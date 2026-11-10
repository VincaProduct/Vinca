import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CalculatorInputs, CalculationResults } from "@/types/calculator";
import { Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { calculateFFRScore, FFR_SCORE_STATUS } from "@/utils/ffrScore";

interface MinimalResultsCardProps {
  inputs: CalculatorInputs;
  results: CalculationResults;
  projections: any[];
  onEditInputs?: () => void;
}

/** Exact amount for comparing SIPs: ₹9,600 rather than ₹10K, so close amounts don't look equal */
const fmtExact = (v: number) => {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(2)}L`;
  return `₹${Math.round(v).toLocaleString("en-IN")}`;
};

function useCountUp(target: number, duration = 1500) {
  const [value, setValue] = useState(0);
  const shown = useRef(0);
  useEffect(() => {
    // No animation when the tab is in the background or motion is reduced:
    // show the real score straight away (it must match the sign-in page)
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || document.hidden) {
      shown.current = target;
      setValue(target);
      return;
    }
    const from = shown.current;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(from + (target - from) * eased);
      shown.current = next;
      setValue(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    // Whatever happens to the animation, land on the real score
    const settle = setTimeout(() => { shown.current = target; setValue(target); }, duration + 100);
    return () => { cancelAnimationFrame(frame); clearTimeout(settle); };
  }, [target, duration]);
  return value;
}

const MinimalResultsCard: React.FC<MinimalResultsCardProps> = ({
  inputs,
  results,
  projections,
  onEditInputs,
}) => {
  const { user } = useAuth();

  const score = calculateFFRScore(inputs, results, projections, null);
  const displayScore = useCountUp(score);
  const [badgeVisible, setBadgeVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setBadgeVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  const { status, statusColor } = FFR_SCORE_STATUS(score);
  const depletionAge = results.corpusDepletionAge;
  const depletes = results.corpusDepletesBeforeLifeExpectancy && depletionAge;
  const yearsEarly = depletionAge ? inputs.lifeExpectancy - depletionAge : 0;
  const currentSIP = inputs.sipAmount;
  const requiredSIP = results.requiredMonthlySIP;
  const gap = Math.max(0, requiredSIP - currentSIP);
  const surplus = Math.max(0, currentSIP - requiredSIP);
  const onTrack = !depletes && gap === 0;

  // Logged-in view — compact score card used inside dashboard
  if (user) {
    return (
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--ui-text-faint)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
            Your Financial Freedom Score
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 4, marginBottom: 12 }}>
            <span style={{ fontSize: 80, fontWeight: 700, color: 'hsl(158 64% 42%)', lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: 28, color: 'var(--ui-text-faint)', marginBottom: 12 }}>/100</span>
          </div>
          <div style={{ width: '100%', maxWidth: 320, margin: '0 auto 12px', height: 8, background: 'var(--ui-line)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${score}%`, background: 'hsl(158 64% 52%)', borderRadius: 4, transition: 'width 1.5s ease-out' }} />
          </div>
          <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold ${statusColor}`}>
            {status}
          </span>
          {depletes && (
            <p style={{ fontSize: 14, color: 'var(--ui-text-body)', marginTop: 12 }}>
              You'll reach retirement but your corpus runs out <strong>{yearsEarly}</strong> years too early.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Public view
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", maxWidth: 600, margin: '0 auto', padding: '0 4px' }}>

      {/* Score card */}
      <div style={{
        background: 'var(--ui-surface)',
        borderRadius: 16,
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        padding: '32px 24px',
        textAlign: 'center',
        marginBottom: 24,
      }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--ui-text-faint)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>
          Your Estimated Financial Freedom Score
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 4, marginBottom: 8 }}>
          <span style={{ fontSize: 80, fontWeight: 700, color: 'hsl(158 64% 42%)', lineHeight: 1 }}>{displayScore}</span>
          <span style={{ fontSize: 32, color: 'var(--ui-text-faint)', marginBottom: 12 }}>/100</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--ui-text-faint)', maxWidth: 400, margin: '0 auto 16px', lineHeight: 1.5 }}>
          Up to 20 more points come from your insurance and emergency fund, added when you complete your checklist after signing in.
        </p>
        <div style={{ width: '100%', maxWidth: 320, margin: '0 auto 16px', height: 8, background: 'var(--ui-line)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${displayScore}%`,
            background: 'hsl(158 64% 52%)',
            borderRadius: 4,
            transition: 'width 0.05s linear',
          }} />
        </div>
        <div style={{ opacity: badgeVisible ? 1 : 0, transition: 'opacity 0.4s ease', marginBottom: 16 }}>
          <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold ${statusColor}`}>
            {status}
          </span>
        </div>

        {depletes ? (
          <p style={{ fontSize: 16, color: 'var(--ui-text-body)', textAlign: 'center', maxWidth: 480, margin: '0 auto 16px', lineHeight: 1.6 }}>
            At your current pace, your money runs out at age <strong>{depletionAge}</strong> — <strong>{yearsEarly}</strong> years before your life expectancy.
          </p>
        ) : (
          <p style={{ fontSize: 15, color: 'var(--ui-text-body)', textAlign: 'center', maxWidth: 480, margin: '0 auto 16px' }}>
            Your plan sustains through your life expectancy of {inputs.lifeExpectancy}.
          </p>
        )}

        {onEditInputs ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--ui-text-muted)' }}>Not your numbers?</span>
            <button
              type="button"
              onClick={onEditInputs}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-md border-2 border-[#06A969] text-[#06A969] bg-[var(--ui-surface)] hover:bg-[var(--ui-green-bg)]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
              Edit my inputs
            </button>
          </div>
        ) : null}
      </div>

      {/* SIP comparison */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div style={{ background: 'var(--ui-surface)', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', padding: '20px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: 'var(--ui-text-muted)', marginBottom: 8 }}>You currently invest</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--ui-text)', marginBottom: 8 }}>
              {fmtExact(currentSIP)}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--ui-text-faint)' }}>/mo</span>
            </p>
            {onTrack ? (
              <span style={{ background: 'var(--ui-green-bg)', color: 'var(--ui-green-text)', fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 100 }}>On track</span>
            ) : (
              <span style={{ background: 'var(--ui-red-bg)', color: 'var(--ui-red-text)', fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 100 }}>Short by {fmtExact(gap)}</span>
            )}
          </div>
          <div style={{ background: 'var(--ui-surface)', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', padding: '20px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: 'var(--ui-text-muted)', marginBottom: 8 }}>You need to invest</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--ui-text)', marginBottom: 8 }}>
              {fmtExact(requiredSIP)}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--ui-text-faint)' }}>/mo</span>
            </p>
            <span style={{ background: 'var(--ui-muted)', color: 'var(--ui-text-muted)', fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 100 }}>Minimum required</span>
          </div>
        </div>

        {gap > 0 ? (
          <div style={{ background: 'var(--ui-red-bg)', border: '1px solid var(--ui-red-line)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--ui-text-muted)', marginBottom: 4 }}>Monthly gap</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--ui-red-text)', marginBottom: 4 }}>+{fmtExact(gap)}/month</p>
            <p style={{ fontSize: 14, color: 'var(--ui-text-muted)' }}>Investing this much more each month would make your money last until {inputs.lifeExpectancy}.</p>
          </div>
        ) : surplus > 0 ? (
          <div style={{ background: 'var(--ui-green-bg)', border: '1px solid var(--ui-green-line)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--ui-text-muted)', marginBottom: 4 }}>You're ahead by</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--ui-green-text)', marginBottom: 4 }}>{fmtExact(surplus)}/month</p>
            <p style={{ fontSize: 14, color: 'var(--ui-text-muted)' }}>You invest more than the minimum your plan needs.</p>
          </div>
        ) : null}

        <p style={{ fontSize: 12, color: 'var(--ui-text-faint)', lineHeight: 1.6, textAlign: 'center', marginTop: 12 }}>
          Both SIP amounts are starting amounts that increase {inputs.growthInSIP}% every year and run for {inputs.yearsForSIP} years.
          Assumes {inputs.returnDuringSIPAndWaiting}% returns while investing, {inputs.returnDuringSWP}% after retirement and {inputs.inflation}% inflation, with life expectancy {inputs.lifeExpectancy}.
          Illustrative only; returns are not guaranteed.
        </p>
      </div>

      {/* Locked items */}
      <div style={{ background: 'var(--ui-surface)', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', marginBottom: 24, overflow: 'hidden' }}>
        {[
          'Your full score breakdown — where each of your points comes from, across 5 areas',
          'The earliest age your money would be enough to retire',
          'Your foundations checklist: life and health insurance, emergency fund and SIP',
          'A free consultation to go through your numbers with us',
        ].map((item, i, arr) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px',
            borderBottom: i < arr.length - 1 ? '1px solid var(--ui-muted)' : 'none',
          }}>
            <Lock style={{ width: 16, height: 16, color: 'var(--ui-text-faint)', flexShrink: 0 }} />
            <span style={{ fontSize: 14, color: 'var(--ui-text-muted)' }}>{item}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <Button
          onClick={() => {
            const retirementYear = new Date().getFullYear() + inputs.yearsForSIP + inputs.waitingYearsBeforeSWP;
            sessionStorage.setItem('ffr_pending_state', JSON.stringify({ inputs, score, retirementYear, gap }));
            localStorage.setItem('redirect_after_login', '/dashboard/ffr');
            window.location.href = '/auth';
          }}
          style={{
            width: '100%',
            maxWidth: 480,
            borderRadius: 12,
            padding: '18px 32px',
            fontWeight: 600,
            fontSize: 18,
            height: 'auto',
            transition: 'all 0.2s ease',
          }}
        >
          {onTrack ? 'See My Full Breakdown — Free →' : 'Show Me How To Fix This — Free →'}
        </Button>
        <p style={{ fontSize: 13, color: 'var(--ui-text-faint)' }}>Takes 10 seconds. No spam.</p>
      </div>
    </div>
  );
};

export default MinimalResultsCard;
