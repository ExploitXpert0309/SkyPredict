import { Brain, CloudAlert, Shirt, Trees, Plane } from 'lucide-react';

const groups = [
  ['Clothing', 'clothing', Shirt],
  ['Travel', 'travel', Plane],
  ['Outdoor', 'outdoor', Trees],
  ['Warnings', 'warnings', CloudAlert]
];

export default function Recommendations({ recommendations }) {
  return (
    <section className="panel p-5">
      <div className="flex items-center gap-3">
        <Brain className="text-aqua" />
        <div>
          <p className="eyebrow">Weather assistant</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">Recommendations</h2>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {groups.map(([title, key, Icon]) => (
          <article key={key} className="soft-card p-4">
            <div className="flex items-center gap-2 font-bold text-slate-950 dark:text-white">
              <Icon size={18} className="text-coral" />
              {title}
            </div>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {(recommendations?.[key]?.length ? recommendations[key] : ['No recommendation available for this category yet.']).map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
