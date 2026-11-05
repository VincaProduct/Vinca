-- Real Worth Calculator: the rates it uses (editable in Admin Tools → Real
-- Worth rates) and snapshots signed-in clients save to their plan.

create table if not exists public.real_worth_rates (
  asset_key text primary key check (asset_key in ('savings', 'fd', 'debt', 'gold', 'equity')),
  label text not null,
  typical_rate numeric(5,2) not null check (typical_rate between 0 and 20),
  -- Weak years: gold and equity only
  weak_rate numeric(5,2) check (weak_rate is null or (weak_rate between 0 and 20 and weak_rate <= typical_rate)),
  fact_line text not null,
  source_note text not null,
  sort_order smallint not null,
  updated_at timestamptz not null default now()
);

-- One row of global settings
create table if not exists public.real_worth_settings (
  id smallint primary key default 1 check (id = 1),
  inflation_default numeric(4,2) not null default 7,
  inflation_min numeric(4,2) not null default 4,
  inflation_max numeric(4,2) not null default 10,
  as_of_date text not null default 'November 2026',
  version integer not null default 1,
  updated_at timestamptz not null default now(),
  check (inflation_min <= inflation_default and inflation_default <= inflation_max)
);

create table if not exists public.real_worth_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  age smallint not null,
  retire_age smallint not null,
  saved_today numeric(14,2) not null,
  monthly numeric(12,2) not null,
  inflation numeric(4,2) not null,
  rates_version integer not null,
  created_at timestamptz not null default now()
);

create index if not exists real_worth_snapshots_user on public.real_worth_snapshots (user_id, created_at desc);

alter table public.real_worth_rates enable row level security;
alter table public.real_worth_settings enable row level security;
alter table public.real_worth_snapshots enable row level security;

drop policy if exists "Anyone can read real worth rates" on public.real_worth_rates;
create policy "Anyone can read real worth rates" on public.real_worth_rates for select using (true);
drop policy if exists "Super admins manage real worth rates" on public.real_worth_rates;
create policy "Super admins manage real worth rates" on public.real_worth_rates for all to authenticated
  using (public.has_role(auth.uid(), 'super_admin'::app_role))
  with check (public.has_role(auth.uid(), 'super_admin'::app_role));

drop policy if exists "Anyone can read real worth settings" on public.real_worth_settings;
create policy "Anyone can read real worth settings" on public.real_worth_settings for select using (true);
drop policy if exists "Super admins manage real worth settings" on public.real_worth_settings;
create policy "Super admins manage real worth settings" on public.real_worth_settings for all to authenticated
  using (public.has_role(auth.uid(), 'super_admin'::app_role))
  with check (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Snapshots: each client reads and saves only their own
drop policy if exists "Read own real worth snapshots" on public.real_worth_snapshots;
create policy "Read own real worth snapshots" on public.real_worth_snapshots for select to authenticated
  using (user_id = auth.uid());
drop policy if exists "Save own real worth snapshots" on public.real_worth_snapshots;
create policy "Save own real worth snapshots" on public.real_worth_snapshots for insert to authenticated
  with check (user_id = auth.uid());
drop policy if exists "Delete own real worth snapshots" on public.real_worth_snapshots;
create policy "Delete own real worth snapshots" on public.real_worth_snapshots for delete to authenticated
  using (user_id = auth.uid());

-- Starting rates (November 2026)
insert into public.real_worth_rates (asset_key, label, typical_rate, weak_rate, fact_line, source_note, sort_order) values
  ('savings', 'Savings account', 2.5, null,
   'Value doesn''t fall · You can take it out any time · Interest is taxed every year',
   'SBI savings account rate', 1),
  ('fd', 'Fixed deposit', 6.25, null,
   'Value doesn''t fall · Bank deposits are insured up to a limit · Interest is taxed every year',
   'SBI 1-2 year FD rate, Oct 2026', 2),
  ('debt', 'Debt funds', 7, null,
   'Value can dip a little · Money reaches you in a few working days · Taxed when you take money out',
   'Long-term returns of low duration and corporate bond funds: 6.8% over 10 years, 7.6% over 20 years', 3),
  ('gold', 'Gold', 10, 8,
   'Value can fall, and has stayed flat for years at times · Taxed when you sell',
   'Typical: middle of all 10-year periods since 1990 (gold price in rupees). Weak years: worst 15-year period since 1990 (5.3%)', 4),
  ('equity', 'Equity funds', 12, 10,
   'Value can fall a lot in some years · Money reaches you in a few working days · Taxed when you take money out',
   'Typical: Nifty 50 TRI, 12.3% over 10 years and 12.1% over 20 years. Weak years: worst 15-year period since 1999 (9%)', 5)
on conflict (asset_key) do nothing;

insert into public.real_worth_settings (id) values (1) on conflict (id) do nothing;
