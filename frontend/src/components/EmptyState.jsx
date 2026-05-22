import { CloudSun } from 'lucide-react';

export default function EmptyState() {
  return (
    <section className="panel flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">
      <CloudSun className="text-aqua" size={46} />
      <h2 className="mt-5 text-2xl font-bold text-slate-950 dark:text-white">Search a place to build the dashboard.</h2>
      <p className="mt-3 max-w-xl text-slate-600 dark:text-slate-300">
        Current conditions, the five-day outlook, air quality, charts, maps, travel content, and saved history will appear here.
      </p>
    </section>
  );
}
