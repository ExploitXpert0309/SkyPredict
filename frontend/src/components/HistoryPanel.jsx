import { Download, History, Trash2, X } from 'lucide-react';
import { weatherApi } from '../services/api.js';

export default function HistoryPanel({ history, searches, onDelete, onSearch, onDeleteSearch, onClearSearches }) {
  const download = (format) => {
    window.location.assign(weatherApi.exportHistory(format));
  };

  return (
    <section className="panel p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-aqua">Search History</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">Recent weather</h2>
        </div>
        <History className="text-coral" />
      </div>

      <div className="mt-4 flex gap-2">
        <button className="muted-btn py-2" type="button" onClick={() => download('json')}><Download size={16} />JSON</button>
        <button className="muted-btn py-2" type="button" onClick={() => download('csv')}><Download size={16} />CSV</button>
      </div>

      <div className="mt-4 max-h-80 space-y-2 overflow-auto pr-1">
        {history.length === 0 && <p className="text-sm text-slate-500">History appears after successful searches.</p>}
        {history.map((item) => (
          <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50/90 p-3 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none">
            <div className="flex items-start justify-between gap-2">
              <button type="button" className="text-left" onClick={() => onSearch(item.location)}>
                <span className="block font-bold text-slate-950 dark:text-white">{item.location}, {item.country}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{Math.round(item.temperature)} C - {item.weather_condition}</span>
              </button>
              <button className="icon-btn h-9 w-9" type="button" onClick={() => onDelete(item.id)} aria-label="Delete history"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {searches.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Recent queries</p>
            <button type="button" onClick={onClearSearches} className="text-xs font-bold text-coral transition hover:text-red-600">
              Clear queries
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {searches.slice(0, 8).map((search) => (
              <span key={search.id} className="inline-flex max-w-full items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-200">
                <button type="button" onClick={() => onSearch(search.query)} className="max-w-52 truncate text-left sm:max-w-64">
                  {search.query}
                </button>
                <button type="button" onClick={() => onDeleteSearch(search.id)} className="text-slate-400 transition hover:text-coral" aria-label={`Delete query ${search.query}`}>
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

