import { Request, Response, NextFunction } from 'express';
import { getCache, setCache, isRedisConnected } from '../config/redis';

/**
 * Express middleware that caches GET responses in Redis.
 * Usage: router.get('/path', cacheMiddleware(ttlSeconds), handler)
 */
export const cacheMiddleware = (ttl: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests when Redis is available
    if (req.method !== 'GET' || !isRedisConnected()) {
      return next();
    }

    const key = `route:${req.originalUrl}`;

    try {
      const cached = await getCache(key);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(cached);
      }
    } catch {
      return next();
    }

    // Patch res.json to intercept and cache the response
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300 && body?.success) {
        setCache(key, body, ttl).catch(() => {});
      }
      res.setHeader('X-Cache', 'MISS');
      return originalJson(body);
    };

    next();
  };
};
