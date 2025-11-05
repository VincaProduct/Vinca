import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ReferralStats {
  referralCode: string | null;
  totalReferrals: number;
  pendingReferrals: number;
  convertedReferrals: number;
  referrals: Array<{
    id: string;
    status: string;
    created_at: string;
  }>;
}

export const useReferrals = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReferralStats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get user's referral code
        const { data: profile } = await supabase
          .from('profiles')
          .select('referral_code')
          .eq('id', user.id)
          .single();

        // Get referral statistics
        const { data: referrals, error } = await supabase
          .from('user_referrals')
          .select('id, status, created_at')
          .eq('referred_by_user_id', user.id);

        if (error) throw error;

        const totalReferrals = referrals?.length || 0;
        const pendingReferrals = referrals?.filter(r => r.status === 'pending').length || 0;
        const convertedReferrals = referrals?.filter(r => r.status === 'converted').length || 0;

        setStats({
          referralCode: profile?.referral_code || null,
          totalReferrals,
          pendingReferrals,
          convertedReferrals,
          referrals: referrals || [],
        });
      } catch (error) {
        console.error('Error fetching referral stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReferralStats();
  }, [user]);

  return { stats, loading };
};
