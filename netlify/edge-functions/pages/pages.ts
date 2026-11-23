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
import {
  DEFAULT_REAL_WORTH_ASSETS,
  REAL_WORTH_COPY,
  REAL_WORTH_FAQS,
} from "../../../src/content/realWorth.ts";
import { PRIVACY_POLICY_HTML } from "../../../src/content/privacyPolicy.ts";
import { HERO, PREVIEW } from "../../../src/content/homeHero.ts";
import { HOME_GUIDES } from "../../../src/content/homeGuides.ts";
import { SHOTS } from "../../../src/components/home/heroShots.ts";

/**
 * Per-page SEO for the public (non-blog) pages: each gets its own title,
 * description, canonical, social tags and JSON-LD instead of the homepage
 * defaults in index.html. The homepage and the calculator also get a
 * server-rendered version of their content (replaced by the app once it loads)
 * so search engines and AI crawlers that don't run JavaScript can read it.
 */

const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;
const SUPABASE_URL = "https://xmmyjphoaqazwlifehxs.supabase.co";
// Public anon key (same one the browser app uses)
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtbXlqcGhvYXFhendsaWZlaHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MTY4NjMsImV4cCI6MjA2NDA5Mjg2M30.E7O_Q0Zcz0S-6ERl0JE-6SUth-lMLMbzTNGrdhDq_1k";

// deno-lint-ignore no-explicit-any
type EventRow = Record<string, any>;
// Only what the public pages show (never the meeting link)
const EVENT_COLUMNS = "id,title,description,event_date,duration_minutes,host_name,image_url";

const loadEvents = async (filter: string): Promise<EventRow[] | null> => {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/events?select=${EVENT_COLUMNS}&is_published=eq.true&${filter}`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } },
  );
  return response.ok ? await response.json() : null;
};

const formatEventDate = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }) + " IST";

/** schema.org Event for an online Vinca Wealth event */
const eventSchema = (event: EventRow) => {
  const start = new Date(event.event_date);
  const end = new Date(start.getTime() + (Number(event.duration_minutes) || 60) * 60000);
  const url = `${SITE_URL}/events/${event.id}`;
  return {
    "@type": "Event",
    "@id": `${url}#event`,
    name: event.title,
    description: String(event.description || "").slice(0, 500),
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: { "@type": "VirtualLocation", url },
    ...(event.image_url ? { image: [event.image_url] } : {}),
    organizer: { "@id": `${SITE_URL}/#organization` },
    ...(event.host_name ? { performer: { "@type": "Person", name: event.host_name } } : {}),
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR", availability: "https://schema.org/InStock", url },
    isAccessibleForFree: true,
  };
};

const eventMeta = (event: EventRow) =>
  `<time datetime="${escapeHtml(event.event_date)}">${escapeHtml(formatEventDate(event.event_date))}</time>` +
  (event.duration_minutes ? ` · ${escapeHtml(event.duration_minutes)} minutes` : "") +
  " · Online";

const renderEventCard = (event: EventRow) => {
  const description = String(event.description || "");
  return `
          <article class="rounded-lg border p-6 mt-4">
            <h3 class="text-xl font-semibold"><a href="/events/${escapeHtml(event.id)}">${escapeHtml(event.title)}</a></h3>
            <p class="text-sm text-muted-foreground">${eventMeta(event)}${event.host_name ? ` · Hosted by ${escapeHtml(event.host_name)}` : ""}</p>
            ${description ? `<p>${escapeHtml(description.slice(0, 300))}${description.length > 300 ? "…" : ""}</p>` : ""}
          </article>`;
};

/** Readable version of the events list (same events the app shows) */
const renderEvents = (events: EventRow[]) => {
  const now = Date.now();
  const upcoming = events.filter((e) => new Date(e.event_date).getTime() >= now);
  const past = events.filter((e) => new Date(e.event_date).getTime() < now);
  return `
    <main style="padding-top: 96px" class="container mx-auto px-6 py-12 max-w-4xl">
      <h1 class="text-3xl font-bold mb-4">Events &amp; Webinars</h1>
      <p>Free Vinca Wealth webinars and events on mutual funds, retirement planning and financial freedom.</p>
      <h2 class="text-2xl font-semibold mt-8">Upcoming events</h2>
      ${upcoming.length ? upcoming.map(renderEventCard).join("") : "<p>No upcoming events right now. New sessions are announced here and in our newsletter.</p>"}
      ${past.length ? `<h2 class="text-2xl font-semibold mt-8">Past events</h2>${past.map(renderEventCard).join("")}` : ""}
    </main>`;
};

/** Readable version of one event's page */
const renderEvent = (event: EventRow) => `
    <main style="padding-top: 96px" class="container mx-auto px-6 py-12 max-w-3xl">
      <p><a href="/events">← All events</a></p>
      <h1 class="text-3xl font-bold mb-4">${escapeHtml(event.title)}</h1>
      <p>${eventMeta(event)}</p>
      ${event.host_name ? `<p>Hosted by ${escapeHtml(event.host_name)}</p>` : ""}
      ${event.image_url ? `<img src="${escapeHtml(event.image_url)}" alt="${escapeHtml(event.title)}" width="1200" height="630" style="max-width:100%;height:auto">` : ""}
      ${String(event.description || "").split(/\n\s*\n/).filter((para) => para.trim()).map((para) => `<p>${escapeHtml(para.trim())}</p>`).join("")}
      <p>Registration is free.</p>
    </main>`;
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

// Homepage hero, built with the same markup and classes as the app's HomeHero
// and HeroPhoneStory (first frame, nothing moving yet), so the first thing a
// visitor sees is already the real hero. The app then takes over without a
// visible change. Keep in step with src/components/home/HomeHero.tsx.
const BTN = "inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 rounded-md h-auto min-h-[52px] px-6 py-3 text-base font-semibold";
const ARROW = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right ml-1 h-4 w-4"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>';
const SHIELD = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check h-3.5 w-3.5 flex-shrink-0 text-primary" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>';

const heroPhone = (key: "score" | "market" | "compass", i: number) => {
  const shot = SHOTS[key][0];
  const active = i === 0;
  const small = shot.src.replace(/\.webp$/, "-300.webp");
  const img = `<img src="${shot.src}" srcset="${small} 300w, ${shot.src} 600w" sizes="236px" alt="" width="600" height="1167" decoding="async" ${active ? 'loading="eager" fetchpriority="high"' : 'loading="lazy" fetchpriority="low"'} draggable="false" class="absolute inset-0 h-full w-full object-cover object-top" style="transform-origin: ${shot.ox}% ${shot.oy}%; transform: translateY(${shot.from[1]}%) scale(${shot.from[0]});">`;
  return `<div class="relative flex-shrink-0 transition-[transform,filter,opacity] duration-700 ease-[cubic-bezier(.22,1,.36,1)] lg:mx-[-22px] ${active ? "block" : "hidden lg:block"}" style="z-index: ${active ? 30 : 10 + i}; transform: none; filter: ${active ? "none" : "brightness(.55) saturate(.8)"};"><div class="block w-[220px] rounded-[2.3rem] bg-[#070b0a] p-[7px] ring-1 ring-white/10 sm:w-[236px] lg:w-[176px] xl:w-[218px] 2xl:w-[236px] ${active ? "shadow-[0_30px_70px_-20px_hsl(158_64%_30%/0.65)]" : "shadow-xl"}"><div class="relative aspect-[600/1167] overflow-hidden rounded-[1.85rem] bg-[#111a17]">${img}<span class="absolute left-1/2 top-2 h-[18px] w-[64px] -translate-x-1/2 rounded-full bg-[#070b0a]"></span></div></div></div>`;
};

const heroStep = (s: { title: string; note: string }, i: number) => {
  const active = i === 0;
  return `<a href="/financial-freedom-calculator" class="group relative overflow-hidden rounded-xl border px-2.5 py-2.5 text-left transition-colors sm:px-3.5 sm:py-3 ${active ? "border-primary/50 bg-primary/[0.08]" : "border-border bg-card/60 hover:border-primary/30"}"><span class="flex items-center gap-2"><span class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}">${i + 1}</span><span class="text-xs font-semibold leading-tight text-foreground sm:text-sm">${escapeHtml(s.title)}</span></span><span class="mt-1 hidden text-xs leading-snug text-muted-foreground sm:block">${escapeHtml(s.note)}</span><span class="absolute inset-x-0 bottom-0 h-[3px] bg-border/60"></span></a>`;
};

const renderHeroSection = () => {
  const [before, after] = HERO.h1.split(HERO.h1Highlight);
  return `
      <section class="relative flex min-h-[100svh] items-center overflow-hidden bg-background px-4 pb-14 pt-20 sm:px-6 sm:pt-24 lg:px-16 lg:pb-16 lg:pt-24">
        <div aria-hidden="true" class="pointer-events-none absolute inset-0" style="background: radial-gradient(ellipse 70% 55% at 75% 35%, hsl(158 64% 52% / 0.08), transparent 70%);"></div>
        <div aria-hidden="true" class="pointer-events-none absolute right-[6%] top-[12%] h-72 w-72 rounded-full bg-primary/[0.04] sm:h-80 sm:w-80" style="animation: float 6s ease-in-out infinite;"></div>
        <div aria-hidden="true" class="pointer-events-none absolute bottom-[10%] left-[3%] h-44 w-44 rounded-full bg-primary/[0.04]" style="animation: float 8s ease-in-out infinite reverse;"></div>
        <div aria-hidden="true" class="pointer-events-none absolute right-[30%] top-[55%] hidden h-28 w-28 rounded-full bg-primary/[0.03] lg:block" style="animation: float 5s ease-in-out infinite 1s;"></div>
        <div class="relative mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-10 xl:gap-14">
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-wider sm:text-sm" style="color: var(--brand-text);">${escapeHtml(HERO.eyebrow)}</p>
            <h1 class="mt-3 text-[2rem] font-bold leading-[1.12] text-foreground sm:text-5xl lg:text-[3.4rem]" style="text-wrap: balance;">${escapeHtml(before)}<span style="color: var(--brand-text);">${escapeHtml(HERO.h1Highlight)}</span>${escapeHtml(after ?? "")}</h1>
            <p class="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">${escapeHtml(HERO.subline)}</p>
            <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-start">
              <div class="flex flex-col items-stretch gap-1.5 sm:items-center">
                <a href="/financial-freedom-calculator" class="${BTN} bg-primary text-primary-foreground hover:bg-primary/90">${escapeHtml(HERO.primary)}${ARROW}</a>
                <span class="text-center text-xs text-muted-foreground">${escapeHtml(HERO.primaryNote)}</span>
              </div>
              <a href="/auth" class="${BTN} border bg-background hover:bg-accent hover:text-accent-foreground border-primary/50">${escapeHtml(HERO.secondary)}</a>
            </div>
            <ul class="mt-6 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground sm:text-sm">${HERO.trust.map((t) => `<li class="inline-flex items-center gap-1.5">${SHIELD}${escapeHtml(t)}</li>`).join("")}</ul>
          </div>
          <div class="min-w-0">
            <div class="relative min-w-0">
              <p class="sr-only">${escapeHtml(HERO.storiesLabel)}: ${HERO.stories.map((s) => `${escapeHtml(s.title)} (${escapeHtml(s.note)})`).join("; ")}.</p>
              <div aria-hidden="true" class="pointer-events-none absolute left-1/2 top-[42%] h-[70%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full" style="background: radial-gradient(closest-side, hsl(158 64% 45% / 0.22), transparent);"></div>
              <div aria-hidden="true" class="relative flex items-start justify-center pt-2 lg:pt-6">${HERO.stories.map((s, i) => heroPhone(s.key as "score" | "market" | "compass", i)).join("")}</div>
              <div class="relative mt-8 grid grid-cols-3 gap-2 sm:gap-3 lg:mt-12">${HERO.stories.map(heroStep).join("")}</div>
              <p class="relative mt-3 text-center text-xs text-muted-foreground">${escapeHtml(HERO.storiesNote)} · <span class="opacity-80">${escapeHtml(HERO.storiesCaption)}</span></p>
            </div>
          </div>
        </div>
      </section>
`;
};

/** Readable version of the homepage (same text the app shows) */
const renderHome = () => `
    <main>
${renderHeroSection()}

      <section class="container mx-auto px-6 py-16 max-w-4xl">
        <h2 class="text-3xl font-bold mb-4">${escapeHtml(PREVIEW.h2)}</h2>
        <p>${escapeHtml(PREVIEW.text)}</p>
        <p><a href="/financial-freedom-calculator">${escapeHtml(PREVIEW.button)}</a></p>
        <h3 class="text-xl font-semibold mt-6">${escapeHtml(PREVIEW.cardsHeading)}</h3>
        ${PREVIEW.cards.map((c) => `<h4 class="font-semibold mt-4">${escapeHtml(c.title)}</h4><p>${escapeHtml(c.line)}</p>`).join("")}
        <p>${escapeHtml(PREVIEW.signIn)}</p>
        <p><small>${escapeHtml(PREVIEW.disclaimer)}</small></p>
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

      <section class="container mx-auto px-6 py-16 max-w-4xl">
        <h2 class="text-3xl font-bold mb-4">${escapeHtml(HOME_GUIDES.heading)}</h2>
        <p>${escapeHtml(HOME_GUIDES.text)}</p>
        <h3 class="text-xl font-semibold mt-6">${escapeHtml(HOME_GUIDES.toolsLabel)}</h3>
        <ul>${HOME_GUIDES.tools.map((t) => `<li><a href="${t.href}">${escapeHtml(t.title)}</a>: ${escapeHtml(t.line)}</li>`).join("")}</ul>
        <h3 class="text-xl font-semibold mt-6">${escapeHtml(HOME_GUIDES.articlesLabel)}</h3>
        <ol>${HOME_GUIDES.articles.map((a) => `<li><a href="/blog/${escapeHtml(a.slug)}">${escapeHtml(a.title)}</a></li>`).join("")}</ol>
        <p><a href="/blog">${escapeHtml(HOME_GUIDES.allArticles)}</a> · <a href="${HOME_GUIDES.social.href}" rel="noopener">${escapeHtml(HOME_GUIDES.social.label)} (${escapeHtml(HOME_GUIDES.social.handle)})</a></p>
      </section>

      <section id="faq" class="container mx-auto px-6 py-16 max-w-4xl">
        <h2 class="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
        ${HOME_FAQS.map((faq) => `<details><summary><h3 class="inline font-semibold">${escapeHtml(faq.question)}</h3></summary><p>${escapeHtml(faq.answer)}</p></details>`).join("\n        ")}
      </section>

      <section class="container mx-auto px-6 py-12 max-w-4xl">
        <p>${escapeHtml(COMPANY.description)}</p>
        <p>${escapeHtml(COMPANY.legalStatus)} · ${escapeHtml(COMPANY.arn)} · APMI Registered PMS Distributor · ${escapeHtml(COMPANY.aprn)} · CIN: ${escapeHtml(COMPANY.cin)} · Insurance POSP Code: ${escapeHtml(COMPANY.insurancePosp)}</p>
        <p>Contact: <a href="tel:${escapeHtml(COMPANY.telephone)}">${escapeHtml(COMPANY.telephone)}</a> · <a href="mailto:${escapeHtml(COMPANY.email)}">${escapeHtml(COMPANY.email)}</a></p>
        <p><a href="/blog">Read our research-driven articles on mutual funds, markets and retirement planning</a></p>
        <p><a href="/privacy-policy">Privacy Policy</a></p>
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

const REAL_WORTH_PATH = "/real-worth-calculator";

/** Readable version of the Real Worth Calculator: heading, what it compares, disclaimer and FAQs */
const renderRealWorth = () => `
    <main style="padding-top: 96px; max-width: 960px; margin: 0 auto; padding-left: 16px; padding-right: 16px">
      <h1 style="font-size: 28px; font-weight: 700">${escapeHtml(REAL_WORTH_COPY.h1)}</h1>
      <p>${escapeHtml(REAL_WORTH_COPY.intro)}</p>
      <h2>What we compare</h2>
      <ul>${DEFAULT_REAL_WORTH_ASSETS.map((a) => `<li><strong>${escapeHtml(a.label)}</strong>: ${escapeHtml(a.factLine)}</li>`).join("")}</ul>
      <p>Before tax · Inflation 7% a year</p>
      <p><a href="/financial-freedom-calculator">Will this last through my retirement? Check in 2 minutes</a></p>
      <p><small>${escapeHtml(REAL_WORTH_COPY.disclaimer)}</small></p>
      <p><small>${escapeHtml(REAL_WORTH_COPY.entity)}</small></p>
      <h2>Frequently Asked Questions</h2>
      ${REAL_WORTH_FAQS.map((faq) => `<details><summary>${escapeHtml(faq.question)}</summary><p>${escapeHtml(faq.answer)}</p></details>`).join("")}
    </main>`;

const PRIVACY_PATH = "/privacy-policy";

/** The full privacy policy, readable without JavaScript (Meta ad review, AI assistants, search) */
const renderPrivacy = () => `
    <main style="padding-top: 96px; max-width: 896px; margin: 0 auto; padding-left: 16px; padding-right: 16px">
      <h1 style="font-size: 32px; font-weight: 700">Privacy Policy</h1>
      ${PRIVACY_POLICY_HTML}
      <p>Vinca Investment Private Limited · AMFI-registered Mutual Fund Distributor · ARN-293401 · <a href="mailto:${escapeHtml(COMPANY.email)}">${escapeHtml(COMPANY.email)}</a></p>
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
  if (path === REAL_WORTH_PATH) {
    graph.push(faqPage(url, REAL_WORTH_FAQS), {
      "@type": "WebApplication",
      "@id": `${url}#app`,
      name: "Real Worth Calculator",
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
  const eventId = path.match(/^\/events\/([^/]+)$/)?.[1];
  let seo = PAGE_SEO[path];
  if (!seo && !eventId) return;

  try {
    // Events: the list, or one event (a real 404 when it doesn't exist)
    let events: EventRow[] = [];
    let event: EventRow | undefined;
    let image = DEFAULT_IMAGE;
    if (path === "/events") {
      events = (await loadEvents("order=event_date.desc")) || [];
    } else if (eventId) {
      const found = /^[0-9a-f-]{36}$/i.test(eventId) ? await loadEvents(`id=eq.${eventId}`) : [];
      if (found === null) return; // database unreachable: serve the plain app
      event = found[0];
      if (!event) {
        const notFound = (await (await context.next()).text())
          .replace(/<title>[\s\S]*?<\/title>/i, "<title>Event not found | Vinca Wealth</title>")
          .replace(/<meta\s+name="robots"[\s\S]*?\/?>/i, '<meta name="robots" content="noindex" />');
        return new Response(notFound, { status: 404, headers: { "content-type": "text/html; charset=utf-8" } });
      }
      const summary = String(event.description || "").replace(/\s+/g, " ").trim();
      seo = {
        title: `${event.title} | Vinca Wealth Events`,
        description: summary.length > 155
          ? `${summary.slice(0, 152).replace(/\s+\S*$/, "")}…`
          : summary || `Free Vinca Wealth webinar: ${event.title}.`,
      };
      if (event.image_url) image = event.image_url;
    }

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
    <meta property="og:image" content="${escapeHtml(image)}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="Vinca Wealth">
    <meta property="og:locale" content="en_IN">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@vincawealth">
    <meta name="twitter:title" content="${escapeHtml(seo.title)}">
    <meta name="twitter:description" content="${escapeHtml(seo.description)}">
    <meta name="twitter:image" content="${escapeHtml(image)}">
    <meta name="geo.region" content="IN-KA">
    <meta name="geo.placename" content="Bengaluru">
    <meta name="geo.position" content="${COMPANY.geo.latitude};${COMPANY.geo.longitude}">
    <script type="application/ld+json">${scriptJson({ "@context": "https://schema.org", "@graph": [...pageGraph(path, canonical, seo), ...(event ? [eventSchema(event)] : events.map(eventSchema))] })}</script>`;

    let html = stripDefaultHead(await response.text())
      // index.html's generic geo tags are replaced by the Bengaluru ones above
      .replace(/<meta\s+name="geo\.(region|placename)"[\s\S]*?\/?>/gi, "")
      .replace("<head>", `<head>\n${head}`);
    if (path === "/") html = html.replace('<div id="root"></div>', `<div id="root">${renderHome()}</div>`);
    if (path === CALCULATOR_PATH) html = html.replace('<div id="root"></div>', `<div id="root">${renderCalculator()}</div>`);
    if (path === REAL_WORTH_PATH) html = html.replace('<div id="root"></div>', `<div id="root">${renderRealWorth()}</div>`);
    if (path === PRIVACY_PATH) html = html.replace('<div id="root"></div>', `<div id="root">${renderPrivacy()}</div>`);
    if (path === "/events") html = html.replace('<div id="root"></div>', `<div id="root">${renderEvents(events)}</div>`);
    if (event) html = html.replace('<div id="root"></div>', `<div id="root">${renderEvent(event)}</div>`);

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
  path: ["/", "/financial-freedom-calculator", "/real-worth-calculator", "/events", "/events/*", "/privacy-policy"],
  // Responses opt in to CDN caching with Netlify-CDN-Cache-Control
  cache: "manual",
};
