import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import {
  createFavorite,
  deleteFavorite,
  getFavorites,
  updateFavorite
} from '../services/supabaseService.js';

export const favoriteSchema = z.object({
  body: z.object({
    cityName: z.string().trim().min(1).max(120),
    country: z.string().trim().max(80).optional().default('')
  })
});

export const favoriteUpdateSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    cityName: z.string().trim().min(1).max(120).optional(),
    country: z.string().trim().max(80).optional()
  })
});

export const favoriteIdSchema = z.object({
  params: z.object({ id: z.string().uuid() })
});

export const listFavorites = asyncHandler(async (_req, res) => {
  const data = await getFavorites();
  res.json({ success: true, data });
});

export const addFavorite = asyncHandler(async (req, res) => {
  const data = await createFavorite(req.body);
  res.status(201).json({ success: true, data });
});

export const editFavorite = asyncHandler(async (req, res) => {
  const updates = {};
  if (req.body.cityName) updates.city_name = req.body.cityName;
  if (req.body.country !== undefined) updates.country = req.body.country;
  if (!Object.keys(updates).length) {
    throw new ApiError(400, 'No favorite fields provided for update.');
  }
  const data = await updateFavorite(req.params.id, updates);
  res.json({ success: true, data });
});

export const removeFavorite = asyncHandler(async (req, res) => {
  const data = await deleteFavorite(req.params.id);
  res.json({ success: true, data });
});
