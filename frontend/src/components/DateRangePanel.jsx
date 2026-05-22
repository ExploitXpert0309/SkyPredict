import { useState } from 'react';
import { CalendarRange, Database, Loader2 } from 'lucide-react';

const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = (n) => {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date.toISOString().slice(0, 10);
};

export default function DateRangePanel({ weather, onSubmit }) {
  const [startDate, setStartDate] = useState(daysAgo(7));
  const [endDate, setEndDate] = useState(daysAgo(1));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const maxDate = today();

  const submit = async (event) => {
    event.preventDefault();
    if (!weather) {
      setError('Search a location first so we know where to fetch the range.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date must be on or before end date.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const data = await onSubmit({
        latitude: weather.location.lat,
        longitude: weather.location.lon,
        query: weather.location.displayName || weather.location.name,
        startDate,
        endDate
      });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel p-5">
      <div className="flex items-center gap-3">
        <CalendarRange className="text-aqua" />
        <div>
          <p className="eyebrow">CRUD · Create</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">Save a date-range report</h2>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
        Pick a past date range for the searched location. Daily temperatures are fetched from Open-Meteo and one row per day is persisted to Supabase
        so you can read, update, or delete each day from the History panel.
      </p>

      <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <div>
          <label htmlFor="range-start" className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Start date</label>
          <input
            id="range-start"
            type="date"
            value={startDate}
            max={maxDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-slate-950 outline-none transition focus:border-aqua focus:ring-4 focus:ring-aqua/15 dark:border-white/10 dark:bg-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="range-end" className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">End date</label>
          <input
            id="range-end"
            type="date"
            value={endDate}
            max={maxDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-slate-950 outline-none transition focus:border-aqua focus:ring-4 focus:ring-aqua/15 dark:border-white/10 dark:bg-slate-900 dark:text-white"
          />
        </div>
        <button type="submit" disabled={!weather || loading} className="primary-btn h-11 self-end">
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Database size={16} />}
          Fetch &amp; Save
        </button>
      </form>

      {error && (
        <p className="mt-3 rounded-lg border border-coral/30 bg-coral/10 px-4 py-3 text-sm font-medium text-coral">{error}</p>
      )}

      {result?.days?.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 dark:border-white/10">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-left text-xs font-bold uppercase text-slate-600 dark:bg-slate-900 dark:text-slate-300">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Condition</th>
                <th className="px-3 py-2">Mean °C</th>
                <th className="px-3 py-2">Max / Min</th>
                <th className="px-3 py-2">Rain (mm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {result.days.map((day) => (
                <tr key={day.date} className="text-slate-700 dark:text-slate-200">
                  <td className="px-3 py-2 font-mono">{day.date}</td>
                  <td className="px-3 py-2">{day.condition}</td>
                  <td className="px-3 py-2">{day.temperatureMean ?? '—'}</td>
                  <td className="px-3 py-2">{day.temperatureMax ?? '—'} / {day.temperatureMin ?? '—'}</td>
                  <td className="px-3 py-2">{day.precipitation ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-400">
            Saved {result.savedCount} of {result.days.length} day(s) to Supabase.
            {result.warnings?.length > 0 && <span className="ml-2 text-coral">{result.warnings.join(' ')}</span>}
          </p>
        </div>
      )}
    </section>
  );
}
