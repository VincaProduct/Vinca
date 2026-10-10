-- Blog CMS phase 2: SEO fields, key takeaways and FAQs. Only adds columns and
-- a table; existing posts keep working (new columns are empty by default).

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS meta_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS focus_keyword text,
  ADD COLUMN IF NOT EXISTS key_takeaways text[] NOT NULL DEFAULT '{}',
  -- [{ "question": "...", "answer": "..." }]
  ADD COLUMN IF NOT EXISTS faqs jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS hide_global_faqs boolean NOT NULL DEFAULT false;

-- Company FAQs shown at the end of every post (unless the post hides them)
CREATE TABLE IF NOT EXISTS public.global_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.global_faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Global FAQs are public" ON public.global_faqs;
CREATE POLICY "Global FAQs are public"
  ON public.global_faqs FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Super admins manage global FAQs" ON public.global_faqs;
CREATE POLICY "Super admins manage global FAQs"
  ON public.global_faqs FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
