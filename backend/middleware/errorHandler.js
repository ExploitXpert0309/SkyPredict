import { AxiosError } from 'axios';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';

export const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      details: error.errors.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
    });
  }

  if (error instanceof AxiosError) {
    const upstreamStatus = error.response?.status || 502;
    return res.status(upstreamStatus).json({
      success: false,
      message: error.code === 'ECONNABORTED'
        ? 'Weather provider timed out. Please try again.'
        : error.response?.data?.message || 'External API request failed',
      details: error.response?.data || null
    });
  }

  const statusCode = error.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error',
    details: error.details || null
  });
};

