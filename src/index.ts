import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cron from 'node-cron';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { portfolioRoutes } from './routes/portfolio';
import { alertRoutes } from './routes/alerts';
import { PriceService } from './services/priceService';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
app.use(cors());
app.use(express.json());
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/alerts', alertRoutes);

const priceService = new PriceService();

wss.on('connection', (ws) => {
  ws.on('message', (msg) => {
    const data = JSON.parse(msg.toString());
    if (data.type === 'subscribe') {
      (ws as any).coins = data.coins;
    }
  });
});

cron.schedule('*/30 * * * * *', async () => {
  const prices = await priceService.fetchPrices();
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      const coins = (client as any).coins || [];
      const filtered = coins.length ? Object.fromEntries(Object.entries(prices).filter(([k]) => coins.includes(k))) : prices;
      client.send(JSON.stringify({ type: 'prices', data: filtered }));
    }
  });
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto-tracker').then(() => {
  server.listen(5000, () => console.log('Crypto tracker on port 5000'));
});
