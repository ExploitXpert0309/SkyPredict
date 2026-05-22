import NodeCache from 'node-cache';

export const cache = new NodeCache({ stdTTL: 300, checkperiod: 120 });

export const getOrSetCache = async (key, ttlSeconds, fetcher) => {
  const cached = cache.get(key);
  if (cached) return cached;
  const value = await fetcher();
  cache.set(key, value, ttlSeconds);
  return value;
};

