export interface CoinPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  image: string;
  sparkline_in_7d?: { price: number[] };
  last_updated: string;
}

export interface Holding {
  id: string;
  coinId: string;
  amount: number;
  buyPrice: number;
  buyDate: string;
  notes?: string;
}

export interface PortfolioSummary {
  holdings: Array<Holding & {
    currentPrice: number;
    currentValue: number;
    investedValue: number;
    pnl: number;
    pnlPercentage: number;
    allocation: number;
  }>;
  totalValue: number;
  totalInvested: number;
  totalPnl: number;
  totalPnlPercentage: number;
  bestPerformer: string | null;
  worstPerformer: string | null;
}

export interface PriceAlert {
  id: string;
  coinId: string;
  targetPrice: number;
  direction: 'above' | 'below';
  isActive: boolean;
  isTriggered: boolean;
  triggeredAt?: Date;
  createdAt: Date;
}
