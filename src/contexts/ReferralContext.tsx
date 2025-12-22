import { createContext, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

const ReferralContext = createContext({});

export const ReferralProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  useEffect(() => {
    const processReferralCode = async () => {
      if (!user) return;

      // Check URL for referral code first (from OAuth redirect)
      const urlParams = new URLSearchParams(window.location.search);
      const urlReferralCode = urlParams.get('ref');
      
      // Also check localStorage as fallback
      const storedReferralCode = localStorage.getItem('pending_referral_code');
      const referralCode = urlReferralCode || storedReferralCode;

      // Get current user's profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('zoho_sync_status, zoho_contact_id, referred_by_user_id, pending_referral_code')
        .eq('id', user.id)
        .single();

      // Only process if status is waiting_referral
      if (userProfile?.zoho_sync_status === 'waiting_referral') {
        if (referralCode && !userProfile?.referred_by_user_id) {
          // Find referrer
          const { data: referrerProfile } = await supabase
            .from('profiles')
            .select('id, zoho_contact_id, zoho_lead_id, first_name, last_name')
            .eq('referral_code', referralCode)
            .maybeSingle();

          if (referrerProfile) {
            // Update profile with referral info AND trigger Zoho sync
            await supabase
              .from('profiles')
              .update({
                referred_by_user_id: referrerProfile.id,
                zoho_referrer_contact_id: referrerProfile.zoho_contact_id,
                pending_referral_code: referralCode,
                zoho_sync_status: 'pending', // This triggers Zoho lead creation
              })
              .eq('id', user.id);

            // Create referral tracking record
            await supabase
              .from('user_referrals')
              .insert({
                user_id: user.id,
                referred_by_user_id: referrerProfile.id,
                referral_code_used: referralCode,
                status: 'pending',
              });
          } else {
            // Still trigger Zoho sync even without referral
            await supabase
              .from('profiles')
              .update({ zoho_sync_status: 'pending' })
              .eq('id', user.id);
          }
        } else {
          // No referral code, just trigger normal Zoho sync
          await supabase
            .from('profiles')
            .update({ zoho_sync_status: 'pending' })
            .eq('id', user.id);
        }

        // Clean up
        localStorage.removeItem('pending_referral_code');
        if (urlReferralCode) {
          // Remove ref param from URL without reload
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    };

    // Add small delay to ensure user profile is created
    const timer = setTimeout(() => {
      processReferralCode();
    }, 500);

    return () => clearTimeout(timer);
  }, [user]);

  return (
    <ReferralContext.Provider value={{}}>
      {children}
    </ReferralContext.Provider>
  );
};

export const useReferral = () => useContext(ReferralContext);
