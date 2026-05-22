import { PlayCircle } from 'lucide-react';

export default function TravelVideos({ videos }) {
  return (
    <section id="travel" className="panel p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-aqua">Travel Videos</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">Explore before you go</h2>
        </div>
        <PlayCircle className="text-coral" />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {(videos || []).map((video) => (
          <a key={video.id} href={video.url} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-lg border border-slate-200 bg-white/75 dark:border-white/10 dark:bg-white/5">
            <img className="aspect-video w-full object-cover transition group-hover:scale-105" src={video.thumbnail} alt={video.title} loading="lazy" />
            <div className="p-3">
              <p className="line-clamp-2 text-sm font-bold text-slate-950 dark:text-white">{video.title}</p>
              <p className="mt-1 text-xs text-slate-500">{video.channelTitle}</p>
            </div>
          </a>
        ))}
        {(!videos || videos.length === 0) && <p className="text-sm text-slate-500">Travel videos are unavailable for this search.</p>}
      </div>
    </section>
  );
}

