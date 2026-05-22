import { GitCompareArrows, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function ComparisonPanel({ onCompare }) {
  const [query, setQuery] = useState('');
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  const compare = async (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const result = await onCompare(query);
      setComparison(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel p-5">
      <div className="flex items-center gap-3">
        <GitCompareArrows className="text-aqua" />
        <div>
          <p className="text-sm font-bold uppercase text-aqua">Bonus</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">City comparison</h2>
        </div>
      </div>
      <form onSubmit={compare} className="mt-4 flex gap-2">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Compare with city" className="h-11 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 outline-none focus:border-aqua dark:border-white/10 dark:bg-slate-900" />
        <button className="icon-btn" type="submit" aria-label="Compare city">{loading ? <Loader2 className="animate-spin" size={17} /> : <GitCompareArrows size={17} />}</button>
      </form>
      {comparison && (
        <div className="mt-4 rounded-lg bg-slate-950 p-4 text-white dark:bg-white dark:text-slate-950">
          <p className="font-bold">{comparison.location.name}, {comparison.location.country}</p>
          <p className="mt-2 text-3xl font-black">{Math.round(comparison.current.main.temp)}°C</p>
          <p className="capitalize opacity-75">{comparison.current.weather?.[0]?.description}</p>
        </div>
      )}
    </section>
  );
}

