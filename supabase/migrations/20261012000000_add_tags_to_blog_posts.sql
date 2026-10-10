-- Comma-separated tags entered in the blog CMS, used for SEO keywords
-- (BlogPosting schema, article:tag meta), CTA targeting and shown on the post.
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';