/**
 * The Netlify edge function (netlify/edge-functions/tags) server-renders blog
 * pages and embeds the data it used as JSON, so the app can render the same
 * content immediately instead of showing a spinner and fetching it again.
 */
const cache = new Map<string, unknown>();

export const readSsrData = <T>(id: 'blog-post-data' | 'blog-list-data'): T | null => {
  if (cache.has(id)) return cache.get(id) as T | null;
  let value: T | null = null;
  try {
    const el = typeof document !== 'undefined' ? document.getElementById(id) : null;
    value = el?.textContent ? (JSON.parse(el.textContent) as T) : null;
  } catch {
    value = null;
  }
  cache.set(id, value);
  return value;
};
