import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Settings2 } from 'lucide-react';
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
import { useFFR } from '@/hooks/useFFR';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Label,
} from 'recharts';
import { LifestylePlannerTab } from '@/components/financial-planning/lifestyle-planner/LifestylePlannerTab';
import { HealthStressTab } from '@/components/financial-planning/health-stress/HealthStressTab';

// ── helpers ──────────────────────────────────────────────────────────────
const fmt = (v: number) => {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${Math.round(v).toLocaleString('en-IN')}`;
};

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
  const maxYears = Math.min(90 - inputs.age, inputs.lifeExpectancy - inputs.age);
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
    if (corpus <= 0 && isSWP) break;
  }
  return rows;
}

// ── Chapter 2: Gap Chart ─────────────────────────────────────────────────
function GapChart() {
  const { inputs, results, projections } = useFinancialPlanning();
  if (!inputs || !results) return null;

  const currentData = projections.map(p => ({ age: p.age, current: p.expectedCorpus }));

  const fixedInputs = { ...inputs, sipAmount: Math.max(inputs.sipAmount, results.requiredMonthlySIP) };
  const fixedRaw = generateProjections(fixedInputs);
  const fixedMap = new Map(fixedRaw.map(r => [r.age, r.corpus]));

  const chartData = currentData.map(d => ({
    age: d.age,
    current: d.current,
    fixed: fixedMap.get(d.age) ?? null,
  }));

  const depletionAge = results.corpusDepletionAge;
  const yearsEarly = depletionAge ? inputs.lifeExpectancy - depletionAge : 0;

  const fmtY = (v: number) => {
    if (Math.abs(v) >= 10000000) return `₹${(v / 10000000).toFixed(0)}Cr`;
    if (Math.abs(v) >= 100000) return `₹${(v / 100000).toFixed(0)}L`;
    return `₹${(v / 1000).toFixed(0)}K`;
  };

  return (
    <div>
      <div style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <XAxis dataKey="age" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmtY} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={56} />
            <Tooltip
              formatter={(v: number, name: string) => [fmt(v), name === 'current' ? 'Current plan' : 'If you close the gap']}
              labelFormatter={l => `Age ${l}`}
              contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13 }}
            />
            {depletionAge && (
              <ReferenceLine x={depletionAge} stroke="#E85D4A" strokeDasharray="4 3" strokeOpacity={0.7}>
                <Label value={`Money runs out — Age ${depletionAge}`} position="top" fill="#E85D4A" fontSize={11} />
              </ReferenceLine>
            )}
            <Line type="monotone" dataKey="current" stroke="#E85D4A" strokeWidth={2} dot={false} name="current" />
            <Line type="monotone" dataKey="fixed" stroke="hsl(158 64% 42%)" strokeWidth={2} dot={false} name="fixed" />
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
    </div>
  );
}

// ── Chapter 3: Foundation ────────────────────────────────────────────────
function FoundationChapter() {
  const { inputs, results } = useFinancialPlanning();
  const [checked, setChecked] = useState<boolean[]>([false, false, false, false]);

  const toggle = (i: number) => setChecked(c => c.map((v, idx) => idx === i ? !v : v));
  const allChecked = checked.every(Boolean);

  if (!inputs || !results) return null;

  const annualIncome = inputs.monthlyIncome * 12;
  const items = [
    { icon: '🛡️', name: 'Life Insurance', need: annualIncome * 10, label: `${fmt(annualIncome * 10)} cover` },
    { icon: '❤️', name: 'Health Insurance', need: annualIncome * 0.5, label: `${fmt(annualIncome * 0.5)} cover` },
    { icon: '💰', name: 'Emergency Fund', need: inputs.currentMonthlyExpenses * 6, label: `${fmt(inputs.currentMonthlyExpenses * 6)} saved` },
    {
      icon: '📈', name: 'Required SIP',
      need: results.requiredMonthlySIP,
      label: `${fmt(inputs.sipAmount)} / ${fmt(results.requiredMonthlySIP)} needed`,
    },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 16 }}>
        {items.map((item, i) => (
          <div key={i} style={{
            background: 'white',
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
            border: checked[i] ? '2px solid hsl(158 64% 52% / 0.4)' : '2px solid transparent',
            transition: 'border-color 0.2s ease',
            position: 'relative',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <span style={{ fontSize: 24 }}>{item.icon}</span>
              <span style={{
                fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 100,
                background: checked[i] ? '#F0FDF4' : '#FEF2F2',
                color: checked[i] ? 'hsl(158 64% 32%)' : '#E85D4A',
                transition: 'all 0.2s ease',
              }}>
                {checked[i] ? 'Confirmed' : 'Not confirmed'}
              </span>
            </div>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{item.name}</p>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>You need {item.label}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => toggle(i)}
                style={{
                  width: 24, height: 24, borderRadius: 6,
                  border: `2px solid ${checked[i] ? 'hsl(158 64% 52%)' : '#D1D5DB'}`,
                  background: checked[i] ? 'hsl(158 64% 52%)' : 'white',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  color: 'white', fontSize: 14, fontWeight: 700,
                }}
              >
                {checked[i] ? '✓' : ''}
              </button>
            </div>
          </div>
        ))}
      </div>
      {allChecked && (
        <div style={{
          background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 12, padding: '16px 20px',
          animation: 'fadeIn 0.4s ease',
        }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#166534', margin: 0 }}>
            ✓ Foundation solid. Now focus on closing your SIP gap.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Chapter 4: Stress Test ────────────────────────────────────────────────
function StressTestChapter() {
  const [lifestyleOpen, setLifestyleOpen] = useState(false);
  const [healthOpen, setHealthOpen] = useState(false);

  const cardStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: 16,
    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
    overflow: 'hidden',
  };

  const headerStyle: React.CSSProperties = {
    padding: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
      {/* Lifestyle */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>💰</span>
            <div>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 4 }}>Lifestyle Scenarios</p>
              <p style={{ fontSize: 14, color: '#6B7280' }}>What if you want a premium retirement?</p>
            </div>
          </div>
          {lifestyleOpen && (
            <button onClick={() => setLifestyleOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#9CA3AF', flexShrink: 0 }}>Close</button>
          )}
        </div>
        {!lifestyleOpen && (
          <div style={{ padding: '0 24px 24px' }}>
            <button
              onClick={() => setLifestyleOpen(true)}
              style={{
                background: 'none', border: '1.5px solid hsl(158 64% 52%)', borderRadius: 10,
                padding: '10px 20px', cursor: 'pointer', color: 'hsl(158 64% 42%)',
                fontSize: 14, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif",
                transition: 'all 0.2s ease',
              }}
            >
              Run Lifestyle Test →
            </button>
          </div>
        )}
        <div style={{
          maxHeight: lifestyleOpen ? 2000 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.4s ease',
          padding: lifestyleOpen ? '0 24px 24px' : '0 24px',
        }}>
          {lifestyleOpen && <LifestylePlannerTab />}
        </div>
      </div>

      {/* Health */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>❤️</span>
            <div>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 4 }}>Health Impact Test</p>
              <p style={{ fontSize: 14, color: '#6B7280' }}>What if a major health event hits your plan?</p>
            </div>
          </div>
          {healthOpen && (
            <button onClick={() => setHealthOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#9CA3AF', flexShrink: 0 }}>Close</button>
          )}
        </div>
        {!healthOpen && (
          <div style={{ padding: '0 24px 24px' }}>
            <button
              onClick={() => setHealthOpen(true)}
              style={{
                background: 'none', border: '1.5px solid hsl(158 64% 52%)', borderRadius: 10,
                padding: '10px 20px', cursor: 'pointer', color: 'hsl(158 64% 42%)',
                fontSize: 14, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif",
                transition: 'all 0.2s ease',
              }}
            >
              Run Health Test →
            </button>
          </div>
        )}
        <div style={{
          maxHeight: healthOpen ? 2000 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.4s ease',
          padding: healthOpen ? '0 24px 24px' : '0 24px',
        }}>
          {healthOpen && <HealthStressTab />}
        </div>
      </div>
    </div>
  );
}

// ── Chapter 5: Next Move ──────────────────────────────────────────────────
function NextMoveChapter() {
  const { inputs, results } = useFinancialPlanning();
  if (!inputs || !results) return null;

  const sipGap = Math.max(0, results.requiredMonthlySIP - inputs.sipAmount);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
        {/* Sprint */}
        <div style={{
          background: 'hsl(158 64% 42%)',
          borderRadius: 16,
          padding: 28,
          color: 'white',
        }}>
          <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Start closing the gap yourself</p>
          <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 24, lineHeight: 1.6 }}>
            Try investing {fmt(sipGap)} more this month. One month only. No long-term commitment.
          </p>
          <button
            style={{
              background: 'white', color: 'hsl(158 64% 32%)', border: 'none', borderRadius: 10,
              padding: '12px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif", width: '100%',
              transition: 'all 0.2s ease',
            }}
          >
            Start My 1-Month Trial →
          </button>
        </div>

        {/* Elevate */}
        <div style={{
          background: 'white',
          border: '2px solid hsl(158 64% 52%)',
          borderRadius: 16,
          padding: 28,
        }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Talk to an advisor first</p>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24, lineHeight: 1.6 }}>
            30 minutes. Free. No obligation. See your plan with expert eyes.
          </p>
          <button
            onClick={() => window.location.href = '/dashboard/book-wealth-manager'}
            style={{
              background: 'hsl(158 64% 42%)', color: 'white', border: 'none', borderRadius: 10,
              padding: '12px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif", width: '100%',
              transition: 'all 0.2s ease',
            }}
          >
            Book a Free 30-Min Session →
          </button>
        </div>
      </div>

      <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center' }}>
        Educational platform. No investment advice provided. All transactions via authorised partners.
      </p>
    </div>
  );
}

// ── Sticky Progress Nav ───────────────────────────────────────────────────
const CHAPTERS = ['Score', 'Gap', 'Foundation', 'Stress Test', 'Next Step'] as const;

function StickyNav({ activeChapter, refs }: { activeChapter: number; refs: React.RefObject<HTMLElement | null>[] }) {
  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      background: 'rgba(250,250,248,0.95)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid #F3F4F6',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
    }}>
      {CHAPTERS.map((label, i) => {
        const active = i <= activeChapter;
        return (
          <button
            key={i}
            onClick={() => refs[i]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            <span style={{
              width: 10, height: 10, borderRadius: '50%',
              background: active ? 'hsl(158 64% 52%)' : '#D1D5DB',
              transition: 'background 0.3s ease',
            }} />
            <span style={{ fontSize: 10, fontWeight: 500, color: active ? 'hsl(158 64% 32%)' : '#9CA3AF', whiteSpace: 'nowrap' }}>
              {label}
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
    const observers = chapterRefs.map((ref, i) => {
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveChapter(i); },
        { threshold: 0.3 }
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

  const sectionStyle: React.CSSProperties = {
    paddingTop: 48,
    paddingBottom: 48,
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
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
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

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 16px' }}>

        {/* Chapter 1 — Score */}
        <section ref={chapterRefs[0] as any} style={sectionStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <h1 style={{ ...headingStyle, fontSize: 24, margin: 0 }}>Your Financial Freedom Dashboard</h1>
            {editBtn}
          </div>

          {hasCalculated && inputs && results && projections.length > 0 ? (
            <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', padding: 24 }}>
              <FFRScoreCard inputs={inputs} results={results} projections={projections} checklist={checklist} />
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
            <h2 style={headingStyle}>Stress test your plan</h2>
            <p style={subStyle}>See how different scenarios affect your retirement.</p>
            <StressTestChapter />
          </section>
        )}

        {/* Chapter 5 — Next Move */}
        {hasCalculated && inputs && results && (
          <section ref={chapterRefs[4] as any} style={{ ...sectionStyle, borderTop: '1px solid #F3F4F6' }}>
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
