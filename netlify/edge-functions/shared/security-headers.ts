/**
 * Netlify doesn't apply public/_headers to responses built by edge functions,
 * so the edge functions add the same security headers themselves.
 * Keep in sync with the "/*" block in public/_headers.
 */
const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

export const withSecurityHeaders = (response: Response | undefined | void): Response | undefined => {
  if (!response) return undefined; // not handled here: Netlify serves it (with _headers)
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    if (!headers.has(name)) headers.set(name, value);
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
};
