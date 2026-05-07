import { Router, Request, Response } from 'express';
import { PriceService } from '../services/priceService';

export const portfolioRoutes = Router();
const priceService = new PriceService();
const portfolios = new Map<string, Array<{ coinId: string; amount: number; buyPrice: number; buyDate: string }>>();

portfolioRoutes.post('/holdings', (req: Request, res: Response) => {
  const { userId, coinId, amount, buyPrice } = req.body;
  if (!portfolios.has(userId)) portfolios.set(userId, []);
  portfolios.get(userId)!.push({ coinId, amount, buyPrice, buyDate: new Date().toISOString() });
  res.status(201).json({ success: true });
});

portfolioRoutes.get('/:userId', async (req: Request, res: Response) => {
  const holdings = portfolios.get(req.params.userId) || [];
  const coinIds = [...new Set(holdings.map(h => h.coinId))];
  const prices = await priceService.fetchPrices(coinIds);
  
  const portfolio = holdings.map(h => {
    const current = prices[h.coinId];
    const currentValue = current ? current.current_price * h.amount : 0;
    const investedValue = h.buyPrice * h.amount;
    return { ...h, currentPrice: current?.current_price || 0, currentValue, investedValue, pnl: currentValue - investedValue, pnlPercentage: ((currentValue - investedValue) / investedValue) * 100 };
  });

  const totalValue = portfolio.reduce((s, p) => s + p.currentValue, 0);
  const totalInvested = portfolio.reduce((s, p) => s + p.investedValue, 0);
  res.json({ success: true, data: { holdings: portfolio, totalValue, totalInvested, totalPnl: totalValue - totalInvested, totalPnlPercentage: ((totalValue - totalInvested) / totalInvested) * 100 } });
});

portfolioRoutes.get('/prices/top', async (_req: Request, res: Response) => {
  const prices = await priceService.fetchPrices();
  res.json({ success: true, data: Object.values(prices).slice(0, 20) });
});
