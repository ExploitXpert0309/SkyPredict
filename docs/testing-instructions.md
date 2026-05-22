# Testing Instructions

## Local Verification

```bash
npm run install:all
npm run dev
```

Open `http://localhost:5173`.

## Manual Test Checklist

- Search by city: `Hyderabad`.
- Search by zip code: `10001`.
- Search by coordinates: `17.3850,78.4867`.
- Search by landmark: `Eiffel Tower`.
- After a successful search, choose a past date in the Past Weather calendar and load the one-day historical report.
- Confirm the calendar does not allow today or future dates.
- Click any 5-day forecast card and verify it opens a dedicated hourly report page for only that selected day.
- Use Back to dashboard from the hourly report page.
- Use current location and deny permission once to verify the error state.
- Add and remove a favorite location.
- Delete a history item.
- Export history as JSON and CSV.
- Resize to an Android viewport and verify navigation, cards, charts, map, and videos remain usable.
- Turn off the backend and verify the frontend shows a readable API error.

## Build Checks

```bash
npm run build --prefix frontend
npm run lint
npm run audit:all
```

The backend health endpoint also reports provider configuration booleans without exposing keys:

```bash
curl http://localhost:5000/api/health
```
