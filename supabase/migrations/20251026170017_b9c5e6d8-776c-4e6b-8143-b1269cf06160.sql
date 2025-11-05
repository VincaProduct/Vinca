-- Fix the referral flow by delaying Zoho sync until referral is processed
-- Update handle_new_user to NOT set zoho_sync_status to 'pending' immediately
-- This prevents trigger from firing before referral processing
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public 
AS $$
DECLARE
  full_name_value TEXT;
  space_position INTEGER;
BEGIN
  full_name_value := NEW.raw_user_meta_data->>'full_name';
  
  IF full_name_value IS NOT NULL AND full_name_value != '' THEN
    space_position := POSITION(' ' IN full_name_value);
    
    IF space_position > 0 THEN
      INSERT INTO public.profiles (id, email, full_name, first_name, last_name, zoho_sync_status)
      VALUES (
        NEW.id, 
        NEW.email, 
        full_name_value,
        TRIM(SUBSTRING(full_name_value FROM 1 FOR space_position - 1)),
        TRIM(SUBSTRING(full_name_value FROM space_position + 1)),
        'waiting_referral' -- Wait for referral processing before syncing
      );
    ELSE
      INSERT INTO public.profiles (id, email, full_name, first_name, last_name, zoho_sync_status)
      VALUES (
        NEW.id, 
        NEW.email, 
        full_name_value,
        '',
        TRIM(full_name_value),
        'waiting_referral'
      );
    END IF;
  ELSE
    INSERT INTO public.profiles (id, email, full_name, zoho_sync_status)
    VALUES (NEW.id, NEW.email, full_name_value, 'waiting_referral');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update trigger to only fire when status changes from waiting_referral to pending
-- This ensures referral code is captured first
CREATE OR REPLACE FUNCTION public.trigger_zoho_lead_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_id BIGINT;
  payload JSONB;
  referrer_code TEXT;
BEGIN
  -- Only trigger when zoho_sync_status changes to 'pending' (after referral processing)
  IF NEW.zoho_sync_status = 'pending' 
     AND (OLD.zoho_sync_status IS NULL OR OLD.zoho_sync_status != 'pending')
     AND NEW.email IS NOT NULL 
     AND NEW.first_name IS NOT NULL 
     AND NEW.last_name IS NOT NULL THEN
    
    -- Get referral code from profile if exists
    referrer_code := NEW.pending_referral_code;
    
    payload := jsonb_build_object(
      'userId', NEW.id,
      'email', NEW.email,
      'firstName', NEW.first_name,
      'lastName', NEW.last_name,
      'fullName', NEW.full_name,
      'company', NEW.company,
      'phone', NEW.phone,
      'referralCode', referrer_code
    );
    
    SELECT INTO request_id net.http_post(
      url := 'https://xmmyjphoaqazwlifehxs.supabase.co/functions/v1/create-zoho-lead',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtbXlqcGhvYXFhendsaWZlaHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MTY4NjMsImV4cCI6MjA2NDA5Mjg2M30.E7O_Q0Zcz0S-6ERl0JE-6SUth-lMLMbzTNGrdhDq_1k'
      ),
      body := payload
    );
    
  END IF;
  
  RETURN NEW;
END;
$$;