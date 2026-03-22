import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'student', college: '', location: '', phone: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-backdrop flex min-h-[calc(100vh-7rem)] items-center justify-center px-4 py-10 sm:px-6">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="hidden lg:block">
          <div className="glass-panel rounded-[2rem] p-8">
            <div className="mb-3 inline-flex rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-primary-700 dark:border-primary-900/60 dark:bg-primary-950/30 dark:text-primary-300">
            Join NotesKart
            </div>
            <h1 className="brand-font text-5xl font-bold leading-tight text-slate-900 dark:text-white">
              Start buying, selling, and earning from study material.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
              Build your student marketplace profile once, then manage listings, access digital notes, and track payouts from one place.
            </p>
          </div>
        </div>

        <div className="glass-panel w-full rounded-[2rem] p-6 sm:p-8 lg:p-10">
          <div className="mb-8">
            <h2 className="brand-font text-4xl font-bold text-slate-900 dark:text-white">Create Account</h2>
            <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">Set up your student profile and get started.</p>
          </div>

          {error && <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">{error}</div>}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="block w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-primary-500 dark:focus:ring-primary-900/40" />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="block w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-primary-500 dark:focus:ring-primary-900/40" />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required className="block w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-primary-500 dark:focus:ring-primary-900/40" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">City / Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} required placeholder="e.g. Hapur" className="block w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-primary-500 dark:focus:ring-primary-900/40" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="e.g. 9876543210" className="block w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-primary-500 dark:focus:ring-primary-900/40" />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">College (Optional)</label>
              <input type="text" name="college" value={formData.college} onChange={handleChange} className="block w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-primary-500 dark:focus:ring-primary-900/40" />
            </div>

            <div className="sm:col-span-2 pt-2">
              <button type="submit" className="w-full rounded-2xl bg-[var(--hero-gradient)] px-4 py-3.5 text-lg font-extrabold text-white shadow-xl shadow-blue-500/20 transition hover:-translate-y-0.5">
                Sign Up
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm font-semibold text-slate-600 dark:text-slate-400">
            Already have an account?
            <Link to="/login" className="ml-1 text-primary-600 hover:text-primary-700 dark:text-primary-300 dark:hover:text-primary-200">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
