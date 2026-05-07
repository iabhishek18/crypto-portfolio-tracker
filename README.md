# Crypto Portfolio Tracker

> Real-time cryptocurrency portfolio with WebSocket live prices (30s refresh), P&L calculation, price alerts, and CoinGecko market data.

## 🚀 Overview

A real-time crypto portfolio tracker that streams live prices via WebSocket (refreshed every 30 seconds from CoinGecko), calculates profit/loss per holding and total portfolio value, supports price alerts (above/below target), and provides 7-day sparkline data for trending visualization.

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📊 Real-Time Prices | WebSocket stream, 30s CoinGecko refresh |
| 💼 Portfolio P&L | Per-coin and total profit/loss calculation |
| 🔔 Price Alerts | Set target price (above/below), get notified |
| 📈 Sparklines | 7-day mini-charts for each coin |
| 🏪 Top 100 Coins | Market cap, volume, 24h change |
| 🔄 Live WebSocket | Subscribe to specific coins |
| 💰 Multi-Portfolio | Track multiple holdings with buy price |
| 📱 Responsive | Mobile-friendly dashboard |

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | Node.js, Express |
| WebSocket | ws (native WebSocket) |
| Data | CoinGecko API (free) |
| Database | MongoDB |
| Scheduler | node-cron (30s price refresh) |

## ⚡ Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

Server at `http://localhost:5000` | WebSocket at `ws://localhost:5000/ws/tracking`

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/portfolio/holdings` | Add holding |
| GET | `/api/portfolio/:userId` | Get portfolio with P&L |
| GET | `/api/portfolio/prices/top` | Top 20 coins |
| POST | `/api/alerts` | Create price alert |
| GET | `/api/alerts/:userId` | Get active alerts |

### WebSocket

```javascript
const ws = new WebSocket('ws://localhost:5000');
ws.send(JSON.stringify({ type: 'subscribe', coins: ['bitcoin', 'ethereum'] }));
ws.onmessage = (event) => console.log(JSON.parse(event.data));
```

## 📄 License

MIT
