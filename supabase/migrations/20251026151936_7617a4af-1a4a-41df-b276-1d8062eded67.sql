-- Add referral columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS zoho_referrer_contact_id TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by_user_id);

-- Create user_referrals tracking table
CREATE TABLE IF NOT EXISTS public.user_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code_used TEXT,
  referral_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'converted')),
  zoho_lead_id TEXT,
  zoho_contact_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for user_referrals
CREATE INDEX IF NOT EXISTS idx_user_referrals_user_id ON public.user_referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_referrals_referred_by ON public.user_referrals(referred_by_user_id);
CREATE INDEX IF NOT EXISTS idx_user_referrals_code ON public.user_referrals(referral_code_used);

-- Enable RLS on user_referrals
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_referrals
CREATE POLICY "Users can view their own referrals"
  ON public.user_referrals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view referrals they made"
  ON public.user_referrals FOR SELECT
  USING (auth.uid() = referred_by_user_id);

CREATE POLICY "Users can insert their own referrals"
  ON public.user_referrals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can view all referrals"
  ON public.user_referrals FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Update handle_new_user function to handle referral codes
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public 
AS $$
DECLARE
  full_name_value TEXT;
  space_position INTEGER;
  referral_code_value TEXT;
  referrer_user_id UUID;
BEGIN
  full_name_value := NEW.raw_user_meta_data->>'full_name';
  referral_code_value := NEW.raw_user_meta_data->>'referral_code';
  
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
        'pending'
      );
    ELSE
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
    INSERT INTO public.profiles (id, email, full_name, zoho_sync_status)
    VALUES (NEW.id, NEW.email, full_name_value, 'pending');
  END IF;
  
  -- Store referral relationship if code provided
  IF referral_code_value IS NOT NULL AND referral_code_value != '' THEN
    SELECT id INTO referrer_user_id 
    FROM public.profiles 
    WHERE referral_code = referral_code_value 
    LIMIT 1;
    
    IF referrer_user_id IS NOT NULL THEN
      UPDATE public.profiles 
      SET referred_by_user_id = referrer_user_id
      WHERE id = NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update trigger_zoho_lead_creation to pass referral code
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
  IF NEW.email IS NOT NULL 
     AND NEW.first_name IS NOT NULL 
     AND NEW.last_name IS NOT NULL 
     AND NEW.zoho_sync_status = 'pending' THEN
    
    -- Get referral code if user was referred
    IF NEW.referred_by_user_id IS NOT NULL THEN
      SELECT referral_code INTO referrer_code
      FROM profiles
      WHERE id = NEW.referred_by_user_id;
    END IF;
    
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
$function$;