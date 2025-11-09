import type { Context } from "https://edge.netlify.com";

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);

  // Only process blog post URLs
  if (!url.pathname.startsWith('/blog/') || url.pathname === '/blog' || url.pathname === '/blog/') {
    return;
  }

  // Extract slug from URL
  const slug = url.pathname.replace('/blog/', '');

  try {
    // Fetch blog post data from Supabase (using hardcoded values since they're public)
    const supabaseUrl = 'https://xmmyjphoaqazwlifehxs.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtbXlqcGhvYXFhendsaWZlaHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MTY4NjMsImV4cCI6MjA2NDA5Mjg2M30.E7O_Q0Zcz0S-6ERl0JE-6SUth-lMLMbzTNGrdhDq_1k';

    console.log(`Fetching blog post with slug: ${slug}`);

    const response = await fetch(
      `${supabaseUrl}/rest/v1/blog_posts?select=*,author:authors(name,title,image)&slug=eq.${slug}`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch blog post: ${response.status} ${response.statusText}`);
      return;
    }

    const posts = await response.json();
    console.log(`Found ${posts?.length || 0} posts for slug: ${slug}`);

    if (!posts || posts.length === 0) {
      console.log('No blog post found, skipping OG tag injection');
      return;
    }

    const post = posts[0];
    console.log(`Processing blog post: ${post.title}`);

    // Fetch the original HTML
    const htmlResponse = await context.next();
    const html = await htmlResponse.text();

    // Prepare meta tag values
    const title = post.title || 'Vinca Wealth Blog';
    const description = post.excerpt || post.subtitle || 'Read the latest insights on wealth management from Vinca Wealth';
    const image = post.featured_image || 'https://vincawealth.com/og-image.png';
    const blogUrl = `https://vincawealth.com/blog/${post.slug}`;
    const authorName = post.author?.name || post.author_name || 'Vinca Wealth';

    // Create meta tags
    const metaTags = `
    <!-- Dynamic Blog Post Meta Tags -->
    <title>${title} | Vinca Wealth Blog</title>
    <meta name="description" content="${description}">
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
    <meta property="og:site_name" content="Vinca Wealth">
    <meta property="article:published_time" content="${post.published_at || post.created_at}">
    <meta property="article:author" content="${authorName}">
    <meta property="article:section" content="${post.category}">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${blogUrl}">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${image}">
    <meta name="twitter:image:alt" content="${title}">
    <meta name="twitter:site" content="@vincawealth">
    <meta name="twitter:creator" content="@vincawealth">
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "${title}",
      "description": "${description}",
      "image": "${image}",
      "author": {
        "@type": "Person",
        "name": "${authorName}"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Vinca Wealth",
        "logo": {
          "@type": "ImageObject",
          "url": "https://vincawealth.com/logo.png"
        }
      },
      "datePublished": "${post.published_at || post.created_at}",
      "dateModified": "${post.updated_at}",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "${blogUrl}"
      }
    }
    </script>
    `;

    // Inject meta tags into HTML (replace the closing </head> tag)
    const modifiedHtml = html.replace('</head>', `${metaTags}\n</head>`);

    return new Response(modifiedHtml, {
      headers: {
        'content-type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error in OG tags edge function:', error);
    return;
  }
};

export const config = { path: "/blog/*" };
