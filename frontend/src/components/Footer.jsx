import { BookOpen, Mail, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="relative z-[1] mt-auto px-3 pb-4 pt-10 sm:px-5 sm:pb-5 sm:pt-14">
      <div className="glass-panel mx-auto max-w-7xl overflow-hidden rounded-[2rem]">
        <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.4fr_0.9fr_0.9fr] lg:px-10 lg:py-10">
          <div>
            <div className="mb-4 inline-flex items-center gap-3 text-primary-600 dark:text-primary-300">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--hero-gradient)] text-white shadow-lg shadow-blue-500/20">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <div className="brand-font text-2xl font-bold">NotesKart</div>
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Built for students</div>
              </div>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              NotesKart makes campus commerce feel modern: discover affordable notes, browse local books, and unlock digital material from fellow students in a cleaner, more trustworthy marketplace.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-extrabold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Quick Links</h4>
            <div className="space-y-3 text-sm">
              <Link to="/" className="flex items-center gap-2 font-semibold text-slate-700 transition-colors hover:text-primary-600 dark:text-slate-200 dark:hover:text-primary-300">
                <ArrowRight className="h-4 w-4" /> Browse Materials
              </Link>
              <Link to="/dashboard" className="flex items-center gap-2 font-semibold text-slate-700 transition-colors hover:text-primary-600 dark:text-slate-200 dark:hover:text-primary-300">
                <ArrowRight className="h-4 w-4" /> My Dashboard
              </Link>
              <Link to="/register" className="flex items-center gap-2 font-semibold text-slate-700 transition-colors hover:text-primary-600 dark:text-slate-200 dark:hover:text-primary-300">
                <ArrowRight className="h-4 w-4" /> Get Started
              </Link>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-extrabold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Contact</h4>
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
                <Mail className="h-4 w-4 text-primary-500" />
                support@noteskart.me
              </div>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                Reach out for account help, payment issues, or listing approvals.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200/70 px-6 py-4 text-center text-xs font-semibold text-slate-500 dark:border-slate-800/70 dark:text-slate-400 sm:px-10">
          <span className="inline-flex items-center gap-1">
            © {new Date().getFullYear()} NotesKart. Made with <Heart className="h-3 w-3 fill-rose-400 text-rose-400" /> for students.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
