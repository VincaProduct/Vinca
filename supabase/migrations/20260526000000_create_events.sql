-- Events table for public webinars/sessions
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date timestamptz not null,
  duration_minutes int not null default 60,
  description text,
  host_name text,
  zoho_meeting_link text,
  is_published boolean not null default false,
  created_at timestamptz default now()
);

-- Registrations (one per user per event)
create table if not exists event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  registered_at timestamptz default now(),
  unique(event_id, user_id)
);

-- RLS
alter table events enable row level security;
alter table event_registrations enable row level security;

-- Anyone can read published events
create policy "Public can read published events"
  on events for select
  using (is_published = true);

-- Users can read their own registrations
create policy "Users can read own registrations"
  on event_registrations for select
  using (auth.uid() = user_id);

-- Users can register
create policy "Users can register"
  on event_registrations for insert
  with check (auth.uid() = user_id);

-- Seed: Desai's June 4 webinar (update zoho_meeting_link when you have it)
insert into events (title, event_date, duration_minutes, host_name, description, zoho_meeting_link, is_published)
values (
  'How to Retire Early — A Live Session with Desai Manjunath',
  '2026-06-04 12:30:00+05:30',
  60,
  'Desai Manjunath',
  'Join Desai Manjunath — Director, Vinca Wealth — for a free live session on building the financial foundation for early retirement.

We''ll cover:
• How to calculate your retirement corpus
• Common mistakes that delay financial freedom
• How mutual funds fit into your retirement plan
• Live Q&A

This session is free and open to all.',
  null,
  true
);
