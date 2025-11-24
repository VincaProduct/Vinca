import type { Context } from "https://edge.netlify.com";
import { marked } from "https://esm.sh/marked@11.1.1";

// Detect if the user agent is a search engine crawler
const isCrawler = (userAgent: string): boolean => {
  const crawlerPatterns = [
    'Googlebot',
    'Bingbot',
    'Slurp', // Yahoo
    'DuckDuckBot',
    'Baiduspider',
    'YandexBot',
    'Sogou',
    'Exabot',
    'facebot', // Facebook
    'ia_archiver', // Alexa
    'Applebot',
    'Pinterestbot',
    'LinkedInBot',
    'WhatsApp',
    'Twitterbot',
  ];

  return crawlerPatterns.some(pattern =>
    userAgent.toLowerCase().includes(pattern.toLowerCase())
  );
};

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';
  const isCrawlerRequest = isCrawler(userAgent);

  console.log(`[OG-Tags] Request to: ${url.pathname} from: ${userAgent.substring(0, 100)}`);
  console.log(`[OG-Tags] Is crawler: ${isCrawlerRequest}`);

  // Handle blog listing page
  if ((url.pathname === '/blog' || url.pathname === '/blog/') && isCrawlerRequest) {
    return handleBlogListing(request, context);
  }

  // Only process blog post URLs
  if (!url.pathname.startsWith('/blog/') || url.pathname === '/blog' || url.pathname === '/blog/') {
    return;
  }

  // Extract slug from URL
  const slug = url.pathname.replace('/blog/', '').replace(/\/$/, '');

  if (!slug) {
    return;
  }

  try {
    // Fetch blog post data from Supabase (using hardcoded values since they're public)
    const supabaseUrl = 'https://xmmyjphoaqazwlifehxs.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtbXlqcGhvYXFhendsaWZlaHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MTY4NjMsImV4cCI6MjA2NDA5Mjg2M30.E7O_Q0Zcz0S-6ERl0JE-6SUth-lMLMbzTNGrdhDq_1k';

    console.log(`[OG-Tags] Fetching blog post with slug: ${slug}`);

    const response = await fetch(
      `${supabaseUrl}/rest/v1/blog_posts?select=*,author:authors(name,title,image)&slug=eq.${slug}&status=eq.published`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error(`[OG-Tags] Failed to fetch blog post: ${response.status} ${response.statusText}`);
      return;
    }

    const posts = await response.json();
    console.log(`[OG-Tags] Found ${posts?.length || 0} posts for slug: ${slug}`);

    if (!posts || posts.length === 0) {
      console.log('[OG-Tags] No published blog post found, skipping OG tag injection');
      return;
    }

    const post = posts[0];
    console.log(`[OG-Tags] Processing blog post: ${post.title}`);

    // Fetch the original HTML
    const htmlResponse = await context.next();
    const html = await htmlResponse.text();

    // Prepare meta tag values - escape special characters for HTML
    const escapeHtml = (text: string) => {
      if (!text) return '';
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const title = escapeHtml(post.title || 'Vinca Wealth Blog');
    const description = escapeHtml(post.excerpt || post.subtitle || 'Read the latest insights on wealth management, mutual funds, and financial planning from Vinca Wealth');

    // Ensure image URLs are absolute and properly formatted
    let image = post.featured_image || 'https://vincawealth.com/images/vinca-logo.webp';
    if (image && !image.startsWith('http')) {
      image = `https://vincawealth.com${image.startsWith('/') ? '' : '/'}${image}`;
    }

    const blogUrl = `https://vincawealth.com/blog/${post.slug}`;
    const authorName = escapeHtml(post.author?.name || post.author_name || 'Vinca Wealth');
    const category = escapeHtml(post.category || 'Financial Planning');
    const readTime = escapeHtml(post.read_time || '5 min read');

    // Create meta tags with proper escaping
    const metaTags = `
    <!-- Dynamic Blog Post Meta Tags -->
    <title>${title} | Vinca Wealth Blog</title>
    <meta name="description" content="${description}">
    <meta name="author" content="${authorName}">
    <link rel="canonical" href="${blogUrl}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${blogUrl}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${image}">
    <meta property="og:image:secure_url" content="${image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:type" content="image/png">
    <meta property="og:site_name" content="Vinca Wealth">
    <meta property="og:locale" content="en_US">
    <meta property="article:published_time" content="${post.published_at || post.created_at}">
    <meta property="article:modified_time" content="${post.updated_at || post.created_at}">
    <meta property="article:author" content="${authorName}">
    <meta property="article:section" content="${category}">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${blogUrl}">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${image}">
    <meta name="twitter:image:alt" content="${title}">
    <meta name="twitter:site" content="@vincawealth">
    <meta name="twitter:creator" content="@vincawealth">
    
    <!-- WhatsApp / LinkedIn specific -->
    <meta property="og:image:alt" content="${title}">
    <meta name="thumbnail" content="${image}">
    
    <!-- Structured Data for Article -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": "${title.replace(/"/g, '\\"')}",
      "description": "${description.replace(/"/g, '\\"')}",
      "image": {
        "@type": "ImageObject",
        "url": "${image}",
        "width": 1200,
        "height": 630
      },
      "author": {
        "@type": "Person",
        "name": "${authorName.replace(/"/g, '\\"')}"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Vinca Wealth",
        "url": "https://vincawealth.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://vincawealth.com/images/vinca-logo.webp"
        },
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "183/8, Adjacent to Daddy's Elixir Appartment Singenagrahara, Huskur Post, Sarjapura, hobli, Phase II",
          "addressLocality": "Electronic City, Bengaluru",
          "addressRegion": "Karnataka",
          "postalCode": "560100",
          "addressCountry": "IN"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "telephone": "+91-7386809164",
          "email": "support@vincawealth.com"
        }
      },
      "datePublished": "${post.published_at || post.created_at}",
      "dateModified": "${post.updated_at || post.created_at}",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "${blogUrl}"
      },
      "articleSection": "${category.replace(/"/g, '\\"')}",
      "timeRequired": "${readTime.replace(/"/g, '\\"')}"
    }
    </script>
    
    <!-- Organization Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": ["FinancialService", "Organization"],
      "@id": "https://vincawealth.com/#organization",
      "name": "Vinca Wealth",
      "url": "https://vincawealth.com",
      "logo": {
        "@type": "ImageObject",
        "@id": "https://vincawealth.com/#logo",
        "url": "https://vincawealth.com/images/vinca-logo.webp",
        "contentUrl": "https://vincawealth.com/images/vinca-logo.webp",
        "caption": "Vinca Wealth",
        "inLanguage": "en-US",
        "width": "200",
        "height": "100"
      },
      "description": "Professional wealth management services specializing in mutual funds and goal-based investing",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "183/8, Adjacent to Daddy's Elixir Appartment Singenagrahara, Huskur Post, Sarjapura, hobli, Phase II",
        "addressLocality": "Electronic City, Bengaluru",
        "addressRegion": "Karnataka",
        "postalCode": "560100",
        "addressCountry": "IN"
      },
      "sameAs": [
        "https://www.facebook.com/vincawealth",
        "https://www.twitter.com/vincawealth",
        "https://www.linkedin.com/company/vincawealth"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "telephone": "+91-7386809164",
        "email": "support@vincawealth.com",
        "availableLanguage": "English"
      }
    }
    </script>
    `;

    // Simply inject meta tags at the very beginning of head (right after <head>)
    // Don't remove existing tags - let the first ones (ours) take precedence
    const modifiedHtml = html.replace('<head>', `<head>\n${metaTags}`);

    console.log(`[OG-Tags] Successfully injected OG tags for: ${post.title}`);
    console.log(`[OG-Tags] Image URL: ${image}`);
    console.log(`[OG-Tags] User-Agent: ${userAgent.substring(0, 50)}`);

    // If it's a crawler, inject full HTML content for SEO
    let finalHtml = modifiedHtml;
    if (isCrawlerRequest) {
      console.log(`[OG-Tags] Rendering full HTML for crawler`);
      const contentHtml = await renderBlogPostHtml(post);
      finalHtml = modifiedHtml.replace(
        '<div id="root"></div>',
        `<div id="root">${contentHtml}</div>`
      );
    }

    return new Response(finalHtml, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=3600, must-revalidate',
        'x-robots-tag': 'index, follow',
      },
    });
  } catch (error) {
    console.error('[OG-Tags] Error in OG tags edge function:', error);
    return;
  }
};

// Render full blog post HTML for crawlers
async function renderBlogPostHtml(post: any): Promise<string> {
  const contentHtml = await marked(post.content || '');
  const publishedDate = new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <article itemscope itemtype="https://schema.org/BlogPosting">
      <header>
        <nav aria-label="breadcrumb">
          <ol style="display: flex; list-style: none; padding: 0; margin: 0 0 20px 0; font-size: 14px;">
            <li><a href="/" style="color: #666;">Home</a></li>
            <li style="margin: 0 8px;">/</li>
            <li><a href="/blog" style="color: #666;">Blog</a></li>
            <li style="margin: 0 8px;">/</li>
            <li style="color: #333;">${post.title}</li>
          </ol>
        </nav>
        
        <h1 itemprop="headline" style="font-size: 2.5rem; font-weight: bold; margin: 20px 0; line-height: 1.2;">
          ${post.title}
        </h1>
        
        ${post.subtitle ? `<p style="font-size: 1.25rem; color: #666; margin: 15px 0;">${post.subtitle}</p>` : ''}
        
        <div style="display: flex; align-items: center; gap: 20px; margin: 20px 0; padding: 20px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee;">
          ${post.author_image ? `<img src="${post.author_image}" alt="${post.author?.name || post.author_name}" style="width: 50px; height: 50px; border-radius: 50%;" />` : ''}
          <div>
            <p itemprop="author" itemscope itemtype="https://schema.org/Person" style="margin: 0; font-weight: 600;">
              <span itemprop="name">${post.author?.name || post.author_name || 'Vinca Wealth'}</span>
            </p>
            ${post.author?.title || post.author_title ? `<p style="margin: 0; font-size: 14px; color: #666;">${post.author?.title || post.author_title}</p>` : ''}
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
              <time itemprop="datePublished" datetime="${post.published_at || post.created_at}">
                ${publishedDate}
              </time>
              ${post.read_time ? ` • ${post.read_time}` : ''}
            </p>
          </div>
        </div>
        
        ${post.featured_image ? `
          <img 
            itemprop="image" 
            src="${post.featured_image}" 
            alt="${post.title}" 
            style="width: 100%; height: auto; border-radius: 8px; margin: 30px 0;"
          />
        ` : ''}
      </header>
      
      <div itemprop="articleBody" style="line-height: 1.8; font-size: 1.1rem; max-width: 800px; margin: 0 auto;">
        ${contentHtml}
      </div>
      
      <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="margin: 0; color: #666;">Category: <span itemprop="articleSection">${post.category}</span></p>
      </footer>
    </article>
  `;
}

// Handle blog listing page for crawlers
async function handleBlogListing(request: Request, context: Context) {
  try {
    const supabaseUrl = 'https://xmmyjphoaqazwlifehxs.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtbXlqcGhvYXFhendsaWZlaHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MTY4NjMsImV4cCI6MjA2NDA5Mjg2M30.E7O_Q0Zcz0S-6ERl0JE-6SUth-lMLMbzTNGrdhDq_1k';

    console.log(`[OG-Tags] Fetching blog posts for listing page`);

    const response = await fetch(
      `${supabaseUrl}/rest/v1/blog_posts?select=id,title,slug,excerpt,featured_image,category,published_at,read_time&status=eq.published&order=published_at.desc&limit=50`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error(`[OG-Tags] Failed to fetch blog posts`);
      return;
    }

    const posts = await response.json();
    console.log(`[OG-Tags] Found ${posts?.length || 0} published posts`);

    const htmlResponse = await context.next();
    const html = await htmlResponse.text();

    const listingHtml = `
      <main>
        <header style="padding: 40px 20px; text-align: center; border-bottom: 2px solid #eee;">
          <h1 style="font-size: 3rem; font-weight: bold; margin: 0;">Vinca Wealth Blog</h1>
          <p style="font-size: 1.25rem; color: #666; margin: 20px 0 0 0;">Insights on wealth management, mutual funds, and financial planning</p>
        </header>
        
        <div style="max-width: 1200px; margin: 40px auto; padding: 0 20px;">
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 30px;">
            ${posts.map((post: any) => `
              <article itemscope itemtype="https://schema.org/BlogPosting" style="border: 1px solid #eee; border-radius: 8px; overflow: hidden; transition: box-shadow 0.3s;">
                ${post.featured_image ? `
                  <img itemprop="image" src="${post.featured_image}" alt="${post.title}" style="width: 100%; height: 200px; object-fit: cover;" />
                ` : ''}
                <div style="padding: 20px;">
                  <p style="margin: 0 0 10px 0; font-size: 14px; color: #666; text-transform: uppercase;">${post.category}</p>
                  <h2 itemprop="headline" style="margin: 0 0 15px 0; font-size: 1.5rem; font-weight: 600;">
                    <a href="/blog/${post.slug}" itemprop="url" style="color: #333; text-decoration: none;">
                      ${post.title}
                    </a>
                  </h2>
                  ${post.excerpt ? `<p itemprop="description" style="margin: 0 0 15px 0; color: #666; line-height: 1.6;">${post.excerpt}</p>` : ''}
                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 14px; color: #999;">
                    <time itemprop="datePublished" datetime="${post.published_at}">
                      ${new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </time>
                    ${post.read_time ? `<span>${post.read_time}</span>` : ''}
                  </div>
                </div>
              </article>
            `).join('')}
          </div>
        </div>
      </main>
    `;

    const modifiedHtml = html.replace(
      '<div id="root"></div>',
      `<div id="root">${listingHtml}</div>`
    );

    return new Response(modifiedHtml, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=3600, must-revalidate',
        'x-robots-tag': 'index, follow',
      },
    });
  } catch (error) {
    console.error('[OG-Tags] Error rendering blog listing:', error);
    return;
  }
}

export const config = {
  path: "/blog/*",
  // Ensure edge function runs for all user agents including social media crawlers
  excludedPath: ["/blog/cms", "/blog/cms/*"]
};
