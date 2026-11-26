-- Expert Panel review: super admins can send an article back to its writer
-- with feedback. Sending back clears submitted_at (so it is a draft again) and
-- stores the note; the writer sees "Changes requested" and the note, edits,
-- and sends it for review again (which clears the note).
--
-- Super admins already update any post; members already update their own drafts.

alter table public.blog_posts add column if not exists review_note text;
alter table public.blog_posts add column if not exists changes_requested_at timestamptz;

-- My Articles also shows the feedback (the return type changes, so recreate)
drop function if exists public.get_my_article_stats();
create function public.get_my_article_stats()
returns table (
  id uuid,
  title text,
  slug text,
  status text,
  submitted_at timestamptz,
  published_at timestamptz,
  updated_at timestamptz,
  review_note text,
  changes_requested_at timestamptz,
  total_views integer,
  views_30d integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.title,
    p.slug,
    p.status,
    p.submitted_at,
    p.published_at,
    p.updated_at,
    p.review_note,
    p.changes_requested_at,
    coalesce((select sum(v.views) from public.blog_post_views v where v.post_id = p.id), 0)::integer,
    coalesce((select sum(v.views) from public.blog_post_views v
              where v.post_id = p.id and v.day > current_date - 30), 0)::integer
  from public.blog_posts p
  where auth.uid() is not null and p.submitted_by = auth.uid()
  order by p.updated_at desc
$$;

revoke all on function public.get_my_article_stats() from public, anon;
grant execute on function public.get_my_article_stats() to authenticated;
