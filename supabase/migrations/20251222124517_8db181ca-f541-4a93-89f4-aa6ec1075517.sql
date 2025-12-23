-- Drop the existing trigger function and recreate for Contacts instead of Leads
DROP FUNCTION IF EXISTS public.trigger_zoho_lead_creation() CASCADE;

-- Create new trigger function for Zoho Contact creation
CREATE OR REPLACE FUNCTION public.trigger_zoho_contact_creation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
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
    
    -- Call the new create-zoho-contact function instead of create-zoho-lead
    SELECT INTO request_id net.http_post(
      url := 'https://xmmyjphoaqazwlifehxs.supabase.co/functions/v1/create-zoho-contact',
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

-- Create the trigger on profiles table
CREATE TRIGGER on_profile_zoho_sync_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_zoho_contact_creation();