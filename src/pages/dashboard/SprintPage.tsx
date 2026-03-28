import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ComfortLevelScale from '@/components/sprint/ComfortLevelScale';
import SprintSummaryCardRow from '@/components/sprint/SprintSummaryCardRow';
import { useSprints, type Sprint, type SprintReflection } from '@/hooks/useSprints';

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

export default function SprintPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getActiveSprint, startSprint, completeSprint, abandonSprint, addReflection, getReflections } = useSprints();

  const scoreComponent = searchParams.get('component') as Sprint['score_component'] | null;
  const meta = scoreComponent ? COMPONENT_META[scoreComponent] : null;

  const [loading, setLoading] = useState(true);
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
  const [reflections, setReflections] = useState<SprintReflection[]>([]);

  // Start sprint form
  const [sipAmount, setSipAmount] = useState('');
  const [starting, setStarting] = useState(false);

  // Reflection form
  const [comfortLevel, setComfortLevel] = useState<number | null>(null);
  const [reflectionText, setReflectionText] = useState('');
  const [savingReflection, setSavingReflection] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [abandoning, setAbandoning] = useState(false);

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
    if (!scoreComponent) return;
    setStarting(true);
    const amount = parseFloat(sipAmount);
    await startSprint(scoreComponent, 'monthly', isNaN(amount) ? undefined : amount);
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
  const daysElapsed = activeSprint
    ? Math.floor((Date.now() - new Date(activeSprint.started_at).getTime()) / 86400000)
    : 0;
  const daysRemaining = Math.max(0, 30 - daysElapsed);
  const progressPct = Math.min(100, Math.round((daysElapsed / 30) * 100));

  const hasMidpoint = reflections.some(r => r.phase === 'midpoint');
  const hasCompletion = reflections.some(r => r.phase === 'completion');
  const showMidpoint = daysElapsed >= 15 && !hasMidpoint;
  const showCompletion = daysElapsed >= 30 && !hasCompletion;

  // ── State 3: Loading ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-sm text-muted-foreground">Loading your sprint...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10 flex flex-col gap-6">

      {/* ── State 1: No active sprint ─────────────────────────────────── */}
      {!activeSprint && (
        <>
          <Card className="border-primary/20 shadow-md">
            <CardContent className="pt-6 pb-6 space-y-5">
              {meta ? (
                <>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                      30-Day Sprint
                    </p>
                    <h1 className="text-xl font-bold text-foreground">{meta.label}</h1>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{meta.preview}</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Start a 30-day sprint to improve your FFR score.</p>
              )}

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
                {starting ? 'Starting...' : 'Start my 30-day sprint'}
              </Button>
            </CardContent>
          </Card>

          <button
            type="button"
            onClick={() => navigate('/dashboard/ffr')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
          >
            ← Back to my score
          </button>
        </>
      )}

      {/* ── State 2: Active sprint ────────────────────────────────────── */}
      {activeSprint && (
        <>
          {console.log('[SprintPage] score_component:', activeSprint.score_component)}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
              Active Sprint
            </p>
            <h1 className="text-xl font-bold text-foreground">
              {(COMPONENT_META[activeSprint.score_component?.trim().replace(/\.$/, '') as Sprint['score_component']] ?? { label: 'Your Sprint', preview: '' }).label}
            </h1>
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
