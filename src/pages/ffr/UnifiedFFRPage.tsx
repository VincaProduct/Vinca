import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Settings2, X, ChevronDown } from 'lucide-react';
import {
  FinancialPlanningProvider,
  useFinancialPlanning,
  defaultInputs,
  FV,
  CEILING,
} from '@/components/financial-planning/context/FinancialPlanningContext';
import TimelineCalculatorForm from '@/components/calculator/TimelineCalculatorForm';
import { toast } from 'sonner';
import { CalculatorInputs } from '@/types/calculator';
import { FFRScoreCard } from '@/components/ffr/FFRScoreCard';
import { FFRScoreBreakdown } from '@/components/ffr/FFRScoreBreakdown';
import { useFFR } from '@/hooks/useFFR';
import { HEALTH_COSTS, HealthCategory } from '@/types/financial-planning';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// ── helpers ──────────────────────────────────────────────────────────────
const fmt = (v: number) => {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${Math.round(v).toLocaleString('en-IN')}`;
};

// Always generates to age 90; never stops early (allows negative corpus for red line)
function generateProjections(inputs: CalculatorInputs) {
  const rows: { age: number; corpus: number }[] = [];
  let corpus = inputs.initialPortfolioValue;
  const annualReturn = inputs.returnDuringSIPAndWaiting / 100;
  const swpReturn = inputs.returnDuringSWP / 100;
  const sipEnd = inputs.yearsForSIP;
  const swpStart = inputs.yearsForSIP + inputs.waitingYearsBeforeSWP;
  const inflatedExp = CEILING(
    inputs.currentMonthlyExpenses * Math.pow(1 + inputs.inflation / 100, swpStart),
    1000
  );
  let prevSWP = 0;
  const maxYears = 90 - inputs.age; // always go to 90
  for (let y = 1; y <= maxYears; y++) {
    const isSIP = y <= sipEnd;
    const isSWP = y > swpStart;
    const sip = isSIP ? inputs.sipAmount * Math.pow(1 + inputs.growthInSIP / 100, y - 1) : 0;
    let swp = 0;
    if (isSWP) {
      swp = y === swpStart + 1 ? inflatedExp : prevSWP * (1 + inputs.growthInSWP / 100);
      prevSWP = swp;
    }
    if (!isSWP) {
      const rate = Math.pow(1 + annualReturn, 1 / 12) - 1;
      corpus = FV(rate, 12, -sip, -corpus, 1);
    } else {
      const rate = Math.pow(1 + swpReturn, 1 / 12) - 1;
      corpus = FV(rate, 12, swp, -corpus, 1);
    }
    rows.push({ age: inputs.age + y, corpus });
    // No early break — red line continues negative past zero
  }
  return rows;
}

// ── Chapter 2: Gap Chart ─────────────────────────────────────────────────
function GapChart() {
  const { inputs, results, projections } = useFinancialPlanning();
  const [tableOpen, setTableOpen] = useState(false);
  if (!inputs || !results) return null;

  // Both lines generated fresh to age 90; red line can go negative past zero
  const currentRaw = generateProjections(inputs);
  const fixedInputs = { ...inputs, sipAmount: Math.max(inputs.sipAmount, results.requiredMonthlySIP) };
  const fixedRaw = generateProjections(fixedInputs);

  const currentMap = new Map(currentRaw.map(r => [r.age, r.corpus]));
  const fixedMap = new Map(fixedRaw.map(r => [r.age, r.corpus]));

  // Chart data: every year from age+1 to 90
  const chartData: { age: number; current: number | null; fixed: number | null }[] = [];
  for (let age = inputs.age + 1; age <= 90; age++) {
    chartData.push({
      age,
      current: currentMap.get(age) ?? null,
      fixed: fixedMap.get(age) ?? null,
    });
  }

  // X-axis: show every 5 years from first multiple-of-5 above current age up to 90
  const xTicks: number[] = [];
  const firstTick = Math.ceil((inputs.age + 1) / 5) * 5;
  for (let t = firstTick; t <= 90; t += 5) xTicks.push(t);

  const depletionAge = results.corpusDepletionAge;
  const yearsEarly = depletionAge ? 90 - depletionAge : 0;

  const fmtY = (v: number) => {
    if (Math.abs(v) >= 10000000) return `₹${(v / 10000000).toFixed(0)}Cr`;
    if (Math.abs(v) >= 100000) return `₹${(v / 100000).toFixed(0)}L`;
    return `₹${(v / 1000).toFixed(0)}K`;
  };

  const phaseLabel = (p: typeof projections[0]) => {
    if (p.isInSIPPhase) return { label: 'SIP', bg: '#F0FDF4', color: 'hsl(158 64% 32%)' };
    if (p.isInWaitingPhase) return { label: 'Growth', bg: '#EFF6FF', color: '#1D4ED8' };
    return { label: 'Withdrawal', bg: '#FFFBEB', color: '#92400E' };
  };

  return (
    <div>
      {/* Depletion annotation — outside the chart canvas, above it */}
      {depletionAge && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#E85D4A' }}>
            ⚠ Corpus depletes at Age {depletionAge}
          </span>
        </div>
      )}

      <div style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="age"
              ticks={xTicks}
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
              domain={[inputs.age + 1, 90]}
              type="number"
            />
            <YAxis tickFormatter={fmtY} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={56} />
            <Tooltip
              formatter={(v: number, name: string) => [fmt(v), name === 'current' ? 'Current plan' : 'If you close the gap']}
              labelFormatter={l => `Age ${l}`}
              contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13 }}
            />
            {depletionAge && (
              <ReferenceLine x={depletionAge} stroke="#E85D4A" strokeDasharray="4 3" strokeOpacity={0.5} />
            )}
            <Line type="monotone" dataKey="current" stroke="#E85D4A" strokeWidth={2} dot={false} name="current" connectNulls={false} />
            <Line type="monotone" dataKey="fixed" stroke="hsl(158 64% 42%)" strokeWidth={2} dot={false} name="fixed" connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#E85D4A', display: 'inline-block' }} />
          <span style={{ fontSize: 13, color: '#6B7280' }}>Current plan</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'hsl(158 64% 42%)', display: 'inline-block' }} />
          <span style={{ fontSize: 13, color: '#6B7280' }}>If you close the gap</span>
        </div>
      </div>
      {depletionAge && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: 20, marginTop: 20 }}>
          <p style={{ fontSize: 14, color: '#991B1B', margin: 0 }}>
            On your current plan, your corpus runs out at age <strong>{depletionAge}</strong> — <strong>{yearsEarly}</strong> years before your life expectancy of 90.
          </p>
        </div>
      )}

      {/* Year-by-year toggle */}
      <button
        onClick={() => setTableOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, marginTop: 20,
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 14, color: '#6B7280', fontFamily: "'Plus Jakarta Sans', sans-serif",
          padding: 0,
        }}
      >
        <span>📊 See year-by-year breakdown</span>
        <ChevronDown style={{
          width: 16, height: 16,
          transform: tableOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.25s ease',
        }} />
      </button>

      <div style={{
        maxHeight: tableOpen ? 480 : 0,
        overflow: tableOpen ? 'auto' : 'hidden',
        transition: 'max-height 0.4s ease',
        marginTop: tableOpen ? 12 : 0,
        borderRadius: 12,
        border: tableOpen ? '1px solid #F3F4F6' : 'none',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif", minWidth: 500 }}>
          <thead>
            <tr style={{ background: '#F3F4F6' }}>
              {['Age', 'Phase', 'Monthly SIP', 'Corpus', 'Return %'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projections.map((p, idx) => {
              const phase = phaseLabel(p);
              return (
                <tr key={p.age} style={{ background: idx % 2 === 0 ? 'white' : '#FAFAF8' }}>
                  <td style={{ padding: '9px 14px', color: '#111827', fontWeight: 500 }}>{p.age}</td>
                  <td style={{ padding: '9px 14px' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100,
                      background: phase.bg, color: phase.color,
                    }}>{phase.label}</span>
                  </td>
                  <td style={{ padding: '9px 14px', color: '#374151' }}>
                    {p.monthlySIP > 0 ? fmt(p.monthlySIP) : p.monthlySWP > 0 ? `−${fmt(p.monthlySWP)}` : '—'}
                  </td>
                  <td style={{ padding: '9px 14px', color: p.expectedCorpus < 0 ? '#E85D4A' : '#111827', fontWeight: 500 }}>
                    {fmt(p.expectedCorpus)}
                  </td>
                  <td style={{ padding: '9px 14px', color: '#6B7280' }}>{p.returnRate.toFixed(1)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <button
          onClick={() => setTableOpen(false)}
          style={{
            display: 'block', width: '100%', padding: '10px 0', background: '#F9FAFB',
            border: 'none', cursor: 'pointer', fontSize: 13, color: '#9CA3AF',
            fontFamily: "'Plus Jakarta Sans', sans-serif", borderTop: '1px solid #F3F4F6',
          }}
        >
          ↑ Hide breakdown
        </button>
      </div>
    </div>
  );
}

// ── Chapter 3: Foundation ────────────────────────────────────────────────
type FoundationStatus = 'yes' | 'no' | null;

function FoundationChapter() {
  const { inputs, results } = useFinancialPlanning();
  const [statuses, setStatuses] = useState<FoundationStatus[]>([null, null, null, null]);

  const setStatus = (i: number, val: FoundationStatus) =>
    setStatuses(s => s.map((v, idx) => idx === i ? val : v));

  const confirmedCount = statuses.filter(s => s === 'yes').length;
  const anyNo = statuses.some(s => s === 'no');
  const allYes = statuses.every(s => s === 'yes');

  if (!inputs || !results) return null;

  const annualIncome = inputs.monthlyIncome * 12;
  const items = [
    {
      icon: '🛡️', name: 'Life Insurance',
      label: `${fmt(annualIncome * 10)} cover`,
      action: 'Learn what cover you need →',
      actionHref: '#',
    },
    {
      icon: '❤️', name: 'Health Insurance',
      label: `${fmt(annualIncome * 0.5)} cover`,
      action: 'Learn what cover you need →',
      actionHref: '#',
    },
    {
      icon: '💰', name: 'Emergency Fund',
      label: `${fmt(inputs.currentMonthlyExpenses * 6)} saved`,
      action: 'How to build an emergency fund →',
      actionHref: '#',
    },
    {
      icon: '📈', name: 'Required SIP',
      label: `${fmt(inputs.sipAmount)} / ${fmt(results.requiredMonthlySIP)} needed`,
      action: 'Start closing this gap →',
      actionHref: '#chapter-next-move',
    },
  ];

  const pillBtn = (i: number, val: 'yes' | 'no', label: string, activeColor: string, activeBg: string, activeBorder: string) => (
    <button
      onClick={() => setStatus(i, val)}
      style={{
        flex: 1, padding: '8px 0', borderRadius: 8, cursor: 'pointer',
        fontSize: 13, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif",
        border: `1.5px solid ${statuses[i] === val ? activeBorder : '#E5E7EB'}`,
        background: statuses[i] === val ? activeBg : 'white',
        color: statuses[i] === val ? activeColor : '#6B7280',
        transition: 'all 0.2s ease',
      }}
    >
      {label}
    </button>
  );

  return (
    <div>
      {/* Progress indicator */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <span style={{
          fontSize: 13, fontWeight: 600, padding: '4px 12px', borderRadius: 100,
          background: allYes ? '#F0FDF4' : '#F3F4F6',
          color: allYes ? 'hsl(158 64% 32%)' : '#374151',
          transition: 'all 0.3s ease',
        }}>
          {confirmedCount} of 4 foundations confirmed
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 16 }}>
        {items.map((item, i) => {
          const s = statuses[i];
          const cardBg = s === 'yes' ? '#F0FDF4' : s === 'no' ? '#FEF2F2' : 'white';
          const cardBorder = s === 'yes' ? '1px solid #86EFAC' : s === 'no' ? '1px solid #FECACA' : '1px solid #F3F4F6';
          const pillText = s === 'yes' ? 'Confirmed ✓' : s === 'no' ? 'Action needed' : 'Not checked';
          const pillBg = s === 'yes' ? '#F0FDF4' : s === 'no' ? '#FEF2F2' : '#F3F4F6';
          const pillColor = s === 'yes' ? 'hsl(158 64% 32%)' : s === 'no' ? '#E85D4A' : '#9CA3AF';

          return (
            <div key={i} style={{
              background: cardBg,
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
              border: cardBorder,
              transition: 'all 0.25s ease',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ fontSize: 24 }}>{item.icon}</span>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100,
                  background: pillBg, color: pillColor, transition: 'all 0.2s ease',
                }}>
                  {pillText}
                </span>
              </div>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{item.name}</p>
              <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>You need {item.label}</p>

              <p style={{ fontSize: 13, color: '#374151', marginBottom: 10 }}>Do you have this in place?</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {pillBtn(i, 'yes', '✓ Yes, I do', 'hsl(158 64% 32%)', '#F0FDF4', '#86EFAC')}
                {pillBtn(i, 'no', '✗ Not yet', '#E85D4A', '#FEF2F2', '#FECACA')}
              </div>

              {s === 'no' && (
                <a
                  href={item.actionHref}
                  style={{
                    display: 'block', marginTop: 12, fontSize: 13, fontWeight: 600,
                    color: 'hsl(158 64% 42%)', textDecoration: 'none',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                  onClick={item.actionHref === '#chapter-next-move' ? (e) => {
                    e.preventDefault();
                    document.getElementById('chapter-next-move')?.scrollIntoView({ behavior: 'smooth' });
                  } : undefined}
                >
                  {item.action}
                </a>
              )}
            </div>
          );
        })}
      </div>

      {allYes && (
        <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 12, padding: '16px 20px' }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#166534', margin: 0 }}>
            ✓ Foundation solid. Now focus on closing your SIP gap.
          </p>
        </div>
      )}
      {anyNo && !allYes && (
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, padding: '16px 20px' }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#92400E', margin: 0 }}>
            ⚠️ Fix your foundation before focusing on the SIP gap. Gaps here can undo your retirement plan.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Inline Lifestyle Panel ────────────────────────────────────────────────
function InlineLifestylePanel() {
  const { inputs, results, lifestyleShift, setLifestyleShift, lifestyleData } = useFinancialPlanning();
  if (!inputs || !results) return null;

  const adjustedExpenses = inputs.currentMonthlyExpenses * (1 + lifestyleShift / 100);
  const ratio = (lifestyleData?.requiredCorpus && results.requiredCorpus)
    ? lifestyleData.requiredCorpus / results.requiredCorpus : 1;
  const requiredSIP = Math.round(results.requiredMonthlySIP * ratio);
  const sipGap = requiredSIP - inputs.sipAmount;

  const presets = [
    { value: -25, label: 'Frugal' },
    { value: 0, label: 'Current' },
    { value: 30, label: 'Comfortable' },
    { value: 70, label: 'Premium' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Slider */}
      <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '20px 20px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Lifestyle adjustment</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'hsl(158 64% 42%)' }}>
            {lifestyleShift >= 0 ? `+${lifestyleShift}%` : `${lifestyleShift}%`}
          </span>
        </div>
        <input
          type="range"
          min={-50}
          max={100}
          step={5}
          value={lifestyleShift}
          onChange={e => setLifestyleShift(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'hsl(158 64% 52%)', marginBottom: 8, cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF' }}>
          <span>−50%</span><span>0%</span><span>+50%</span><span>+100%</span>
        </div>
      </div>

      {/* Quick-select pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {presets.map(p => (
          <button
            key={p.value}
            onClick={() => setLifestyleShift(p.value)}
            style={{
              padding: '6px 16px', borderRadius: 100, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif",
              background: lifestyleShift === p.value ? 'hsl(158 64% 52%)' : '#F3F4F6',
              color: lifestyleShift === p.value ? 'white' : '#374151',
              transition: 'all 0.2s ease',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Result card */}
      <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>Monthly expenses</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{fmt(adjustedExpenses)}</p>
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>Required SIP</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{fmt(requiredSIP)}</p>
          </div>
        </div>
        {sipGap > 0 ? (
          <div style={{ background: '#FEF2F2', borderRadius: 8, padding: '10px 14px' }}>
            <p style={{ fontSize: 13, color: '#991B1B', margin: 0 }}>
              You need <strong>{fmt(sipGap)}/mo more</strong> to sustain this lifestyle.
            </p>
          </div>
        ) : (
          <div style={{ background: '#F0FDF4', borderRadius: 8, padding: '10px 14px' }}>
            <p style={{ fontSize: 13, color: 'hsl(158 64% 32%)', margin: 0 }}>
              Your current SIP covers this lifestyle.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Inline Health Panel ───────────────────────────────────────────────────
function InlineHealthPanel() {
  const { healthCategory, setHealthCategory, healthStressData } = useFinancialPlanning();
  const categories: HealthCategory[] = ['everyday', 'planned', 'highImpact'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Scenario cards — single column */}
      {categories.map(cat => {
        const cost = HEALTH_COSTS[cat];
        const selected = healthCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => setHealthCategory(cat)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              textAlign: 'left', cursor: 'pointer', borderRadius: 12, padding: '14px 16px',
              border: `2px solid ${selected ? 'hsl(158 64% 52%)' : '#E5E7EB'}`,
              background: selected ? '#F0FDF4' : 'white',
              transition: 'all 0.2s ease',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{cost.icon}</span>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 2px' }}>{cost.label}</p>
                <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>{cost.description}</p>
              </div>
            </div>
            {cost.monthly > 0 && (
              <span style={{
                fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 100, flexShrink: 0, marginLeft: 12,
                background: selected ? 'hsl(158 64% 52%)' : '#F3F4F6',
                color: selected ? 'white' : '#6B7280',
                transition: 'all 0.2s ease',
              }}>
                +{fmt(cost.monthly)}/mo
              </span>
            )}
          </button>
        );
      })}

      {/* Result card */}
      {healthStressData && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: 20, marginTop: 4 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>Years lost</p>
              <p style={{ fontSize: 24, fontWeight: 700, color: '#E85D4A', margin: 0 }}>
                {healthStressData.yearsLost}
              </p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>SIP buffer needed</p>
              <p style={{ fontSize: 24, fontWeight: 700, color: '#E85D4A', margin: 0 }}>
                {fmt(HEALTH_COSTS[healthCategory].monthly)}/mo
              </p>
            </div>
          </div>
          {HEALTH_COSTS[healthCategory].monthly > 0 && (
            <p style={{ fontSize: 13, color: '#991B1B', margin: 0 }}>
              Add <strong>{fmt(HEALTH_COSTS[healthCategory].monthly)}/mo</strong> to your SIP as a buffer against this scenario.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Chapter 4: Stress Test ────────────────────────────────────────────────
function StressTestChapter() {
  const [openPanel, setOpenPanel] = useState<'lifestyle' | 'health' | null>(null);

  const toggle = (panel: 'lifestyle' | 'health') =>
    setOpenPanel(prev => prev === panel ? null : panel);

  const cardBase: React.CSSProperties = {
    background: 'white',
    borderRadius: 16,
    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
    overflow: 'hidden',
  };

  const runBtnStyle: React.CSSProperties = {
    background: 'none', border: '1.5px solid hsl(158 64% 52%)', borderRadius: 10,
    padding: '10px 20px', cursor: 'pointer', color: 'hsl(158 64% 42%)',
    fontSize: 14, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif",
    transition: 'all 0.2s ease',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Lifestyle card */}
      <div style={cardBase}>
        <div style={{ padding: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>💰</span>
            <div>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 4 }}>Lifestyle Creep</p>
              <p style={{ fontSize: 14, color: '#6B7280' }}>What if your expenses are 30% higher in retirement than you planned?</p>
            </div>
          </div>
          {openPanel === 'lifestyle' && (
            <button onClick={() => setOpenPanel(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', flexShrink: 0, padding: 4 }}>
              <X style={{ width: 16, height: 16 }} />
            </button>
          )}
        </div>
        {openPanel !== 'lifestyle' && (
          <div style={{ padding: '0 24px 24px' }}>
            <button onClick={() => toggle('lifestyle')} style={runBtnStyle}>
              Test My Lifestyle Risk →
            </button>
          </div>
        )}
        <div style={{
          maxHeight: openPanel === 'lifestyle' ? 900 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.4s ease',
          padding: openPanel === 'lifestyle' ? '0 24px 24px' : '0 24px',
        }}>
          {openPanel === 'lifestyle' && <InlineLifestylePanel />}
        </div>
      </div>

      {/* Health card */}
      <div style={cardBase}>
        <div style={{ padding: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>❤️</span>
            <div>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 4 }}>A Health Shock</p>
              <p style={{ fontSize: 14, color: '#6B7280' }}>What if a major medical event costs you ₹20L and 2 years of income?</p>
            </div>
          </div>
          {openPanel === 'health' && (
            <button onClick={() => setOpenPanel(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', flexShrink: 0, padding: 4 }}>
              <X style={{ width: 16, height: 16 }} />
            </button>
          )}
        </div>
        {openPanel !== 'health' && (
          <div style={{ padding: '0 24px 24px' }}>
            <button onClick={() => toggle('health')} style={runBtnStyle}>
              Test My Health Risk →
            </button>
          </div>
        )}
        <div style={{
          maxHeight: openPanel === 'health' ? 900 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.4s ease',
          padding: openPanel === 'health' ? '0 24px 24px' : '0 24px',
        }}>
          {openPanel === 'health' && <InlineHealthPanel />}
        </div>
      </div>
    </div>
  );
}

// ── Sprint Waitlist Modal ─────────────────────────────────────────────────
function SprintModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email ?? '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await supabase.from('sprint_waitlist').insert({
        email: email.trim(),
        user_id: user?.id ?? null,
      });
      setSuccess(true);
    } catch {
      // silently ignore — show success anyway
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: 20, padding: 36, maxWidth: 420, width: '100%',
          boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
        >
          <X style={{ width: 18, height: 18 }} />
        </button>

        {success ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🎉</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>You're on the list!</h3>
            <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>
              We'll reach out when your 1-month sprint is ready to start.
            </p>
            <button
              onClick={onClose}
              style={{
                marginTop: 24, background: 'hsl(158 64% 42%)', color: 'white',
                border: 'none', borderRadius: 10, padding: '12px 28px', fontWeight: 600, fontSize: 14,
                cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Start My 1-Month Sprint</h3>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24, lineHeight: 1.6 }}>
              Try investing the extra SIP amount for one month. No long-term commitment. We'll send you a reminder when it's time to start.
            </p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{
                  border: '2px solid #E5E7EB', borderRadius: 10, padding: '12px 16px',
                  fontSize: 15, outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: 'border-color 0.2s ease', color: '#111827',
                }}
                onFocus={e => (e.target.style.borderColor = 'hsl(158 64% 52%)')}
                onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
              />
              <button
                type="submit"
                disabled={loading || !email.trim()}
                style={{
                  background: 'hsl(158 64% 42%)', color: 'white', border: 'none', borderRadius: 10,
                  padding: '14px 20px', fontWeight: 600, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif", opacity: loading ? 0.7 : 1,
                  transition: 'opacity 0.2s ease',
                }}
              >
                {loading ? 'Saving...' : 'Join the Sprint →'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ── Chapter 5: Next Move ──────────────────────────────────────────────────
function NextMoveChapter() {
  const { inputs, results } = useFinancialPlanning();
  const [sprintOpen, setSprintOpen] = useState(false);
  const [sprintHovered, setSprintHovered] = useState(false);
  if (!inputs || !results) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <SprintModal open={sprintOpen} onClose={() => setSprintOpen(false)} />

      {/* Primary CTA card */}
      <div style={{
        background: 'hsl(158 64% 42%)',
        borderRadius: 20,
        padding: '36px 32px',
        maxWidth: 560,
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 8px 32px hsl(158 64% 42% / 0.25)',
      }}>
        <p style={{ fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 12, lineHeight: 1.3 }}>
          Talk to an advisor about your plan
        </p>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', marginBottom: 28, lineHeight: 1.65 }}>
          You've seen your gap. Book 30 minutes with a wealth manager who will look at your specific numbers and tell you exactly what to do.
        </p>
        <button
          onClick={() => window.location.href = '/dashboard/book-wealth-manager'}
          style={{
            background: 'white', color: 'hsl(158 64% 32%)', border: 'none', borderRadius: 12,
            padding: '15px 24px', fontWeight: 700, fontSize: 16, cursor: 'pointer',
            fontFamily: "'Plus Jakarta Sans', sans-serif", width: '100%',
            transition: 'all 0.2s ease', marginBottom: 16,
          }}
        >
          Book a Free 30-Min Session →
        </button>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: 0 }}>
          ⭐ Free session. No obligation. No spam.
        </p>
      </div>

      {/* Secondary sprint link */}
      <button
        onClick={() => setSprintOpen(true)}
        onMouseEnter={() => setSprintHovered(true)}
        onMouseLeave={() => setSprintHovered(false)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 14, color: '#6B7280', fontFamily: "'Plus Jakarta Sans', sans-serif",
          textDecoration: sprintHovered ? 'underline' : 'none',
          transition: 'color 0.2s ease',
          padding: 0,
        }}
      >
        Prefer to track this yourself? Join the Sprint waitlist →
      </button>

      <p style={{ fontSize: 12, color: '#D1D5DB', margin: 0 }}>
        Educational platform. No investment advice provided. All transactions via authorised partners.
      </p>
    </div>
  );
}

// ── Sticky Progress Nav ───────────────────────────────────────────────────
const CHAPTERS = ['Score', 'Gap', 'Foundation', 'Stress Test', 'Next Step'] as const;
const CHAPTERS_SHORT = ['Score', 'Gap', 'Foundation', 'Stress', 'Next Step'] as const;

function StickyNav({ activeChapter, refs }: { activeChapter: number; refs: React.RefObject<HTMLElement | null>[] }) {
  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'white',
      borderBottom: '1px solid #F3F4F6',
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-evenly',
    }}>
      {CHAPTERS.map((label, i) => {
        const active = i === activeChapter;
        return (
          <button
            key={i}
            onClick={() => refs[i]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              background: 'none', border: 'none', cursor: 'pointer', padding: 0, flex: '1 1 0',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            {/* Desktop dot: 10px filled or grey outline */}
            <span className="hidden sm:block" style={{
              width: 10, height: 10, borderRadius: '50%',
              background: active ? 'hsl(158 64% 52%)' : 'transparent',
              border: active ? 'none' : '1.5px solid #D1D5DB',
              flexShrink: 0,
              transition: 'background 0.3s ease, border 0.3s ease',
            }} />
            {/* Mobile dot: 8px filled or grey outline */}
            <span className="block sm:hidden" style={{
              width: 8, height: 8, borderRadius: '50%',
              background: active ? 'hsl(158 64% 52%)' : 'transparent',
              border: active ? 'none' : '1.5px solid #D1D5DB',
              flexShrink: 0,
              transition: 'background 0.3s ease, border 0.3s ease',
            }} />
            {/* Desktop label: full text, 12px */}
            <span className="hidden sm:block" style={{
              fontSize: 12, fontWeight: active ? 600 : 400,
              color: active ? 'hsl(158 64% 32%)' : '#9CA3AF',
              whiteSpace: 'nowrap',
              transition: 'color 0.3s ease',
            }}>
              {label}
            </span>
            {/* Mobile label: shortened, 10px */}
            <span className="block sm:hidden" style={{
              fontSize: 10, fontWeight: active ? 600 : 400,
              color: active ? 'hsl(158 64% 32%)' : '#9CA3AF',
              whiteSpace: 'nowrap',
              transition: 'color 0.3s ease',
            }}>
              {CHAPTERS_SHORT[i]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Main FFR Content ──────────────────────────────────────────────────────
function FFRContent() {
  const { inputs, results, projections, isLoading, hasCalculated, setInputs } = useFinancialPlanning();
  const { checklist } = useFFR(inputs && results ? { inputs, results } : undefined);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editedInputs, setEditedInputs] = useState<CalculatorInputs | null>(null);
  const [activeChapter, setActiveChapter] = useState(0);

  const chapterRefs = [
    useRef<HTMLElement | null>(null),
    useRef<HTMLElement | null>(null),
    useRef<HTMLElement | null>(null),
    useRef<HTMLElement | null>(null),
    useRef<HTMLElement | null>(null),
  ];

  useEffect(() => {
    // Fire when section top enters top 25% of viewport — reliable for sequential sections
    const observers = chapterRefs.map((ref, i) => {
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveChapter(i); },
        { threshold: 0, rootMargin: '0px 0px -75% 0px' }
      );
      if (ref.current) observer.observe(ref.current);
      return observer;
    });
    return () => observers.forEach(o => o.disconnect());
  }, [hasCalculated]);

  const handleOpenEdit = () => {
    setEditedInputs({ ...(inputs || defaultInputs) });
    setIsEditOpen(true);
  };

  const handleCalculate = async () => {
    if (!editedInputs) return;
    await setInputs(editedInputs);
    setIsEditOpen(false);
    toast.success('Plan updated');
  };

  // scrollMarginTop accounts for sticky nav (~50px) + compact header (~56px)
  const sectionStyle: React.CSSProperties = {
    paddingTop: 48,
    paddingBottom: 48,
    scrollMarginTop: 110,
  };

  const headingStyle: React.CSSProperties = {
    fontSize: 20,
    fontWeight: 700,
    color: '#111827',
    marginBottom: 8,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  };

  const subStyle: React.CSSProperties = {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 24,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAFAF8', padding: 24 }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 80, background: '#F3F4F6', borderRadius: 12, marginBottom: 16, animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      </div>
    );
  }

  const editBtn = (
    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={handleOpenEdit} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Settings2 style={{ width: 14, height: 14 }} />
          {hasCalculated ? 'Edit Inputs' : 'Enter Inputs'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit Financial Plan</DialogTitle></DialogHeader>
        <div style={{ marginTop: 16 }}>
          {editedInputs && (
            <TimelineCalculatorForm
              inputs={editedInputs}
              onInputChange={setEditedInputs}
              onCalculate={handleCalculate}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <StickyNav activeChapter={activeChapter} refs={chapterRefs as any} />

      {/* Fix 2: Compact header row — directly below sticky nav */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #F3F4F6',
        position: 'sticky',
        top: 50, // just below the nav (~50px tall)
        zIndex: 40,
      }}>
        <div style={{
          maxWidth: 900, margin: '0 auto', padding: '16px 20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#111827', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Financial Freedom Dashboard
          </span>
          {editBtn}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px' }}>

        {/* Chapter 1 — Score */}
        <section ref={chapterRefs[0] as any} style={sectionStyle}>
          {hasCalculated && inputs && results && projections.length > 0 ? (
            <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <FFRScoreCard inputs={inputs} results={results} projections={projections} checklist={checklist} />
              <FFRScoreBreakdown inputs={inputs} results={results} projections={projections} checklist={checklist} />
            </div>
          ) : (
            <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', padding: 40, textAlign: 'center' }}>
              <p style={{ color: '#9CA3AF', fontSize: 15, marginBottom: 16 }}>No plan yet. Enter your details to get started.</p>
              {editBtn}
            </div>
          )}
        </section>

        {/* Chapter 2 — Gap */}
        {hasCalculated && inputs && results && (
          <section ref={chapterRefs[1] as any} style={{ ...sectionStyle, borderTop: '1px solid #F3F4F6' }}>
            <h2 style={headingStyle}>What happens if nothing changes</h2>
            <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', padding: 24 }}>
              <GapChart />
            </div>
          </section>
        )}

        {/* Chapter 3 — Foundation */}
        {hasCalculated && inputs && results && (
          <section ref={chapterRefs[2] as any} style={{ ...sectionStyle, borderTop: '1px solid #F3F4F6' }}>
            <h2 style={headingStyle}>Before fixing your gap, make sure your base is solid.</h2>
            <p style={subStyle}>These four things protect everything else you build.</p>
            <FoundationChapter />
          </section>
        )}

        {/* Chapter 4 — Stress Test */}
        {hasCalculated && inputs && results && (
          <section ref={chapterRefs[3] as any} style={{ ...sectionStyle, borderTop: '1px solid #F3F4F6' }}>
            <h2 style={headingStyle}>What could derail your plan?</h2>
            <p style={subStyle}>Two things kill most retirement plans. Test yours against both.</p>
            <StressTestChapter />
          </section>
        )}

        {/* Chapter 5 — Next Move */}
        {hasCalculated && inputs && results && (
          <section id="chapter-next-move" ref={chapterRefs[4] as any} style={{ ...sectionStyle, borderTop: '1px solid #F3F4F6' }}>
            <h2 style={headingStyle}>Your next move</h2>
            <p style={subStyle}>One action closes the gap. Choose your pace.</p>
            <NextMoveChapter />
          </section>
        )}
      </div>
    </div>
  );
}

export default function UnifiedFFRPage() {
  return (
    <FinancialPlanningProvider>
      <FFRContent />
    </FinancialPlanningProvider>
  );
}
