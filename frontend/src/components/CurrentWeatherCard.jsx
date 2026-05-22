import { Droplets, Eye, Gauge, Sunrise, Sunset, Thermometer, Wind } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatTime, iconUrl, visibilityKm } from '../utils/weather.js';

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="soft-card p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
        <Icon size={15} />
        {label}
      </div>
      <div className="mt-2 text-lg font-bold text-slate-950 dark:text-white">{value}</div>
    </div>
  );
}

export default function CurrentWeatherCard({ weather }) {
  const current = weather.current;
  const primary = current.weather?.[0] || {};
  const timezoneOffset = current.timezone || 0;
  const cityLine = [weather.location.name, weather.location.state, weather.location.country].filter(Boolean).join(', ');
  const observedAt = new Date(current.dt * 1000).toLocaleString([], {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit'
  });

  return (
    <motion.section id="forecast" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="panel overflow-hidden">
      <div className="grid gap-0 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="border-b border-slate-200/80 p-6 sm:p-7 xl:border-b-0 xl:border-r dark:border-white/10">
          <div className="flex items-center justify-between gap-3">
            <p className="eyebrow">Current weather</p>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-white/10 dark:text-slate-300">
              Updated {observedAt}
            </span>
          </div>
          <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center">
            <img className="h-24 w-24 rounded-lg bg-slate-50 shadow-sm dark:bg-white/10 dark:shadow-none" src={iconUrl(primary.icon)} alt={primary.description} />
            <div>
              <h2 className="text-3xl font-black text-slate-950 dark:text-white">{cityLine}</h2>
              <p className="mt-2 capitalize text-slate-600 dark:text-slate-300">{primary.description}</p>
              <p className="mt-4 text-6xl font-black text-slate-950 dark:text-white">{Math.round(current.main.temp)}°C</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Feels like {Math.round(current.main.feels_like)}°C</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
          <Stat icon={Droplets} label="Humidity" value={`${current.main.humidity}%`} />
          <Stat icon={Gauge} label="Pressure" value={`${current.main.pressure} hPa`} />
          <Stat icon={Wind} label="Wind" value={`${current.wind?.speed ?? 0} m/s`} />
          <Stat icon={Eye} label="Visibility" value={visibilityKm(current.visibility)} />
          <Stat icon={Sunrise} label="Sunrise" value={formatTime(current.sys.sunrise, timezoneOffset)} />
          <Stat icon={Sunset} label="Sunset" value={formatTime(current.sys.sunset, timezoneOffset)} />
          <Stat icon={Thermometer} label="High / Low" value={`${Math.round(current.main.temp_max)}° / ${Math.round(current.main.temp_min)}°`} />
          <Stat icon={Gauge} label="Local Time" value={weather.timezone?.formatted?.slice(11, 16) || 'N/A'} />
          <Stat icon={Thermometer} label="UV Index" value={weather.uvIndex?.value ?? 'N/A'} />
        </div>
      </div>
    </motion.section>
  );
}
