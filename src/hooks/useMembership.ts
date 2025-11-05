import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type MembershipTier = 'free' | 'pro' | 'premium' | 'client';

interface Membership {
  id: string;
  tier: MembershipTier | 'premium'; // Allow old 'premium' tier from DB
  upgraded_at: string | null;
  subscription_status: string | null;
  aum_verified: boolean;
}

export const useMembership = () => {
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMembership = async () => {
      if (!user) {
        setMembership(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_memberships')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          // Membership should be created by database trigger on signup
          // If missing, use default free tier (edge case)
          console.error('Membership record not found for user, using default free tier');
          setMembership({
            id: crypto.randomUUID(),
            tier: 'free',
            upgraded_at: null,
            subscription_status: null,
            aum_verified: false,
          } as Membership);
        } else {
          setMembership(data);
        }
      } catch (error) {
        console.error('Error fetching membership:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembership();
  }, [user]);

  const upgradeMembership = async (tier: MembershipTier) => {
    if (!user) return;

    try {
      // Map 'pro' to 'premium' for database compatibility
      const dbTier = tier === 'pro' ? 'premium' : tier;
      
      const { data, error } = await supabase
        .from('user_memberships')
        .update({
          tier: dbTier as any,
          upgraded_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setMembership(data as any);
    } catch (error) {
      console.error('Error upgrading membership:', error);
    }
  };

  return {
    membership,
    loading,
    tier: membership?.tier || 'free',
    isPro: membership?.tier === 'pro' || membership?.tier === 'premium' || membership?.tier === 'client',
    isClient: membership?.tier === 'client' || (membership?.tier === 'pro' && membership?.aum_verified === true),
    upgradeMembership,
  };
};
