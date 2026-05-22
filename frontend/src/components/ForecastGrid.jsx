import { CalendarDays, ChevronRight, CloudLightning, CloudRain, CloudSun, Sun } from 'lucide-react';
import { buildDailyForecast, iconUrl } from '../utils/weather.js';

const getForecastVisual = (day) => {
  const description = day.description.toLowerCase();

  if (description.includes('thunder')) {
    return { Icon: CloudLightning, label: 'Storm risk', className: 'bg-amberline/10 text-amberline ring-amberline/20' };
  }

  if (description.includes('rain') || description.includes('drizzle')) {
    return { Icon: CloudRain, label: 'Rain likely', className: 'bg-aqua/10 text-aqua ring-aqua/20' };
  }

  if (day.max >= 42) {
    return { Icon: Sun, label: 'Extreme heat', className: 'bg-coral/10 text-coral ring-coral/20' };
  }

  if (day.max >= 38) {
    return { Icon: Sun, label: 'Very hot', className: 'bg-amberline/10 text-amberline ring-amberline/20' };
  }

  if (day.max >= 35 && description.includes('cloud')) {
    return { Icon: CloudSun, label: 'Hot with clouds', className: 'bg-amberline/10 text-amberline ring-amberline/20' };
  }

  return null;
};

export default function ForecastGrid({ forecast, onSelectDay }) {
  const days = buildDailyForecast(forecast);

  return (
    <section className="panel p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow">5-day outlook</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">Daily forecast</h2>
        </div>
        <CalendarDays className="text-coral" />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {days.map((day) => {
          const visual = getForecastVisual(day);
          const VisualIcon = visual?.Icon;

          return (
            <button
              key={day.date}
              type="button"
              onClick={() => onSelectDay(day)}
              className="soft-card group p-4 text-left transition hover:-translate-y-1 hover:border-aqua hover:shadow-md focus:outline-none focus:ring-2 focus:ring-aqua/50"
            >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {new Date(`${day.date}T00:00:00`).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
              <ChevronRight className="text-slate-300 transition group-hover:text-aqua" size={17} />
            </div>
            <div className="mt-3 flex h-16 items-center">
              {VisualIcon ? (
                <span className={`inline-flex h-14 w-14 items-center justify-center rounded-lg ring-1 ${visual.className}`}>
                  <VisualIcon size={32} strokeWidth={2.2} />
                </span>
              ) : (
                <img className="h-16 w-16" src={iconUrl(day.icon)} alt={day.description} />
              )}
            </div>
            <div className="mt-1 min-h-[3rem]">
              {visual && (
                <span className={`mb-1 inline-flex rounded-md px-2 py-1 text-[11px] font-black uppercase ${visual.className}`}>
                  {visual.label}
                </span>
              )}
              <p className="capitalize text-sm text-slate-500 dark:text-slate-400">{day.description}</p>
            </div>
            <p className="mt-3 text-2xl font-black text-slate-950 dark:text-white">{day.max}° <span className="text-base text-slate-500">{day.min}°</span></p>
            <div className="mt-3 flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>{day.humidity}% RH</span>
              <span>{day.wind} m/s</span>
            </div>
            <p className="mt-3 text-xs font-bold text-aqua">View time slots</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
