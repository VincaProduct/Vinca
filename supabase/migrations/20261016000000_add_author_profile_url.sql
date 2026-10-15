-- Author profile link (e.g. LinkedIn): linked from the author's name on articles
-- and used as the author's "url" in the BlogPosting structured data.
ALTER TABLE public.authors ADD COLUMN IF NOT EXISTS profile_url text;
