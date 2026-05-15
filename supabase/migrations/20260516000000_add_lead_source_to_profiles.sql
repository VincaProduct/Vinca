-- Add lead_source column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS lead_source TEXT;

-- Recreate handle_new_user: set 'waiting_lead_source' instead of 'pending'
-- so the client can write lead_source before the Zoho sync fires
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  full_name_value TEXT;
  space_position INTEGER;
  referral_code_value TEXT;
  referrer_record RECORD;
  new_user_id UUID;
BEGIN
  full_name_value := NEW.raw_user_meta_data->>'full_name';
  referral_code_value := NEW.raw_user_meta_data->>'referral_code';
  new_user_id := NEW.id;

  -- Insert basic profile, waiting for client to set lead_source
  IF full_name_value IS NOT NULL AND full_name_value != '' THEN
    space_position := POSITION(' ' IN full_name_value);
    IF space_position > 0 THEN
      INSERT INTO public.profiles (id, email, full_name, first_name, last_name, zoho_sync_status)
      VALUES (
        new_user_id,
        NEW.email,
        full_name_value,
        TRIM(SUBSTRING(full_name_value FROM 1 FOR space_position - 1)),
        TRIM(SUBSTRING(full_name_value FROM space_position + 1)),
        'waiting_lead_source'
      );
    ELSE
      INSERT INTO public.profiles (id, email, full_name, first_name, last_name, zoho_sync_status)
      VALUES (
        new_user_id,
        NEW.email,
        full_name_value,
        '',
        TRIM(full_name_value),
        'waiting_lead_source'
      );
    END IF;
  ELSE
    INSERT INTO public.profiles (id, email, full_name, zoho_sync_status)
    VALUES (new_user_id, NEW.email, full_name_value, 'waiting_lead_source');
  END IF;

  -- Process referral code if provided
  IF referral_code_value IS NOT NULL AND referral_code_value != '' THEN
    SELECT id, zoho_contact_id, first_name, last_name
    INTO referrer_record
    FROM public.profiles
    WHERE referral_code = referral_code_value
    LIMIT 1;

    IF FOUND THEN
      UPDATE public.profiles
      SET
        referred_by_user_id        = referrer_record.id,
        zoho_referrer_contact_id   = referrer_record.zoho_contact_id,
        pending_referral_code      = referral_code_value
      WHERE id = new_user_id;

      INSERT INTO public.user_referrals (user_id, referred_by_user_id, referral_code_used, status)
      VALUES (new_user_id, referrer_record.id, referral_code_value, 'pending');
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Recreate trigger_zoho_contact_creation to include lead_source in payload
CREATE OR REPLACE FUNCTION public.trigger_zoho_contact_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_id BIGINT;
  payload JSONB;
BEGIN
  IF NEW.zoho_sync_status = 'pending'
     AND (OLD.zoho_sync_status IS NULL OR OLD.zoho_sync_status != 'pending')
     AND NEW.email IS NOT NULL THEN

    payload := jsonb_build_object(
      'userId',       NEW.id,
      'email',        NEW.email,
      'firstName',    NEW.first_name,
      'lastName',     NEW.last_name,
      'fullName',     NEW.full_name,
      'company',      NEW.company,
      'phone',        NEW.phone,
      'referralCode', NEW.pending_referral_code,
      'leadSource',   COALESCE(NEW.lead_source, 'Website Signup')
    );

    SELECT INTO request_id net.http_post(
      url     := 'https://xmmyjphoaqazwlifehxs.supabase.co/functions/v1/create-zoho-contact',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtbXlqcGhvYXFhendsaWZlaHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MTY4NjMsImV4cCI6MjA2NDA5Mjg2M30.E7O_Q0Zcz0S-6ERl0JE-6SUth-lMLMbzTNGrdhDq_1k'
      ),
      body    := payload
    );
  END IF;

  RETURN NEW;
END;
$$;
