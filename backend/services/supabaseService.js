import { Parser } from '@json2csv/plainjs';
import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';

const ensureSupabase = () => {
  if (!supabase) {
    throw new ApiError(500, 'Supabase is not configured.');
  }
};

const run = async (operation) => {
  ensureSupabase();
  const { data, error } = await operation();
  if (error) {
    const isPolicyError = error.code === '42501' || /row-level security|permission|policy/i.test(error.message);
    throw new ApiError(
      isPolicyError ? 403 : 500,
      isPolicyError
        ? 'Supabase permission blocked this action. Run the latest SQL policy update in supabase/fix-user-search-delete-policy.sql.'
        : error.message,
      error
    );
  }
  return data;
};

export const saveSearch = async ({ query, searchType }) => run(() =>
  supabase.from('user_searches').insert({ query, search_type: searchType }).select().single()
);

export const saveWeatherHistory = async ({ bundle, recommendations }) => {
  const current = bundle.current;
  return run(() =>
    supabase.from('weather_history').insert({
      location: bundle.location.name,
      country: bundle.location.country,
      latitude: bundle.location.lat,
      longitude: bundle.location.lon,
      temperature: current.main.temp,
      humidity: current.main.humidity,
      pressure: current.main.pressure,
      wind_speed: current.wind?.speed ?? 0,
      weather_condition: current.weather?.[0]?.description || 'Unknown',
      forecast_data: {
        displayName: bundle.location.displayName,
        current,
        forecast: bundle.forecast,
        airQuality: bundle.airQuality,
        uvIndex: bundle.uvIndex,
        timezone: bundle.timezone,
        recommendations
      }
    }).select().single()
  );
};

export const getHistory = async ({ limit = 25, offset = 0 } = {}) => run(() =>
  supabase
    .from('weather_history')
    .select('*')
    .order('searched_at', { ascending: false })
    .range(offset, offset + limit - 1)
);

export const updateHistory = async (id, updates) => run(() =>
  supabase.from('weather_history').update(updates).eq('id', id).select().single()
);

export const deleteHistory = async (id) => run(() =>
  supabase.from('weather_history').delete().eq('id', id).select().single()
);

export const getSearches = async () => run(() =>
  supabase.from('user_searches').select('*').order('created_at', { ascending: false }).limit(25)
);

export const deleteSearch = async (id) => run(() =>
  supabase.from('user_searches').delete().eq('id', id).select().single()
);

export const clearSearches = async () => run(() =>
  supabase.from('user_searches').delete().not('id', 'is', null).select()
);

export const getFavorites = async () => run(() =>
  supabase.from('favorite_locations').select('*').order('created_at', { ascending: false })
);

export const createFavorite = async ({ cityName, country }) => run(() =>
  supabase.from('favorite_locations').insert({ city_name: cityName, country }).select().single()
);

export const updateFavorite = async (id, updates) => run(() =>
  supabase.from('favorite_locations').update(updates).eq('id', id).select().single()
);

export const deleteFavorite = async (id) => run(() =>
  supabase.from('favorite_locations').delete().eq('id', id).select().single()
);

export const exportHistory = async (format = 'json') => {
  const rows = await getHistory({ limit: 500, offset: 0 });
  if (format === 'csv') {
    const parser = new Parser();
    return { contentType: 'text/csv', body: parser.parse(rows) };
  }

  return { contentType: 'application/json', body: JSON.stringify(rows, null, 2) };
};
