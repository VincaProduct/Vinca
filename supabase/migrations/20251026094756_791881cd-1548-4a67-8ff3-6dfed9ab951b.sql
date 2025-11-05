-- Fix remaining function security issues

-- Fix trigger_zoho_lead_creation function
CREATE OR REPLACE FUNCTION public.trigger_zoho_lead_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_id BIGINT;
  payload JSONB;
BEGIN
  IF NEW.email IS NOT NULL 
     AND NEW.first_name IS NOT NULL 
     AND NEW.last_name IS NOT NULL 
     AND NEW.zoho_sync_status = 'pending' THEN
    
    payload := jsonb_build_object(
      'userId', NEW.id,
      'email', NEW.email,
      'firstName', NEW.first_name,
      'lastName', NEW.last_name,
      'fullName', NEW.full_name,
      'company', NEW.company,
      'phone', NEW.phone
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

-- Fix get_current_user_role function  
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = auth.uid()
  ORDER BY 
    CASE role
      WHEN 'super_admin' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1
$$;