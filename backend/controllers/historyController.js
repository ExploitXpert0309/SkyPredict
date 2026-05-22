import { asyncHandler } from '../utils/asyncHandler.js';
import { clearSearches, deleteSearch, exportHistory, getHistory, getSearches } from '../services/supabaseService.js';

export const listHistory = asyncHandler(async (req, res) => {
  const data = await getHistory(req.query);
  res.json({ success: true, data });
});

export const listSearches = asyncHandler(async (_req, res) => {
  const data = await getSearches();
  res.json({ success: true, data });
});

export const removeSearch = asyncHandler(async (req, res) => {
  const data = await deleteSearch(req.params.id);
  res.json({ success: true, data });
});

export const removeAllSearches = asyncHandler(async (_req, res) => {
  const data = await clearSearches();
  res.json({ success: true, data });
});

const SUPPORTED_FORMATS = new Set(['json', 'csv', 'xml', 'md', 'markdown', 'pdf']);

export const downloadHistory = asyncHandler(async (req, res) => {
  const requested = (req.query.format || 'json').toLowerCase();
  const format = SUPPORTED_FORMATS.has(requested) ? requested : 'json';
  const exported = await exportHistory(format);
  res.setHeader('Content-Type', exported.contentType);
  res.setHeader('Content-Disposition', `attachment; filename="weather-history.${exported.extension}"`);
  res.send(exported.body);
});
