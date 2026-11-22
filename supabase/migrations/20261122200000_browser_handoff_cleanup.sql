-- Hourly cleanup of unclaimed handoffs (Instagram/Facebook -> Chrome/Safari),
-- so nothing stays more than about two hours even when no one new signs in.
-- Uses Supabase's built-in scheduler (pg_cron). Safe to run more than once:
-- scheduling the same job name again just updates it.

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

SELECT cron.schedule(
  'cleanup-browser-handoffs',
  '0 * * * *',
  $$DELETE FROM public.browser_handoffs WHERE created_at < now() - interval '1 hour'$$
);
