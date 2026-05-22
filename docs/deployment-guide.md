# Deployment Guide

## Frontend on Vercel

1. Create a Vercel project from this repository.
2. Set the project root to `frontend`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Add environment variables:
   - `VITE_API_BASE_URL=https://your-backend-host.example.com/api`
   - `VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key`

## Backend on Render or Railway

1. Create a Node.js web service with root directory `backend`.
2. Build command: `npm install`.
3. Start command: `npm start`.
4. Add environment variables from `backend/.env.example`.
5. Set `CLIENT_URL` to the deployed Vercel URL.

## Supabase

1. Open the Supabase SQL editor.
2. Run `supabase/schema.sql`.
3. Confirm the `weather_history`, `favorite_locations`, and `user_searches` tables exist.
4. For production, replace broad assessment policies with authenticated per-user policies.

