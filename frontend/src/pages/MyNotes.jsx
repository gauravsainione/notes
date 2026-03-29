import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock3, Search, ShieldCheck } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import PdfThumbnail from '../components/PdfThumbnail';

const MyNotes = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchNotes = async () => {
      try {
        const { data } = await api.get('/orders/myorders');
        const digitalOrders = (data || [])
          .filter((order) => order?.status === 'completed' && order?.product?.type === 'digital')
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setNotes(digitalOrders);
      } catch (err) {
        console.error('Failed to load my notes:', err);
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [authLoading, user]);

  const filteredNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return notes;

    return notes.filter((order) => {
      const title = order?.product?.title?.toLowerCase() || '';
      const category = order?.product?.category?.toLowerCase() || '';
      return title.includes(normalizedQuery) || category.includes(normalizedQuery);
    });
  }, [notes, query]);

  if (authLoading) {
    return <div className="p-16 text-center text-xl font-medium text-gray-500 animate-pulse">Loading your notes...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <section className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
              <ShieldCheck className="h-4 w-4" />
              Easy Access Library
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              One simple screen for all your purchased notes
            </h1>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-gray-600 dark:text-gray-300 sm:text-base">
              Log in, open this page, and read every purchased note in one place. No need to search through different pages for your study material.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/40">
                <BookOpen className="h-5 w-5 text-primary-500" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Available Notes</p>
                  <p className="text-xl font-black text-gray-900 dark:text-white">{notes.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/40">
                <Clock3 className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Experience</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Login and start reading faster</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-900/40">
            <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
              Search Your Notes
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title or class"
                className="w-full bg-transparent text-sm font-medium text-gray-700 outline-none placeholder:text-gray-400 dark:text-gray-200"
              />
            </div>
            <p className="mt-3 text-xs font-medium leading-6 text-gray-500 dark:text-gray-400">
              This page only shows digital notes you can read inside the website.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        {loading ? (
          <div className="rounded-[2rem] border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
            Loading your purchased notes...
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
            <BookOpen className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
              {notes.length === 0 ? 'No purchased notes yet' : 'No notes match your search'}
            </h2>
            <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              {notes.length === 0
                ? 'After buying a digital note, it will appear here for quick access.'
                : 'Try a different title or class name in the search box.'}
            </p>
            {notes.length === 0 && (
              <Link
                to="/"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-600"
              >
                Browse Notes
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredNotes.map((order) => (
              <article
                key={order._id}
                className="overflow-hidden rounded-[1.75rem] border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-900">
                  {order.product?.thumbnailUrl ? (
                    <PdfThumbnail
                      src={`${order.product.thumbnailUrl}`}
                      title={order.product?.title}
                      className="h-full w-full bg-white dark:bg-gray-900"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-14 w-14 text-primary-400" />
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="inline-flex rounded-full bg-primary-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
                    {order.product?.category || 'Digital Notes'}
                  </div>
                  <h3 className="mt-3 line-clamp-2 text-xl font-extrabold text-gray-900 dark:text-white">
                    {order.product?.title || 'Purchased Note'}
                  </h3>
                  <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Added on {new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>

                  <div className="mt-5 flex flex-col gap-3">
                    <Link
                      to={`/view/${order._id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-600"
                    >
                      <BookOpen className="h-4 w-4" />
                      Read Notes
                    </Link>
                    <Link
                      to={`/product/${order.product?._id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 transition hover:border-primary-300 hover:text-primary-600 dark:border-gray-700 dark:text-gray-200 dark:hover:text-primary-300"
                    >
                      Open Post
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default MyNotes;
