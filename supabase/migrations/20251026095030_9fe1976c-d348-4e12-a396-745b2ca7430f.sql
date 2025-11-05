-- CRITICAL SECURITY FIX: Remove UPDATE policy from user_memberships
-- Users should NOT be able to update their own membership tier
-- Only edge functions using service role should update memberships

DROP POLICY IF EXISTS "Users can update their own membership" ON public.user_memberships;

-- Also remove INSERT policy as memberships should only be created by edge functions or triggers
DROP POLICY IF EXISTS "Users can insert their own membership" ON public.user_memberships;

-- Keep only SELECT policy for users to view their membership
-- Memberships will be managed exclusively by:
-- 1. Webhook (razorpay-webhook) using service role
-- 2. Auto-creation trigger on user signup (if exists)