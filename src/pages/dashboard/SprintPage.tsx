import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Clock } from 'lucide-react';
import ComfortLevelScale from '@/components/sprint/ComfortLevelScale';
import SprintSummaryCardRow from '@/components/sprint/SprintSummaryCardRow';
import { useSprints, type Sprint, type SprintReflection } from '@/hooks/useSprints';
import {
  FinancialPlanningProvider,
  useFinancialPlanning,
} from '@/components/financial-planning/context/FinancialPlanningContext';

// ── constants ─────────────────────────────────────────────────────────────────

const DARK_BG = '#0D2818';
const GREEN   = '#06A969';

const COMPONENT_META: Record<Sprint['score_component'], { label: string; preview: string }> = {
  corpus_progress: {
    label: 'Increase my SIP',
    preview: 'Completing this sprint could move your Corpus Progress from amber to green — directly increasing your FFR score.',
  },
  time_buffer: {
    label: 'Retire earlier',
    preview: 'Completing this sprint could add up to 10 points to your Time Buffer score.',
  },
  essentials_coverage: {
    label: 'Get protected',
    preview: 'Completing this sprint could move your Essentials Coverage from 0/20 to 15/20 — adding 15 points to your FFR score.',
  },
  lifestyle_sustainability: {
    label: 'Fix my withdrawal plan',
    preview: 'Completing this sprint could move your Lifestyle Sustainability from 0/10 to 10/10.',
  },
  savings_rate: {
    label: 'Improve savings rate',
    preview: 'Completing this sprint could improve your savings rate and increase your FFR score.',
  },
};

const COMPONENT_MONTHS: Record<Sprint['score_component'], number> = {
  corpus_progress:       6,
  time_buffer:          12,
  savings_rate:          4,
  essentials_coverage:   3,
  lifestyle_sustainability: 2,
};

const COMPONENT_KEYS = Object.keys(COMPONENT_META) as Sprint['score_component'][];

// ── inner component ───────────────────────────────────────────────────────────

function SprintPageContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getActiveSprint, startSprint, completeSprint, abandonSprint, addReflection, getReflections } = useSprints();
  const { inputs, hasCalculated } = useFinancialPlanning();

  const scoreComponent = searchParams.get('component') as Sprint['score_component'] | null;

  const [loading, setLoading]               = useState(true);
  const [activeSprint, setActiveSprint]     = useState<Sprint | null>(null);
  const [reflections, setReflections]       = useState<SprintReflection[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<Sprint['score_component'] | null>(scoreComponent);

  // Start sprint form
  const [sipAmount, setSipAmount]   = useState('');
  const [starting, setStarting]     = useState(false);

  // Reflection form
  const [comfortLevel, setComfortLevel]         = useState<number | null>(null);
  const [reflectionText, setReflectionText]     = useState('');
  const [savingReflection, setSavingReflection] = useState(false);
  const [completing, setCompleting]             = useState(false);
  const [abandoning, setAbandoning]             = useState(false);

  // Retirement date (same computation as DashboardHome)
  const retirementYear = hasCalculated && inputs
    ? new Date().getFullYear() + inputs.yearsForSIP + inputs.waitingYearsBeforeSWP
    : null;
  const retirementLabel = retirementYear ? `January ${retirementYear}` : null;

  async function refresh() {
    setLoading(true);
    const { data: sprint } = await getActiveSprint();
    setActiveSprint(sprint);
    if (sprint) {
      const { data: refs } = await getReflections(sprint.id);
      setReflections(refs);
    } else {
      setReflections([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleStart() {
    if (!selectedComponent) return;
    setStarting(true);
    const amount = parseFloat(sipAmount);
    await startSprint(selectedComponent, 'monthly', isNaN(amount) ? undefined : amount);
    await refresh();
    setStarting(false);
  }

  async function handleSaveReflection(phase: 'midpoint' | 'completion') {
    if (!activeSprint || comfortLevel === null) return;
    setSavingReflection(true);
    await addReflection(activeSprint.id, phase, comfortLevel, reflectionText || undefined);
    await refresh();
    setComfortLevel(null);
    setReflectionText('');
    setSavingReflection(false);
  }

  async function handleComplete() {
    if (!activeSprint || comfortLevel === null) return;
    setCompleting(true);
    await completeSprint(activeSprint.id);
    await addReflection(activeSprint.id, 'completion', comfortLevel, reflectionText || undefined);
    navigate('/dashboard/ffr');
  }

  async function handleAbandon() {
    if (!activeSprint) return;
    setAbandoning(true);
    await abandonSprint(activeSprint.id);
    navigate('/dashboard/ffr');
  }

  // Derived sprint progress
  const daysElapsed  = activeSprint
    ? Math.floor((Date.now() - new Date(activeSprint.started_at).getTime()) / 86400000)
    : 0;
  const daysRemaining = Math.max(0, 30 - daysElapsed);
  const progressPct   = Math.min(100, Math.round((daysElapsed / 30) * 100));

  const hasMidpoint   = reflections.some(r => r.phase === 'midpoint');
  const hasCompletion = reflections.some(r => r.phase === 'completion');
  const showMidpoint  = daysElapsed >= 15 && !hasMidpoint;
  const showCompletion = daysElapsed >= 30 && !hasCompletion;

  // Active sprint meta lookup (preserving original trim/replace guard)
  const activeKey = activeSprint?.score_component?.trim().replace(/\.$/, '') as Sprint['score_component'];
  const activeMeta   = COMPONENT_META[activeKey] ?? { label: 'Your Sprint', preview: '' };
  const activeMonths = COMPONENT_MONTHS[activeKey] ?? 0;

  // ── Retirement Clock card (always shown) ──────────────────────────────────
  const clockCard = (
    <div
      className="rounded-2xl p-8 relative overflow-hidden"
      style={{ background: DARK_BG }}
    >
      <Clock
        className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none select-none"
        style={{ width: 100, height: 100, color: 'rgba(255,255,255,0.06)' }}
      />
      <p
        className="text-xs font-semibold tracking-widest uppercase mb-4"
        style={{ color: 'rgba(134,239,172,0.75)' }}
      >
        Your retirement date
      </p>
      {retirementLabel ? (
        <>
          <p
            className="text-5xl font-black text-white leading-tight mb-3"
            style={{ letterSpacing: '-0.02em' }}
          >
            {retirementLabel}
          </p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Every action you take moves this date closer
          </p>
        </>
      ) : (
        <>
          <p className="text-xl font-semibold text-white mb-3 max-w-xs leading-snug">
            Set up your financial plan to see your retirement date.
          </p>
          <a
            href="/dashboard/ffr"
            className="text-sm font-semibold hover:underline"
            style={{ color: GREEN }}
          >
            Set up your plan →
          </a>
        </>
      )}
    </div>
  );

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="max-w-xl mx-auto px-4 py-10 flex flex-col gap-6"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {clockCard}
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">Loading your sprint...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="max-w-xl mx-auto px-4 py-10 flex flex-col gap-6"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* ── Retirement Clock ─────────────────────────────────────────────── */}
      {clockCard}

      {/* ── No active sprint: pick an action ─────────────────────────────── */}
      {!activeSprint && (
        <>
          <div>
            <h2 className="text-xl font-bold text-foreground">Accelerate your retirement date</h2>
            <p className="text-sm text-muted-foreground mt-1">Pick one commitment to focus on this month.</p>
          </div>

          {/* Option cards */}
          <div className="flex flex-col gap-3">
            {COMPONENT_KEYS.map((key) => {
              const meta   = COMPONENT_META[key];
              const months = COMPONENT_MONTHS[key];
              const isSelected = selectedComponent === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedComponent(key)}
                  className={`text-left w-full p-5 rounded-2xl border-2 transition-all duration-150 ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <p className="font-semibold text-foreground">{meta.label}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{meta.preview}</p>
                    </div>
                    <span
                      className="text-xs font-semibold whitespace-nowrap px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{ background: '#F0FDF4', color: GREEN }}
                    >
                      ~{months}mo earlier
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* SIP commitment form — revealed when an option is selected */}
          {selectedComponent && (
            <Card className="border-primary/20 shadow-sm">
              <CardContent className="pt-6 pb-6 space-y-4">
                <p className="text-sm font-semibold text-foreground">
                  Commit to: <span className="text-primary">{COMPONENT_META[selectedComponent].label}</span>
                </p>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    How much will you commit to SIP this month? ₹
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={sipAmount}
                    onChange={e => setSipAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <Button
                  onClick={handleStart}
                  disabled={starting || !sipAmount}
                  className="w-full"
                >
                  {starting ? 'Starting...' : 'Start this commitment →'}
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* ── Active sprint ─────────────────────────────────────────────────── */}
      {activeSprint && (
        <>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
              You are working on
            </p>
            <h2 className="text-xl font-bold text-foreground">{activeMeta.label}</h2>
            {activeMonths > 0 && (
              <p className="text-sm mt-1" style={{ color: GREEN }}>
                Potential date improvement: ~{activeMonths} months earlier
              </p>
            )}
          </div>

          <SprintSummaryCardRow
            startDate={activeSprint.started_at}
            endDate={activeSprint.ends_at}
            sipAmount={activeSprint.sip_amount_committed}
            status="In Progress"
          />

          {/* Progress bar */}
          <Card className="border-border shadow-sm">
            <CardContent className="pt-5 pb-5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">Day {daysElapsed} of 30</span>
                <span className="text-muted-foreground">{daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Midpoint reflection */}
          {showMidpoint && (
            <Card className="border-amber-400/40 shadow-sm">
              <CardContent className="pt-5 pb-5 space-y-4">
                <h2 className="text-base font-semibold text-foreground">How is it going?</h2>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Comfort level</label>
                  <ComfortLevelScale value={comfortLevel} onChange={setComfortLevel} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Reflection</label>
                  <Textarea
                    value={reflectionText}
                    onChange={e => setReflectionText(e.target.value)}
                    placeholder="What's working? What's hard?"
                    rows={3}
                  />
                </div>
                <Button
                  onClick={() => handleSaveReflection('midpoint')}
                  disabled={savingReflection || comfortLevel === null}
                  className="w-full"
                >
                  {savingReflection ? 'Saving...' : 'Save reflection'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Completion reflection */}
          {showCompletion && (
            <Card className="border-primary/30 shadow-sm">
              <CardContent className="pt-5 pb-5 space-y-4">
                <h2 className="text-base font-semibold text-foreground">Sprint complete — how did it go?</h2>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Comfort level</label>
                  <ComfortLevelScale value={comfortLevel} onChange={setComfortLevel} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Reflection</label>
                  <Textarea
                    value={reflectionText}
                    onChange={e => setReflectionText(e.target.value)}
                    placeholder="Did you stick to your commitment? What did you learn?"
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleComplete}
                  disabled={completing || comfortLevel === null}
                  className="w-full"
                >
                  {completing ? 'Completing...' : 'Complete my sprint'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Abandon */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={handleAbandon}
              disabled={abandoning}
              className="text-xs text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
            >
              {abandoning ? 'Abandoning...' : 'Abandon sprint'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────

export default function SprintPage() {
  return (
    <FinancialPlanningProvider>
      <SprintPageContent />
    </FinancialPlanningProvider>
  );
}
