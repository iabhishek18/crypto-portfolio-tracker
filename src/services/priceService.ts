import axios from 'axios';
import { config } from '../config/env';
import { CoinPrice } from '../models/types';

interface CacheEntry { data: Record<string, CoinPrice>; timestamp: number; }

let cache: CacheEntry | null = null;

export async function fetchTopCoins(limit = 100): Promise<CoinPrice[]> {
  if (cache && Date.now() - cache.timestamp < config.CACHE_TTL_MS) {
    return Object.values(cache.data).slice(0, limit);
  }

  const { data } = await axios.get<CoinPrice[]>(`${config.COINGECKO_BASE_URL}/coins/markets`, {
    params: { vs_currency: 'usd', order: 'market_cap_desc', per_page: limit, sparkline: true, price_change_percentage: '24h' },
    timeout: 10000,
  });

  cache = { data: Object.fromEntries(data.map((c) => [c.id, c])), timestamp: Date.now() };
  return data;
}

export function getCoinPrice(coinId: string): CoinPrice | undefined {
  return cache?.data[coinId];
}

export function getCachedPrices(): Record<string, CoinPrice> {
  return cache?.data ?? {};
}

export async function getCoinHistory(coinId: string, days: number): Promise<Array<{ timestamp: number; price: number }>> {
  const { data } = await axios.get(`${config.COINGECKO_BASE_URL}/coins/${coinId}/market_chart`, {
    params: { vs_currency: 'usd', days },
    timeout: 10000,
  });
  return data.prices.map(([timestamp, price]: [number, number]) => ({ timestamp, price: Math.round(price * 100) / 100 }));
}
