import { z } from 'zod';
const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  COINGECKO_BASE_URL: z.string().default('https://api.coingecko.com/api/v3'),
  PRICE_REFRESH_INTERVAL_MS: z.coerce.number().default(30000),
  CACHE_TTL_MS: z.coerce.number().default(25000),
});
export const config = envSchema.parse(process.env);
