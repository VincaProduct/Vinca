/**
 * Where a visitor came from (Google Ads click IDs and UTM tags), saved in this
 * browser on arrival so it survives the Google sign-in redirect, then written
 * to the new user's profile (and from there to Zoho). No personal data.
 *
 * Kept for 90 days, the same window Google Ads uses for click conversions.
 * A visit with a new ad click (gclid/gbraid/wbraid) replaces the saved one;
 * other visits never overwrite it, so the first source is kept.
 */

const STORAGE_KEY = 'vinca_ad_attribution';
const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;

const CLICK_KEYS = ['gclid', 'gbraid', 'wbraid'] as const;
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;

export type AdAttribution = Partial<Record<(typeof CLICK_KEYS)[number] | (typeof UTM_KEYS)[number], string>> & {
  landing_page: string;
  ad_click_at: string;
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

    const isNewClick = CLICK_KEYS.some((key) => found[key]);
    if (readAttribution() && !isNewClick) return;

    const record: AdAttribution = {
      ...found,
      landing_page: window.location.pathname.slice(0, 255),
      ad_click_at: new Date().toISOString(),
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
