# SkyPredict — AI Weather Forecast App

**Developed by:** Srinivas Gummadidala
**Assessment:** PM Accelerator AI Engineer Internship — Technical Assessment (Full Stack)
**LinkedIn:** https://www.linkedin.com/in/srinivas-gummadidala/
**Repository:** https://github.com/DarkMatrix07/skypredict-v2

---

## 🔗 Live Links

| Resource | URL |
|---|---|
| **🌐 Live App** | http://159.65.152.242:8084 |
| **🔌 Live API** | http://159.65.152.242:8084/api/health |
| **🎥 Demo Video (1–2 min)** | **PASTE YOUR VIDEO URL HERE** _(YouTube / Google Drive / Loom)_ |
| **💻 GitHub Repo** | https://github.com/DarkMatrix07/skypredict-v2 |

---

## About PM Accelerator

[**PM Accelerator**](https://www.linkedin.com/school/pmaccelerator/) is a U.S.-based career
accelerator focused on helping professionals and students build real-world skills in Product
Management, AI, Software Engineering, and emerging technologies through mentorship, hands-on
projects, internships, and industry collaboration. The Product Manager Accelerator Program
offers AI PM Bootcamps, AI Builder Bootcamps, career coaching, resume reviews, mock interviews,
and a global community of product builders and engineers shipping real products.

The same description is rendered inside the app footer alongside the LinkedIn link, per the
assessment requirement.

---

## Project Overview

SkyPredict is a full-stack weather intelligence platform built for the PM Accelerator AI Engineer
Internship technical assessment. It satisfies **both Tech Assessment #1 (Frontend)** and
**Tech Assessment #2 (Backend)** — the dual-role / Full Stack track.

- **Frontend** — React + Vite dashboard with Tailwind CSS, dark mode, code splitting, Framer
  Motion transitions, and full responsive layout (laptop-first, scales to tablet and Android).
- **Backend** — Express REST API that centralises provider calls, Zod validation, in-memory
  caching, rate limiting, and Supabase persistence.
- **Database** — Supabase (Postgres) for `weather_history`, `favorite_locations`, and
  `user_searches` tables. Full CRUD, including a **date-range CREATE flow** that writes one row
  per day so reviewers can read, update, and delete each day independently.
- **Real APIs only** — no static or mocked data.

---

## How SkyPredict maps to the assessment rubric

### Tech Assessment #1 — Frontend
| Requirement | Where it is |
|---|---|
| Location input (zip / postal / GPS / landmarks / city / coordinates) | `WeatherSearch.jsx`, `openWeatherService.resolveLocation` |
| Current weather, clear visuals, icons | `CurrentWeatherCard.jsx` + Lucide icons |
| "Use current location" via browser geolocation | `Dashboard.geolocate()` |
| **1.1** 5-day forecast | `ForecastGrid.jsx` |
| **1.2** Graceful error handling | Zod errors surfaced through API, `ApiError`, in-UI banners |
| Responsive — desktop, tablet, smartphone | Tailwind responsive grid; tested 360 px → 1920 px |
| JS framework (no Python/Java) | React 18 + Vite |

### Tech Assessment #2 — Backend
| Requirement | Where it is |
|---|---|
| **2.1 CREATE** — location + date range → temperatures, validated, persisted | `POST /api/weather/range` → `historicalWeatherService.getHistoricalRange` → `supabaseService.saveWeatherRange` |
| Date-range validation (start ≤ end, end ≤ today, ≤ 31 days) | `weatherRangeSchema` in `weatherController.js` |
| Location-exists validation / fuzzy match | OpenWeather geocoding + Google Maps fallback in `resolveLocation` |
| **2.1 READ** | `GET /api/weather`, `GET /api/history`, `GET /api/history/searches` |
| **2.1 UPDATE** with validation | `PUT /api/weather/:id` (whitelisted fields), `PUT /api/favorites/:id` |
| **2.1 DELETE** | `DELETE /api/weather/:id`, `DELETE /api/favorites/:id`, `DELETE /api/history/searches/:id` |
| **2.2 API Integration** — YouTube, Google Maps, plus extras | `youtubeService.js`, `MapPanel.jsx`, OpenWeather Air Pollution, Open-Meteo Historical, TimezoneDB |
| **2.3 Data Export** — JSON, CSV, **XML, Markdown, PDF** | `GET /api/history/export?format=json\|csv\|xml\|md\|pdf` |
| Name + PM Accelerator info in the app itself | `Footer.jsx`, `Navbar.jsx` |

---

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router DOM, Recharts, Framer Motion, Lucide React, Axios
- **Backend:** Node.js, Express, Axios, Zod, Helmet, CORS, compression, express-rate-limit, node-cache, pdfkit, @json2csv/plainjs
- **Database:** Supabase (PostgreSQL)
- **External APIs:** OpenWeatherMap (current, forecast, air pollution), Open-Meteo Historical Weather, Google Maps + Places, YouTube Data API, TimezoneDB
- **Deployment targets:** Vercel (frontend), Render or Railway (backend)

---

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

### Requirements files

The assessment asks for a "requirements file showing which libraries/packages need to be
installed." Three are provided:

- [`package.json`](package.json) — root workspace + `install:all` orchestrator
- [`backend/package.json`](backend/package.json) — Express, Supabase, Zod, pdfkit, etc.
- [`frontend/package.json`](frontend/package.json) — React, Vite, Tailwind, Recharts, etc.

---

## Run Locally

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:5000/api/health`

If a previous run left the ports busy:

```bash
npm run dev:fresh
```

---

## Environment Setup

Backend (`backend/.env`):

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

Frontend (`frontend/.env`):

```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

---

## Supabase Setup

Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL editor. It creates:

- `weather_history` — one row per saved weather record (current search **or** one row per day
  from the date-range CREATE flow)
- `favorite_locations`
- `user_searches`

Assessment-friendly RLS policies are included so reviewers can exercise CRUD without auth. For
production, replace them with authenticated per-user policies.

---

## API Endpoints

### Weather

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/weather` | Search by city / zip / coordinates / landmark / geolocation |
| `POST` | `/api/weather/historical` | Past weather for a single date |
| `POST` | `/api/weather/range` | **Date-range CREATE** — fetches per-day temps, persists one row per day |
| `POST` | `/api/weather/hourly-forecast` | Hourly forecast for a selected day |
| `GET`  | `/api/weather/suggestions?query=` | Location autocomplete |
| `GET`  | `/api/weather` | List persisted weather history |
| `PUT`  | `/api/weather/:id` | Update a weather record (whitelisted fields) |
| `DELETE` | `/api/weather/:id` | Delete a weather record |

### History & exports

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/history` | Read saved weather records |
| `GET` | `/api/history/searches` | Read recent search queries |
| `DELETE` | `/api/history/searches/:id` | Delete a single query |
| `DELETE` | `/api/history/searches` | Clear all queries |
| `GET` | `/api/history/export?format=json` | Export — JSON |
| `GET` | `/api/history/export?format=csv` | Export — CSV |
| `GET` | `/api/history/export?format=xml` | Export — XML |
| `GET` | `/api/history/export?format=md` | Export — Markdown |
| `GET` | `/api/history/export?format=pdf` | Export — PDF |

### Favorites

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/favorites` | List favorites |
| `POST` | `/api/favorites` | Add a favorite |
| `PUT` | `/api/favorites/:id` | Update a favorite |
| `DELETE` | `/api/favorites/:id` | Delete a favorite |

### Health

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/health` | Provider configuration status (no secrets exposed) |

---

## Features

- Search by city, zip / postal code, GPS coordinates, landmarks, or browser geolocation.
- Current weather: temperature, feels-like, humidity, pressure, wind, visibility, sunrise,
  sunset, cloud cover, timezone, description, icon.
- **Date-range CREATE flow** (CRUD requirement) — pick a past date range, fetch daily temps from
  Open-Meteo, persist one row per day to Supabase; each day is independently
  readable / updatable / deletable.
- Past-date weather reports with calendar selector limited to dates that already happened.
- 5-day forecast cards generated from OpenWeather forecast data.
- Clickable forecast days → dedicated hourly weather report page.
- Air Quality Index + pollution components from OpenWeather Air Pollution API.
- Recharts analytics for temperature, humidity, and wind trends.
- Google Maps embed for the searched location.
- YouTube travel / weather videos for the searched city.
- Supabase-backed weather history, favorite locations, and search records.
- **Five export formats:** JSON, CSV, XML, Markdown, PDF.
- AI-style recommendations for clothing, travel, outdoor activities, and warnings.
- Dark / light mode, loading skeletons, debounce-ready search, Framer Motion transitions,
  responsive nav, empty states, robust error messages.
- Bonus features: voice search, city comparison, PWA manifest, offline shell caching, API
  caching, weather alerts through recommendation warnings.
- Health endpoint reports configured provider status without exposing secrets.

---

## Deployment

See [`docs/deployment-guide.md`](docs/deployment-guide.md). Once deployed, fill in the URLs at
the top of this README.

---

## Testing

```bash
npm run build --prefix frontend
npm run lint
npm run audit:all
```

Manual testing walkthrough: [`docs/testing-instructions.md`](docs/testing-instructions.md).

---

## 🎥 Demo Video

> **PASTE YOUR VIDEO LINK HERE → ______________________________**
>
> (YouTube, Google Drive, Loom, Vimeo — any viewable URL works.
> Replace this placeholder once recorded, and also update the table at the top of this README.)

Script: [`docs/demo-video-script.md`](docs/demo-video-script.md).

Cover in the 1–2 min walkthrough:
1. Search a city → current weather + 5-day forecast.
2. Use geolocation.
3. **Date-range CREATE** → show new rows appear in Supabase, then update and delete one.
4. Export to JSON, CSV, XML, Markdown, PDF.
5. Show Google Maps + YouTube panels.
6. Show the footer (name + PM Accelerator description + LinkedIn).

---

## Future Improvements

- User authentication and per-user saved locations.
- Push notifications for severe weather alerts.
- Server-side background jobs for favorite-location alert monitoring.
- Unit + integration tests with Vitest, React Testing Library, and Supertest.
- TypeScript migration for typed API contracts.
- Swap in-memory cache for Redis to support multi-instance deploys.

---

## Author

**Srinivas Gummadidala** — [LinkedIn](https://www.linkedin.com/in/srinivas-gummadidala/) · [GitHub](https://github.com/DarkMatrix07/skypredict-v2)

Built for the PM Accelerator AI Engineer Internship Technical Assessment.
