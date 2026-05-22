import { Router } from 'express';
import {
  addFavorite,
  editFavorite,
  favoriteIdSchema,
  favoriteSchema,
  favoriteUpdateSchema,
  listFavorites,
  removeFavorite
} from '../controllers/favoritesController.js';
import { validate } from '../middleware/validate.js';

export const favoritesRouter = Router();

favoritesRouter.get('/', listFavorites);
favoritesRouter.post('/', validate(favoriteSchema), addFavorite);
favoritesRouter.put('/:id', validate(favoriteUpdateSchema), editFavorite);
favoritesRouter.delete('/:id', validate(favoriteIdSchema), removeFavorite);

