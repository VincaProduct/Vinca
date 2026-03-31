-- Create insurance_complaints table for claim support submissions
create table if not exists public.insurance_complaints (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text not null,
  insurer text not null,
  policy_type text not null,
  issue_type text not null,
  policy_number text,
  description text not null,
  status text not null default 'Registered',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.insurance_complaints enable row level security;

-- Allow anyone to insert (no auth required for complaint submission)
create policy "Anyone can submit an insurance complaint"
  on public.insurance_complaints
  for insert
  with check (true);

-- Only service role can read complaints (admin access via Supabase dashboard)
create policy "Service role can read complaints"
  on public.insurance_complaints
  for select
  using (auth.role() = 'service_role');

-- Auto-update updated_at on row change
create or replace function public.update_insurance_complaints_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger insurance_complaints_updated_at
  before update on public.insurance_complaints
  for each row execute function public.update_insurance_complaints_updated_at();
