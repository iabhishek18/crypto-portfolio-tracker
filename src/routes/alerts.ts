import { Router, Request, Response } from 'express';
export const alertRoutes = Router();
const alerts: any[] = [];

alertRoutes.post('/', (req: Request, res: Response) => {
  const { userId, coinId, targetPrice, direction } = req.body;
  const alert = { id: `ALERT-${Date.now()}`, userId, coinId, targetPrice, direction, active: true, createdAt: new Date() };
  alerts.push(alert);
  res.status(201).json({ success: true, data: alert });
});

alertRoutes.get('/:userId', (req: Request, res: Response) => {
  res.json({ success: true, data: alerts.filter(a => a.userId === req.params.userId && a.active) });
});

alertRoutes.delete('/:id', (req: Request, res: Response) => {
  const alert = alerts.find(a => a.id === req.params.id);
  if (alert) alert.active = false;
  res.json({ success: true });
});
