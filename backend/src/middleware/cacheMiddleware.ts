/**
 * Cache Middleware
 *
 * Middleware để cache API responses
 * Tự động cache và serve từ cache khi có
 */

import { NextFunction, Request, Response } from 'express';
import { cache, generateCacheKey } from '../utils/cache';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  keyPrefix?: string; // Prefix cho cache key
  varyBy?: string[]; // Fields từ query/params để generate key
}

/**
 * Cache middleware factory
 *
 * @example
 * router.get('/restaurants',
 *   cacheMiddleware({ ttl: 300, keyPrefix: 'restaurants' }),
 *   getRestaurants
 * );
 */
export function cacheMiddleware(options: CacheOptions = {}) {
  const {
    ttl = 300, // Default 5 minutes
    keyPrefix = 'api',
    varyBy = [],
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Chỉ cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key
    const params: Record<string, any> = {
      path: req.path,
    };

    // Add varyBy fields từ query
    for (const field of varyBy) {
      if (req.query[field] !== undefined) {
        params[field] = req.query[field];
      }
    }

    const cacheKey = generateCacheKey(keyPrefix, params);

    // Check cache
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log(`✅ Cache HIT: ${cacheKey}`);
      return res.status(200).json({
        ...cached,
        cached: true,
        cacheKey, // Debug info
      });
    }

    console.log(`❌ Cache MISS: ${cacheKey}`);

    // Override res.json để cache response
    const originalJson = res.json.bind(res);
    res.json = function (body: any) {
      // Chỉ cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(cacheKey, body, ttl);
        console.log(`💾 Cached: ${cacheKey} (TTL: ${ttl}s)`);
      }

      return originalJson(body);
    };

    next();
  };
}

/**
 * Cache invalidation middleware
 * Xóa cache khi có mutations (POST, PUT, DELETE)
 *
 * @example
 * router.post('/restaurants',
 *   invalidateCacheMiddleware({ patterns: ['restaurants:', 'api:'] }),
 *   createRestaurant
 * );
 */
export function invalidateCacheMiddleware(options: { patterns: string[] }) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Override res.json để invalidate cache sau khi response
    const originalJson = res.json.bind(res);
    res.json = function (body: any) {
      // Invalidate cache nếu success
      if (res.statusCode >= 200 && res.statusCode < 300) {
        let totalInvalidated = 0;

        for (const pattern of options.patterns) {
          const count = cache.deletePattern(pattern);
          totalInvalidated += count;
        }

        if (totalInvalidated > 0) {
          console.log(`🗑️  Invalidated ${totalInvalidated} cache entries`);
        }
      }

      return originalJson(body);
    };

    next();
  };
}

/**
 * Clear all cache
 * Có thể dùng cho admin endpoint
 */
export function clearAllCache(req: Request, res: Response) {
  cache.clear();
  res.json({
    success: true,
    message: 'All cache cleared',
  });
}

/**
 * Get cache statistics
 * Admin endpoint để monitor cache
 */
export function getCacheStats(req: Request, res: Response) {
  const stats = cache.stats();
  res.json({
    success: true,
    data: stats,
  });
}

export default cacheMiddleware;
