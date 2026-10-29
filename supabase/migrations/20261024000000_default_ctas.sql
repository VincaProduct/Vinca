-- Default CTAs: a CTA can be shown automatically on every article, in the
-- middle or at the bottom (at most one CTA for each, so two defaults in all).
alter table public.ctas
  add column if not exists default_position public.cta_placement_position;

alter table public.ctas
  drop constraint if exists ctas_default_position_check;
alter table public.ctas
  add constraint ctas_default_position_check
  check (default_position is null or default_position in ('middle_article', 'bottom'));

create unique index if not exists ctas_one_default_per_position
  on public.ctas (default_position)
  where default_position is not null;

-- Default CTAs switched off for a particular article
alter table public.blog_posts
  add column if not exists hidden_default_ctas uuid[] not null default '{}';

-- CTA buttons now go to their own Action URL instead of always to the
-- sign-in page. Point "Book your Free consultation" at the sign-in page so it
-- keeps working exactly as it does today.
update public.ctas
  set action_url = 'https://vincawealth.com/auth'
  where id = '1ea514f8-a7bf-4b73-a3aa-3c68eb159137'
    and action_url = 'https://vincawealth.com/#contact';
