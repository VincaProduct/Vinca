-- Profiles were readable by anyone (even signed-out visitors) when they had a
-- referral code: the policy "Users can view profiles by referral code" used
-- (referral_code IS NOT NULL), exposing email, phone, name, company and ad data.
--
-- The only client-side use was finding the referrer for a referral code, which
-- needs just their id and Zoho contact id. find_referrer() returns exactly that,
-- for signed-in users only, and the open policy is removed.
-- (Edge functions use the service key and are not affected.)
--
-- Undo:
--   create policy "Users can view profiles by referral code" on public.profiles
--     for select using (referral_code is not null);

create or replace function public.find_referrer(_code text)
returns table (id uuid, zoho_contact_id text)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.zoho_contact_id
  from public.profiles p
  where auth.uid() is not null
    and _code is not null
    and p.referral_code = _code
    and p.id <> auth.uid()
  limit 1
$$;

revoke all on function public.find_referrer(text) from public, anon;
grant execute on function public.find_referrer(text) to authenticated;

drop policy if exists "Users can view profiles by referral code" on public.profiles;
