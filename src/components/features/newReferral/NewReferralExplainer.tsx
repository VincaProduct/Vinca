export const NewReferralExplainer = () => (
  <div className="mt-8">
    <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-7 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2.5 h-2.5 rounded-full bg-[#009688]" aria-hidden />
        <h3 className="text-lg font-semibold text-slate-900">Terms & Conditions</h3>
      </div>
      <ul className="mt-2 space-y-3 text-sm text-slate-600">
        <li className="leading-relaxed">Only users who join Vinca using your referral link are counted.</li>
        <li className="leading-relaxed">Rewards are earned only after the referred user completes a paid membership.</li>
        <li className="leading-relaxed">No rewards are granted for link shares without successful sign-ups.</li>
        <li className="leading-relaxed">Self-referrals are not allowed.</li>
        <li className="leading-relaxed">Rewards are unlocked after verification.</li>
        <li className="leading-relaxed">All referrals are subject to Vinca&apos;s Terms & Conditions.</li>
      </ul>
    </div>
  </div>
);
