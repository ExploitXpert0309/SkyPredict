import { Router } from 'express';
import { providerStatus } from '../config/env.js';
import { favoritesRouter } from './favoritesRoutes.js';
import { historyRouter } from './historyRoutes.js';
import { weatherRouter } from './weatherRoutes.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    providers: providerStatus
  });
});

apiRouter.use('/weather', weatherRouter);
apiRouter.use('/history', historyRouter);
apiRouter.use('/favorites', favoritesRouter);
