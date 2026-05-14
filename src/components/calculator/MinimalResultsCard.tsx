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

const fmt = (v: number) => {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${Math.round(v).toLocaleString("en-IN")}`;
};

function useCountUp(target: number, duration = 1500) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
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

  // Logged-in view — compact score card used inside dashboard
  if (user) {
    return (
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
            Your Financial Freedom Score
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 4, marginBottom: 12 }}>
            <span style={{ fontSize: 80, fontWeight: 700, color: 'hsl(158 64% 42%)', lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: 28, color: '#9CA3AF', marginBottom: 12 }}>/100</span>
          </div>
          <div style={{ width: '100%', maxWidth: 320, margin: '0 auto 12px', height: 8, background: '#E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${score}%`, background: 'hsl(158 64% 52%)', borderRadius: 4, transition: 'width 1.5s ease-out' }} />
          </div>
          <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold ${statusColor}`}>
            {status}
          </span>
          {depletes && (
            <p style={{ fontSize: 14, color: '#4B5563', marginTop: 12 }}>
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
        background: 'white',
        borderRadius: 16,
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        padding: '32px 24px',
        textAlign: 'center',
        marginBottom: 24,
      }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>
          Your Financial Freedom Score
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 4, marginBottom: 16 }}>
          <span style={{ fontSize: 80, fontWeight: 700, color: 'hsl(158 64% 42%)', lineHeight: 1 }}>{displayScore}</span>
          <span style={{ fontSize: 32, color: '#9CA3AF', marginBottom: 12 }}>/100</span>
        </div>
        <div style={{ width: '100%', maxWidth: 320, margin: '0 auto 16px', height: 8, background: '#E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
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
          <p style={{ fontSize: 16, color: '#4B5563', textAlign: 'center', maxWidth: 480, margin: '0 auto 16px', lineHeight: 1.6 }}>
            At your current pace, your money runs out at age <strong>{depletionAge}</strong> — <strong>{yearsEarly}</strong> years before your life expectancy.
          </p>
        ) : (
          <p style={{ fontSize: 15, color: '#4B5563', textAlign: 'center', maxWidth: 480, margin: '0 auto 16px' }}>
            Your plan sustains through your life expectancy of {inputs.lifeExpectancy}.
          </p>
        )}

        {onEditInputs ? (
          <button
            onClick={onEditInputs}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#6B7280', textDecoration: 'underline', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Not your numbers? Edit inputs
          </button>
        ) : null}
      </div>

      {/* SIP comparison */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', padding: '20px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>You currently invest</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
              {fmt(currentSIP)}<span style={{ fontSize: 12, fontWeight: 400, color: '#9CA3AF' }}>/mo</span>
            </p>
            <span style={{ background: '#FEF2F2', color: '#E85D4A', fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 100 }}>Insufficient</span>
          </div>
          <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', padding: '20px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>You need to invest</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
              {fmt(requiredSIP)}<span style={{ fontSize: 12, fontWeight: 400, color: '#9CA3AF' }}>/mo</span>
            </p>
            <span style={{ background: '#F0FDF4', color: 'hsl(158 64% 32%)', fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 100 }}>Secure</span>
          </div>
        </div>

        {gap > 0 && (
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}>Monthly Gap</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: 'hsl(158 64% 32%)', marginBottom: 4 }}>+{fmt(gap)}/month</p>
            <p style={{ fontSize: 14, color: '#6B7280' }}>Most people start by closing 20% of this gap first.</p>
          </div>
        )}
      </div>

      {/* Locked items */}
      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', marginBottom: 24, overflow: 'hidden' }}>
        {[
          `You're losing ${100 - score} points in one specific area — here's which one`,
          `Two changes move your score from ${score} to ${Math.min(score + 25, 100)}+`,
          'Your personalised month-by-month action plan',
          `How you compare to ${inputs.age}-year-olds with a similar income`,
        ].map((item, i, arr) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px',
            borderBottom: i < arr.length - 1 ? '1px solid #F3F4F6' : 'none',
          }}>
            <Lock style={{ width: 16, height: 16, color: '#9CA3AF', flexShrink: 0 }} />
            <span style={{ fontSize: 14, color: '#6B7280' }}>{item}</span>
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
          Show Me How To Fix This — Free →
        </Button>
        <p style={{ fontSize: 13, color: '#9CA3AF' }}>Takes 10 seconds. No spam.</p>
      </div>
    </div>
  );
};

export default MinimalResultsCard;
