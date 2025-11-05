-- Fix security vulnerability: Restrict profiles table access
-- Remove the overly permissive public read policy and replace with secure policies

-- First, drop the existing public read policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;

-- Create a secure policy that only allows users to view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Optional: Allow super admins to view all profiles if needed for admin functionality
CREATE POLICY "Super admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));