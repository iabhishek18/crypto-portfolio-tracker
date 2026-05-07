import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as portfolioService from '../services/portfolioService';

export const portfolioRoutes = Router();

const addHoldingSchema = z.object({ coinId: z.string().min(1), amount: z.number().positive(), buyPrice: z.number().positive(), notes: z.string().optional() });
const createAlertSchema = z.object({ coinId: z.string().min(1), targetPrice: z.number().positive(), direction: z.enum(['above', 'below']) });

portfolioRoutes.get('/:userId', (req: Request, res: Response) => {
  const summary = portfolioService.getPortfolio(req.params.userId!);
  res.json({ success: true, data: summary });
});

portfolioRoutes.post('/:userId/holdings', (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = addHoldingSchema.parse(req.body);
    const holding = portfolioService.addHolding(req.params.userId!, data.coinId, data.amount, data.buyPrice, data.notes);
    res.status(201).json({ success: true, data: holding });
  } catch (e) { next(e); }
});

portfolioRoutes.delete('/:userId/holdings/:holdingId', (req: Request, res: Response) => {
  const removed = portfolioService.removeHolding(req.params.userId!, req.params.holdingId!);
  if (!removed) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Holding not found' } }); return; }
  res.status(204).end();
});

portfolioRoutes.get('/:userId/alerts', (req: Request, res: Response) => {
  res.json({ success: true, data: portfolioService.getAlerts(req.params.userId!) });
});

portfolioRoutes.post('/:userId/alerts', (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createAlertSchema.parse(req.body);
    const alert = portfolioService.createAlert(req.params.userId!, data.coinId, data.targetPrice, data.direction);
    res.status(201).json({ success: true, data: alert });
  } catch (e) { next(e); }
});
