-- Create elevate_leads table for eligibility check submissions
create table if not exists public.elevate_leads (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text not null,
  email text not null,
  income_range text,
  investment_habit text,
  financial_goal text,
  ffr_score numeric,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.elevate_leads enable row level security;

-- Allow anyone to insert (no auth required for lead capture)
create policy "Anyone can submit an elevate lead"
  on public.elevate_leads
  for insert
  with check (true);

-- Only service role can read leads (admin access via Supabase dashboard)
create policy "Service role can read leads"
  on public.elevate_leads
  for select
  using (auth.role() = 'service_role');
