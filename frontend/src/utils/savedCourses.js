const FAVORITES_KEY = 'studyswap:favorites';
const BOOKMARKS_KEY = 'studyswap:bookmarks';

const readIds = (key) => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeIds = (key, ids) => {
  localStorage.setItem(key, JSON.stringify(ids));
};

const toggleId = (key, id) => {
  const existing = readIds(key);
  const next = existing.includes(id)
    ? existing.filter((item) => item !== id)
    : [...existing, id];
  writeIds(key, next);
  return next.includes(id);
};

export const getFavoriteIds = () => readIds(FAVORITES_KEY);
export const getBookmarkIds = () => readIds(BOOKMARKS_KEY);
export const toggleFavoriteId = (id) => toggleId(FAVORITES_KEY, id);
export const toggleBookmarkId = (id) => toggleId(BOOKMARKS_KEY, id);
