-- Revert handle_new_user to not extract referral code from metadata
-- OAuth metadata cannot contain custom data, so we process referral codes from frontend

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  full_name_value TEXT;
  space_position INTEGER;
  new_user_id UUID;
BEGIN
  full_name_value := NEW.raw_user_meta_data->>'full_name';
  new_user_id := NEW.id;
  
  -- Insert basic profile with waiting_referral status
  -- This prevents Zoho sync until frontend processes referral code
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
        'waiting_referral'
      );
    ELSE
      INSERT INTO public.profiles (id, email, full_name, first_name, last_name, zoho_sync_status)
      VALUES (
        new_user_id, 
        NEW.email, 
        full_name_value,
        '',
        TRIM(full_name_value),
        'waiting_referral'
      );
    END IF;
  ELSE
    INSERT INTO public.profiles (id, email, full_name, zoho_sync_status)
    VALUES (new_user_id, NEW.email, full_name_value, 'waiting_referral');
  END IF;
  
  RETURN NEW;
END;
$function$;