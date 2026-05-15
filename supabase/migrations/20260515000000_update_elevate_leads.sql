-- Drop old elevate_leads (had redundant name/phone/email NOT NULL)
drop table if exists public.elevate_leads;

-- Lean version: user_id links to profiles for all identity data
create table public.elevate_leads (
  id                uuid        default gen_random_uuid() primary key,
  user_id           uuid        references public.profiles(id) on delete set null,
  investable_amount text        not null,
  concern           text,
  focus             text,
  eligible          boolean     not null,
  ffr_score         numeric,
  created_at        timestamptz default now() not null
);

alter table public.elevate_leads enable row level security;

create policy "Users can insert their own lead"
  on public.elevate_leads for insert
  with check (auth.uid() = user_id);

create policy "Service role can read all leads"
  on public.elevate_leads for select
  using (auth.role() = 'service_role');
