/**
 * Memory Cache Utility
 *
 * Simple in-memory caching với TTL (Time To Live)
 * Dùng cho cache API responses ở backend
 */

interface CacheItem<T> {
  value: T;
  expiry: number;
}

class MemoryCache {
  private cache: Map<string, CacheItem<any>>;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor() {
    this.cache = new Map();
    this.cleanupInterval = null;
    this.startCleanup();
  }

  /**
   * Set cache với TTL
   * @param key - Cache key
   * @param value - Data cần cache
   * @param ttl - Time to live (seconds), default 300s (5 phút)
   */
  set<T>(key: string, value: T, ttl: number = 300): void {
    const expiry = Date.now() + ttl * 1000;
    this.cache.set(key, { value, expiry });
  }

  /**
   * Get cache
   * @returns null nếu không có hoặc đã expired
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Check expiry
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  /**
   * Check if key exists và chưa expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete một key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Delete tất cả keys match pattern
   * @param pattern - Regex pattern hoặc string prefix
   */
  deletePattern(pattern: string | RegExp): number {
    let count = 0;
    const regex =
      typeof pattern === 'string' ? new RegExp(`^${pattern}`) : pattern;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache statistics
   */
  stats(): {
    size: number;
    keys: string[];
    memoryUsage: string;
  } {
    const memoryUsage = process.memoryUsage();
    return {
      size: this.size(),
      keys: this.keys(),
      memoryUsage: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    };
  }

  /**
   * Cleanup expired items mỗi 60s
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      let cleaned = 0;

      for (const [key, item] of this.cache.entries()) {
        if (now > item.expiry) {
          this.cache.delete(key);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        console.log(`🧹 Cache cleanup: removed ${cleaned} expired items`);
      }
    }, 60000); // 60 seconds
  }

  /**
   * Stop cleanup interval
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Singleton instance
export const cache = new MemoryCache();

/**
 * Cache decorator cho async functions
 *
 * @example
 * const getCachedData = cacheAsync(
 *   'data-key',
 *   async () => fetchDataFromDB(),
 *   300 // 5 minutes
 * );
 */
export async function cacheAsync<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  // Check cache first
  const cached = cache.get<T>(key);
  if (cached !== null) {
    console.log(`✅ Cache HIT: ${key}`);
    return cached;
  }

  // Cache miss - execute function
  console.log(`❌ Cache MISS: ${key}`);
  const result = await fn();

  // Cache result
  cache.set(key, result, ttl);

  return result;
}

/**
 * Generate cache key từ nhiều parameters
 *
 * @example
 * const key = generateCacheKey('restaurants', { city: 'HCM', rating: 4 });
 * // Output: "restaurants:city=HCM:rating=4"
 */
export function generateCacheKey(
  prefix: string,
  params?: Record<string, any>
): string {
  if (!params || Object.keys(params).length === 0) {
    return prefix;
  }

  const paramsStr = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
    .join(':');

  return `${prefix}:${paramsStr}`;
}

// Export default instance
export default cache;
