-- Expert Panel public profiles (vincawealth.com/experts/<handle>) and tighter
-- image uploads.
--
-- 1. authors gets a public handle and portfolio fields (expertise, credentials,
--    location). Members edit their own author row (policy from 20261126000000).
-- 2. Approving an application now also gives the new author a unique handle.
-- 3. get_expert_profile(handle) returns a member's public profile with their
--    published-article count and total reads; list_expert_handles() feeds the sitemap.
-- 4. Blog image uploads: only super admins and active panel members (was: any
--    signed-in user).

-- ── 1. Portfolio fields ──────────────────────────────────────────────────────

alter table public.authors add column if not exists handle text;
alter table public.authors add column if not exists expertise text[] not null default '{}';
alter table public.authors add column if not exists credentials text;
alter table public.authors add column if not exists location text;

alter table public.authors drop constraint if exists authors_handle_format;
alter table public.authors add constraint authors_handle_format
  check (handle is null or (handle ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(handle) between 3 and 40));

create unique index if not exists authors_handle_unique on public.authors (handle) where handle is not null;

-- A free handle made from a name: "Priya Sharma" -> priya-sharma (or priya-sharma-2, ...)
create or replace function public.make_author_handle(_name text)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  base text;
  candidate text;
  n integer := 1;
begin
  base := trim(both '-' from regexp_replace(lower(coalesce(_name, '')), '[^a-z0-9]+', '-', 'g'));
  base := left(base, 34);
  base := trim(both '-' from base);
  if char_length(base) < 3 then
    base := 'expert';
  end if;
  candidate := base;
  while exists (select 1 from public.authors a where a.handle = candidate) loop
    n := n + 1;
    candidate := base || '-' || n;
  end loop;
  return candidate;
end;
$$;

revoke all on function public.make_author_handle(text) from public, anon;

-- ── 2. Approving now also sets the handle ────────────────────────────────────

create or replace function public.approve_expert_panel_application(_application_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  app public.expert_panel_applications%rowtype;
  new_author_id uuid;
begin
  if not public.has_role(auth.uid(), 'super_admin'::app_role) then
    raise exception 'Only super admins can approve panel applications';
  end if;

  select * into app from public.expert_panel_applications where id = _application_id for update;
  if not found then
    raise exception 'Application not found';
  end if;
  if app.status <> 'pending' then
    raise exception 'This application has already been reviewed';
  end if;

  -- Re-use the author profile if this person was a member before
  select m.author_id into new_author_id from public.expert_panel_members m where m.user_id = app.user_id;
  if new_author_id is null then
    insert into public.authors (name, title, profile_url, handle)
    values (
      btrim(app.full_name),
      btrim(app.occupation),
      nullif(btrim(coalesce(app.linkedin_url, '')), ''),
      public.make_author_handle(app.full_name)
    )
    returning id into new_author_id;
  else
    update public.authors set handle = public.make_author_handle(name)
      where id = new_author_id and handle is null;
  end if;

  insert into public.expert_panel_members (user_id, author_id, level, status, approved_by, approved_at)
  values (app.user_id, new_author_id, 'member', 'active', auth.uid(), now())
  on conflict (user_id) do update
    set status = 'active', author_id = excluded.author_id, approved_by = excluded.approved_by, approved_at = now();

  update public.expert_panel_applications
    set status = 'approved', reviewed_at = now(), reviewed_by = auth.uid()
    where id = _application_id;

  return new_author_id;
end;
$$;

revoke all on function public.approve_expert_panel_application(uuid) from public, anon;
grant execute on function public.approve_expert_panel_application(uuid) to authenticated;

-- Give existing panel members a handle (none expected yet)
update public.authors a set handle = public.make_author_handle(a.name)
where a.handle is null and exists (
  select 1 from public.expert_panel_members m where m.author_id = a.id and m.status = 'active'
);

-- ── 3. Public profile ────────────────────────────────────────────────────────

create or replace function public.get_expert_profile(_handle text)
returns table (
  author_id uuid,
  handle text,
  name text,
  title text,
  bio text,
  image text,
  profile_url text,
  expertise text[],
  credentials text,
  location text,
  level text,
  member_since timestamptz,
  articles_published integer,
  total_reads integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    a.id,
    a.handle,
    a.name,
    a.title,
    a.bio,
    a.image,
    a.profile_url,
    a.expertise,
    a.credentials,
    a.location,
    m.level,
    m.approved_at,
    (select count(*) from public.blog_posts p where p.author_id = a.id and p.status = 'published')::integer,
    coalesce((
      select sum(v.views) from public.blog_post_views v
      join public.blog_posts p on p.id = v.post_id
      where p.author_id = a.id and p.status = 'published'
    ), 0)::integer
  from public.authors a
  join public.expert_panel_members m on m.author_id = a.id and m.status = 'active'
  where a.handle = lower(_handle)
  limit 1
$$;

revoke all on function public.get_expert_profile(text) from public;
grant execute on function public.get_expert_profile(text) to anon, authenticated;

-- Handles of active members, for the sitemap
create or replace function public.list_expert_handles()
returns table (handle text, updated_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select a.handle, a.updated_at
  from public.authors a
  join public.expert_panel_members m on m.author_id = a.id and m.status = 'active'
  where a.handle is not null
$$;

revoke all on function public.list_expert_handles() from public;
grant execute on function public.list_expert_handles() to anon, authenticated;

-- ── 4. Image uploads: super admins and panel members only ────────────────────

drop policy if exists "Authenticated users can upload blog images" on storage.objects;
drop policy if exists "Admins and panel members upload blog images" on storage.objects;
create policy "Admins and panel members upload blog images" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'blog-images'
    and (public.has_role(auth.uid(), 'super_admin'::app_role) or public.is_panel_member(auth.uid()))
  );
