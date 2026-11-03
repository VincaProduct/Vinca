/**
 * Sends an event to Google Tag Manager's dataLayer. Only pass event names and
 * non-personal labels: never ages, amounts, names or emails.
 */
export const trackEvent = (event: string, params: Record<string, string | undefined> = {}) => {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...params });
};

/** Where the visitor came from: ?src= on this page, else the UTM source saved on arrival */
export const trafficSource = () => {
  try {
    const src = new URLSearchParams(window.location.search).get('src');
    return src || new URLSearchParams(window.location.search).get('utm_source') || localStorage.getItem('utm_source') || undefined;
  } catch {
    return undefined;
  }
};
