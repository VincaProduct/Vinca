import { Card, CardContent } from '@/components/ui/card';
import { NewReferralDisplayData } from './types/newReferral.types';

const TIERS = [
  { label: '₹500 discount', count: 1 },
  { label: '₹1,500 discount', count: 3 },
  { label: 'Free Premium', count: 7 },
];

function getCurrentTier(refs: number) {
  if (refs >= 7) return 2;
  if (refs >= 3) return 1;
  if (refs >= 1) return 0;
  return -1;
}


export const NewReferralProgress = ({ data }: { data: NewReferralDisplayData }) => {
  const tierIdx = getCurrentTier(data.successfulReferrals);
  const nextTier = TIERS[tierIdx + 1];
  const progress = tierIdx === 2
    ? 100
    : (data.successfulReferrals / (nextTier ? nextTier.count : TIERS[TIERS.length - 1].count)) * 100;
  const remaining = nextTier ? Math.max(nextTier.count - data.successfulReferrals, 0) : 0;

  return (
    <Card className="bg-card/50 border border-border/50 rounded-2xl shadow-sm hover:shadow-md transition-shadow h-full">
      <CardContent className="p-6 sm:p-8 flex flex-col justify-between h-full">
        <div className="flex justify-between gap-4 mb-6">
          {TIERS.map((tier, idx) => (
            <div key={tier.label} className="flex-1 flex flex-col items-center">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl mb-2 ${tierIdx >= idx ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-300'}`}>🏆</div>
              <div className={`text-sm font-semibold ${tierIdx >= idx ? 'text-foreground' : 'text-muted-foreground'}`}>{tier.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{tier.count} ref</div>
            </div>
          ))}
        </div>

        <div className="h-2.5 bg-muted rounded-full mb-6 overflow-hidden">
          <div
            className="h-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        <p className="text-base text-muted-foreground leading-relaxed text-center">
          {nextTier ? (
            <>
              <span className="font-bold text-foreground">{remaining}</span> referral{remaining === 1 ? '' : 's'} to unlock{' '}
              <span className="font-bold text-foreground">{nextTier.label}</span>
            </>
          ) : (
            <span className="font-bold text-emerald-600">All rewards unlocked!</span>
          )}
        </p>
      </CardContent>
    </Card>
  );
};
