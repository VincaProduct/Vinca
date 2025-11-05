
-- Allow users to view profiles by referral code for referral lookups
-- This is needed so new users can find their referrer's profile
CREATE POLICY "Users can view profiles by referral code"
ON profiles
FOR SELECT
USING (referral_code IS NOT NULL);
