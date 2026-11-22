/**
 * Where a visitor came from (Google and Meta ad click IDs and UTM tags), saved in this
 * browser on arrival so it survives the Google sign-in redirect, then written
 * to the new user's profile (and from there to Zoho). No personal data.
 *
 * Kept for 90 days, the same window Google Ads uses for click conversions.
 * A visit with a new ad click (gclid/gbraid/wbraid/fbclid) replaces the saved one;
 * other visits never overwrite it, so the first source is kept.
 */

const STORAGE_KEY = 'vinca_ad_attribution';
const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;

const CLICK_KEYS = ['gclid', 'gbraid', 'wbraid', 'fbclid'] as const;
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;

export type AdAttribution = Partial<Record<(typeof CLICK_KEYS)[number] | (typeof UTM_KEYS)[number], string>> & {
  landing_page: string;
  ad_click_at: string;
  /** When Meta's click ID was first seen (Meta needs this time with the ID later) */
  fbclid_at?: string;
};

const clean = (value: string | null) => (value ? value.trim().slice(0, 255) : '');

export const readAttribution = (): AdAttribution | null => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as AdAttribution | null;
    if (!saved?.ad_click_at) return null;
    if (Date.now() - new Date(saved.ad_click_at).getTime() > MAX_AGE_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return saved;
  } catch {
    return null;
  }
};

/** Call once on page load */
export const captureAttribution = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const found: Partial<AdAttribution> = {};
    for (const key of [...CLICK_KEYS, ...UTM_KEYS]) {
      const value = clean(params.get(key));
      if (value) found[key] = value;
    }
    if (Object.keys(found).length === 0) return;

    const saved = readAttribution();
    const isNewClick = CLICK_KEYS.some((key) => found[key]);
    if (saved && !isNewClick) return;

    // Reloading a page that still has the same click ID in its URL is not a new click
    if (saved && CLICK_KEYS.every((key) => found[key] === saved[key])) return;

    const now = new Date().toISOString();
    const record: AdAttribution = {
      ...found,
      landing_page: window.location.pathname.slice(0, 255),
      ad_click_at: now,
      ...(found.fbclid ? { fbclid_at: now } : {}),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Storage blocked (private window etc.): nothing to keep
  }
};

/** Once it's on the user's profile it isn't needed in the browser any more */
export const clearAttribution = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};
