import { Github, Linkedin, Menu, Moon, Sun, X } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../hooks/useTheme.js';

const links = ['Forecast', 'Air', 'Charts', 'Map', 'Travel'];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/[0.88] shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/[0.92] dark:shadow-none">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <a href="#top" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink font-black text-white dark:bg-aqua dark:text-slate-950">AI</span>
          <span>
            <span className="block text-sm font-bold uppercase text-slate-950 dark:text-white">Weather Forecast</span>
            <span className="block text-xs text-slate-500 dark:text-slate-400">Srinivas Gummadidala</span>
          </span>
        </a>

        <div className="hidden items-center gap-2 lg:flex">
          {links.map((link) => (
            <a key={link} href={`#${link.toLowerCase()}`} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-aqua/10 hover:text-ink dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white">
              {link}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://www.linkedin.com/in/srinivas-gummadidala/"
            target="_blank"
            rel="noreferrer noopener"
            className="icon-btn hidden sm:inline-flex"
            aria-label="Srinivas Gummadidala on LinkedIn"
            title="LinkedIn — Srinivas Gummadidala"
          >
            <Linkedin size={18} />
          </a>
          <a
            href="https://github.com/DarkMatrix07/skypredict-v2"
            target="_blank"
            rel="noreferrer noopener"
            className="icon-btn hidden sm:inline-flex"
            aria-label="SkyPredict source on GitHub"
            title="GitHub — SkyPredict repo"
          >
            <Github size={18} />
          </a>
          <button className="icon-btn" type="button" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="icon-btn lg:hidden" type="button" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-950 lg:hidden">
          {links.map((link) => (
            <a key={link} href={`#${link.toLowerCase()}`} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
              {link}
            </a>
          ))}
          <div className="mt-2 flex gap-2 border-t border-slate-200 pt-3 dark:border-white/10">
            <a href="https://www.linkedin.com/in/srinivas-gummadidala/" target="_blank" rel="noreferrer noopener" className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold dark:border-white/10">
              <Linkedin size={16} /> LinkedIn
            </a>
            <a href="https://github.com/DarkMatrix07/skypredict-v2" target="_blank" rel="noreferrer noopener" className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold dark:border-white/10">
              <Github size={16} /> GitHub
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
