-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function to handle new user with referral processing
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
  
  -- Insert basic profile first
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
  
  -- Process referral code if provided
  IF referral_code_value IS NOT NULL AND referral_code_value != '' THEN
    -- Find referrer by referral code
    SELECT id, zoho_contact_id, zoho_lead_id, first_name, last_name
    INTO referrer_record
    FROM public.profiles
    WHERE referral_code = referral_code_value
    LIMIT 1;
    
    IF FOUND THEN
      -- Update profile with referral information
      UPDATE public.profiles
      SET 
        referred_by_user_id = referrer_record.id,
        zoho_referrer_contact_id = referrer_record.zoho_contact_id,
        pending_referral_code = referral_code_value,
        zoho_sync_status = 'pending' -- Now trigger Zoho sync
      WHERE id = new_user_id;
      
      -- Create referral tracking record
      INSERT INTO public.user_referrals (
        user_id,
        referred_by_user_id,
        referral_code_used,
        status
      ) VALUES (
        new_user_id,
        referrer_record.id,
        referral_code_value,
        'pending'
      );
    END IF;
  ELSE
    -- No referral code, proceed with normal Zoho sync
    UPDATE public.profiles
    SET zoho_sync_status = 'pending'
    WHERE id = new_user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();