import Redis from 'ioredis';

// ─── Redis Client ────────────────────────────────────────────────────────────

let redisClient: Redis | null = null;

const DEFAULT_TTL = {
  products: 600,        // 10 min  — product list/detail
  featured: 300,        // 5 min   — featured products
  categories: 1800,     // 30 min  — rarely change
  collections: 1800,    // 30 min
  adminStats: 60,       // 1 min   — dashboard stats (near real-time)
  cart: 120,            // 2 min
  session: 3600,        // 1 hour  — user session data
  search: 180,          // 3 min   — search results
  coupon: 600,          // 10 min
};

// ─── Connect ─────────────────────────────────────────────────────────────────

export const connectRedis = async (): Promise<void> => {
  const url = process.env.REDIS_URL;

  if (!url || url.trim() === '') {
    console.warn('⚠️  Redis URL not configured — Redis caching disabled.');
    return;
  }

  try {
    redisClient = new Redis(url, {
      lazyConnect: true,
      maxRetriesPerRequest: 2,
      retryStrategy: (times) => {
        if (times >= 3) return null; // stop retrying after 3 attempts
        return Math.min(times * 200, 1000);
      },
      enableReadyCheck: true,
      connectTimeout: 5000,
    });

    // Event listeners
    redisClient.on('connect', () => console.log('🔴 Redis connecting...'));
    redisClient.on('ready', () => console.log('✅ Redis Connected & Ready'));
    redisClient.on('error', (err) => console.error('❌ Redis Error:', err.message));
    redisClient.on('close', () => console.warn('⚠️  Redis connection closed'));
    redisClient.on('reconnecting', () => console.log('🔄 Redis reconnecting...'));

    await redisClient.connect();
  } catch (err: any) {
    console.warn('⚠️  Redis connection failed — caching disabled:', err.message);
    redisClient = null;
  }
};

// ─── Status ──────────────────────────────────────────────────────────────────

export const isRedisConnected = (): boolean => {
  return redisClient !== null && redisClient.status === 'ready';
};

export const getRedisClient = (): Redis | null => redisClient;

// ─── Core Cache Operations ────────────────────────────────────────────────────

export const getCache = async <T = any>(key: string): Promise<T | null> => {
  if (!redisClient) return null;
  try {
    const data = await redisClient.get(key);
    return data ? (JSON.parse(data) as T) : null;
  } catch (err: any) {
    console.warn(`Cache GET error for "${key}":`, err.message);
    return null;
  }
};

export const setCache = async (
  key: string,
  value: any,
  ttl: number = DEFAULT_TTL.products
): Promise<void> => {
  if (!redisClient) return;
  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    await redisClient.setex(key, ttl, serialized);
  } catch (err: any) {
    console.warn(`Cache SET error for "${key}":`, err.message);
  }
};

export const deleteCache = async (...keys: string[]): Promise<void> => {
  if (!redisClient || keys.length === 0) return;
  try {
    await redisClient.del(...keys);
  } catch (err: any) {
    console.warn('Cache DELETE error:', err.message);
  }
};

export const deleteCachePattern = async (pattern: string): Promise<number> => {
  if (!redisClient) return 0;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length === 0) return 0;
    await redisClient.del(...keys);
    return keys.length;
  } catch (err: any) {
    console.warn(`Cache PATTERN DELETE error for "${pattern}":`, err.message);
    return 0;
  }
};

// ─── Cache with Auto-Population ──────────────────────────────────────────────

/**
 * Get value from cache; if miss, call loader fn, cache result, and return it.
 */
export const cacheWrap = async <T>(
  key: string,
  loader: () => Promise<T>,
  ttl?: number
): Promise<T> => {
  const cached = await getCache<T>(key);
  if (cached !== null) return cached;

  const fresh = await loader();
  if (fresh !== null && fresh !== undefined) {
    await setCache(key, fresh, ttl);
  }
  return fresh;
};

// ─── Increment Counter (for analytics, rate limiting) ────────────────────────

export const incrementCounter = async (key: string, ttl?: number): Promise<number> => {
  if (!redisClient) return 0;
  try {
    const count = await redisClient.incr(key);
    if (ttl && count === 1) await redisClient.expire(key, ttl);
    return count;
  } catch {
    return 0;
  }
};

// ─── Session Store Helpers ────────────────────────────────────────────────────

export const setSession = async (userId: string, data: any): Promise<void> =>
  setCache(`session:${userId}`, data, DEFAULT_TTL.session);

export const getSession = async <T>(userId: string): Promise<T | null> =>
  getCache<T>(`session:${userId}`);

export const deleteSession = async (userId: string): Promise<void> =>
  deleteCache(`session:${userId}`);

// ─── Pub/Sub for Real-Time Events ─────────────────────────────────────────────

export const publishEvent = async (channel: string, payload: any): Promise<void> => {
  if (!redisClient) return;
  try {
    await redisClient.publish(channel, JSON.stringify(payload));
  } catch {}
};

// ─── TTL Exports ─────────────────────────────────────────────────────────────

export const TTL = DEFAULT_TTL;

export default redisClient;
