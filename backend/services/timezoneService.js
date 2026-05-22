import axios from 'axios';
import { env, providerStatus } from '../config/env.js';
import { getOrSetCache } from '../utils/cache.js';

export const getTimezone = async ({ lat, lon }) => {
  if (!providerStatus.timezone) {
    return null;
  }

  const cacheKey = `timezone:${lat}:${lon}`;
  return getOrSetCache(cacheKey, 86400, async () => {
    const { data } = await axios.get('https://api.timezonedb.com/v2.1/get-time-zone', {
      timeout: env.apiTimeoutMs,
      params: {
        key: env.timezoneApiKey,
        format: 'json',
        by: 'position',
        lat,
        lng: lon
      }
    });

    return data?.status === 'OK' ? data : null;
  });
};
