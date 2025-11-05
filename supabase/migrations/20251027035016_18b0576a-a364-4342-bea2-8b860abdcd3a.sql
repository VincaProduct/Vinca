-- First, drop the duplicate trigger
DROP TRIGGER IF EXISTS on_profile_zoho_sync ON profiles;

-- Update the trigger function with proper logging
CREATE OR REPLACE FUNCTION public.trigger_zoho_lead_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  request_id BIGINT;
  payload JSONB;
  referrer_code TEXT;
BEGIN
  -- Log trigger execution
  RAISE LOG 'trigger_zoho_lead_creation FIRED for user: %', NEW.id;
  RAISE LOG 'OLD zoho_sync_status: %, NEW zoho_sync_status: %', OLD.zoho_sync_status, NEW.zoho_sync_status;
  RAISE LOG 'NEW.pending_referral_code: %', NEW.pending_referral_code;
  RAISE LOG 'NEW.email: %', NEW.email;
  RAISE LOG 'NEW.first_name: %, NEW.last_name: %', NEW.first_name, NEW.last_name;
  
  -- Only trigger when zoho_sync_status changes to 'pending' (after referral processing)
  IF NEW.zoho_sync_status = 'pending' 
     AND (OLD.zoho_sync_status IS NULL OR OLD.zoho_sync_status != 'pending')
     AND NEW.email IS NOT NULL 
     AND NEW.first_name IS NOT NULL 
     AND NEW.last_name IS NOT NULL THEN
    
    RAISE LOG 'Conditions met, preparing to call edge function';
    
    -- Get referral code from profile if exists
    referrer_code := NEW.pending_referral_code;
    
    RAISE LOG 'referrer_code to be sent: %', referrer_code;
    
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
    
    RAISE LOG 'Payload to be sent: %', payload::text;
    
    SELECT INTO request_id net.http_post(
      url := 'https://xmmyjphoaqazwlifehxs.supabase.co/functions/v1/create-zoho-lead',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtbXlqcGhvYXFhendsaWZlaHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MTY4NjMsImV4cCI6MjA2NDA5Mjg2M30.E7O_Q0Zcz0S-6ERl0JE-6SUth-lMLMbzTNGrdhDq_1k'
      ),
      body := payload
    );
    
    RAISE LOG 'Edge function request_id: %', request_id;
  ELSE
    RAISE LOG 'Conditions NOT met - skipping edge function call';
  END IF;
  
  RETURN NEW;
END;
$function$;