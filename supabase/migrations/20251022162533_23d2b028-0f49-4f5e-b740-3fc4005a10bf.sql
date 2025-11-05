-- Enable pg_net extension for async HTTP calls
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Add Zoho CRM integration columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS zoho_lead_id TEXT,
ADD COLUMN IF NOT EXISTS zoho_sync_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS zoho_sync_error TEXT;

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_profiles_zoho_lead_id ON public.profiles(zoho_lead_id);
CREATE INDEX IF NOT EXISTS idx_profiles_zoho_sync_status ON public.profiles(zoho_sync_status);

-- Update handle_new_user function to parse full_name into first_name and last_name
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
  -- Get full_name from metadata
  full_name_value := NEW.raw_user_meta_data->>'full_name';
  
  -- Parse first_name and last_name from full_name
  IF full_name_value IS NOT NULL AND full_name_value != '' THEN
    space_position := POSITION(' ' IN full_name_value);
    
    IF space_position > 0 THEN
      -- Split on first space
      INSERT INTO public.profiles (id, email, full_name, first_name, last_name, zoho_sync_status)
      VALUES (
        NEW.id, 
        NEW.email, 
        full_name_value,
        TRIM(SUBSTRING(full_name_value FROM 1 FOR space_position - 1)),
        TRIM(SUBSTRING(full_name_value FROM space_position + 1)),
        'pending'
      );
    ELSE
      -- Single name - use as last_name
      INSERT INTO public.profiles (id, email, full_name, first_name, last_name, zoho_sync_status)
      VALUES (
        NEW.id, 
        NEW.email, 
        full_name_value,
        '',
        TRIM(full_name_value),
        'pending'
      );
    END IF;
  ELSE
    -- No full_name provided
    INSERT INTO public.profiles (id, email, full_name, zoho_sync_status)
    VALUES (NEW.id, NEW.email, full_name_value, 'pending');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger function to call edge function for Zoho CRM sync
CREATE OR REPLACE FUNCTION public.trigger_zoho_lead_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_id BIGINT;
  payload JSONB;
BEGIN
  -- Only trigger if conditions are met
  IF NEW.email IS NOT NULL 
     AND NEW.first_name IS NOT NULL 
     AND NEW.last_name IS NOT NULL 
     AND NEW.zoho_sync_status = 'pending' THEN
    
    -- Build payload
    payload := jsonb_build_object(
      'userId', NEW.id,
      'email', NEW.email,
      'firstName', NEW.first_name,
      'lastName', NEW.last_name,
      'fullName', NEW.full_name,
      'company', NEW.company,
      'phone', NEW.phone
    );
    
    -- Make async HTTP call to edge function
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

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS on_profile_zoho_sync ON public.profiles;
CREATE TRIGGER on_profile_zoho_sync
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_zoho_lead_creation();