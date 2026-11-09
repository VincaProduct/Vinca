-- Google Ads: keep where a new user came from (ad click IDs + UTM tags) and
-- send it to their Zoho contact. Safe to run more than once.

-- 1) Columns on profiles, filled in by the website right after a new sign-up
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS gclid        TEXT,
  ADD COLUMN IF NOT EXISTS gbraid       TEXT,
  ADD COLUMN IF NOT EXISTS wbraid       TEXT,
  ADD COLUMN IF NOT EXISTS utm_source   TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium   TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS utm_term     TEXT,
  ADD COLUMN IF NOT EXISTS utm_content  TEXT,
  ADD COLUMN IF NOT EXISTS landing_page TEXT,
  ADD COLUMN IF NOT EXISTS ad_click_at  TIMESTAMPTZ;

-- 2) Once the Zoho contact exists, copy these onto it (custom fields in Zoho
--    Contacts with the API names below). Runs once per user, when
--    zoho_contact_id is first set. If the Zoho fields don't exist yet, Zoho
--    rejects only this update; the contact itself is unaffected.
CREATE OR REPLACE FUNCTION public.sync_ad_attribution_to_zoho()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_id BIGINT;
BEGIN
  IF NEW.zoho_contact_id IS NOT NULL
     AND (OLD.zoho_contact_id IS NULL)
     AND (NEW.gclid IS NOT NULL OR NEW.gbraid IS NOT NULL OR NEW.wbraid IS NOT NULL OR NEW.utm_source IS NOT NULL) THEN

    SELECT INTO request_id net.http_post(
      url     := 'https://xmmyjphoaqazwlifehxs.supabase.co/functions/v1/sync-to-zoho',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtbXlqcGhvYXFhendsaWZlaHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MTY4NjMsImV4cCI6MjA2NDA5Mjg2M30.E7O_Q0Zcz0S-6ERl0JE-6SUth-lMLMbzTNGrdhDq_1k'
      ),
      body    := jsonb_strip_nulls(jsonb_build_object(
        'zoho_contact_id', NEW.zoho_contact_id,
        'UTM_Source',      NEW.utm_source,
        'UTM_Medium',      NEW.utm_medium,
        'UTM_Campaign',    NEW.utm_campaign,
        'UTM_Term',        NEW.utm_term,
        'UTM_Content',     NEW.utm_content,
        'GCLID',           COALESCE(NEW.gclid, NEW.gbraid, NEW.wbraid),
        'Landing_Page',    NEW.landing_page
      ))
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_zoho_contact_created_sync_attribution ON public.profiles;
CREATE TRIGGER on_zoho_contact_created_sync_attribution
  AFTER UPDATE OF zoho_contact_id ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_ad_attribution_to_zoho();
