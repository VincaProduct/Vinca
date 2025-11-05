-- Add Zoho conversion tracking columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS zoho_contact_id TEXT,
ADD COLUMN IF NOT EXISTS zoho_account_id TEXT,
ADD COLUMN IF NOT EXISTS zoho_deal_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_zoho_contact_id ON public.profiles(zoho_contact_id);

-- Create table for failed conversions (for manual retry)
CREATE TABLE IF NOT EXISTS public.zoho_conversion_failures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  zoho_lead_id TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_details JSONB DEFAULT '{}'::jsonb,
  plan_type TEXT NOT NULL,
  plan_amount INTEGER NOT NULL,
  retry_count INTEGER DEFAULT 0,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.zoho_conversion_failures ENABLE ROW LEVEL SECURITY;

-- Super admins can view all failed conversions
CREATE POLICY "Super admins can view failed conversions"
ON public.zoho_conversion_failures
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Super admins can update failed conversions (mark as resolved)
CREATE POLICY "Super admins can update failed conversions"
ON public.zoho_conversion_failures
FOR UPDATE
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Add index for querying unresolved failures
CREATE INDEX IF NOT EXISTS idx_zoho_conversion_failures_resolved ON public.zoho_conversion_failures(resolved, created_at);

-- Add updated_at trigger
CREATE TRIGGER update_zoho_conversion_failures_updated_at
  BEFORE UPDATE ON public.zoho_conversion_failures
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();