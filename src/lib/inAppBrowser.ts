/**
 * Instagram and Facebook open links in their own built-in browser. Google
 * sign-in works there, but Google doesn't know the phone's account, so people
 * must type their email and password. In Chrome or Safari it's one tap.
 *
 * So inside those apps, "Continue with Google" first saves what the visitor
 * has done (score, calculator numbers, ad tags) under a random ID, then opens
 * the same page in the phone's real browser, which picks it all up and starts
 * Google sign-in straight away. Nothing personal goes in the link.
 */
import { supabase } from '@/integrations/supabase/client';
import { trackEvent } from '@/lib/tracking';

const UA = typeof navigator !== 'undefined' ? navigator.userAgent : '';

export const inAppBrowser = (): 'instagram' | 'facebook' | null => {
  if (/Instagram/i.test(UA)) return 'instagram';
  if (/FBAN|FBAV|FB_IAB|FBIOS|FB4A/i.test(UA)) return 'facebook';
  return null;
};

export const phoneOs = (): 'android' | 'ios' | 'other' =>
  /Android/i.test(UA) ? 'android' : /iPhone|iPad|iPod/i.test(UA) ? 'ios' : 'other';

// What the site keeps in the browser between the calculator and sign-in
const LOCAL_KEYS = [
  'financial_calculator_inputs', 'financial_calculator_results',
  'redirect_after_login', 'post_auth_redirect', 'pending_referral_code',
  'utm_source', 'utm_medium', 'utm_campaign', 'vinca_ad_attribution',
];
const SESSION_KEYS = ['ffr_pending_state', 'auth_context_blog', 'auth_context_consultation'];
// Meta's own first-party cookies, so the sign-up still counts for the ad click
const COOKIES = ['_fbp', '_fbc'];

type Payload = { local: Record<string, string>; session: Record<string, string>; cookies: Record<string, string> };

const readCookie = (name: string) =>
  document.cookie.split('; ').find((c) => c.startsWith(`${name}=`))?.slice(name.length + 1);

const writeCookie = (name: string, value: string) => {
  const domain = /(^|\.)vincawealth\.com$/.test(location.hostname) ? '; domain=.vincawealth.com' : '';
  document.cookie = `${name}=${value}; path=/; max-age=${90 * 24 * 3600}; SameSite=Lax${domain}`;
};

const collect = (): Payload => {
  const out: Payload = { local: {}, session: {}, cookies: {} };
  try {
    LOCAL_KEYS.forEach((k) => { const v = localStorage.getItem(k); if (v !== null) out.local[k] = v; });
    SESSION_KEYS.forEach((k) => { const v = sessionStorage.getItem(k); if (v !== null) out.session[k] = v; });
  } catch { /* storage blocked */ }
  COOKIES.forEach((k) => { const v = readCookie(k); if (v) out.cookies[k] = v; });
  return out;
};

/** The link that makes the phone open its real browser instead of the app's */
const externalLink = (url: string) => {
  const u = new URL(url);
  if (phoneOs() === 'android') {
    return `intent://${u.host}${u.pathname}${u.search}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url)};end`;
  }
  if (phoneOs() === 'ios') return `x-safari-https://${u.host}${u.pathname}${u.search}`;
  return url;
};

/**
 * Save progress and open /auth in the real browser. Resolves true if the page
 * was left (the real browser took over), false if nothing happened, so the
 * caller can show the manual "Open in browser" steps instead.
 */
export const continueInRealBrowser = async (): Promise<boolean> => {
  const { data: id, error } = await (supabase as any).rpc('create_browser_handoff', { p_payload: collect() });
  if (error || !id) return false;
  trackEvent('open_in_browser', { app: inAppBrowser() ?? undefined, os: phoneOs() });
  window.location.href = externalLink(`${window.location.origin}/auth?handoff=${id}`);
  return new Promise((resolve) => {
    setTimeout(() => resolve(document.visibilityState === 'hidden'), 2500);
  });
};

/** In the real browser: put back what the visitor did in the app. True if restored. */
export const restoreHandoff = async (id: string): Promise<boolean> => {
  const { data, error } = await (supabase as any).rpc('claim_browser_handoff', { p_id: id });
  const payload = data as Payload | null;
  if (error || !payload) return false;
  try {
    Object.entries(payload.local || {}).forEach(([k, v]) => localStorage.setItem(k, v));
    Object.entries(payload.session || {}).forEach(([k, v]) => sessionStorage.setItem(k, v));
  } catch { /* storage blocked */ }
  Object.entries(payload.cookies || {}).forEach(([k, v]) => { if (COOKIES.includes(k) && !readCookie(k)) writeCookie(k, v); });
  return true;
};
