/**
 * An anonymous random id for this browser, used only so an article view is
 * counted once per reader per day. Nothing personal; null for bots and
 * automated browsers (they shouldn't count as readers).
 */
const KEY = 'vinca_reader_id';
const BOT = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|whatsapp|python|curl|wget/i;

export const readerId = (): string | null => {
  if (typeof window === 'undefined') return null;
  if ((navigator as Navigator & { webdriver?: boolean }).webdriver || BOT.test(navigator.userAgent)) return null;
  try {
    let id = localStorage.getItem(KEY);
    if (!id || !/^[0-9a-f-]{36}$/.test(id)) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return null;
  }
};
