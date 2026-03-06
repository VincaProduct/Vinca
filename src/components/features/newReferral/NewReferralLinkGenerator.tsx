import { Button } from '@/components/ui/button';
import { copyToClipboard, shareReferralLink } from './utils/newReferral.utils';

interface Props {
  referralCode: string;
  onGenerate: () => void;
  referralLinkGenerated: boolean;
}

export const NewReferralLinkGenerator = ({ referralCode, referralLinkGenerated, onGenerate }: Props) => {
  const hasReferralLink = referralLinkGenerated && Boolean(referralCode);
  const referralLink = hasReferralLink ? `${window.location.origin}/signup?ref=${referralCode}` : '';

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_12px_30px_rgba(15,23,42,0.08)] p-7 sm:p-8">
      <p className="text-slate-600 text-sm mb-6">
        Share your link — rewards unlock as friends join Premium
      </p>

      {hasReferralLink ? (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <div className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm text-slate-700 break-all">
              {referralLink}
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button
                variant="secondary"
                className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                onClick={() => copyToClipboard(referralLink)}
              >
                Copy
              </Button>
              <Button
                variant="default"
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm hover:from-emerald-600 hover:to-emerald-700"
                onClick={() => shareReferralLink(referralLink)}
              >
                Share
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-start">
          <Button
            onClick={onGenerate}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm hover:from-emerald-600 hover:to-emerald-700"
          >
            Generate Referral Link
          </Button>
        </div>
      )}
    </div>
  );
};
