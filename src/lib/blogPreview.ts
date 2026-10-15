/**
 * The CMS hands the unsaved post to the /blog-preview page (opened in an
 * iframe or a new tab on the same site) through localStorage.
 */
const PREVIEW_KEY = 'vinca-blog-preview';

export const saveBlogPreview = (post: Record<string, unknown>): boolean => {
  try {
    localStorage.setItem(PREVIEW_KEY, JSON.stringify(post));
    return true;
  } catch {
    return false;
  }
};

export const readBlogPreview = <T>(): T | null => {
  try {
    const raw = localStorage.getItem(PREVIEW_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

export const BLOG_PREVIEW_STORAGE_KEY = PREVIEW_KEY;
