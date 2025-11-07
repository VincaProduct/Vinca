import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useReferrals } from '@/hooks/useReferrals';
import { ReferralCard } from '@/components/referral/ReferralCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMembership } from '@/hooks/useMembership';

const ReferFriend = () => {
  const { stats, loading } = useReferrals();
  const { membership, loading: membershipLoading } = useMembership();

  if (loading || membershipLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if user is premium
  const isPremium = membership?.tier === 'premium';

  if (!isPremium) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Alert>
          <AlertDescription>
            Referral program is available for premium members only. Upgrade to premium to start referring friends and earning rewards.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!stats?.referralCode) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Alert>
          <AlertDescription>
            Your referral code is being generated. Please refresh the page in a moment.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Refer a Friend</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Share the wealth of knowledge and grow together. Invite your friends to join Vinca Wealth.
        </p>
      </div>

      {/* Referral Card with Stats */}
      <ReferralCard
        referralCode={stats.referralCode}
        totalReferrals={stats.totalReferrals}
        pendingReferrals={stats.pendingReferrals}
        convertedReferrals={stats.convertedReferrals}
      />

      {/* Referral History */}
      {stats.referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Referral History</CardTitle>
            <CardDescription>
              Track your successful referrals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium">Referral</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(referral.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      referral.status === 'converted'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                    }`}
                  >
                    {referral.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReferFriend;
