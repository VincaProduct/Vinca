-- Raise board: clients post what is blocking their financial progress and
-- vote on each other's posts. New posts are shown to everyone once a super
-- admin approves them; the person who posted sees their own straight away.

create table if not exists public.raise_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 3 and 500),
  user_id uuid references auth.users (id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  -- Votes the early posts received before the board saved votes; real votes add to it
  base_votes integer not null default 0,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users (id) on delete set null
);

create index if not exists raise_posts_status_created on public.raise_posts (status, created_at desc);
create index if not exists raise_posts_user on public.raise_posts (user_id);

create table if not exists public.raise_votes (
  post_id uuid not null references public.raise_posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.raise_posts enable row level security;
alter table public.raise_votes enable row level security;

-- Posts: approved ones are public to signed-in clients; your own are always
-- visible to you; super admins see and review everything
drop policy if exists "Read approved or own raise posts" on public.raise_posts;
create policy "Read approved or own raise posts" on public.raise_posts for select to authenticated
  using (status = 'approved' or user_id = auth.uid() or public.has_role(auth.uid(), 'super_admin'::app_role));

drop policy if exists "Clients post raises for review" on public.raise_posts;
create policy "Clients post raises for review" on public.raise_posts for insert to authenticated
  with check (user_id = auth.uid() and status = 'pending' and base_votes = 0);

drop policy if exists "Super admins review raise posts" on public.raise_posts;
create policy "Super admins review raise posts" on public.raise_posts for update to authenticated
  using (public.has_role(auth.uid(), 'super_admin'::app_role))
  with check (public.has_role(auth.uid(), 'super_admin'::app_role));

drop policy if exists "Super admins delete raise posts" on public.raise_posts;
create policy "Super admins delete raise posts" on public.raise_posts for delete to authenticated
  using (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Votes: each person manages only their own vote, on approved posts.
-- Totals are read through get_raise_board(), so who voted stays private.
drop policy if exists "Read own raise votes" on public.raise_votes;
create policy "Read own raise votes" on public.raise_votes for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Vote on approved raises" on public.raise_votes;
create policy "Vote on approved raises" on public.raise_votes for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.raise_posts p where p.id = post_id and p.status = 'approved')
  );

drop policy if exists "Change own raise vote" on public.raise_votes;
create policy "Change own raise vote" on public.raise_votes for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Remove own raise vote" on public.raise_votes;
create policy "Remove own raise vote" on public.raise_votes for delete to authenticated
  using (user_id = auth.uid());

-- The board as the signed-in person sees it, with vote totals and their own vote
create or replace function public.get_raise_board()
returns table (
  id uuid,
  title text,
  status text,
  created_at timestamptz,
  score integer,
  my_vote smallint,
  is_mine boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.title,
    p.status,
    p.created_at,
    (p.base_votes + coalesce((select sum(v.value) from public.raise_votes v where v.post_id = p.id), 0))::integer as score,
    (select v.value from public.raise_votes v where v.post_id = p.id and v.user_id = auth.uid()) as my_vote,
    (p.user_id is not null and p.user_id = auth.uid()) as is_mine
  from public.raise_posts p
  where auth.uid() is not null
    and (p.status = 'approved' or p.user_id = auth.uid() or public.has_role(auth.uid(), 'super_admin'::app_role))
$$;

revoke all on function public.get_raise_board() from public, anon;
grant execute on function public.get_raise_board() to authenticated;

-- The blockers clients shared before the board was saved, with their votes so far
insert into public.raise_posts (title, status, base_votes, created_at)
select v.title, 'approved', v.base_votes, v.created_at::timestamptz
from (values
  ('I don''t know how much corpus I actually need to retire.', 18, '2026-04-10T10:00:00Z'),
  ('My SIPs are running but I have no idea if I''m on track.', 15, '2026-04-18T10:00:00Z'),
  ('I keep postponing setting up term insurance.', 12, '2026-03-22T10:00:00Z'),
  ('I don''t know whether to invest a lump sum or do SIP right now.', 11, '2026-05-01T10:00:00Z'),
  ('My family doesn''t understand my early retirement goal.', 9, '2026-04-05T10:00:00Z'),
  ('I have money sitting in savings account but don''t know where to move it.', 8, '2026-05-15T10:00:00Z')
) as v (title, base_votes, created_at)
where not exists (select 1 from public.raise_posts p where p.title = v.title);
