import { Heart, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function FavoritesPanel({ favorites, onAdd, onDelete, onSearch }) {
  const [cityName, setCityName] = useState('');

  const submit = (event) => {
    event.preventDefault();
    if (!cityName.trim()) return;
    onAdd(cityName.trim());
    setCityName('');
  };

  return (
    <section className="panel p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Favorites</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">Saved locations</h2>
        </div>
        <Heart className="text-coral" />
      </div>

      <form onSubmit={submit} className="mt-4 flex gap-2">
        <input value={cityName} onChange={(event) => setCityName(event.target.value)} placeholder="Add city" className="h-11 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 outline-none focus:border-aqua dark:border-white/10 dark:bg-slate-900" />
        <button className="icon-btn" type="submit" aria-label="Add favorite"><Plus size={18} /></button>
      </form>

      <div className="mt-4 space-y-2">
        {favorites.length === 0 && <p className="text-sm text-slate-500">No favorite locations yet.</p>}
        {favorites.map((favorite) => (
          <div key={favorite.id} className="soft-card flex items-center justify-between gap-2 p-3">
            <button type="button" onClick={() => onSearch(favorite.city_name)} className="min-w-0 text-left">
              <span className="block truncate font-bold text-slate-950 dark:text-white">{favorite.city_name}</span>
              <span className="text-xs text-slate-500">{favorite.country || 'Saved city'}</span>
            </button>
            <button className="icon-btn h-9 w-9" type="button" onClick={() => onDelete(favorite.id)} aria-label="Delete favorite"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </section>
  );
}
