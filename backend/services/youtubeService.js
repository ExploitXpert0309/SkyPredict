import axios from 'axios';
import { env, providerStatus } from '../config/env.js';
import { getOrSetCache } from '../utils/cache.js';

export const getTravelVideos = async (locationName) => {
  if (!providerStatus.youtube || !locationName) return [];

  const cacheKey = `videos:${locationName.toLowerCase()}`;
  return getOrSetCache(cacheKey, 43200, async () => {
    const { data } = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      timeout: env.apiTimeoutMs,
      params: {
        part: 'snippet',
        q: `${locationName} travel weather guide`,
        key: env.youtubeApiKey,
        maxResults: 6,
        type: 'video',
        safeSearch: 'moderate'
      }
    });

    return (data.items || []).map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));
  });
};
