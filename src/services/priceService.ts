import axios from 'axios';

interface CoinPrice { id: string; symbol: string; name: string; current_price: number; price_change_24h: number; price_change_percentage_24h: number; market_cap: number; total_volume: number; sparkline_in_7d?: { price: number[] }; }

export class PriceService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private CACHE_TTL = 30000;

  async fetchPrices(ids?: string[]): Promise<Record<string, CoinPrice>> {
    const cacheKey = ids?.join(',') || 'top100';
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) return cached.data;

    const params: any = { vs_currency: 'usd', order: 'market_cap_desc', per_page: 100, sparkline: true, price_change_percentage: '24h' };
    if (ids?.length) params.ids = ids.join(',');

    const { data } = await axios.get<CoinPrice[]>('https://api.coingecko.com/api/v3/coins/markets', { params });
    const mapped = Object.fromEntries(data.map(coin => [coin.id, coin]));
    this.cache.set(cacheKey, { data: mapped, timestamp: Date.now() });
    return mapped;
  }

  async getCoinHistory(coinId: string, days: number = 30) {
    const { data } = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`, { params: { vs_currency: 'usd', days } });
    return data.prices.map(([timestamp, price]: [number, number]) => ({ timestamp, price, date: new Date(timestamp).toISOString() }));
  }
}
