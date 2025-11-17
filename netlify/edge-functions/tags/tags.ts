import type { Context } from "https://edge.netlify.com";

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';

  // Log all requests for debugging
  console.log(`[OG-Tags] Request to: ${url.pathname} from: ${userAgent.substring(0, 100)}`);

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
        "logo": {
          "@type": "ImageObject",
          "url": "https://vincawealth.com/images/vinca-logo.webp"
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
    `;

    // Simply inject meta tags at the very beginning of head (right after <head>)
    // Don't remove existing tags - let the first ones (ours) take precedence
    const modifiedHtml = html.replace('<head>', `<head>\n${metaTags}`);

    console.log(`[OG-Tags] Successfully injected OG tags for: ${post.title}`);
    console.log(`[OG-Tags] Image URL: ${image}`);
    console.log(`[OG-Tags] User-Agent: ${userAgent.substring(0, 50)}`);

    return new Response(modifiedHtml, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=0, must-revalidate',
        'x-robots-tag': 'index, follow',
      },
    });
  } catch (error) {
    console.error('[OG-Tags] Error in OG tags edge function:', error);
    return;
  }
};

export const config = {
  path: "/blog/*",
  // Ensure edge function runs for all user agents including social media crawlers
  excludedPath: ["/blog/cms", "/blog/cms/*"]
};
