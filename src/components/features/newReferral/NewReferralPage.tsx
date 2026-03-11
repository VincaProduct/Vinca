import { useEffect, useMemo, useState } from 'react';
import CanonicalPageHeader from '@/components/ui/CanonicalPageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_REFERRAL_STATE, NewReferralDisplayData } from './types/newReferral.types';
import { NewReferralMetricsCards } from './NewReferralMetricsCards';
import { NewReferralLinkGenerator } from './NewReferralLinkGenerator';
import { NewReferralExplainer } from './NewReferralExplainer';

export const NewReferralPage = () => {
  const { user } = useAuth();

  const defaultState = useMemo<NewReferralDisplayData>(() => ({
    ...MOCK_REFERRAL_STATE,
    referralCode: '',
  }), []);

  const [referralData, setReferralData] = useState<NewReferralDisplayData>(defaultState);
  const [referralLinkGenerated, setReferralLinkGenerated] = useState(false);

  const storageKey = user ? `new_referral_state_${user.id}` : null;

  useEffect(() => {
    if (!storageKey) {
      setReferralData(defaultState);
      setReferralLinkGenerated(false);
      return;
    }

    const saved = localStorage.getItem(storageKey);
    if (!saved) {
      setReferralData(defaultState);
      setReferralLinkGenerated(false);
      return;
    }

    try {
      const parsed = JSON.parse(saved) as { referralData?: NewReferralDisplayData; referralLinkGenerated?: boolean };
      const savedData = parsed.referralData ?? defaultState;
      setReferralData(savedData);
      const hasExistingReferral = Boolean(parsed.referralLinkGenerated ?? savedData.referralCode);
      setReferralLinkGenerated(hasExistingReferral);
    } catch (error) {
      console.warn('Failed to load referral state, resetting.', error);
      setReferralData(defaultState);
      setReferralLinkGenerated(false);
    }
  }, [storageKey, defaultState]);

  useEffect(() => {
    if (!storageKey) return;
    const generated = referralLinkGenerated || Boolean(referralData.referralCode);
    const payload = { referralData, referralLinkGenerated: generated };
    localStorage.setItem(storageKey, JSON.stringify(payload));
  }, [referralData, referralLinkGenerated, storageKey]);

  // Simulate generating a new code (for demo)
  const handleGenerate = () => {
    setReferralData((prev) => ({ ...prev, referralCode: Math.random().toString(36).slice(2, 10).toUpperCase() }));
    setReferralLinkGenerated(true);
  };


  return (
    <>
      <CanonicalPageHeader
        title="Invite friends to financial readiness"
        children={<p className="text-[10px] sm:text-xs text-slate-500 mt-0">Share the journey and earn rewards together</p>}
      />
      <div className="max-w-6xl mx-auto w-full px-3 sm:px-6 py-3 sm:py-6">

      {/* Metrics Cards - Ultra Compact */}
      <div className="mb-3 sm:mb-4 max-w-xs mx-auto sm:max-w-none">
        <NewReferralMetricsCards data={referralData} />
      </div>

      {/* Referral Link Generator - Compact */}
      <div className="mb-4 sm:mb-6">
        <NewReferralLinkGenerator
          referralCode={referralData.referralCode}
          referralLinkGenerated={referralLinkGenerated || Boolean(referralData.referralCode)}
          onGenerate={handleGenerate}
        />
      </div>

      {/* Rewards Tiers - Ultra Compact */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-sm sm:text-base font-semibold text-slate-900 mb-2 sm:mb-3">Rewards Tiers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-white rounded-lg sm:rounded-xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] p-3 sm:p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs sm:text-base">
                🎁
              </div>
              <div>
                <div className="text-sm sm:text-base font-semibold text-slate-900">₹500</div>
                <div className="text-[8px] sm:text-[10px] text-emerald-600 font-medium">Tier 1</div>
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-600">On 1 successful referral</p>
            <div className="mt-1.5 text-[8px] sm:text-[9px] text-slate-400">✓ Instant discount</div>
          </div>
          
          <div className="bg-white rounded-lg sm:rounded-xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] p-3 sm:p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs sm:text-base">
                🚀
              </div>
              <div>
                <div className="text-sm sm:text-base font-semibold text-slate-900">₹1,500</div>
                <div className="text-[8px] sm:text-[10px] text-emerald-600 font-medium">Tier 2</div>
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-600">On 3 successful referrals</p>
            <div className="mt-1.5 text-[8px] sm:text-[9px] text-slate-400">✓ Double rewards</div>
          </div>
          
          <div className="bg-white rounded-lg sm:rounded-xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] p-3 sm:p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs sm:text-base">
                👑
              </div>
              <div>
                <div className="text-sm sm:text-base font-semibold text-slate-900">Free Premium</div>
                <div className="text-[8px] sm:text-[10px] text-emerald-600 font-medium">Tier 3</div>
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-600">On 7 successful referrals</p>
            <div className="mt-1.5 text-[8px] sm:text-[9px] text-slate-400">✓ Full access</div>
          </div>
        </div>
      </div>

      {/* Explainer Section */}
      <NewReferralExplainer />
    </div>
  </>);
};