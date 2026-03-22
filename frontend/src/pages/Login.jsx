import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-backdrop flex min-h-[calc(100vh-7rem)] items-center justify-center px-4 py-10 sm:px-6">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="hidden lg:block">
          <div className="rounded-[2rem] bg-[var(--hero-gradient)] p-10 text-white shadow-2xl shadow-blue-500/20">
            <div className="mb-3 inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em]">
              Welcome Back
            </div>
            <h1 className="brand-font max-w-lg text-5xl font-bold leading-tight">
              Your study marketplace, organized and ready.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-blue-50/90">
              Jump back into notes, books, digital previews, and local student listings with a calmer, cleaner experience.
            </p>
          </div>
        </div>

        <div className="glass-panel w-full rounded-[2rem] p-6 sm:p-8 lg:p-10">
          <div className="mb-8">
            <div className="mb-3 inline-flex rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-primary-700 dark:border-primary-900/60 dark:bg-primary-950/30 dark:text-primary-300">
              Sign In
            </div>
            <h2 className="brand-font text-4xl font-bold text-slate-900 dark:text-white">Welcome Back</h2>
            <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              Access your dashboard, purchases, listings, and payouts.
            </p>
          </div>

          {error && <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3.5 text-slate-900 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-primary-500 dark:focus:ring-primary-900/40"
                placeholder="student@college.edu"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3.5 text-slate-900 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-primary-500 dark:focus:ring-primary-900/40"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-[var(--hero-gradient)] px-4 py-3.5 text-lg font-extrabold text-white shadow-xl shadow-blue-500/20 transition hover:-translate-y-0.5"
            >
              Sign In
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-semibold text-slate-600 dark:text-slate-400">
            Don&apos;t have an account?
            <Link to="/register" className="ml-1 text-primary-600 hover:text-primary-700 dark:text-primary-300 dark:hover:text-primary-200">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
