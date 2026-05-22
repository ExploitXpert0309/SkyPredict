import { CalendarClock, CloudRain, Gauge, Loader2, Thermometer, Wind } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const yesterday = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
};

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="soft-card p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
        <Icon size={15} />
        {label}
      </div>
      <p className="mt-2 text-lg font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

export default function HistoricalWeatherPanel({
  weather,
  historical,
  selectedDate,
  onDateChange,
  onLoad,
  loading,
  error
}) {
  const maxDate = yesterday();
  const locationName = weather
    ? [weather.location.name, weather.location.state, weather.location.country].filter(Boolean).join(', ')
    : 'Search a location first';
  const summary = historical?.summary;
  const chartData = (historical?.hourly || [])
    .filter((item) => item.temperature !== null)
    .map((item) => ({
      hour: item.hour,
      temperature: item.temperature,
      humidity: item.humidity
    }));

  return (
    <section className="panel p-5">
      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <div className="flex items-center gap-3">
            <CalendarClock className="text-aqua" />
            <div>
              <p className="eyebrow">Past weather</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">Pick a previous day</h2>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Calendar dates are limited to days that already happened. The report uses archived weather data for the currently selected location.
          </p>

          <form onSubmit={onLoad} className="mt-5 space-y-3">
            <div>
              <label htmlFor="historical-date" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Historical date</label>
              <input
                id="historical-date"
                type="date"
                value={selectedDate}
                max={maxDate}
                onChange={(event) => onDateChange(event.target.value)}
                className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-slate-950 outline-none transition focus:border-aqua focus:ring-4 focus:ring-aqua/15 dark:border-white/10 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <button className="primary-btn h-12 w-full sm:w-auto" type="submit" disabled={!weather || loading}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : <CalendarClock size={18} />}
              Show past report
            </button>
          </form>

          <p className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
            Location: {locationName}
          </p>
          {error && <p className="mt-3 rounded-lg border border-coral/30 bg-coral/10 px-4 py-3 text-sm font-medium text-coral">{error}</p>}
        </div>

        <div className="soft-card p-4">
          {!historical ? (
            <div className="flex min-h-72 flex-col items-center justify-center text-center">
              <CalendarClock className="text-aqua" size={36} />
              <h3 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">No past day selected yet.</h3>
              <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                Search a place, choose a previous date, and load a one-day weather report.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{historical.date}</p>
                  <h3 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">{summary.condition}</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{historical.source}</p>
                </div>
                <p className="text-5xl font-black text-slate-950 dark:text-white">{Math.round(summary.temperatureMean ?? 0)}°C</p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <Metric icon={Thermometer} label="High / Low" value={`${summary.temperatureMax ?? 'N/A'}° / ${summary.temperatureMin ?? 'N/A'}°`} />
                <Metric icon={Thermometer} label="Feels Like" value={summary.feelsLikeMean !== null ? `${summary.feelsLikeMean}°C` : 'N/A'} />
                <Metric icon={CloudRain} label="Rain" value={`${summary.rain ?? 0} mm`} />
                <Metric icon={CloudRain} label="Precipitation" value={`${summary.precipitation ?? 0} mm`} />
                <Metric icon={Wind} label="Max Wind" value={summary.windSpeedMax !== null ? `${summary.windSpeedMax} m/s` : 'N/A'} />
                <Metric icon={Gauge} label="Humidity" value={summary.humidityMean !== null ? `${summary.humidityMean}%` : 'N/A'} />
              </div>

              {chartData.length > 0 && (
                <div className="mt-5 h-52 rounded-lg border border-slate-200 bg-white/70 p-3 dark:border-white/10 dark:bg-slate-950/40">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <XAxis dataKey="hour" tick={{ fontSize: 11 }} minTickGap={16} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="temperature" name="Temp C" stroke="#ff7058" fill="#ff7058" fillOpacity={0.14} strokeWidth={2} />
                      <Area type="monotone" dataKey="humidity" name="Humidity %" stroke="#10b8c7" fill="#10b8c7" fillOpacity={0.1} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

