-- Timestamp set when Zoho CRM initiates the change — used to prevent sync loops
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS zoho_updated_at TIMESTAMPTZ;

-- Trigger: when key profile fields change in Supabase, push to Zoho CRM
-- Skips if: no zoho_contact_id yet, or if the change was initiated by Zoho (<30s ago)
CREATE OR REPLACE FUNCTION public.trigger_profile_to_zoho_sync()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_id BIGINT;
  payload    JSONB;
BEGIN
  -- Only sync when meaningful fields actually changed
  IF NOT (
    NEW.first_name IS DISTINCT FROM OLD.first_name OR
    NEW.last_name  IS DISTINCT FROM OLD.last_name  OR
    NEW.full_name  IS DISTINCT FROM OLD.full_name  OR
    NEW.phone      IS DISTINCT FROM OLD.phone
  ) THEN
    RETURN NEW;
  END IF;

  -- Skip if no Zoho contact exists yet
  IF NEW.zoho_contact_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Skip if this update was initiated by Zoho (loop prevention — 30s window)
  IF NEW.zoho_updated_at IS NOT NULL
     AND NEW.zoho_updated_at > NOW() - INTERVAL '30 seconds' THEN
    RETURN NEW;
  END IF;

  payload := jsonb_build_object(
    'zoho_contact_id', NEW.zoho_contact_id,
    'first_name',      NEW.first_name,
    'last_name',       NEW.last_name,
    'full_name',       NEW.full_name,
    'phone',           NEW.phone,
    'email',           NEW.email
  );

  SELECT INTO request_id net.http_post(
    url     := 'https://xmmyjphoaqazwlifehxs.supabase.co/functions/v1/sync-to-zoho',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtbXlqcGhvYXFhendsaWZlaHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MTY4NjMsImV4cCI6MjA2NDA5Mjg2M30.E7O_Q0Zcz0S-6ERl0JE-6SUth-lMLMbzTNGrdhDq_1k'
    ),
    body    := payload
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_update_sync_to_zoho
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_profile_to_zoho_sync();
