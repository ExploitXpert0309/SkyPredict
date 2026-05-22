import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-aqua">404</p>
        <h1 className="mt-4 text-4xl font-bold">This route drifted away.</h1>
        <Link className="primary-btn mt-8" to="/">Back to dashboard</Link>
      </div>
    </main>
  );
}

