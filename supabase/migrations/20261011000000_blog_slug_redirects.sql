-- Old blog URLs keep working after a slug change: the blog edge function
-- answers /blog/<old-slug> with a 301 redirect to the post's current slug.

CREATE TABLE IF NOT EXISTS public.blog_slug_redirects (
  old_slug text PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_slug_redirects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Blog slug redirects are public" ON public.blog_slug_redirects;
CREATE POLICY "Blog slug redirects are public"
  ON public.blog_slug_redirects FOR SELECT
  USING (true);

-- Record the previous slug whenever a post's slug changes
CREATE OR REPLACE FUNCTION public.record_blog_slug_redirect()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.slug IS DISTINCT FROM OLD.slug AND OLD.slug IS NOT NULL AND OLD.slug <> '' THEN
    INSERT INTO public.blog_slug_redirects (old_slug, post_id)
    VALUES (OLD.slug, NEW.id)
    ON CONFLICT (old_slug) DO UPDATE SET post_id = EXCLUDED.post_id, created_at = now();

    -- A slug that is live again must not redirect anywhere
    DELETE FROM public.blog_slug_redirects WHERE old_slug = NEW.slug;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS blog_posts_record_slug_redirect ON public.blog_posts;
CREATE TRIGGER blog_posts_record_slug_redirect
  AFTER UPDATE OF slug ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.record_blog_slug_redirect();
