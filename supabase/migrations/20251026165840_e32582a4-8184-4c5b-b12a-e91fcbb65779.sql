-- Add pending_referral_code column to profiles to store referral code during signup
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS pending_referral_code TEXT;

-- Update handle_new_user to extract and store referral code from OAuth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public 
AS $$
DECLARE
  full_name_value TEXT;
  space_position INTEGER;
  referral_code_value TEXT;
BEGIN
  full_name_value := NEW.raw_user_meta_data->>'full_name';
  referral_code_value := NEW.raw_user_meta_data->>'referral_code';
  
  IF full_name_value IS NOT NULL AND full_name_value != '' THEN
    space_position := POSITION(' ' IN full_name_value);
    
    IF space_position > 0 THEN
      INSERT INTO public.profiles (id, email, full_name, first_name, last_name, zoho_sync_status, pending_referral_code)
      VALUES (
        NEW.id, 
        NEW.email, 
        full_name_value,
        TRIM(SUBSTRING(full_name_value FROM 1 FOR space_position - 1)),
        TRIM(SUBSTRING(full_name_value FROM space_position + 1)),
        'pending',
        referral_code_value
      );
    ELSE
      INSERT INTO public.profiles (id, email, full_name, first_name, last_name, zoho_sync_status, pending_referral_code)
      VALUES (
        NEW.id, 
        NEW.email, 
        full_name_value,
        '',
        TRIM(full_name_value),
        'pending',
        referral_code_value
      );
    END IF;
  ELSE
    INSERT INTO public.profiles (id, email, full_name, zoho_sync_status, pending_referral_code)
    VALUES (NEW.id, NEW.email, full_name_value, 'pending', referral_code_value);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update trigger_zoho_lead_creation to pass referral code from profile
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
  IF NEW.email IS NOT NULL 
     AND NEW.first_name IS NOT NULL 
     AND NEW.last_name IS NOT NULL 
     AND NEW.zoho_sync_status = 'pending' THEN
    
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