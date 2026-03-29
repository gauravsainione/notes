import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Search, ArrowUpDown, ShoppingBag, Sparkles, BookOpen, ChevronRight, Heart, Bookmark } from 'lucide-react';
import api from '../api/axios';
import heroBanner from '../assets/hero.png';
import { useToast } from '../context/ToastContext';
import { getFavoriteIds, getBookmarkIds, toggleFavoriteId, toggleBookmarkId } from '../utils/savedCourses';
import PdfThumbnail from '../components/PdfThumbnail';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activePricing, setActivePricing] = useState('All');
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [bookmarkIds, setBookmarkIds] = useState([]);
  const toast = useToast();

  useEffect(() => {
    api.get('/products/categories').then(res => setCategories(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    setFavoriteIds(getFavoriteIds());
    setBookmarkIds(getBookmarkIds());
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = new URLSearchParams();
        if (search) params.append('category', search);

        const res = await api.get(`/products?${params.toString()}`);
        setProducts(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProducts();
  }, [search]);

  const courseGroups = useMemo(() => {
    const groups = new Set();
    categories.forEach(cat => {
      const mainCat = cat.split(' - ')[0];
      if (mainCat) groups.add(mainCat);
    });
    return Array.from(groups).sort();
  }, [categories]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (activeCategory !== 'All') {
      result = result.filter(p => p.category.startsWith(activeCategory));
    }
    if (activePricing === 'Free') {
      result = result.filter(p => p.pricingType === 'free' || Number(p.price) === 0);
    } else if (activePricing === 'Paid') {
      result = result.filter(p => p.pricingType !== 'free' && Number(p.price) > 0);
    }

    switch (sortBy) {
      case 'price_low':
        return result.sort((a, b) => a.price - b.price);
      case 'price_high':
        return result.sort((a, b) => b.price - a.price);
      case 'newest':
      default:
        return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }, [products, sortBy, activeCategory, activePricing]);

  const featuredCount = filteredProducts.filter(product => product.type === 'digital').length;

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleToggleFavorite = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    const isFavorite = toggleFavoriteId(productId);
    setFavoriteIds(getFavoriteIds());
    toast(isFavorite ? 'Added to favorites' : 'Removed from favorites', 'success');
  };

  const handleToggleBookmark = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    const isBookmarked = toggleBookmarkId(productId);
    setBookmarkIds(getBookmarkIds());
    toast(isBookmarked ? 'Bookmarked for later' : 'Removed from bookmarks', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
      <section className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] bg-slate-950 shadow-[0_22px_60px_rgba(15,23,42,0.16)]">
        <div className="absolute inset-0">
          <img src={heroBanner} alt="Study banner" className="h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.92)_8%,rgba(29,78,216,0.78)_45%,rgba(8,145,178,0.64)_100%)]" />
          <div className="absolute -left-20 top-0 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-blue-400/20 blur-3xl" />
        </div>

        <div className="relative z-[1] grid gap-5 px-4 py-5 sm:px-8 sm:py-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-10">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-blue-50 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-cyan-200" />
              Student Marketplace
            </div>

            <h1 className="brand-font text-2xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              Discover notes, books, and digital courses in one beautiful study hub.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50/88 sm:mt-4 sm:text-base sm:leading-7">
              Browse affordable study materials shared by students, compare categories quickly, and unlock digital content with a smoother buying experience.
            </p>

            <form onSubmit={handleSearch} className="mt-5 max-w-3xl rounded-[1.35rem] border border-white/15 bg-white/12 p-2 backdrop-blur-md shadow-xl shadow-slate-950/20 sm:mt-6 sm:rounded-[1.5rem] sm:p-2.5">
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by subject, course, keyword, or semester..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full rounded-2xl border border-white/20 bg-white px-12 py-3.5 text-slate-900 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-extrabold text-primary-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-primary-50 md:w-auto"
                >
                  Search
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </form>

          </div>

          <div className="hidden lg:flex items-end justify-end">
            <div className="glass-panel w-full max-w-xs rounded-[1.75rem] p-5 text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-primary-700 dark:bg-primary-950/30 dark:text-primary-300">
                <BookOpen className="h-4 w-4" />
                Smart Discovery
              </div>
              <h3 className="mt-3 brand-font text-xl font-bold text-slate-900 dark:text-white">
                Search faster and reach the right material sooner.
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Use the banner search to jump straight into course pages, then refine by category and sort by newest or price below.
              </p>
            </div>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveCategory('All')}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeCategory === 'All' ? 'bg-primary-500 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:text-primary-500'}`}
            >
              All
            </button>
            {courseGroups.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-primary-500 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:text-primary-500'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['All', 'Paid', 'Free'].map((pricing) => (
              <button
                key={pricing}
                onClick={() => setActivePricing(pricing)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activePricing === pricing ? 'bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                {pricing}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {activeCategory !== 'All' ? activeCategory : 'Recently Added'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} found
            </p>
          </div>
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="min-w-0 flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer sm:flex-none"
            >
              <option value="newest">Newest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No listings yet. Be the first to share your study materials!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map(product => (
              <Link to={`/product/${product._id}`} key={product._id} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 dark:border-gray-700 group flex flex-col h-full">
                <div className="h-52 sm:h-56 bg-gray-50 dark:bg-gray-700 relative flex items-center justify-center border-b border-gray-100 dark:border-gray-700 overflow-hidden">
                  {product.images?.[0] ? (
                    <img src={product.images[0]?.startsWith('/') ? product.images[0] : product.images[0]} alt={product.title} className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105 sm:object-cover sm:p-0" />
                  ) : product.thumbnailUrl ? (
                    <PdfThumbnail
                      src={product.thumbnailUrl}
                      title={product.title}
                      className="pointer-events-none"
                      pageClassName="scale-100 origin-top sm:scale-[1.08]"
                    />
                  ) : (
                    <div className="text-primary-500/80 font-extrabold text-2xl uppercase tracking-[0.2em] transform group-hover:scale-105 transition-transform duration-300">PDF NOTE</div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm dark:bg-gray-900/90 text-gray-900 dark:text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                    {product.type === 'digital' ? 'Digital' : 'Physical'}
                  </div>
                  <div className="absolute left-3 top-3 flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(e, product._id)}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-sm transition ${favoriteIds.includes(product._id) ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/70 dark:text-rose-300' : 'border-white/70 bg-white/90 text-slate-600 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200'}`}
                      aria-label="Toggle favorite"
                    >
                      <Heart className={`h-4 w-4 ${favoriteIds.includes(product._id) ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleToggleBookmark(e, product._id)}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-sm transition ${bookmarkIds.includes(product._id) ? 'border-primary-200 bg-primary-50 text-primary-600 dark:border-primary-900/50 dark:bg-primary-950/70 dark:text-primary-300' : 'border-white/70 bg-white/90 text-slate-600 hover:text-primary-600 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200'}`}
                      aria-label="Toggle bookmark"
                    >
                      <Bookmark className={`h-4 w-4 ${bookmarkIds.includes(product._id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
                <div className="p-4 sm:p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-sm sm:text-lg text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-primary-500 transition-colors leading-tight">{product.title}</h3>
                  <p className="text-xs sm:text-sm font-medium text-primary-500 mb-1">{product.category}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 sm:mb-4">{new Date(product.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>

                  <div className="mt-auto flex items-end justify-between gap-3 pt-3 sm:pt-4 border-t border-gray-50 dark:border-gray-700/50">
                    <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">{product.pricingType === 'free' || Number(product.price) === 0 ? 'Free' : `Rs. ${product.price}`}</span>
                    <span className="inline-flex max-w-[9rem] items-center truncate rounded-md bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-500 dark:bg-gray-700/50 dark:text-gray-400">
                      <MapPin size={12} className="mr-1 shrink-0" /> <span className="truncate">{product.location}</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-300">Available</div>
            <div className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{filteredProducts.length}</div>
            <div className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">Listings live now</div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-300">Digital</div>
            <div className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{featuredCount}</div>
            <div className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">Instant-access courses</div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-300">Categories</div>
            <div className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{courseGroups.length}</div>
            <div className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">Streams to explore</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
