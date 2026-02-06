type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry<any>>();

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

export function setCached<T>(
  key: string,
  data: T,
  ttl = 60_000
) {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttl,
  });
}

export function clearCache(key?: string) {
  key ? cache.delete(key) : cache.clear();
}
