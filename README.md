# AI Weather Forecast App

Developed by: Srinivas Gummadidala

## About PM Accelerator

PM Accelerator is a U.S.-based career accelerator focused on helping professionals and students build real-world skills in Product Management, AI, Software Engineering, and emerging technologies through mentorship, hands-on projects, internships, and industry collaboration.

## Project Overview

AI Weather Forecast App is a full-stack weather intelligence platform built for the PM Accelerator AI Engineer Internship technical assessment. It uses real APIs for current weather, 5-day forecasts, historical past-day weather, air pollution, maps, travel videos, and timezone data, with Supabase PostgreSQL persistence for search history and favorite locations.

The application is laptop-first, fast, modular, and responsive on Android. The frontend is a modern React dashboard, and the backend is an Express API layer that centralizes provider calls, validation, caching, persistence, and error handling.

## Features

- Search by city, zip/postal code, GPS coordinates, landmarks, or browser geolocation.
- Current weather with temperature, feels-like, humidity, pressure, wind, visibility, sunrise, sunset, UV index, timezone, weather description, and icons.
- Past-date weather reports using a calendar selector limited to dates that already happened.
- 5-day forecast cards generated from OpenWeather forecast data.
- Clickable forecast days with a dedicated hourly weather report page for the selected day.
- Air Quality Index and pollution component details from OpenWeather Air Pollution API.
- Recharts analytics for temperature, humidity, and wind trends.
- Google Maps embed for the searched location.
- YouTube travel/weather videos for the searched city.
- Supabase-backed weather history, favorite locations, and search records.
- JSON and CSV history export.
- AI-style recommendations for clothing, travel, outdoor activities, and warnings.
- Dark/light mode, loading skeletons, debounce-ready search, smooth Framer Motion transitions, responsive navigation, empty states, and robust error messages.
- Bonus features: voice search, city comparison, PWA manifest, offline shell caching, API caching, and weather alerts through recommendation warnings.
- Health endpoint reports configured provider status without exposing secrets.

## Tech Stack

- Frontend: React.js, Vite, Tailwind CSS, Axios, React Router DOM, Recharts, Framer Motion, Lucide React Icons.
- Backend: Node.js, Express.js, Axios, Zod, Helmet, CORS, compression, rate limiting, node-cache.
- Database: Supabase PostgreSQL.
- APIs: OpenWeatherMap, OpenWeather Air Pollution, Open-Meteo Historical Weather, Google Maps, YouTube Data API, TimezoneDB.
- Deployment: Vercel for frontend, Render or Railway for backend.

## Installation

```bash
npm run install:all
```

Create local environment files from the examples:

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

Fill in the API keys provided for the assessment. Keep `.env` files local and never commit them.

## Run Locally

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:5000/api/health`

## Environment Setup

Backend variables:

```bash
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
OPENWEATHER_API_KEY=your_openweather_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
YOUTUBE_API_KEY=your_youtube_api_key
TIMEZONE_API_KEY=your_timezone_api_key
```

Frontend variables:

```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Supabase Setup

Run [supabase/schema.sql](supabase/schema.sql) in the Supabase SQL editor. It creates:

- `weather_history`
- `favorite_locations`
- `user_searches`

Assessment-friendly RLS policies are included. For production, replace them with authenticated per-user policies.

## API Setup

- OpenWeatherMap key is used for current weather, forecast, UV, and air pollution APIs.
- Google Maps key is used by the frontend map embed.
- Google Maps Geocoding is used as a backend fallback for landmark searches.
- YouTube API key is used by the backend travel video service.
- TimezoneDB key is used by the backend timezone service.
- Open-Meteo Historical Weather API is used for past-date weather reports and does not require an API key.

## Backend Routes

- `POST /api/weather`
- `POST /api/weather/historical`
- `POST /api/weather/hourly-forecast`
- `GET /api/weather`
- `PUT /api/weather/:id`
- `DELETE /api/weather/:id`
- `GET /api/history`
- `GET /api/history/searches`
- `GET /api/history/export?format=json`
- `GET /api/history/export?format=csv`
- `GET /api/favorites`
- `POST /api/favorites`
- `PUT /api/favorites/:id`
- `DELETE /api/favorites/:id`

## Screenshots

Add screenshots after running locally or deploying:

- `docs/screenshots/dashboard-laptop.png`
- `docs/screenshots/dashboard-android.png`
- `docs/screenshots/charts-map-videos.png`

## Deployment Links

- Frontend Vercel URL: add after deployment.
- Backend Render/Railway URL: add after deployment.

See [docs/deployment-guide.md](docs/deployment-guide.md).

## Testing

```bash
npm run build --prefix frontend
npm run lint
npm run audit:all
```

Manual testing instructions are in [docs/testing-instructions.md](docs/testing-instructions.md).

## Demo Video

Demo video link: add after recording.

Script: [docs/demo-video-script.md](docs/demo-video-script.md).

## Future Improvements

- Add user authentication and per-user saved locations.
- Add push notifications for severe weather alerts.
- Add hourly forecast drill-down and historical trend comparisons.
- Add server-side background jobs for favorite-location alert monitoring.
- Add unit and integration tests with Vitest, React Testing Library, and Supertest.
- Add typed API contracts with TypeScript.
