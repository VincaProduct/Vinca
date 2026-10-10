-- Inspirational quote shown at the top of a blog post
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS quote text;
