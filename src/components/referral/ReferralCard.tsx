import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Share2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface ReferralCardProps {
  referralCode: string;
  totalReferrals: number;
  pendingReferrals: number;
  convertedReferrals: number;
}

export const ReferralCard = ({
  referralCode,
  totalReferrals,
  pendingReferrals,
  convertedReferrals,
}: ReferralCardProps) => {
  const { toast } = useToast();
  const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: 'Copied!',
      description: 'Referral link copied to clipboard',
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Vinca Wealth',
          text: `Join me on Vinca Wealth and start your financial freedom journey! Use my referral code: ${referralCode}`,
          url: referralLink,
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Your Referral Program
            </CardTitle>
            <CardDescription>
              Share your referral code and earn rewards
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {referralCode}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-primary">{totalReferrals}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-amber-500">{pendingReferrals}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-green-500">{convertedReferrals}</div>
            <div className="text-sm text-muted-foreground">Converted</div>
          </div>
        </div>

        {/* Referral Link */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Your Referral Link</label>
          <div className="flex gap-2">
            <Input
              value={referralLink}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              onClick={handleCopyLink}
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* How It Works */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-semibold text-sm">How It Works</h4>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="font-bold text-primary">1.</span>
              Share your referral link with friends and family
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary">2.</span>
              They sign up using your link
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary">3.</span>
              Track their progress as they join Vinca Wealth
            </li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
