import { Router } from 'express';
import {
  deleteWeather,
  getSuggestions,
  getWeather,
  historicalWeatherSchema,
  hourlyForecastSchema,
  historyQuerySchema,
  idParamSchema,
  postHistoricalWeather,
  postHourlyForecast,
  postWeather,
  postWeatherRange,
  suggestionQuerySchema,
  putWeather,
  weatherRangeSchema,
  weatherSearchSchema
} from '../controllers/weatherController.js';
import { validate } from '../middleware/validate.js';

export const weatherRouter = Router();

weatherRouter.post('/', validate(weatherSearchSchema), postWeather);
weatherRouter.post('/historical', validate(historicalWeatherSchema), postHistoricalWeather);
weatherRouter.post('/range', validate(weatherRangeSchema), postWeatherRange);
weatherRouter.post('/hourly-forecast', validate(hourlyForecastSchema), postHourlyForecast);
weatherRouter.get('/suggestions', validate(suggestionQuerySchema), getSuggestions);
weatherRouter.get('/', validate(historyQuerySchema), getWeather);
weatherRouter.put('/:id', validate(idParamSchema), putWeather);
weatherRouter.delete('/:id', validate(idParamSchema), deleteWeather);
