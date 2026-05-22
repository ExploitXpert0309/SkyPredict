import axios from 'axios';
import { ApiError } from '../utils/ApiError.js';
import { getOrSetCache } from '../utils/cache.js';

const forecastClient = axios.create({
  baseURL: 'https://api.open-meteo.com',
  timeout: 10000
});

export const getHourlyForecast = async ({ latitude, longitude, date }) => {
  const key = `hourly-forecast:${latitude}:${longitude}:${date}`;

  return getOrSetCache(key, 1800, async () => {
    const { data } = await forecastClient.get('/v1/forecast', {
      params: {
        latitude,
        longitude,
        start_date: date,
        end_date: date,
        timezone: 'auto',
        temperature_unit: 'celsius',
        wind_speed_unit: 'ms',
        hourly: [
          'temperature_2m',
          'apparent_temperature',
          'relative_humidity_2m',
          'surface_pressure',
          'visibility',
          'wind_speed_10m',
          'weather_code'
        ].join(',')
      }
    });

    if (!data?.hourly?.time?.length) {
      throw new ApiError(404, 'Hourly forecast is not available for the selected day.');
    }

    const hourly = data.hourly;
    return {
      date,
      timezone: data.timezone || 'auto',
      source: 'Open-Meteo Forecast API',
      items: hourly.time.map((time, index) => ({
        time,
        hour: new Date(time).toLocaleTimeString([], { hour: 'numeric' }),
        temperature: Math.round(hourly.temperature_2m?.[index] ?? 0),
        feelsLike: Math.round(hourly.apparent_temperature?.[index] ?? hourly.temperature_2m?.[index] ?? 0),
        humidity: hourly.relative_humidity_2m?.[index] ?? null,
        pressure: hourly.surface_pressure?.[index] ?? null,
        visibility: hourly.visibility?.[index] ?? null,
        wind: Number((hourly.wind_speed_10m?.[index] ?? 0).toFixed(1)),
        weatherCode: hourly.weather_code?.[index] ?? null,
        description: 'Hourly forecast'
      }))
    };
  });
};

