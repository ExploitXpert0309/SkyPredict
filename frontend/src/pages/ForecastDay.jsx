import {
  ArrowLeft,
  Cloud,
  CloudDrizzle,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSun,
  Droplets,
  Eye,
  Gauge,
  Moon,
  Sun,
  Thermometer,
  Wind
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import Footer from '../components/Footer.jsx';
import Navbar from '../components/Navbar.jsx';
import { weatherApi } from '../services/api.js';
import { iconUrl, visibilityKm } from '../utils/weather.js';

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

const numericDomain = (values, padding = 2, minimumFloor = null) => {
  const valid = values.filter(Number.isFinite);
  if (!valid.length) return ['auto', 'auto'];
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  const spread = Math.max(max - min, 1);
  const pad = Math.max(padding, spread * 0.18);
  const lower = Math.floor(min - pad);
  const upper = Math.ceil(max + pad);
  return [minimumFloor === null ? lower : Math.max(minimumFloor, lower), upper];
};

const isNightHour = (time) => {
  const hour = new Date(time).getHours();
  return hour < 6 || hour >= 18;
};

const getWeatherVisual = (item) => {
  const code = item.weatherCode;
  const description = (item.description || '').toLowerCase();
  const night = isNightHour(item.time);

  if ([95, 96, 99].includes(code) || description.includes('thunder')) {
    return { Icon: CloudLightning, className: 'text-amberline', label: 'Thunderstorm' };
  }
  if ([61, 63, 65, 80, 81, 82].includes(code) || description.includes('rain')) {
    return { Icon: CloudRain, className: 'text-aqua', label: 'Rain' };
  }
  if ([51, 53, 55].includes(code) || description.includes('drizzle')) {
    return { Icon: CloudDrizzle, className: 'text-aqua', label: 'Drizzle' };
  }
  if ([2, 3, 45, 48].includes(code) || description.includes('cloud') || description.includes('fog') || description.includes('overcast')) {
    return night
      ? { Icon: CloudMoon, className: 'text-slate-500 dark:text-slate-200', label: 'Cloudy night' }
      : { Icon: CloudSun, className: 'text-amberline', label: 'Cloudy sun' };
  }

  return night
    ? { Icon: Moon, className: 'text-slate-500 dark:text-slate-200', label: 'Clear night' }
    : { Icon: Sun, className: 'text-amberline', label: 'Sunny' };
};

function WeatherGlyph({ item, size = 34 }) {
  if (item?.icon && !item.weatherCode) {
    return <img className="h-10 w-10" src={iconUrl(item.icon)} alt={item.description} />;
  }

  const { Icon, className, label } = getWeatherVisual(item || {});
  return <Icon aria-label={label} className={className} size={size} />;
}

export default function ForecastDay() {
  const { date } = useParams();
  const [hourlyReport, setHourlyReport] = useState(null);
  const [hourlyError, setHourlyError] = useState('');

  const data = useMemo(() => {
    const raw = sessionStorage.getItem('selectedForecastDay');
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return parsed.date === date ? parsed : null;
    } catch {
      return null;
    }
  }, [date]);

  useEffect(() => {
    if (!data?.latitude || !data?.longitude || !date) return;

    let active = true;
    weatherApi.hourlyForecast({
      latitude: data.latitude,
      longitude: data.longitude,
      date
    }).then((report) => {
      if (active) setHourlyReport(report);
    }).catch((error) => {
      if (active) setHourlyError(error.message);
    });

    return () => {
      active = false;
    };
  }, [data, date]);

  const items = hourlyReport?.items?.length ? hourlyReport.items : data?.items || [];
  const chartData = items.map((item) => ({
    hour: item.hour,
    temperature: item.temperature,
    feelsLike: item.feelsLike,
    humidity: item.humidity,
    wind: item.wind,
    pressure: item.pressure
  }));

  const temps = items.map((item) => item.temperature).filter(Number.isFinite);
  const feels = items.map((item) => item.feelsLike).filter(Number.isFinite);
  const humidity = items.map((item) => item.humidity).filter(Number.isFinite);
  const winds = items.map((item) => item.wind).filter(Number.isFinite);
  const pressures = items.map((item) => item.pressure).filter(Number.isFinite);
  const primary = items[Math.floor(items.length / 2)] || items[0];
  const tempDomain = numericDomain([...temps, ...feels], 2);
  const windDomain = numericDomain(winds, 1, 0);
  const pressureDomain = numericDomain(pressures, 1);

  return (
    <div className="min-h-screen bg-[#f8fbff] text-slate-950 dark:bg-slate-950 dark:text-white">
      <Navbar />
      <main className="weather-clouds transition-colors duration-500">
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <Link to="/" className="muted-btn w-fit py-2">
            <ArrowLeft size={17} />
            Back to dashboard
          </Link>

          {!data ? (
            <section className="panel flex min-h-96 flex-col items-center justify-center px-6 py-12 text-center">
              <Cloud className="text-aqua" size={44} />
              <h1 className="mt-5 text-3xl font-black text-slate-950 dark:text-white">No forecast day selected.</h1>
              <p className="mt-3 max-w-xl text-slate-600 dark:text-slate-300">
                Go back to the dashboard, search a location, and click one of the 5-day forecast cards.
              </p>
            </section>
          ) : (
            <>
              <section className="panel overflow-hidden">
                <div className="grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
                  <div className="border-b border-slate-200/80 p-6 lg:border-b-0 lg:border-r dark:border-white/10">
                    <p className="eyebrow">Hourly forecast report</p>
                    <h1 className="mt-3 text-4xl font-black leading-tight text-slate-950 dark:text-white">
                      {new Date(data.date).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h1>
                    <p className="mt-3 text-slate-600 dark:text-slate-300">{data.location}</p>
                    {primary && (
                      <div className="mt-6 flex items-center gap-4">
                        <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-slate-50 shadow-sm dark:bg-white/10 dark:shadow-none">
                          <WeatherGlyph item={primary} size={46} />
                        </div>
                        <div>
                          <p className="capitalize text-slate-600 dark:text-slate-300">{primary.description}</p>
                          <p className="mt-2 text-5xl font-black text-slate-950 dark:text-white">{primary.temperature}°C</p>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {hourlyReport ? 'Representative hourly forecast' : 'Representative forecast slot'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
                    <Metric icon={Thermometer} label="High / Low" value={temps.length ? `${Math.max(...temps)}° / ${Math.min(...temps)}°` : 'N/A'} />
                    <Metric icon={Droplets} label="Avg Humidity" value={humidity.length ? `${Math.round(humidity.reduce((sum, value) => sum + value, 0) / humidity.length)}%` : 'N/A'} />
                    <Metric icon={Wind} label="Max Wind" value={winds.length ? `${Math.max(...winds).toFixed(1)} m/s` : 'N/A'} />
                    <Metric icon={Gauge} label="Pressure" value={primary?.pressure ? `${primary.pressure} hPa` : 'N/A'} />
                    <Metric icon={Eye} label="Visibility" value={primary?.visibility ? visibilityKm(primary.visibility) : 'N/A'} />
                    <Metric icon={Cloud} label="Time Slots" value={`${items.length}`} />
                  </div>
                </div>
              </section>

              <section className="panel p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="eyebrow">Graph report</p>
                    <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">24-hour weather trends</h2>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{hourlyReport ? hourlyReport.source : 'OpenWeather forecast intervals'}</p>
                </div>
                {hourlyError && (
                  <p className="mt-3 rounded-lg border border-amberline/30 bg-amberline/10 px-4 py-3 text-sm font-medium text-slate-700 dark:text-amberline">
                    Hourly API unavailable, showing OpenWeather forecast intervals instead. {hourlyError}
                  </p>
                )}

                <div className="mt-5 grid gap-5 xl:grid-cols-3">
                  <div className="h-72 rounded-lg border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-950/40 xl:col-span-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="dayTemp" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="5%" stopColor="#ff7058" stopOpacity={0.45} />
                            <stop offset="95%" stopColor="#ff7058" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="hour" tick={{ fontSize: 11 }} minTickGap={8} />
                        <YAxis tick={{ fontSize: 11 }} domain={tempDomain} />
                        <Tooltip />
                        <Area type="monotone" dataKey="temperature" name="Temp C" stroke="#ff7058" fill="url(#dayTemp)" strokeWidth={3} />
                        <Line type="monotone" dataKey="feelsLike" name="Feels C" stroke="#f5b841" strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="h-72 rounded-lg border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-950/40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="hour" tick={{ fontSize: 11 }} minTickGap={16} />
                        <YAxis tick={{ fontSize: 11 }} domain={windDomain} />
                        <Tooltip />
                        <Bar dataKey="wind" name="Wind m/s" fill="#2fbf71" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="mt-5 h-72 rounded-lg border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-950/40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="hour" tick={{ fontSize: 11 }} minTickGap={8} />
                      <YAxis yAxisId="humidity" tick={{ fontSize: 11 }} domain={[0, 100]} width={36} />
                      <YAxis yAxisId="pressure" orientation="right" tick={{ fontSize: 11 }} domain={pressureDomain} width={52} />
                      <Tooltip />
                      <Line yAxisId="humidity" type="monotone" dataKey="humidity" name="Humidity %" stroke="#10b8c7" strokeWidth={3} dot={false} />
                      <Line yAxisId="pressure" type="monotone" dataKey="pressure" name="Pressure hPa" stroke="#64748b" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="panel p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="eyebrow">Scrollable hours</p>
                    <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">
                      {hourlyReport ? 'Hourly weather report' : 'Available forecast intervals'}
                    </h2>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Scroll sideways to review all {items.length} slots.</p>
                </div>

                <div className="mt-5 overflow-x-auto pb-3">
                  <div className="flex min-w-max gap-3">
                    {items.map((item) => (
                      <article key={item.time} className="soft-card w-44 shrink-0 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-black text-slate-950 dark:text-white">{item.hour}</p>
                            <p className="line-clamp-2 capitalize text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
                          </div>
                          <WeatherGlyph item={item} size={32} />
                        </div>
                        <p className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{item.temperature}°C</p>
                        <div className="mt-3 space-y-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          <p>Feels {item.feelsLike}°</p>
                          <p>{item.humidity ?? 'N/A'}% RH</p>
                          <p>{item.wind} m/s wind</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="mt-4 max-h-96 overflow-auto rounded-lg border border-slate-200 bg-white/70 dark:border-white/10 dark:bg-slate-950/40">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="sticky top-0 bg-slate-100 text-xs uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Time</th>
                        <th className="px-4 py-3">Temp</th>
                        <th className="px-4 py-3">Feels</th>
                        <th className="px-4 py-3">Humidity</th>
                        <th className="px-4 py-3">Wind</th>
                        <th className="px-4 py-3">Pressure</th>
                        <th className="px-4 py-3">Visibility</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                      {items.map((item) => (
                        <tr key={`row-${item.time}`} className="text-slate-700 dark:text-slate-200">
                          <td className="px-4 py-3 font-bold text-slate-950 dark:text-white">{item.hour}</td>
                          <td className="px-4 py-3">{item.temperature}°C</td>
                          <td className="px-4 py-3">{item.feelsLike}°C</td>
                          <td className="px-4 py-3">{item.humidity ?? 'N/A'}%</td>
                          <td className="px-4 py-3">{item.wind} m/s</td>
                          <td className="px-4 py-3">{item.pressure ?? 'N/A'} hPa</td>
                          <td className="px-4 py-3">{item.visibility ? visibilityKm(item.visibility) : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

