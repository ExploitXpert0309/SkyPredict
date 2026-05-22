import { Map } from 'lucide-react';

export default function MapPanel({ weather }) {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { lat, lon, name, displayName } = weather.location;
  const mapLabel = displayName || name;
  const hasGoogleKey = key && !/^your_|placeholder/i.test(key);
  const src = hasGoogleKey
    ? `https://www.google.com/maps/embed/v1/place?key=${key}&q=${lat},${lon}&zoom=16&maptype=roadmap`
    : `https://maps.google.com/maps?q=${lat},${lon}&z=16&output=embed`;

  return (
    <section id="map" className="panel overflow-hidden">
      <div className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm font-bold uppercase text-aqua">Google Maps</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">{mapLabel}</h2>
        </div>
        <Map className="text-coral" />
      </div>
      <iframe
        title={`Map of ${mapLabel}`}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-[380px] w-full border-0"
      />
    </section>
  );
}
