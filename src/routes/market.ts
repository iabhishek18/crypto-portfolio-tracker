import { Router, Request, Response } from 'express';
import * as priceService from '../services/priceService';

export const marketRoutes = Router();

marketRoutes.get('/coins', async (_req: Request, res: Response) => {
  try {
    const coins = await priceService.fetchTopCoins(50);
    res.json({ success: true, data: coins, meta: { total: coins.length, cached: true } });
  } catch (error) {
    res.status(502).json({ success: false, error: { code: 'UPSTREAM_ERROR', message: 'Failed to fetch market data' } });
  }
});

marketRoutes.get('/coins/:coinId', (req: Request, res: Response) => {
  const coin = priceService.getCoinPrice(req.params.coinId!);
  if (!coin) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Coin not found in cache' } }); return; }
  res.json({ success: true, data: coin });
});

marketRoutes.get('/coins/:coinId/history', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const history = await priceService.getCoinHistory(req.params.coinId!, days);
    res.json({ success: true, data: history });
  } catch {
    res.status(502).json({ success: false, error: { code: 'UPSTREAM_ERROR', message: 'Failed to fetch history' } });
  }
});
