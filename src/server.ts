import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { config } from './config/env';
import { portfolioRoutes } from './routes/portfolio';
import { marketRoutes } from './routes/market';
import * as priceService from './services/priceService';
import * as portfolioService from './services/portfolioService';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), wsClients: wss.clients.size });
});

app.use('/api/v1/portfolio', portfolioRoutes);
app.use('/api/v1/market', marketRoutes);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err.name === 'ZodError') {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid request', details: err } });
    return;
  }
  res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
});

const wsSubscriptions = new Map<WebSocket, Set<string>>();

wss.on('connection', (ws) => {
  wsSubscriptions.set(ws, new Set());

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type === 'subscribe' && Array.isArray(msg.coins)) {
        wsSubscriptions.set(ws, new Set(msg.coins));
        ws.send(JSON.stringify({ type: 'subscribed', coins: msg.coins }));
      }
    } catch { ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' })); }
  });

  ws.on('close', () => { wsSubscriptions.delete(ws); });
});

async function broadcastPrices(): Promise<void> {
  try {
    await priceService.fetchTopCoins();
    const prices = priceService.getCachedPrices();
    const triggered = portfolioService.checkAlerts();

    wss.clients.forEach((client) => {
      if (client.readyState !== WebSocket.OPEN) return;
      const subs = wsSubscriptions.get(client);
      const filtered = subs?.size ? Object.fromEntries(Object.entries(prices).filter(([k]) => subs.has(k))) : prices;
      client.send(JSON.stringify({ type: 'prices', data: Object.values(filtered).map((c) => ({ id: c.id, price: c.current_price, change24h: c.price_change_percentage_24h })) }));
    });

    if (triggered.length > 0) {
      console.log(`[Alerts] ${triggered.length} alerts triggered`);
    }
  } catch (error) {
    console.error('[Price broadcast error]', error);
  }
}

setInterval(broadcastPrices, config.PRICE_REFRESH_INTERVAL_MS);

server.listen(config.PORT, () => {
  console.log(`[Crypto Tracker] Running on port ${config.PORT}`);
  console.log(`[WebSocket] Ready for connections`);
  broadcastPrices();
});

process.on('SIGTERM', () => { server.close(); process.exit(0); });
