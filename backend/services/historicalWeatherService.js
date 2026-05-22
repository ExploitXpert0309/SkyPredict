import axios from 'axios';
import { ApiError } from '../utils/ApiError.js';
import { getOrSetCache } from '../utils/cache.js';

const archiveClient = axios.create({
  baseURL: 'https://archive-api.open-meteo.com',
  timeout: 10000
});

const weatherCodeMap = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail'
};

const average = (values = []) => {
  const valid = values.filter((value) => Number.isFinite(value));
  if (!valid.length) return null;
  return Number((valid.reduce((sum, value) => sum + value, 0) / valid.length).toFixed(1));
};

export const getHistoricalWeather = async ({ location, date }) => {
  const key = `historical:${location.lat}:${location.lon}:${date}`;

  return getOrSetCache(key, 86400, async () => {
    const { data } = await archiveClient.get('/v1/archive', {
      params: {
        latitude: location.lat,
        longitude: location.lon,
        start_date: date,
        end_date: date,
        timezone: 'auto',
        temperature_unit: 'celsius',
        wind_speed_unit: 'ms',
        daily: [
          'weather_code',
          'temperature_2m_max',
          'temperature_2m_min',
          'temperature_2m_mean',
          'apparent_temperature_mean',
          'precipitation_sum',
          'rain_sum',
          'wind_speed_10m_max',
          'wind_gusts_10m_max'
        ].join(','),
        hourly: [
          'temperature_2m',
          'relative_humidity_2m',
          'surface_pressure',
          'visibility',
          'wind_speed_10m'
        ].join(',')
      }
    });

    if (!data?.daily?.time?.length) {
      throw new ApiError(404, 'Historical weather is not available for the selected date and location.');
    }

    const daily = data.daily;
    const hourly = data.hourly || {};
    const code = daily.weather_code?.[0];

    return {
      location,
      date,
      timezone: data.timezone || 'auto',
      source: 'Open-Meteo Historical Weather API',
      summary: {
        condition: weatherCodeMap[code] || 'Historical weather',
        weatherCode: code,
        temperatureMean: daily.temperature_2m_mean?.[0] ?? null,
        temperatureMax: daily.temperature_2m_max?.[0] ?? null,
        temperatureMin: daily.temperature_2m_min?.[0] ?? null,
        feelsLikeMean: daily.apparent_temperature_mean?.[0] ?? null,
        precipitation: daily.precipitation_sum?.[0] ?? null,
        rain: daily.rain_sum?.[0] ?? null,
        windSpeedMax: daily.wind_speed_10m_max?.[0] ?? null,
        windGustMax: daily.wind_gusts_10m_max?.[0] ?? null,
        humidityMean: average(hourly.relative_humidity_2m),
        pressureMean: average(hourly.surface_pressure),
        visibilityMean: average(hourly.visibility)
      },
      hourly: (hourly.time || []).map((time, index) => ({
        time,
        hour: new Date(time).toLocaleTimeString([], { hour: 'numeric' }),
        temperature: hourly.temperature_2m?.[index] ?? null,
        humidity: hourly.relative_humidity_2m?.[index] ?? null,
        pressure: hourly.surface_pressure?.[index] ?? null,
        visibility: hourly.visibility?.[index] ?? null,
        windSpeed: hourly.wind_speed_10m?.[index] ?? null
      }))
    };
  });
};

