import { Github, Info, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/70 px-4 py-10 text-sm text-slate-600 dark:border-white/10 dark:bg-slate-950/80 dark:text-slate-400">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-bold text-slate-900 dark:text-white">SkyPredict · AI Weather Forecast App</p>
            <p className="mt-1 text-sm">
              Developed by <span className="font-semibold text-ink dark:text-aqua">Srinivas Gummadidala</span> for the
              PM Accelerator AI Engineer Internship Technical Assessment.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="https://www.linkedin.com/in/srinivas-gummadidala/"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:bg-aqua/10 hover:text-ink dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <Linkedin size={14} /> Srinivas on LinkedIn
            </a>
            <a
              href="https://github.com/DarkMatrix07/skypredict-v2"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:bg-aqua/10 hover:text-ink dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <Github size={14} /> Source on GitHub
            </a>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white/80 p-5 leading-relaxed text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-300">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-aqua">
            <Info size={14} /> About PM Accelerator
          </div>
          <p className="mt-3">
            <strong className="text-slate-900 dark:text-white">PM Accelerator</strong> is a U.S.-based career accelerator focused on helping
            professionals and students build real-world skills in Product Management, AI, Software Engineering, and emerging
            technologies through mentorship, hands-on projects, internships, and industry collaboration. The Product Manager
            Accelerator Program offers AI PM Bootcamps, AI Builder Bootcamps, career coaching, resume reviews, mock interviews,
            and a global community of product builders and engineers shipping real products.
          </p>
          <a
            href="https://www.linkedin.com/school/pmaccelerator/"
            target="_blank"
            rel="noreferrer noopener"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-ink px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-ink/90 dark:bg-aqua dark:text-slate-950 dark:hover:bg-aqua/90"
          >
            <Linkedin size={14} /> Visit PM Accelerator on LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
