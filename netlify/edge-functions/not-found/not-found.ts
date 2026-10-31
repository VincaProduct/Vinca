import type { Context } from "https://edge.netlify.com";
import { withSecurityHeaders } from "../shared/security-headers.ts";

/**
 * Every unknown address used to get the app with status 200 and the
 * homepage's title, which Google counts as a "soft 404". Addresses the app
 * has no page for now get a real 404 (the app still shows its "page not
 * found" screen). Keep KNOWN_ROUTES in step with the routes in src/App.tsx.
 */

const KNOWN_ROUTES: RegExp[] = [
  /^\/$/,
  /^\/blog(\/.*)?$/, // the blog edge function sends its own 404s
  /^\/blog-preview$/,
  /^\/thank-you$/,
  /^\/financial-freedom-calculator$/,
  /^\/auth(\/.*)?$/,
  /^\/privacy-policy$/,
  /^\/events(\/[^/]+(\/confirmation)?)?$/,
  /^\/dashboard(\/.*)?$/,
];

/** Pages that were removed, sent on to the closest page that still exists */
const MOVED: Record<string, string> = {
  "/pricing": "/",
  "/buy-membership": "/",
  "/achievers-club": "/",
};

const handler = async (request: Request, context: Context): Promise<Response | undefined> => {
  if (request.method !== "GET" && request.method !== "HEAD") return;
  const path = new URL(request.url).pathname.replace(/\/+$/, "") || "/";
  if (MOVED[path]) {
    return new Response(null, { status: 301, headers: { Location: MOVED[path], "Cache-Control": "public, max-age=3600" } });
  }

  // Files (scripts, images, fonts, sitemap...) and known pages are served as usual
  if (/\.[a-z0-9]+$/i.test(path) || KNOWN_ROUTES.some((route) => route.test(path))) return;

  const response = await context.next();
  if (!(response.headers.get("content-type") || "").includes("text/html")) return response;

  const html = (await response.text())
    .replace(/<title>[\s\S]*?<\/title>/i, "<title>Page not found | Vinca Wealth</title>")
    .replace(/<meta\s+name="robots"[\s\S]*?\/?>/i, '<meta name="robots" content="noindex" />')
    .replace(/<link\s+rel="canonical"[\s\S]*?\/?>/gi, "");
  return new Response(html, {
    status: 404,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=0, must-revalidate" },
  });
};

export default async (request: Request, context: Context) => withSecurityHeaders(await handler(request, context));

export const config = {
  path: "/*",
  excludedPath: ["/assets/*", "/fonts/*", "/images/*", "/lovable-uploads/*", "/testimonials/*", "/.netlify/*"],
  cache: "manual",
};
