-- Expert Panel, phase 1: writers.
--
-- People apply from /dashboard/expert-panel. A super admin reviews each
-- application; approving it makes the person a panel Member and gives them an
-- author profile. Members write articles in their dashboard and submit them
-- for review. Only super admins publish (through the Blog CMS, as today).
--
-- Additive only: two new tables, one view-count table, two new columns on
-- blog_posts, and new policies. Nothing existing is dropped or renamed.

-- ── Applications ─────────────────────────────────────────────────────────────

create table if not exists public.expert_panel_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  full_name text not null check (char_length(btrim(full_name)) between 2 and 120),
  email text not null,
  linkedin_url text,
  occupation text not null check (char_length(btrim(occupation)) between 2 and 200),
  topics text not null check (char_length(btrim(topics)) between 3 and 1000),
  sample_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  review_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users (id) on delete set null
);

-- One open application per person at a time
create unique index if not exists expert_panel_applications_one_pending
  on public.expert_panel_applications (user_id) where status = 'pending';
create index if not exists expert_panel_applications_status_created
  on public.expert_panel_applications (status, created_at desc);

-- ── Members ──────────────────────────────────────────────────────────────────

create table if not exists public.expert_panel_members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  author_id uuid references public.authors (id) on delete set null,
  -- Phase 1 only uses 'member'; 'associate' and 'senior' come later
  level text not null default 'member' check (level in ('member', 'associate', 'senior')),
  status text not null default 'active' check (status in ('active', 'paused')),
  approved_by uuid references auth.users (id) on delete set null,
  approved_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Is this person an active panel member? (used by the policies below)
create or replace function public.is_panel_member(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.expert_panel_members m
    where m.user_id = _user_id and m.status = 'active'
  )
$$;

-- The author profile that belongs to this panel member
create or replace function public.panel_author_id(_user_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select m.author_id from public.expert_panel_members m
  where m.user_id = _user_id and m.status = 'active'
$$;

revoke all on function public.is_panel_member(uuid) from public, anon;
revoke all on function public.panel_author_id(uuid) from public, anon;
grant execute on function public.is_panel_member(uuid) to authenticated;
grant execute on function public.panel_author_id(uuid) to authenticated;

alter table public.expert_panel_applications enable row level security;
alter table public.expert_panel_members enable row level security;

-- Applications: you send and see your own; super admins see and review all
drop policy if exists "Send own panel application" on public.expert_panel_applications;
create policy "Send own panel application" on public.expert_panel_applications for insert to authenticated
  with check (
    user_id = auth.uid()
    and status = 'pending'
    and reviewed_at is null
    and reviewed_by is null
    and review_note is null
    and not public.is_panel_member(auth.uid())
  );

drop policy if exists "Read own or all panel applications" on public.expert_panel_applications;
create policy "Read own or all panel applications" on public.expert_panel_applications for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'super_admin'::app_role));

drop policy if exists "Super admins review panel applications" on public.expert_panel_applications;
create policy "Super admins review panel applications" on public.expert_panel_applications for update to authenticated
  using (public.has_role(auth.uid(), 'super_admin'::app_role))
  with check (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Members: you see your own membership; only super admins change memberships
drop policy if exists "Read own or all panel members" on public.expert_panel_members;
create policy "Read own or all panel members" on public.expert_panel_members for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'super_admin'::app_role));

drop policy if exists "Super admins manage panel members" on public.expert_panel_members;
create policy "Super admins manage panel members" on public.expert_panel_members for all to authenticated
  using (public.has_role(auth.uid(), 'super_admin'::app_role))
  with check (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Approve an application: creates the author profile and the membership in one step
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
    insert into public.authors (name, title, profile_url)
    values (btrim(app.full_name), btrim(app.occupation), nullif(btrim(coalesce(app.linkedin_url, '')), ''))
    returning id into new_author_id;
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

-- Members keep their own author profile up to date (bio, photo, title, LinkedIn)
drop policy if exists "Panel members update own author profile" on public.authors;
create policy "Panel members update own author profile" on public.authors for update to authenticated
  using (id = public.panel_author_id(auth.uid()))
  with check (id = public.panel_author_id(auth.uid()));

-- ── Articles written by members ──────────────────────────────────────────────

-- Who wrote the post in their dashboard, and when they sent it for review
alter table public.blog_posts add column if not exists submitted_by uuid references auth.users (id) on delete set null;
alter table public.blog_posts add column if not exists submitted_at timestamptz;
create index if not exists blog_posts_submitted_by on public.blog_posts (submitted_by);

-- Members see their own posts (any status)
drop policy if exists "Panel members read own posts" on public.blog_posts;
create policy "Panel members read own posts" on public.blog_posts for select to authenticated
  using (submitted_by = auth.uid());

-- Members create drafts under their own author profile; they never publish
drop policy if exists "Panel members create draft posts" on public.blog_posts;
create policy "Panel members create draft posts" on public.blog_posts for insert to authenticated
  with check (
    public.is_panel_member(auth.uid())
    and submitted_by = auth.uid()
    and status = 'draft'
    and published_at is null
    and author_id = public.panel_author_id(auth.uid())
  );

-- Members edit their own drafts until a super admin publishes them
drop policy if exists "Panel members edit own drafts" on public.blog_posts;
create policy "Panel members edit own drafts" on public.blog_posts for update to authenticated
  using (public.is_panel_member(auth.uid()) and submitted_by = auth.uid() and status = 'draft')
  with check (
    submitted_by = auth.uid()
    and status = 'draft'
    and published_at is null
    and author_id = public.panel_author_id(auth.uid())
  );

-- Members delete their own drafts (never published posts)
drop policy if exists "Panel members delete own drafts" on public.blog_posts;
create policy "Panel members delete own drafts" on public.blog_posts for delete to authenticated
  using (submitted_by = auth.uid() and status = 'draft');

-- ── Article views (the "proof of your work" stats) ───────────────────────────

create table if not exists public.blog_post_views (
  post_id uuid not null references public.blog_posts (id) on delete cascade,
  day date not null default current_date,
  views integer not null default 0,
  primary key (post_id, day)
);

alter table public.blog_post_views enable row level security;
-- No direct access: views are added by record_blog_post_view() and read by
-- get_my_article_stats(); super admins can read the table
drop policy if exists "Super admins read post views" on public.blog_post_views;
create policy "Super admins read post views" on public.blog_post_views for select to authenticated
  using (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Count one view of a published post (the page calls this once per visit)
create or replace function public.record_blog_post_view(_post_id uuid)
returns void
language sql
volatile
security definer
set search_path = public
as $$
  insert into public.blog_post_views (post_id, day, views)
  select p.id, current_date, 1
  from public.blog_posts p
  where p.id = _post_id and p.status = 'published'
  on conflict (post_id, day) do update set views = public.blog_post_views.views + 1
$$;

revoke all on function public.record_blog_post_view(uuid) from public;
grant execute on function public.record_blog_post_view(uuid) to anon, authenticated;

-- A member's own articles with their status and views
create or replace function public.get_my_article_stats()
returns table (
  id uuid,
  title text,
  slug text,
  status text,
  submitted_at timestamptz,
  published_at timestamptz,
  updated_at timestamptz,
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
    coalesce((select sum(v.views) from public.blog_post_views v where v.post_id = p.id), 0)::integer,
    coalesce((select sum(v.views) from public.blog_post_views v
              where v.post_id = p.id and v.day > current_date - 30), 0)::integer
  from public.blog_posts p
  where auth.uid() is not null and p.submitted_by = auth.uid()
  order by p.updated_at desc
$$;

revoke all on function public.get_my_article_stats() from public, anon;
grant execute on function public.get_my_article_stats() to authenticated;
