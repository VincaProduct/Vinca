-- Run once in the Supabase SQL editor: sends the ad click ID to Zoho field Google_Click_ID
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
        'Google_Click_ID', COALESCE(NEW.gclid, NEW.gbraid, NEW.wbraid),
        'Landing_Page',    NEW.landing_page
      ))
    );
  END IF;

  RETURN NEW;
END;
$$;
