import { nanoid } from 'nanoid';
import { Holding, PortfolioSummary, PriceAlert } from '../models/types';
import { getCoinPrice } from './priceService';

const portfolios = new Map<string, Holding[]>();
const alerts = new Map<string, PriceAlert[]>();

export function addHolding(userId: string, coinId: string, amount: number, buyPrice: number, notes?: string): Holding {
  const holding: Holding = { id: nanoid(10), coinId, amount, buyPrice, buyDate: new Date().toISOString(), notes };
  const userHoldings = portfolios.get(userId) ?? [];
  userHoldings.push(holding);
  portfolios.set(userId, userHoldings);
  return holding;
}

export function removeHolding(userId: string, holdingId: string): boolean {
  const userHoldings = portfolios.get(userId);
  if (!userHoldings) return false;
  const filtered = userHoldings.filter((h) => h.id !== holdingId);
  if (filtered.length === userHoldings.length) return false;
  portfolios.set(userId, filtered);
  return true;
}

export function getPortfolio(userId: string): PortfolioSummary {
  const holdings = portfolios.get(userId) ?? [];

  const enriched = holdings.map((h) => {
    const price = getCoinPrice(h.coinId);
    const currentPrice = price?.current_price ?? 0;
    const currentValue = currentPrice * h.amount;
    const investedValue = h.buyPrice * h.amount;
    const pnl = currentValue - investedValue;
    const pnlPercentage = investedValue > 0 ? (pnl / investedValue) * 100 : 0;
    return { ...h, currentPrice, currentValue, investedValue, pnl, pnlPercentage, allocation: 0 };
  });

  const totalValue = enriched.reduce((sum, h) => sum + h.currentValue, 0);
  const totalInvested = enriched.reduce((sum, h) => sum + h.investedValue, 0);

  enriched.forEach((h) => { h.allocation = totalValue > 0 ? (h.currentValue / totalValue) * 100 : 0; });

  const sorted = [...enriched].sort((a, b) => b.pnlPercentage - a.pnlPercentage);

  return {
    holdings: enriched,
    totalValue: Math.round(totalValue * 100) / 100,
    totalInvested: Math.round(totalInvested * 100) / 100,
    totalPnl: Math.round((totalValue - totalInvested) * 100) / 100,
    totalPnlPercentage: totalInvested > 0 ? Math.round(((totalValue - totalInvested) / totalInvested) * 10000) / 100 : 0,
    bestPerformer: sorted[0]?.coinId ?? null,
    worstPerformer: sorted[sorted.length - 1]?.coinId ?? null,
  };
}

export function createAlert(userId: string, coinId: string, targetPrice: number, direction: 'above' | 'below'): PriceAlert {
  const alert: PriceAlert = { id: nanoid(10), coinId, targetPrice, direction, isActive: true, isTriggered: false, createdAt: new Date() };
  const userAlerts = alerts.get(userId) ?? [];
  userAlerts.push(alert);
  alerts.set(userId, userAlerts);
  return alert;
}

export function getAlerts(userId: string): PriceAlert[] {
  return (alerts.get(userId) ?? []).filter((a) => a.isActive);
}

export function checkAlerts(): PriceAlert[] {
  const triggered: PriceAlert[] = [];
  alerts.forEach((userAlerts) => {
    userAlerts.forEach((alert) => {
      if (!alert.isActive || alert.isTriggered) return;
      const price = getCoinPrice(alert.coinId);
      if (!price) return;
      const shouldTrigger = (alert.direction === 'above' && price.current_price >= alert.targetPrice) || (alert.direction === 'below' && price.current_price <= alert.targetPrice);
      if (shouldTrigger) { alert.isTriggered = true; alert.triggeredAt = new Date(); triggered.push(alert); }
    });
  });
  return triggered;
}
