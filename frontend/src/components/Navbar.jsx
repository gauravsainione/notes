import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, User, LogOut, Menu, X, Home, Wallet, Sparkles } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <nav className="sticky top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div className="glass-panel mx-auto max-w-7xl rounded-2xl sm:rounded-3xl">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-[4.15rem] items-center justify-between sm:h-[4.5rem]">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2.5 text-primary-600 dark:text-primary-300 sm:gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--hero-gradient)] text-white shadow-lg shadow-blue-500/20 sm:h-11 sm:w-11">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <div className="brand-font text-xl font-bold leading-none sm:text-2xl">StudySwap</div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 sm:text-[11px] sm:tracking-[0.22em]">Campus Marketplace</div>
                </div>
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <Link to="/" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-300">
                    <span className="inline-flex items-center gap-2"><Home className="h-4 w-4" />Home</span>
                  </Link>
                  {user.role === 'student' && (
                    <Link to="/dashboard" state={{ tab: 'payout' }} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/40">
                      <Wallet className="h-4 w-4" />
                      <span>Rs. {Number(user.walletBalance || 0).toFixed(2)}</span>
                    </Link>
                  )}
                  <Link to="/my-notes" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-300">
                    <BookOpen className="h-4 w-4" />
                    <span>My Notes</span>
                  </Link>
                  <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-300">
                    <User className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  <button onClick={() => setShowLogoutConfirm(true)} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
                    <Sparkles className="h-4 w-4 text-primary-500" />
                    <span>Buy. Sell. Study smarter.</span>
                  </div>
                  <Link to="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-300">Login</Link>
                  <Link to="/register" className="rounded-full bg-[var(--hero-gradient)] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-transform hover:-translate-y-0.5">
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            <div className="flex md:hidden items-center">
              <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-2xl border border-slate-200 bg-white/80 p-2.5 text-slate-600 transition-colors hover:bg-white dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-900">
                {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-200/70 px-3 py-3 md:hidden dark:border-slate-800/70 sm:px-4 sm:py-4">
            <div className="space-y-3">
              {user ? (
                <>
                  <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/70">
                    <Home className="h-5 w-5" /> Home
                  </Link>
                  {user.role === 'student' && (
                    <Link to="/dashboard" state={{ tab: 'payout' }} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <Wallet className="h-5 w-5" /> Wallet (Rs. {Number(user.walletBalance || 0).toFixed(2)})
                    </Link>
                  )}
                  <Link to="/my-notes" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/70">
                    <BookOpen className="h-5 w-5" /> My Notes
                  </Link>
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/70">
                    <User className="h-5 w-5" /> Dashboard
                  </Link>
                  <button onClick={() => setShowLogoutConfirm(true)} className="flex w-full items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-left font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
                    <LogOut className="h-5 w-5" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
                    Student marketplace for local books, notes, and digital study material.
                  </div>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="block rounded-2xl px-4 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/70">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="block rounded-2xl bg-[var(--hero-gradient)] px-4 py-3 text-center font-bold text-white">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <ConfirmModal 
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          logout();
          setMobileOpen(false);
        }}
        title="Logout"
        message="Are you sure you want to logout of your account?"
        confirmText="Logout"
        type="warning"
      />
    </nav>
  );
};

export default Navbar;
