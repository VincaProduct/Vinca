import type { Context } from "https://edge.netlify.com";
import { Marked } from "https://esm.sh/marked@11.1.1";

/**
 * Server-renders blog pages for every visitor (browsers, search engines and AI
 * crawlers alike): per-page meta tags, JSON-LD and the full article/listing
 * markup inside #root. The React app then takes over using the same data,
 * which is embedded as JSON so it doesn't need to fetch it again.
 */

const SITE = "https://vincawealth.com";
const SUPABASE_URL = "https://xmmyjphoaqazwlifehxs.supabase.co";
// Public anon key (same one the browser app uses)
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtbXlqcGhvYXFhendsaWZlaHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MTY4NjMsImV4cCI6MjA2NDA5Mjg2M30.E7O_Q0Zcz0S-6ERl0JE-6SUth-lMLMbzTNGrdhDq_1k";

const ORG_ID = `${SITE}/#organization`;
const WEBSITE_ID = `${SITE}/#website`;
const LOGO = `${SITE}/images/vinca-logo.webp`;
const DEFAULT_IMAGE = `${SITE}/og-image.png`;
const POSTS_PER_PAGE = 12;

const LISTING_TITLE = "Vinca Wealth Blog | Mutual Funds, Investing & Financial Planning";
const LISTING_DESCRIPTION =
  "Read expert articles on mutual funds, goal-based investing, wealth management, and financial planning from the Vinca Wealth team.";

// deno-lint-ignore no-explicit-any
type Row = Record<string, any>;

interface TocItem {
  id: string;
  title: string;
  anchor: string;
  level: 1 | 2 | 3;
}

const supabaseGet = (path: string) =>
  fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Accept: "application/json",
    },
  });

const escapeHtml = (text: unknown) =>
  String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

/** JSON that is safe to place inside a <script> tag */
const scriptJson = (data: unknown) =>
  JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(new RegExp(String.fromCharCode(0x2028), "g"), "\\u2028")
    .replace(new RegExp(String.fromCharCode(0x2029), "g"), "\\u2029");

/** Same algorithm as the React app (TOCEditor / BlogContentWithAnchors) */
const generateAnchor = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();

const plainText = (markdownOrHtml: string) =>
  markdownOrHtml
    .replace(/<[^>]+>/g, "")
    .replace(/[*_`~]/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();

/** Resize and convert Supabase Storage images (WebP/AVIF) through Netlify Image CDN */
const optimizedImage = (src: string | null | undefined, width: number) => {
  if (!src) return "";
  if (!src.startsWith(`${SUPABASE_URL}/storage/`)) return src;
  return `/.netlify/images?url=${encodeURIComponent(src)}&w=${width}&q=75`;
};

const srcSet = (src: string, widths: number[]) =>
  src.startsWith(`${SUPABASE_URL}/storage/`)
    ? widths.map((w) => `${optimizedImage(src, w)} ${w}w`).join(", ")
    : "";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });

/** Drop the homepage defaults from index.html so each page has a single title, canonical, etc. */
const stripDefaultHead = (html: string) =>
  html
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/<meta\s+name="(description|author|robots|keywords|title)"[\s\S]*?\/?>/gi, "")
    .replace(/<meta\s+property="(og|article):[^"]*"[\s\S]*?\/?>/gi, "")
    .replace(/<meta\s+name="twitter:[^"]*"[\s\S]*?\/?>/gi, "")
    .replace(/<link\s+rel="canonical"[\s\S]*?\/?>/gi, "")
    .replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, "");

const injectPage = (html: string, head: string, body: string, data: { id: string; value: unknown }) =>
  stripDefaultHead(html)
    .replace("<head>", `<head>\n${head}`)
    .replace(
      '<div id="root"></div>',
      `<script id="${data.id}" type="application/json">${scriptJson(data.value)}</script>\n  <div id="root">${body}</div>`,
    );

const organization = {
  "@type": ["FinancialService", "Organization"],
  "@id": ORG_ID,
  name: "Vinca Wealth",
  url: SITE,
  logo: { "@type": "ImageObject", "@id": `${SITE}/#logo`, url: LOGO, contentUrl: LOGO, caption: "Vinca Wealth" },
  description: "AMFI registered mutual fund distributor offering goal-based investing and wealth management.",
  identifier: [
    { "@type": "PropertyValue", propertyID: "AMFI ARN", value: "ARN-293401" },
    { "@type": "PropertyValue", propertyID: "CIN", value: "U65999KA2022PTC169569" },
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress:
      "183/8, Adjacent to Daddy's Elixir Appartment Singenagrahara, Huskur Post, Sarjapura, hobli, Phase II",
    addressLocality: "Electronic City, Bengaluru",
    addressRegion: "Karnataka",
    postalCode: "560100",
    addressCountry: "IN",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    telephone: "+91-7386809164",
    email: "support@vincawealth.com",
    availableLanguage: "English",
  },
  sameAs: [
    "https://www.facebook.com/people/Vinca-Wealth/100088393606551/",
    "https://www.instagram.com/vincawealth/",
    "https://www.youtube.com/@vincawealth9573",
  ],
};

const website = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: SITE,
  name: "Vinca Wealth",
  publisher: { "@id": ORG_ID },
  inLanguage: "en-IN",
};

const socialTags = (opts: { type: string; url: string; title: string; description: string; image: string }) => `
    <meta property="og:type" content="${opts.type}">
    <meta property="og:url" content="${opts.url}">
    <meta property="og:title" content="${escapeHtml(opts.title)}">
    <meta property="og:description" content="${escapeHtml(opts.description)}">
    <meta property="og:image" content="${escapeHtml(opts.image)}">
    <meta property="og:image:alt" content="${escapeHtml(opts.title)}">
    <meta property="og:site_name" content="Vinca Wealth">
    <meta property="og:locale" content="en_IN">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@vincawealth">
    <meta name="twitter:title" content="${escapeHtml(opts.title)}">
    <meta name="twitter:description" content="${escapeHtml(opts.description)}">
    <meta name="twitter:image" content="${escapeHtml(opts.image)}">`;

const absoluteImage = (src: string | null | undefined) => {
  if (!src) return DEFAULT_IMAGE;
  return src.startsWith("http") ? src : `${SITE}${src.startsWith("/") ? "" : "/"}${src}`;
};

/* ------------------------------------------------------------------------- */
/* Blog post                                                                 */
/* ------------------------------------------------------------------------- */

interface Faq {
  question: string;
  answer: string;
}

const cleanFaqs = (value: unknown): Faq[] =>
  Array.isArray(value)
    ? value
        .map((f) => ({ question: String(f?.question ?? "").trim(), answer: String(f?.answer ?? "").trim() }))
        .filter((f) => f.question && f.answer)
    : [];

/** The post's own FAQs, then the company FAQs unless the post hides them */
const postFaqs = (post: Row): Faq[] => [
  ...cleanFaqs(post.faqs),
  ...(post.hide_global_faqs ? [] : cleanFaqs(post.global_faqs)),
];

const renderTakeaways = (items: unknown) => {
  const points = Array.isArray(items) ? items.map((p) => String(p).trim()).filter(Boolean) : [];
  if (points.length === 0) return "";
  return `
            <aside aria-label="Key takeaways" class="key-takeaways mb-8 sm:mb-10">
              <p class="key-takeaways-title">Key Takeaways</p>
              <ul>${points.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul>
            </aside>`;
};

const renderFaqs = (faqs: Faq[]) => {
  if (faqs.length === 0) return "";
  return `
            <section aria-labelledby="faqs" class="blog-faqs mt-12 sm:mt-16">
              <h2 id="faqs">Frequently Asked Questions</h2>
              ${faqs.map((f) => `<details><summary>${escapeHtml(f.question)}</summary><p>${escapeHtml(f.answer)}</p></details>`).join("")}
            </section>`;
};

const renderMarkdown = (content: string, toc: TocItem[]) => {
  const anchors = new Map<string, string>();
  toc.forEach((item) => {
    anchors.set(item.title, item.anchor);
    anchors.set(item.title.toLowerCase().trim(), item.anchor);
    anchors.set(generateAnchor(item.title), item.anchor);
  });

  const marked = new Marked({ gfm: true });
  marked.use({
    renderer: {
      heading(text: string, level: number, raw: string) {
        const clean = plainText(raw);
        const id =
          anchors.get(clean) || anchors.get(clean.toLowerCase()) || anchors.get(generateAnchor(clean)) ||
          generateAnchor(clean);
        return `<h${level} id="${escapeHtml(id)}" class="scroll-mt-24">${text}</h${level}>\n`;
      },
      link(href: string, title: string | null, text: string) {
        const external = /^https?:\/\//i.test(href) && !href.startsWith(SITE);
        return `<a href="${escapeHtml(href)}"${title ? ` title="${escapeHtml(title)}"` : ""}${
          external ? ' target="_blank" rel="noopener noreferrer"' : ""
        }>${text}</a>`;
      },
      image(href: string, title: string | null, text: string) {
        const set = srcSet(href, [640, 960, 1280]);
        return `<img src="${escapeHtml(optimizedImage(href, 960))}"${
          set ? ` srcset="${escapeHtml(set)}" sizes="(min-width: 1024px) 800px, 100vw"` : ""
        } alt="${escapeHtml(text)}"${title ? ` title="${escapeHtml(title)}"` : ""} loading="lazy" decoding="async">`;
      },
      table(header: string, body: string) {
        return `<div class="my-6 w-full overflow-x-auto"><table><thead>${header}</thead><tbody>${body}</tbody></table></div>\n`;
      },
    },
  });

  // Inline CTA markers are filled in by the React app
  const withoutMarkers = (content || "").replace(/\[\[CTA:[^\]]+\]\]/g, "");
  return marked.parse(withoutMarkers) as string;
};

const renderToc = (toc: TocItem[]) => {
  const levelClass = { 1: "pl-0 text-sm font-medium", 2: "pl-4 text-sm", 3: "pl-8 text-xs" } as const;
  return `
    <nav aria-label="Table of contents" class="w-full">
      <p class="text-sm font-medium text-muted-foreground uppercase tracking-wide pb-3">On this page</p>
      <ul class="space-y-2 border-l border-border/40">
        ${toc
          .map(
            (item) => `<li><a href="#${escapeHtml(item.anchor)}" class="block w-full text-left py-1.5 px-4 -ml-px border-l-2 border-transparent text-muted-foreground hover:text-foreground ${levelClass[item.level] || levelClass[2]}">${escapeHtml(item.title)}</a></li>`,
          )
          .join("")}
      </ul>
    </nav>`;
};

const renderPost = (post: Row) => {
  const toc: TocItem[] = Array.isArray(post.table_of_contents) ? post.table_of_contents : [];
  const hasToc = toc.length > 0;
  const authorName = post.author?.name || post.author_name || "Vinca Wealth";
  const authorTitle = post.author?.title || post.author_title;
  const authorImage = post.author?.image || post.author_image;
  const authorBio = post.author?.bio || post.author_bio;
  const published = post.published_at || post.created_at;
  const image = post.featured_image as string | null;
  const imageSet = image ? srcSet(image, [640, 960, 1280, 1600]) : "";

  return `
    <article class="pt-16 sm:pt-20 lg:pt-24">
      <div class="bg-muted/30 py-3 sm:py-4">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb">
            <ol class="flex items-center gap-1 sm:gap-2 text-sm text-muted-foreground">
              <li><a href="/" class="hover:text-primary">Home</a></li>
              <li aria-hidden="true">›</li>
              <li><a href="/blog" class="hover:text-primary">Blog</a></li>
              <li aria-hidden="true">›</li>
              <li class="text-foreground truncate" aria-current="page">${escapeHtml(post.title)}</li>
            </ol>
          </nav>
        </div>
      </div>

      <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div class="flex gap-8 max-w-7xl mx-auto ${hasToc ? "" : "justify-center"}">
          <div class="flex-1 ${hasToc ? "max-w-4xl" : "max-w-4xl mx-auto"}">
            <div class="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6 text-sm text-muted-foreground">
              <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-primary/20 text-primary bg-primary/5">${escapeHtml(post.category)}</span>
              ${post.read_time ? `<span>${escapeHtml(post.read_time)}</span>` : ""}
              <time datetime="${escapeHtml(published)}">${formatDate(published)}</time>
            </div>

            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-4 sm:mb-6 leading-tight">${escapeHtml(post.title)}</h1>

            ${post.subtitle ? `<p class="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed">${escapeHtml(post.subtitle)}</p>` : ""}

            ${post.quote ? `<blockquote class="border-l-4 border-primary pl-4 sm:pl-6 py-2 mb-6 sm:mb-8 text-lg sm:text-xl italic text-foreground/80 leading-relaxed">“${escapeHtml(post.quote)}”</blockquote>` : ""}

            ${image ? `
            <div class="aspect-video w-full mb-8 sm:mb-12 overflow-hidden rounded-lg">
              <img src="${escapeHtml(optimizedImage(image, 1280))}"${imageSet ? ` srcset="${escapeHtml(imageSet)}" sizes="(min-width: 1024px) 896px, 100vw"` : ""} alt="${escapeHtml(post.featured_image_alt || post.title)}" width="1280" height="720" fetchpriority="high" decoding="async" class="w-full h-full object-cover">
            </div>` : ""}

            <div class="flex items-center justify-between py-4 sm:py-6 border-y border-border mb-8 sm:mb-12">
              <div class="flex items-center gap-3">
                ${authorImage ? `<img src="${escapeHtml(optimizedImage(authorImage, 96))}" alt="${escapeHtml(authorName)}" width="48" height="48" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover">` : ""}
                <div>
                  <div class="font-semibold text-sm sm:text-base">${escapeHtml(authorName)}</div>
                  ${authorTitle ? `<div class="text-xs sm:text-sm text-muted-foreground">${escapeHtml(authorTitle)}</div>` : ""}
                </div>
              </div>
            </div>

            ${renderTakeaways(post.key_takeaways)}

            ${hasToc ? `<div class="lg:hidden mb-8">${renderToc(toc)}</div>` : ""}

            <div class="blog-content prose prose-lg max-w-none dark:prose-invert prose-headings:scroll-mt-24">
              ${renderMarkdown(post.content, toc)}
            </div>

            ${renderFaqs(postFaqs(post))}

            ${authorBio ? `
            <div class="mt-12 sm:mt-16 p-6 sm:p-8 bg-muted/30 rounded-lg">
              <h2 class="text-lg sm:text-xl font-display font-bold mb-4">About the Author</h2>
              <p class="font-semibold text-base sm:text-lg mb-1">${escapeHtml(authorName)}</p>
              ${authorTitle ? `<p class="text-sm text-muted-foreground mb-3">${escapeHtml(authorTitle)}</p>` : ""}
              <p class="text-sm sm:text-base text-muted-foreground leading-relaxed">${escapeHtml(authorBio)}</p>
            </div>` : ""}
          </div>

          ${hasToc ? `<aside class="hidden lg:block w-80 flex-shrink-0"><div class="sticky top-24">${renderToc(toc)}</div></aside>` : ""}
        </div>
      </div>
    </article>`;
};

const postHead = (post: Row) => {
  const url = `${SITE}/blog/${post.slug}`;
  const title = post.meta_title || post.title;
  const description = post.meta_description || post.excerpt || post.subtitle ||
    "Read the latest insights on wealth management, mutual funds, and financial planning from Vinca Wealth.";
  const image = absoluteImage(post.og_image || post.featured_image);
  const authorName = post.author?.name || post.author_name || "Vinca Wealth";
  const published = post.published_at || post.created_at;
  const modified = post.updated_at || published;
  const noindex = post.noindex === true;
  const words = plainText(post.content || "").split(/\s+/).filter(Boolean).length;

  const graph: Row[] = [
    organization,
    website,
    {
      "@type": "WebPage",
      "@id": url,
      url,
      name: title,
      description,
      isPartOf: { "@id": WEBSITE_ID },
      breadcrumb: { "@id": `${url}#breadcrumb` },
      primaryImageOfPage: { "@type": "ImageObject", url: image },
      inLanguage: "en-IN",
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
    {
      "@type": "BlogPosting",
      "@id": `${url}#article`,
      headline: String(post.title).slice(0, 110),
      description,
      image: [image],
      datePublished: published,
      dateModified: modified,
      author: {
        "@type": "Person",
        name: authorName,
        ...(post.author?.title || post.author_title ? { jobTitle: post.author?.title || post.author_title } : {}),
        ...(post.author?.image ? { image: post.author.image } : {}),
      },
      publisher: { "@id": ORG_ID },
      mainEntityOfPage: { "@id": url },
      isPartOf: { "@id": WEBSITE_ID },
      articleSection: post.category,
      wordCount: words,
      inLanguage: "en-IN",
    },
  ];

  // FAQs shown on the page: the post's own and the company FAQs
  const faqs = postFaqs(post);
  if (faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }

  const featured = post.featured_image as string | null;
  const preload = featured
    ? featured.startsWith(`${SUPABASE_URL}/storage/`)
      ? `<link rel="preload" as="image" href="${escapeHtml(optimizedImage(featured, 1280))}" imagesrcset="${escapeHtml(srcSet(featured, [640, 960, 1280, 1600]))}" imagesizes="(min-width: 1024px) 896px, 100vw" fetchpriority="high">`
      : `<link rel="preload" as="image" href="${escapeHtml(featured)}" fetchpriority="high">`
    : "";

  return `
    <title>${escapeHtml(title)} | Vinca Wealth Blog</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="author" content="${escapeHtml(authorName)}">
    <meta name="robots" content="${noindex ? "noindex, follow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"}">
    <link rel="canonical" href="${url}">
    ${preload}
    ${socialTags({ type: "article", url, title, description, image })}
    <meta property="article:published_time" content="${escapeHtml(published)}">
    <meta property="article:modified_time" content="${escapeHtml(modified)}">
    <meta property="article:author" content="${escapeHtml(authorName)}">
    <meta property="article:section" content="${escapeHtml(post.category)}">
    <script type="application/ld+json">${scriptJson({ "@context": "https://schema.org", "@graph": graph })}</script>`;
};

const handlePost = async (slug: string, context: Context) => {
  const response = await supabaseGet(
    `blog_posts?select=*,author:authors(id,name,title,bio,image)&slug=eq.${encodeURIComponent(slug)}&status=eq.published`,
  );
  if (!response.ok) {
    console.error(`[blog-ssr] Failed to fetch post ${slug}: ${response.status}`);
    // 503 so Google retries rather than treating this as a soft 404
    return new Response("Service Unavailable", { status: 503, headers: { "Retry-After": "300" } });
  }

  const posts: Row[] = await response.json();
  const post = posts[0];

  // Company FAQs (shown on every post unless hidden); missing table = none
  if (post && !post.hide_global_faqs) {
    const faqResponse = await supabaseGet("global_faqs?select=question,answer&order=position.asc").catch(() => null);
    post.global_faqs = faqResponse?.ok ? cleanFaqs(await faqResponse.json()) : [];
  }
  if (!post) {
    // A renamed post: permanently redirect the old slug to the new one
    const redirect = await supabaseGet(
      `blog_slug_redirects?select=post:blog_posts(slug,status)&old_slug=eq.${encodeURIComponent(slug)}`,
    );
    if (redirect.ok) {
      const [row] = (await redirect.json()) as Row[];
      if (row?.post?.status === "published" && row.post.slug !== slug) {
        return new Response(null, {
          status: 301,
          headers: { Location: `/blog/${encodeURIComponent(row.post.slug)}`, "Cache-Control": "public, max-age=3600" },
        });
      }
    }

    // Let the app show its "Article not found" page, with a real 404 status
    const html = await (await context.next()).text();
    return new Response(
      stripDefaultHead(html).replace(
        "<head>",
        '<head>\n    <title>Article not found | Vinca Wealth Blog</title>\n    <meta name="robots" content="noindex">',
      ),
      { status: 404, headers: { "content-type": "text/html; charset=utf-8" } },
    );
  }

  const html = await (await context.next()).text();
  return new Response(injectPage(html, postHead(post), renderPost(post), { id: "blog-post-data", value: post }), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
      "netlify-cdn-cache-control": "public, max-age=300, stale-while-revalidate=86400",
      "x-robots-tag": post.noindex === true ? "noindex, follow" : "index, follow",
    },
  });
};

/* ------------------------------------------------------------------------- */
/* Blog listing                                                              */
/* ------------------------------------------------------------------------- */

const LISTING_COLUMNS = "id,title,slug,excerpt,featured_image,category,read_time,published_at,created_at";

const renderListing = (posts: Row[], page: number, totalPages: number) => `
    <section class="p-8 sm:py-12 lg:py-16 mt-16">
      <div class="mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col lg:flex-row gap-8">
          <div class="lg:w-2/3">
            <h1 class="text-3xl sm:text-4xl font-display font-bold mb-8">Vinca Wealth Blog</h1>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              ${posts
                .map(
                  (post, index) => `
              <article class="rounded-lg border bg-background overflow-hidden h-full">
                <a href="/blog/${escapeHtml(post.slug)}" class="block h-full">
                  ${post.featured_image ? `<div class="aspect-video overflow-hidden"><img src="${escapeHtml(optimizedImage(post.featured_image, 640))}" alt="${escapeHtml(post.title)}" width="640" height="360" ${index < 3 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" class="w-full h-full object-cover"></div>` : ""}
                  <div class="p-3 sm:p-4 lg:p-6">
                    <div class="flex items-center justify-between text-xs sm:text-sm mb-2">
                      <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-primary/20 text-primary bg-primary/5">${escapeHtml(post.category)}</span>
                      ${post.read_time ? `<span class="text-muted-foreground">${escapeHtml(post.read_time)}</span>` : ""}
                    </div>
                    <h2 class="text-sm sm:text-base lg:text-lg font-display font-semibold line-clamp-2 leading-tight">${escapeHtml(post.title)}</h2>
                    ${post.excerpt ? `<p class="text-muted-foreground line-clamp-3 text-xs sm:text-sm mt-3 leading-relaxed">${escapeHtml(post.excerpt)}</p>` : ""}
                    <time class="block text-xs text-muted-foreground mt-3" datetime="${escapeHtml(post.published_at || post.created_at)}">${formatDate(post.published_at || post.created_at)}</time>
                  </div>
                </a>
              </article>`,
                )
                .join("")}
            </div>
            ${renderPagination(page, totalPages)}
          </div>
        </div>
      </div>
    </section>`;

const pageHref = (page: number) => (page <= 1 ? "/blog" : `/blog?page=${page}`);

const renderPagination = (page: number, totalPages: number) => {
  if (totalPages <= 1) return "";
  const links = Array.from({ length: totalPages }, (_, i) => i + 1)
    .map((p) =>
      p === page
        ? `<span aria-current="page" class="inline-flex h-9 min-w-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground">${p}</span>`
        : `<a href="${pageHref(p)}" class="inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm hover:bg-muted">${p}</a>`,
    )
    .join("");
  return `
            <nav aria-label="Blog pages" class="flex flex-wrap items-center justify-center gap-2 pt-8">
              ${page > 1 ? `<a href="${pageHref(page - 1)}" rel="prev" class="inline-flex h-9 items-center rounded-md border px-3 text-sm hover:bg-muted">Previous</a>` : ""}
              ${links}
              ${page < totalPages ? `<a href="${pageHref(page + 1)}" rel="next" class="inline-flex h-9 items-center rounded-md border px-3 text-sm hover:bg-muted">Next</a>` : ""}
            </nav>`;
};

const handleListing = async (url: URL, context: Context) => {
  const response = await supabaseGet(
    `blog_posts?select=${LISTING_COLUMNS}&status=eq.published&or=(noindex.is.null,noindex.is.false)&order=published_at.desc`,
  );
  // noindex column may not exist yet: fall back to all published posts
  const fallback = response.ok
    ? response
    : await supabaseGet(`blog_posts?select=${LISTING_COLUMNS}&status=eq.published&order=published_at.desc`);
  if (!fallback.ok) {
    console.error(`[blog-ssr] Failed to fetch posts: ${fallback.status}`);
    return; // serve the plain app
  }

  const posts: Row[] = await fallback.json();
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const requested = Number.parseInt(url.searchParams.get("page") || "1", 10);
  const page = Number.isFinite(requested) && requested >= 1 ? requested : 1;

  if (page > totalPages || (url.searchParams.has("page") && page === 1)) {
    return new Response(null, { status: 301, headers: { Location: pageHref(Math.min(page, totalPages)) } });
  }

  const pagePosts = posts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);
  const canonical = `${SITE}${pageHref(page)}`;
  const title = page > 1 ? `${LISTING_TITLE} - Page ${page}` : LISTING_TITLE;

  const graph = [
    organization,
    website,
    {
      "@type": "CollectionPage",
      "@id": canonical,
      url: canonical,
      name: title,
      description: LISTING_DESCRIPTION,
      isPartOf: { "@id": WEBSITE_ID },
      breadcrumb: { "@id": `${canonical}#breadcrumb` },
      mainEntity: {
        "@type": "ItemList",
        itemListElement: pagePosts.map((post, i) => ({
          "@type": "ListItem",
          position: (page - 1) * POSTS_PER_PAGE + i + 1,
          url: `${SITE}/blog/${post.slug}`,
          name: post.title,
        })),
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${canonical}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
      ],
    },
  ];

  const head = `
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(LISTING_DESCRIPTION)}">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
    <link rel="canonical" href="${canonical}">
    ${page > 1 ? `<link rel="prev" href="${SITE}${pageHref(page - 1)}">` : ""}
    ${page < totalPages ? `<link rel="next" href="${SITE}${pageHref(page + 1)}">` : ""}
    ${socialTags({ type: "website", url: canonical, title, description: LISTING_DESCRIPTION, image: DEFAULT_IMAGE })}
    <script type="application/ld+json">${scriptJson({ "@context": "https://schema.org", "@graph": graph })}</script>`;

  const html = await (await context.next()).text();
  return new Response(injectPage(html, head, renderListing(pagePosts, page, totalPages), { id: "blog-list-data", value: posts }), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
      "netlify-cdn-cache-control": "public, max-age=300, stale-while-revalidate=86400",
      "x-robots-tag": "index, follow",
      "netlify-vary": "query=page",
    },
  });
};

/* ------------------------------------------------------------------------- */

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  if (request.method !== "GET" && request.method !== "HEAD") return;

  try {
    if (url.pathname === "/blog" || url.pathname === "/blog/") {
      return await handleListing(url, context);
    }

    const slug = decodeURIComponent(url.pathname.replace(/^\/blog\//, "").replace(/\/$/, ""));
    if (!slug || slug.includes("/")) return;
    return await handlePost(slug, context);
  } catch (error) {
    console.error("[blog-ssr] Error rendering blog page:", error);
    return new Response("Service Unavailable", { status: 503, headers: { "Retry-After": "300" } });
  }
};

export const config = {
  path: ["/blog", "/blog/*"],
  excludedPath: ["/blog/cms", "/blog/cms/*"],
  // Responses opt in to CDN caching with Netlify-CDN-Cache-Control
  cache: "manual",
};
