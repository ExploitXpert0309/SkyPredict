import { Activity, Factory } from 'lucide-react';
import { aqiLabel } from '../utils/weather.js';

export default function AirQualityCard({ airQuality }) {
  const item = airQuality?.list?.[0];
  const [label, color] = aqiLabel(item?.main?.aqi);
  const components = item?.components || {};

  return (
    <section id="air" className="panel p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-aqua">Air Quality</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">AQI status</h2>
        </div>
        <Factory className="text-coral" />
      </div>

      <div className="mt-5 flex items-center gap-4 rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-slate-950 shadow-sm dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-white dark:shadow-none">
        <Activity className={color} size={34} />
        <div>
          <p className={`text-3xl font-black ${color}`}>{label}</p>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">AQI level {item?.main?.aqi || 'N/A'}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {Object.entries(components).slice(0, 8).map(([key, value]) => (
          <div key={key} className="rounded-lg border border-slate-200 bg-slate-50/90 p-3 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none">
            <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{key}</p>
            <p className="mt-1 font-bold text-slate-950 dark:text-white">{value} ug/m3</p>
          </div>
        ))}
      </div>
    </section>
  );
}

