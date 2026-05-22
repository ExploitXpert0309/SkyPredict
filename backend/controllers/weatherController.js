import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { getLocationSuggestions, getWeatherBundle, resolveLocation } from '../services/openWeatherService.js';
import { getHistoricalRange, getHistoricalWeather } from '../services/historicalWeatherService.js';
import { getHourlyForecast } from '../services/hourlyForecastService.js';
import { getTimezone } from '../services/timezoneService.js';
import { getTravelVideos } from '../services/youtubeService.js';
import { buildRecommendations } from '../services/recommendationService.js';
import {
  deleteHistory,
  getHistory,
  saveSearch,
  saveWeatherHistory,
  saveWeatherRange,
  updateHistory
} from '../services/supabaseService.js';

export const weatherSearchSchema = z.object({
  body: z.object({
    query: z.string().trim().max(120).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional()
  }).refine((data) => data.query || (Number.isFinite(data.latitude) && Number.isFinite(data.longitude)), {
    message: 'Provide a query or latitude and longitude.'
  })
});

const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format.');

export const historicalWeatherSchema = z.object({
  body: z.object({
    query: z.string().trim().max(160).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    date: dateOnlySchema
  }).refine((data) => data.query || (Number.isFinite(data.latitude) && Number.isFinite(data.longitude)), {
    message: 'Provide a query or latitude and longitude.'
  }).refine((data) => {
    const selected = new Date(`${data.date}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected < today;
  }, {
    path: ['date'],
    message: 'Select a past date. Today and future dates are not available for historical weather.'
  })
});

export const weatherRangeSchema = z.object({
  body: z.object({
    query: z.string().trim().max(160).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    startDate: dateOnlySchema,
    endDate: dateOnlySchema
  }).refine((data) => data.query || (Number.isFinite(data.latitude) && Number.isFinite(data.longitude)), {
    message: 'Provide a query or latitude and longitude.'
  }).refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    path: ['endDate'],
    message: 'End date must be on or after start date.'
  }).refine((data) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(data.endDate) <= today;
  }, {
    path: ['endDate'],
    message: 'End date must be today or earlier.'
  }).refine((data) => {
    const days = Math.round((new Date(data.endDate) - new Date(data.startDate)) / 86400000) + 1;
    return days <= 31;
  }, {
    path: ['endDate'],
    message: 'Range cannot exceed 31 days.'
  })
});

export const hourlyForecastSchema = z.object({
  body: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    date: dateOnlySchema
  })
});

export const suggestionQuerySchema = z.object({
  query: z.object({
    query: z.string().trim().min(2).max(80)
  })
});

export const historyQuerySchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().min(1).max(100).default(25),
    offset: z.coerce.number().int().min(0).default(0)
  })
});

export const idParamSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.record(z.unknown()).optional()
});

export const postWeather = asyncHandler(async (req, res) => {
  const location = await resolveLocation(req.body);
  const bundle = await getWeatherBundle(location);
  const [timezoneResult, videoResult] = await Promise.allSettled([
    getTimezone(location),
    getTravelVideos(location.name)
  ]);

  const enriched = {
    ...bundle,
    timezone: timezoneResult.status === 'fulfilled' ? timezoneResult.value : null,
    videos: videoResult.status === 'fulfilled' ? videoResult.value : []
  };
  const recommendations = buildRecommendations(enriched);

  const persistence = await Promise.allSettled([
    saveSearch({ query: req.body.query || `${location.lat},${location.lon}`, searchType: location.searchType }),
    saveWeatherHistory({ bundle: enriched, recommendations })
  ]);

  const warnings = [
    persistence.some((result) => result.status === 'rejected')
      ? 'Weather loaded, but persistence failed. Verify Supabase settings, schema, and policies.'
      : null,
    timezoneResult.status === 'rejected'
      ? 'Timezone data is temporarily unavailable.'
      : null,
    videoResult.status === 'rejected'
      ? 'Travel videos are temporarily unavailable.'
      : null
  ].filter(Boolean);

  res.status(201).json({
    success: true,
    data: {
      ...enriched,
      recommendations,
      warnings
    }
  });
});

export const postHistoricalWeather = asyncHandler(async (req, res) => {
  const location = await resolveLocation(req.body);
  const historical = await getHistoricalWeather({ location, date: req.body.date });
  res.status(200).json({ success: true, data: historical });
});

export const postWeatherRange = asyncHandler(async (req, res) => {
  const location = await resolveLocation(req.body);
  const range = await getHistoricalRange({
    location,
    startDate: req.body.startDate,
    endDate: req.body.endDate
  });

  const persistence = await Promise.allSettled([
    saveSearch({
      query: req.body.query || `${location.lat},${location.lon} (${req.body.startDate} → ${req.body.endDate})`,
      searchType: 'date_range'
    }),
    saveWeatherRange({ location, days: range.days })
  ]);

  const savedRows = persistence[1].status === 'fulfilled' ? persistence[1].value : [];
  const warnings = persistence.some((result) => result.status === 'rejected')
    ? ['Range loaded, but persistence failed. Verify Supabase settings, schema, and policies.']
    : [];

  res.status(201).json({
    success: true,
    data: { ...range, savedCount: savedRows.length, warnings }
  });
});

export const postHourlyForecast = asyncHandler(async (req, res) => {
  const data = await getHourlyForecast(req.body);
  res.status(200).json({ success: true, data });
});

export const getSuggestions = asyncHandler(async (req, res) => {
  const data = await getLocationSuggestions(req.query.query);
  res.json({ success: true, data });
});

export const getWeather = asyncHandler(async (req, res) => {
  const history = await getHistory(req.query);
  res.json({ success: true, data: history });
});

export const putWeather = asyncHandler(async (req, res) => {
  const allowed = ['location', 'country', 'weather_condition', 'forecast_data'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  if (!Object.keys(updates).length) {
    throw new ApiError(400, 'No supported weather history fields provided for update.');
  }
  const row = await updateHistory(req.params.id, updates);
  res.json({ success: true, data: row });
});

export const deleteWeather = asyncHandler(async (req, res) => {
  const row = await deleteHistory(req.params.id);
  res.json({ success: true, data: row });
});
