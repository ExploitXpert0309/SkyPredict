import dotenv from 'dotenv';

dotenv.config();

const readEnv = (key, fallback = '') => {
  const value = process.env[key];
  if (value === undefined || value === null) return fallback;
  return value.trim().replace(/^['"]|['"]$/g, '');
};

const isPlaceholder = (value) => !value || /^your_|placeholder/i.test(value);

const required = ['OPENWEATHER_API_KEY', 'SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missing = required.filter((key) => isPlaceholder(readEnv(key)));

if (missing.length && process.env.NODE_ENV === 'production') {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

export const env = {
  port: readEnv('PORT', '5000'),
  nodeEnv: readEnv('NODE_ENV', 'development'),
  clientUrl: readEnv('CLIENT_URL', 'http://localhost:5173'),
  openWeatherApiKey: readEnv('OPENWEATHER_API_KEY'),
  supabaseUrl: readEnv('SUPABASE_URL'),
  supabaseAnonKey: readEnv('SUPABASE_ANON_KEY'),
  googleMapsApiKey: readEnv('GOOGLE_MAPS_API_KEY'),
  youtubeApiKey: readEnv('YOUTUBE_API_KEY'),
  timezoneApiKey: readEnv('TIMEZONE_API_KEY'),
  apiTimeoutMs: Number(readEnv('API_TIMEOUT_MS', '9000'))
};

export const providerStatus = {
  openWeather: !isPlaceholder(env.openWeatherApiKey),
  supabase: !isPlaceholder(env.supabaseUrl) && /^https?:\/\//i.test(env.supabaseUrl) && !isPlaceholder(env.supabaseAnonKey),
  googleMaps: !isPlaceholder(env.googleMapsApiKey),
  youtube: !isPlaceholder(env.youtubeApiKey),
  timezone: !isPlaceholder(env.timezoneApiKey)
};
