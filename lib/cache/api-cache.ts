/**
 * Simple in-memory API cache with TTL support
 * For server-side caching of read-heavy endpoints
 *
 * Usage:
 * ```ts
 * const cache = new ApiCache<MyData>(30_000) // 30 second TTL
 *
 * // In API route:
 * const cached = cache.get('my-key')
 * if (cached) return cached
 *
 * const data = await fetchExpensiveData()
 * cache.set('my-key', data)
 * return data
 * ```
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
}

export class ApiCache<T> {
  private cache = new Map<string, CacheEntry<T>>()
  private ttlMs: number

  /**
   * Create a new API cache
   * @param ttlMs - Time-to-live in milliseconds (default: 30 seconds)
   */
  constructor(ttlMs: number = 30_000) {
    this.ttlMs = ttlMs
  }

  /**
   * Get cached data if not expired
   */
  get(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const isExpired = Date.now() - entry.timestamp > this.ttlMs
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * Set cached data
   */
  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  /**
   * Invalidate specific cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Invalidate cache entries matching a prefix
   */
  invalidateByPrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  stats(): { size: number; ttlMs: number } {
    return {
      size: this.cache.size,
      ttlMs: this.ttlMs,
    }
  }
}

// Pre-configured cache instances for common use cases

/**
 * Short-lived cache for frequently accessed data (30 seconds)
 * Use for: queue lists, dashboard stats
 */
export const shortCache = new ApiCache(30_000)

/**
 * Medium cache for less volatile data (60 seconds)
 * Use for: poli list, room list, master data
 */
export const mediumCache = new ApiCache(60_000)

/**
 * Long cache for rarely changing data (5 minutes)
 * Use for: user info, system config
 */
export const longCache = new ApiCache(300_000)

/**
 * Helper to create cache key from query params
 */
export function createCacheKey(
  base: string,
  params?: Record<string, string | number | undefined | null>
): string {
  if (!params) return base

  const sortedParams = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&")

  return sortedParams ? `${base}?${sortedParams}` : base
}
