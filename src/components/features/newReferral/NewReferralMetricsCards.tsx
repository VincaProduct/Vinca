import { Card, CardContent } from '@/components/ui/card';
import { NewReferralDisplayData } from './types/newReferral.types';

interface Props {
  data: NewReferralDisplayData;
}



export const NewReferralMetricsCards = ({ data }: Props) => (
  <div className="grid grid-cols-2 gap-4">
    {/* People You Referred Card */}
    <Card className="bg-card/50 border border-border/50 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5 sm:p-6 flex flex-col items-center justify-center text-center aspect-square sm:aspect-auto">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <p className="text-xs font-medium text-muted-foreground mb-1">People You Referred</p>
        <p className="text-2xl font-bold text-foreground tracking-tight">{data.successfulReferrals}</p>
        <p className="text-xs text-muted-foreground mt-2 truncate max-w-full">Joined via your link</p>
        {data.successfulReferrals > 0 && (
          <div className="mt-2 text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full">
            ✓ Active referrals
          </div>
        )}
      </CardContent>
    </Card>

    {/* Rewards Earned Card */}
    <Card className="bg-card/50 border border-border/50 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5 sm:p-6 flex flex-col items-center justify-center text-center aspect-square sm:aspect-auto">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Rewards Earned</p>
        <p className="text-2xl font-bold text-foreground tracking-tight">₹{data.discountEarned}</p>
        {data.discountEarned > 0 ? (
          <>
            <button
              type="button"
              className="mt-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline underline-offset-2 transition-colors"
            >
              Claim reward
            </button>
            <p className="text-xs text-muted-foreground mt-1">Available to claim</p>
          </>
        ) : (
          <div className="mt-2 text-xs text-muted-foreground">No rewards yet</div>
        )}
      </CardContent>
    </Card>
  </div>
);