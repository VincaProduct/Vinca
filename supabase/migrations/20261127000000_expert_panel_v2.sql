-- Expert Panel, round 2. Safe to run more than once.
--
-- 1. Fairer view counts: one view per reader per article per day; the writer's
--    own visits and admins' visits don't count; the old open counter stops.
-- 2. Clean article addresses: a panel article published with a temporary
--    "-x9k2" ending gets the clean address from its final title (if free).
--    Already-published ones are cleaned now; their old address redirects.
-- 3. list_featured_experts(): verified experts with published articles for the
--    public Expert Panel page, most-read in the last 30 days first.

-- ── 1. Views ─────────────────────────────────────────────────────────────────

-- Who has been counted today (an anonymous random id per browser, nothing personal)
create table if not exists public.blog_post_view_readers (
  post_id uuid not null references public.blog_posts (id) on delete cascade,
  day date not null default current_date,
  reader text not null,
  primary key (post_id, day, reader)
);

alter table public.blog_post_view_readers enable row level security;
-- No policies: only the function below writes it, nobody reads it directly

create or replace function public.record_blog_post_view(_post_id uuid, _reader text)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  post_writer uuid;
  added integer;
begin
  if _reader is null or _reader !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return;
  end if;

  select p.submitted_by into post_writer
  from public.blog_posts p
  where p.id = _post_id and p.status = 'published';
  if not found then
    return;
  end if;

  -- The writer reading their own article, or the team reviewing it
  if auth.uid() is not null and (
    auth.uid() = post_writer
    or public.has_role(auth.uid(), 'super_admin'::app_role)
    or public.has_role(auth.uid(), 'admin'::app_role)
  ) then
    return;
  end if;

  insert into public.blog_post_view_readers (post_id, day, reader)
  values (_post_id, current_date, _reader)
  on conflict do nothing;
  get diagnostics added = row_count;
  if added = 0 then
    return; -- this reader was already counted today
  end if;

  insert into public.blog_post_views (post_id, day, views)
  values (_post_id, current_date, 1)
  on conflict (post_id, day) do update set views = public.blog_post_views.views + 1;
end;
$$;

revoke all on function public.record_blog_post_view(uuid, text) from public;
grant execute on function public.record_blog_post_view(uuid, text) to anon, authenticated;

-- The old one-argument counter (every call counted) now does nothing
create or replace function public.record_blog_post_view(_post_id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  return;
end;
$$;

-- Reader ids are only needed for "today"; keep two days, clear the rest nightly
select cron.schedule(
  'cleanup-blog-view-readers',
  '20 3 * * *',
  $$delete from public.blog_post_view_readers where day < current_date - 2$$
);

-- ── 2. Clean addresses ───────────────────────────────────────────────────────

create or replace function public.clean_article_slug(_title text)
returns text
language sql
immutable
as $$
  select trim(both '-' from left(trim(both '-' from regexp_replace(lower(coalesce(_title, '')), '[^a-z0-9]+', '-', 'g')), 80))
$$;

create or replace function public.clean_panel_slug_on_publish()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  clean text;
begin
  if new.status = 'published'
     and (tg_op = 'INSERT' or old.status is distinct from 'published')
     and new.submitted_by is not null
     and new.slug ~ '-[a-z0-9]{4}$' then
    clean := public.clean_article_slug(new.title);
    if char_length(clean) >= 3
       and clean <> new.slug
       and not exists (select 1 from public.blog_posts p where p.slug = clean and p.id <> new.id)
       and not exists (select 1 from public.blog_slug_redirects r where r.old_slug = clean and r.post_id <> new.id) then
      new.slug := clean;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists blog_posts_clean_panel_slug on public.blog_posts;
create trigger blog_posts_clean_panel_slug
  before insert or update of status on public.blog_posts
  for each row
  execute function public.clean_panel_slug_on_publish();

-- Panel articles already published with the temporary ending (e.g. the gold
-- article "...-po31"). The existing redirect trigger keeps the old address working.
do $$
declare
  r record;
  clean text;
begin
  for r in
    select id, title, slug from public.blog_posts
    where status = 'published' and submitted_by is not null and slug ~ '-[a-z0-9]{4}$'
  loop
    clean := public.clean_article_slug(r.title);
    if char_length(clean) >= 3
       and clean <> r.slug
       and not exists (select 1 from public.blog_posts p where p.slug = clean and p.id <> r.id)
       and not exists (select 1 from public.blog_slug_redirects x where x.old_slug = clean and x.post_id <> r.id) then
      update public.blog_posts set slug = clean where id = r.id;
    end if;
  end loop;
end;
$$;

-- ── 3. Verified experts for the public page ──────────────────────────────────

create or replace function public.list_featured_experts(_limit integer default 5)
returns table (
  handle text,
  name text,
  title text,
  image text,
  articles_published integer,
  top_article_title text,
  top_article_slug text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    a.handle,
    a.name,
    a.title,
    a.image,
    (select count(*) from public.blog_posts p where p.author_id = a.id and p.status = 'published')::integer,
    top.title,
    top.slug
  from public.authors a
  join public.expert_panel_members m on m.author_id = a.id and m.status = 'active'
  left join lateral (
    select p.title, p.slug
    from public.blog_posts p
    where p.author_id = a.id and p.status = 'published'
    order by coalesce((select sum(v.views) from public.blog_post_views v where v.post_id = p.id), 0) desc,
             p.published_at desc
    limit 1
  ) top on true
  where a.handle is not null
    and top.slug is not null
  order by
    coalesce((
      select sum(v.views) from public.blog_post_views v
      join public.blog_posts p on p.id = v.post_id
      where p.author_id = a.id and p.status = 'published' and v.day > current_date - 30
    ), 0) desc,
    m.approved_at asc
  limit least(greatest(coalesce(_limit, 5), 1), 12)
$$;

revoke all on function public.list_featured_experts(integer) from public;
grant execute on function public.list_featured_experts(integer) to anon, authenticated;
