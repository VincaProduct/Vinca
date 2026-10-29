import type { Context } from "https://edge.netlify.com";
import { withSecurityHeaders } from "../shared/security-headers.ts";
import {
  CALCULATOR_FAQS,
  CALCULATOR_INFO,
  COMPANY,
  HOME_FAQS,
  PAGE_SEO,
  SITE_URL,
  organizationSchema,
} from "../../../src/content/siteInfo.ts";

/**
 * Per-page SEO for the public (non-blog) pages: each gets its own title,
 * description, canonical, social tags and JSON-LD instead of the homepage
 * defaults in index.html. The homepage and the calculator also get a
 * server-rendered version of their content (replaced by the app once it loads)
 * so search engines and AI crawlers that don't run JavaScript can read it.
 */

const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;
const WEBSITE_ID = `${SITE_URL}/#website`;

const escapeHtml = (text: unknown) =>
  String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const scriptJson = (data: unknown) =>
  JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(new RegExp(String.fromCharCode(0x2028), "g"), "\\u2028")
    .replace(new RegExp(String.fromCharCode(0x2029), "g"), "\\u2029");

/** Drop the homepage defaults from index.html so each page has a single title, canonical, etc. */
const stripDefaultHead = (html: string) =>
  html
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/<meta\s+name="(description|author|robots|keywords|title)"[\s\S]*?\/?>/gi, "")
    .replace(/<meta\s+property="(og|article):[^"]*"[\s\S]*?\/?>/gi, "")
    .replace(/<meta\s+name="twitter:[^"]*"[\s\S]*?\/?>/gi, "")
    .replace(/<link\s+rel="canonical"[\s\S]*?\/?>/gi, "")
    .replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, "");

const website = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: SITE_URL,
  name: COMPANY.name,
  publisher: { "@id": `${SITE_URL}/#organization` },
  inLanguage: "en-IN",
};

/** Readable version of the homepage (same text the app shows) */
const renderHome = () => `
    <main>
      <section class="relative overflow-hidden min-h-screen flex items-center justify-center px-6 lg:px-16 py-20" style="background: hsl(var(--background))">
        <div class="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
          <h1 class="font-bold leading-tight" style="font-family: 'Plus Jakarta Sans', sans-serif">
            <span class="block" style="font-size: clamp(2rem, 5vw, 3.5rem); color: hsl(var(--foreground))">Are you on track for</span>
            <span class="block" style="font-size: clamp(2.25rem, 6vw, 4rem); color: var(--brand-text)">Financial Freedom?</span>
          </h1>
          <p style="font-size: clamp(1rem, 2.5vw, 1.25rem); color: hsl(var(--muted-foreground)); font-weight: 500">Find out in 2 minutes — free</p>
          <p class="mt-10"><a href="/financial-freedom-calculator" class="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 font-semibold text-primary-foreground">Calculate My Freedom Score</a></p>
          <p style="font-size: 14px; color: hsl(var(--muted-foreground))">Used by investors across India to find their retirement gap.</p>
        </div>
      </section>

      <section class="container mx-auto px-6 py-16 max-w-4xl">
        <h2 class="text-3xl font-bold mb-4">How Vinca gets you to financial freedom</h2>
        <p>Most investors are investing without knowing their number. Vinca fixes that — and keeps it fixed.</p>
        <ol>
          <li><strong>FFR Score: know your number.</strong> Calculate your retirement corpus, your gap, and your projected retirement date.</li>
          <li><strong>Goal-Based Investing: build the right portfolio.</strong> Mutual funds selected for your retirement timeline. SIPs that compound toward your date.</li>
          <li><strong>Active Management: stay on track.</strong> Your plan reviewed, your portfolio rebalanced, your insurance and emergency fund kept in order.</li>
        </ol>
      </section>

      <section id="services" class="container mx-auto px-6 py-16 max-w-4xl">
        <h2 class="text-3xl font-bold mb-4">Everything your retirement plan needs</h2>
        <p>From knowing your number to reaching it — Vinca covers the full journey to financial freedom.</p>
        <h3 class="text-xl font-semibold mt-6">Retirement Planning</h3>
        <p>Know exactly when you can retire and what it will take to get there: Financial Freedom Readiness score, retirement corpus estimation, SIP strategy and timeline, retirement date projection.</p>
        <h3 class="text-xl font-semibold mt-6">Mutual Fund Portfolio Management</h3>
        <p>Portfolio built for your retirement goal, actively monitored and rebalanced as markets move: goal-based portfolio construction, SIP setup and management, regular rebalancing, performance tracking.</p>
        <h3 class="text-xl font-semibold mt-6">Insurance Planning</h3>
        <p>Life insurance adequacy check, health insurance review and coverage gap identification, to protect your retirement corpus.</p>
      </section>

      <section id="faq" class="container mx-auto px-6 py-16 max-w-4xl">
        <h2 class="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
        ${HOME_FAQS.map((faq) => `<details><summary><h3 class="inline font-semibold">${escapeHtml(faq.question)}</h3></summary><p>${escapeHtml(faq.answer)}</p></details>`).join("\n        ")}
      </section>

      <section class="container mx-auto px-6 py-12 max-w-4xl">
        <p>${escapeHtml(COMPANY.description)}</p>
        <p>${escapeHtml(COMPANY.legalStatus)} · ${escapeHtml(COMPANY.arn)} · CIN: ${escapeHtml(COMPANY.cin)} · Insurance POSP Code: ${escapeHtml(COMPANY.insurancePosp)}</p>
        <p>Contact: <a href="tel:${escapeHtml(COMPANY.telephone)}">${escapeHtml(COMPANY.telephone)}</a> · <a href="mailto:${escapeHtml(COMPANY.email)}">${escapeHtml(COMPANY.email)}</a></p>
        <p><a href="/blog">Read our research-driven articles on mutual funds, markets and retirement planning</a></p>
      </section>
    </main>`;

const CALCULATOR_PATH = "/financial-freedom-calculator";

/** Readable version of the calculator page: what it does, assumptions and FAQs (same text the app shows) */
const renderCalculator = () => `
    <main style="padding-top: 96px">
      <div style="text-align: center; padding: 32px 16px 24px">
        <h1 style="font-size: 28px; font-weight: 700">Financial Freedom Calculator</h1>
        <p>Find out in 2 minutes — free</p>
      </div>
      <section style="max-width: 640px; margin: 0 auto; padding: 0 16px 80px">
        <h2>${escapeHtml(CALCULATOR_INFO.heading)}</h2>
        <p>${escapeHtml(CALCULATOR_INFO.intro)}</p>
        <ol>${CALCULATOR_INFO.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
        <h3>Assumptions used</h3>
        <ul>${CALCULATOR_INFO.assumptions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        <h2>Frequently Asked Questions</h2>
        ${CALCULATOR_FAQS.map((faq) => `<details><summary>${escapeHtml(faq.question)}</summary><p>${escapeHtml(faq.answer)}</p></details>`).join("")}
        <p><small>${escapeHtml(CALCULATOR_INFO.disclaimer)}</small></p>
        <p><a href="/blog">Read our articles on retirement planning and mutual funds</a></p>
      </section>
    </main>`;

const faqPage = (url: string, faqs: { question: string; answer: string }[]) => ({
  "@type": "FAQPage",
  "@id": `${url}#faq`,
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
});

const pageGraph = (path: string, url: string, seo: { title: string; description: string }) => {
  const graph: Record<string, unknown>[] = [
    organizationSchema(),
    website,
    {
      "@type": "WebPage",
      "@id": url,
      url,
      name: seo.title,
      description: seo.description,
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-IN",
      ...(path === "/" ? {} : { breadcrumb: { "@id": `${url}#breadcrumb` } }),
    },
  ];

  if (path === "/") {
    graph.push(faqPage(url, HOME_FAQS));
  } else {
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: seo.title.split(" | ")[0], item: url },
      ],
    });
  }
  if (path === CALCULATOR_PATH) {
    graph.push(faqPage(url, CALCULATOR_FAQS), {
      "@type": "WebApplication",
      "@id": `${url}#app`,
      name: "Financial Freedom Calculator",
      url,
      description: seo.description,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Any",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
      provider: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-IN",
    });
  }
  return graph;
};

const handler = async (request: Request, context: Context): Promise<Response | undefined> => {
  if (request.method !== "GET" && request.method !== "HEAD") return;

  const url = new URL(request.url);
  const path = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") : "/";
  const seo = PAGE_SEO[path];
  if (!seo) return;

  try {
    const response = await context.next();
    if (!(response.headers.get("content-type") || "").includes("text/html")) return response;

    const canonical = path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
    const head = `
    <title>${escapeHtml(seo.title)}</title>
    <meta name="description" content="${escapeHtml(seo.description)}">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${canonical}">
    <meta property="og:title" content="${escapeHtml(seo.title)}">
    <meta property="og:description" content="${escapeHtml(seo.description)}">
    <meta property="og:image" content="${DEFAULT_IMAGE}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="Vinca Wealth">
    <meta property="og:locale" content="en_IN">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@vincawealth">
    <meta name="twitter:title" content="${escapeHtml(seo.title)}">
    <meta name="twitter:description" content="${escapeHtml(seo.description)}">
    <meta name="twitter:image" content="${DEFAULT_IMAGE}">
    <meta name="geo.region" content="IN-KA">
    <meta name="geo.placename" content="Bengaluru">
    <meta name="geo.position" content="${COMPANY.geo.latitude};${COMPANY.geo.longitude}">
    <script type="application/ld+json">${scriptJson({ "@context": "https://schema.org", "@graph": pageGraph(path, canonical, seo) })}</script>`;

    let html = stripDefaultHead(await response.text())
      // index.html's generic geo tags are replaced by the Bengaluru ones above
      .replace(/<meta\s+name="geo\.(region|placename)"[\s\S]*?\/?>/gi, "")
      .replace("<head>", `<head>\n${head}`);
    if (path === "/") html = html.replace('<div id="root"></div>', `<div id="root">${renderHome()}</div>`);
    if (path === CALCULATOR_PATH) html = html.replace('<div id="root"></div>', `<div id="root">${renderCalculator()}</div>`);

    return new Response(html, {
      status: response.status,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=0, must-revalidate",
        "netlify-cdn-cache-control": "public, max-age=300, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("[pages-seo] Error:", error);
    return; // serve the plain app
  }
};

// Every response gets the site's security headers (_headers doesn't apply here)
export default async (request: Request, context: Context) => withSecurityHeaders(await handler(request, context));

export const config = {
  path: ["/", "/financial-freedom-calculator", "/events", "/achievers-club", "/pricing", "/privacy-policy"],
  // Responses opt in to CDN caching with Netlify-CDN-Cache-Control
  cache: "manual",
};
