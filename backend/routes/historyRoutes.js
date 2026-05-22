import { Router } from 'express';
import { downloadHistory, listHistory, listSearches, removeAllSearches, removeSearch } from '../controllers/historyController.js';
import { historyQuerySchema, idParamSchema } from '../controllers/weatherController.js';
import { validate } from '../middleware/validate.js';

export const historyRouter = Router();

historyRouter.get('/', validate(historyQuerySchema), listHistory);
historyRouter.get('/searches', listSearches);
historyRouter.delete('/searches', removeAllSearches);
historyRouter.delete('/searches/:id', validate(idParamSchema), removeSearch);
historyRouter.get('/export', downloadHistory);
