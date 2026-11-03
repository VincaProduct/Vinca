import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, X, Check, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useRealWorthRates } from '@/hooks/useRealWorthRates';
import { trackEvent, trafficSource } from '@/lib/tracking';
import {
  REAL_WORTH_COPY as COPY,
  REAL_WORTH_DEFAULT_INPUTS as DEFAULTS,
  REAL_WORTH_FAQS,
  type RealWorthAsset,
} from '@/content/realWorth';
import {
  AGE_MAX,
  AGE_MIN,
  FFR_PREFILL_KEY,
  RETIRE_MAX,
  axisMax,
  calculateRealWorth,
  clampRates,
  formatInr,
  formatTyping,
  isValid,
  parseTyping,
  validate,
  type RealWorthInputs,
} from '@/lib/realWorth';

type Mode = 'public' | 'dashboard';
type View = 'today' | 'future';

/** Numbers kept across Google sign-in after "Save this" */
const PENDING_SAVE_KEY = 'real_worth_pending';

const SAVED_CHIPS = [100000, 500000, 1000000, 2500000];
const MONTHLY_CHIPS = [5000, 10000, 25000, 50000];
const chipLabel = (v: number) => (v >= 100000 ? `₹${v / 100000}L` : `₹${v / 1000}k`);

const sameAsDefaults = (i: RealWorthInputs) =>
  i.age === DEFAULTS.age && i.retireAge === DEFAULTS.retireAge && i.savedToday === DEFAULTS.savedToday && i.monthly === DEFAULTS.monthly;

const readJson = <T,>(storage: Storage, key: string): T | null => {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

// ── Inputs ──────────────────────────────────────────────────────────────────

const FieldError = ({ message }: { message: string | null }) =>
  message ? <p className="mt-1 text-xs text-destructive">{message}</p> : null;

function AgeField({ id, label, value, min, max, onChange, error }: {
  id: string; label: string; value: number; min: number; max: number; onChange: (v: number) => void; error: string | null;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-muted-foreground sm:text-sm">{label}</label>
      <div className="flex h-11 items-stretch overflow-hidden rounded-md border border-input bg-background">
        <button type="button" aria-label={`${label}: one less`} onClick={() => onChange(Math.max(min, value - 1))}
          className="flex w-11 flex-shrink-0 items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground">
          <Minus className="h-4 w-4" />
        </button>
        <input
          id={id}
          inputMode="numeric"
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value.replace(/[^\d]/g, '').slice(0, 3)) || 0)}
          className="w-full min-w-0 bg-transparent text-center text-base font-semibold text-foreground focus:outline-none"
          aria-invalid={!!error}
        />
        <button type="button" aria-label={`${label}: one more`} onClick={() => onChange(Math.min(max, value + 1))}
          className="flex w-11 flex-shrink-0 items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground">
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <FieldError message={error} />
    </div>
  );
}

function AmountField({ id, label, value, chips, onChange, error, showChips }: {
  id: string; label: string; value: number; chips: number[]; onChange: (v: number) => void; error: string | null; showChips: boolean;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-muted-foreground sm:text-sm">{label}</label>
      <div className="flex h-11 items-center rounded-md border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-primary/40">
        <span className="mr-1 text-muted-foreground">₹</span>
        <input
          id={id}
          inputMode="numeric"
          value={formatTyping(value)}
          placeholder="0"
          onChange={(e) => onChange(parseTyping(e.target.value))}
          className="w-full min-w-0 bg-transparent text-base font-semibold text-foreground focus:outline-none"
          aria-invalid={!!error}
        />
      </div>
      {showChips && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <button key={c} type="button" onClick={() => onChange(c)}
              className={`min-h-[44px] min-w-[44px] rounded-full border px-3 text-xs font-semibold transition-colors ${
                value === c ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/60 hover:text-foreground'
              }`}>
              {chipLabel(c)}
            </button>
          ))}
        </div>
      )}
      <FieldError message={error} />
    </div>
  );
}

function InputsGrid({ inputs, onChange, compact }: {
  inputs: RealWorthInputs; onChange: (field: keyof RealWorthInputs, value: number) => void; compact: boolean;
}) {
  const errors = validate(inputs);
  return (
    <div className={`grid gap-3 ${compact ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-1 lg:gap-4' : 'grid-cols-2 gap-4'}`}>
      <AgeField id={`rw-age-${compact}`} label="Your age today" value={inputs.age} min={AGE_MIN} max={AGE_MAX}
        onChange={(v) => onChange('age', v)} error={errors.age} />
      <AgeField id={`rw-retire-${compact}`} label="Age you want to retire" value={inputs.retireAge} min={AGE_MIN + 1} max={RETIRE_MAX}
        onChange={(v) => onChange('retireAge', v)} error={errors.retireAge} />
      {/* Quick chips need 44px taps; on a phone they're in the Edit sheet so the first result stays in view */}
      <AmountField id={`rw-saved-${compact}`} label="Money you've saved today" value={inputs.savedToday} chips={SAVED_CHIPS}
        onChange={(v) => onChange('savedToday', v)} error={errors.savedToday} showChips={!compact} />
      <AmountField id={`rw-monthly-${compact}`} label="Money you add every month" value={inputs.monthly} chips={MONTHLY_CHIPS}
        onChange={(v) => onChange('monthly', v)} error={errors.monthly ?? errors.amounts} showChips={!compact} />
    </div>
  );
}

// ── Calculator ──────────────────────────────────────────────────────────────

export default function RealWorthCalculator({ mode }: { mode: Mode }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const rates = useRealWorthRates();
  const pageType = mode;
  const track = useCallback((event: string) => trackEvent(event, { page_type: pageType, src: trafficSource() }), [pageType]);

  const [inputs, setInputs] = useState<RealWorthInputs>(DEFAULTS);
  const [validInputs, setValidInputs] = useState<RealWorthInputs>(DEFAULTS);
  const [hasPlan, setHasPlan] = useState(false);
  const [view, setView] = useState<View>('today');
  const [inflation, setInflation] = useState<number | null>(null);
  const [assets, setAssets] = useState<RealWorthAsset[] | null>(null);
  const [panel, setPanel] = useState<'inflation' | 'rates' | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [stripVisible, setStripVisible] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const inputsRef = useRef<HTMLDivElement>(null);

  const effectiveInflation = inflation ?? rates.settings.inflationDefault;
  const effectiveAssets = assets ?? rates.assets;
  const ratesEdited = assets !== null;

  // ── Tracking: view, first use, engagement ──
  const changedFields = useRef(new Set<string>());
  const usedSent = useRef(false);
  const engagedSent = useRef(false);
  const engagedTimer = useRef<number>();
  useEffect(() => {
    track('real_worth_view');
    return () => window.clearTimeout(engagedTimer.current);
  }, [track]);
  const markEngaged = useCallback(() => {
    if (engagedSent.current) return;
    engagedSent.current = true;
    track('real_worth_engaged');
  }, [track]);
  const noteInteraction = useCallback((field: string) => {
    if (!usedSent.current) {
      usedSent.current = true;
      track('real_worth_used');
      engagedTimer.current = window.setTimeout(markEngaged, 20000);
    }
    changedFields.current.add(field);
    if (changedFields.current.size >= 2) markEngaged();
  }, [track, markEngaged]);

  // ── Starting numbers ──
  const saveSnapshot = useCallback(async (values: RealWorthInputs, infl: number) => {
    if (!user) return false;
    setSaveState('saving');
    const { error } = await supabase.from('real_worth_snapshots').insert({
      user_id: user.id,
      age: values.age,
      retire_age: values.retireAge,
      saved_today: values.savedToday,
      monthly: values.monthly,
      inflation: infl,
      rates_version: rates.settings.version,
    });
    if (error) {
      console.error('Error saving real worth snapshot:', error);
      setSaveState('idle');
      toast.error(/real_worth_snapshots|schema cache/i.test(error.message)
        ? 'Saving isn’t set up yet. The database table hasn’t been created.'
        : 'Couldn’t save. Please try again.');
      return false;
    }
    setSaveState('saved');
    track('real_worth_saved');
    return true;
  }, [user, rates.settings.version, track]);

  useEffect(() => {
    if (mode !== 'dashboard' || !user) return;
    let cancelled = false;
    (async () => {
      // Came back from "Save this" on the public page: same numbers, saved
      const pending = readJson<{ inputs: RealWorthInputs; inflation: number }>(sessionStorage, PENDING_SAVE_KEY);
      if (pending && isValid(pending.inputs)) {
        sessionStorage.removeItem(PENDING_SAVE_KEY);
        setInputs(pending.inputs);
        setValidInputs(pending.inputs);
        setInflation(pending.inflation);
        setHasPlan(true);
        saveSnapshot(pending.inputs, pending.inflation);
        return;
      }
      // Otherwise the numbers from their Financial Freedom plan
      const { data } = await supabase
        .from('user_calculations')
        .select('inputs')
        .eq('user_id', user.id)
        .eq('calculation_type', 'financial_freedom')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      const plan = data?.inputs as Record<string, number> | undefined;
      if (cancelled || !plan) return;
      const fromPlan: RealWorthInputs = {
        age: Number(plan.age) || 0,
        retireAge: (Number(plan.age) || 0) + (Number(plan.yearsForSIP) || 0) + (Number(plan.waitingYearsBeforeSWP) || 0),
        savedToday: Number(plan.initialPortfolioValue) || 0,
        monthly: Number(plan.sipAmount) || 0,
      };
      if (isValid(fromPlan)) {
        setInputs(fromPlan);
        setValidInputs(fromPlan);
        setHasPlan(true);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, user?.id]);

  // Recalculate 300ms after the last change; invalid inputs keep the last result
  useEffect(() => {
    if (!isValid(inputs)) return;
    const t = window.setTimeout(() => setValidInputs(inputs), 300);
    return () => window.clearTimeout(t);
  }, [inputs]);

  const changeInput = (field: keyof RealWorthInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
    setSaveState('idle');
    noteInteraction(field);
  };

  // Slim summary strip on phones once the inputs scroll out of view
  useEffect(() => {
    const el = inputsRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setStripVisible(!entry.isIntersecting), { rootMargin: '-80px 0px 0px 0px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSheetOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheetOpen]);

  // ── Results ──
  const result = useMemo(
    () => calculateRealWorth(validInputs, effectiveAssets, effectiveInflation),
    [validInputs, effectiveAssets, effectiveInflation],
  );
  const pick = (today: number, future: number) => (view === 'today' ? today : future);
  const lineValue = pick(result.keptUpToday, result.keptUpFuture);
  const max = axisMax(result.rows.map((r) => pick(r.today, r.future)), lineValue);
  const pct = (v: number) => `${Math.max(0, Math.min(100, (v / max) * 100))}%`;
  const showExample = sameAsDefaults(inputs) && (mode === 'public' || !hasPlan);

  // ── Actions ──
  const goToFfr = () => {
    track('real_worth_to_ffr');
    try { sessionStorage.setItem(FFR_PREFILL_KEY, JSON.stringify(validInputs)); } catch { /* storage blocked */ }
    navigate(mode === 'dashboard' ? '/dashboard/ffr' : '/financial-freedom-calculator');
  };

  const onSave = async () => {
    track('real_worth_save_click');
    if (mode === 'dashboard') {
      await saveSnapshot(validInputs, effectiveInflation);
      return;
    }
    try {
      sessionStorage.setItem(PENDING_SAVE_KEY, JSON.stringify({ inputs: validInputs, inflation: effectiveInflation }));
      localStorage.setItem('redirect_after_login', '/dashboard/real-worth');
    } catch { /* storage blocked */ }
    navigate('/auth');
  };

  // The page "Talk to our team" opens; kept in one place so it's easy to change
  const talkToTeam = () => {
    track('real_worth_talk_click');
    if (user) {
      navigate('/dashboard/compass');
      return;
    }
    localStorage.setItem('redirect_after_login', '/dashboard/compass');
    sessionStorage.setItem('auth_context_consultation', 'true');
    navigate('/auth');
  };

  const updateRate = (key: string, field: 'typicalRate' | 'weakRate', value: number) => {
    setAssets((prev) => (prev ?? rates.assets).map((a) => {
      if (a.key !== key) return a;
      const next = clampRates(field === 'typicalRate' ? value : a.typicalRate, field === 'weakRate' ? value : a.weakRate);
      return { ...a, typicalRate: next.typical, weakRate: next.weak };
    }));
  };

  const togglePanel = (p: 'inflation' | 'rates') => {
    setPanel((cur) => (cur === p ? null : p));
    if (p === 'rates' && panel !== 'rates') track('real_worth_rates_opened');
  };

  const summary = `Age ${validInputs.age} → ${validInputs.retireAge} · ${formatInr(validInputs.savedToday)} + ${formatInr(validInputs.monthly)}/month`;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      {/* Phone: summary strip once the inputs are off screen */}
      {stripVisible && !sheetOpen && (
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className={`fixed inset-x-0 z-40 flex min-h-[44px] items-center justify-between gap-2 border-b border-border bg-card/95 px-4 py-2 text-left text-xs text-foreground shadow-sm backdrop-blur md:hidden ${
            mode === 'public' ? 'top-[72px]' : 'top-[60px]'
          }`}
        >
          <span className="truncate">{summary}</span>
          <span className="inline-flex flex-shrink-0 items-center gap-1 font-semibold text-primary"><Pencil className="h-3.5 w-3.5" /> Edit</span>
        </button>
      )}

      {/* Phone: bottom sheet with the same inputs; results stay visible above */}
      {sheetOpen && (
        <div role="dialog" aria-label="Edit your numbers"
          className="fixed inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto rounded-t-2xl border-t border-border bg-card p-4 pb-6 shadow-2xl md:hidden">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Your numbers</p>
            <button type="button" aria-label="Close" onClick={() => setSheetOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground hover:bg-muted">
              <X className="h-5 w-5" />
            </button>
          </div>
          <InputsGrid inputs={inputs} onChange={changeInput} compact={false} />
        </div>
      )}

      <header className="mb-5 lg:mb-8">
        <h1 className="text-xl font-bold leading-tight text-foreground sm:text-3xl" style={{ textWrap: 'balance' } as React.CSSProperties}>
          {COPY.h1}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">{COPY.intro}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
        {/* Inputs */}
        <div ref={inputsRef} className="rounded-xl border border-border bg-card p-3 sm:p-4 lg:sticky lg:top-24 lg:p-5">
          <InputsGrid inputs={inputs} onChange={changeInput} compact />
          {/* Chips for tablet and desktop */}
          <div className="hidden md:block">
            <ChipsRow label="Saved" chips={SAVED_CHIPS} value={inputs.savedToday} onPick={(v) => changeInput('savedToday', v)} />
            <ChipsRow label="Monthly" chips={MONTHLY_CHIPS} value={inputs.monthly} onPick={(v) => changeInput('monthly', v)} />
          </div>
          {showExample && <p className="mt-3 text-xs text-muted-foreground">{COPY.exampleLabel}</p>}
        </div>

        {/* Results */}
        <div className="min-w-0 space-y-5">
          <p className="text-base font-semibold leading-snug text-foreground sm:text-lg">
            Kept as cash, the {formatInr(result.totalPutIn)} you put in would buy only what {formatInr(result.cashToday)} buys today.
          </p>

          {result.years < 10 && (
            <p className="rounded-lg border border-border bg-muted/50 p-3 text-sm text-muted-foreground">{COPY.shortTimeNote}</p>
          )}

          <div className="space-y-1.5">
            <ToggleGroup
              type="single"
              value={view}
              onValueChange={(v) => {
                if (!v) return;
                setView(v as View);
                track('real_worth_view_toggle');
              }}
              className="justify-start"
              aria-label="Show values in"
            >
              <ToggleGroupItem value="today" className="min-h-[44px] px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Today's money</ToggleGroupItem>
              <ToggleGroupItem value="future" className="min-h-[44px] px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Future rupees</ToggleGroupItem>
            </ToggleGroup>
            <p className="text-xs text-muted-foreground">{COPY.toggleHelper}</p>
          </div>

          {/* Chart */}
          <div className="rounded-xl border border-border bg-card p-3 sm:p-5">
            <p className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span aria-hidden="true" className="inline-block h-3.5 border-l-2 border-dashed border-muted-foreground" />
              Just kept up with prices {formatInr(lineValue)}
            </p>
            <ul aria-hidden="true" className="divide-y divide-border">
              {result.rows.map((row) => {
                const value = pick(row.today, row.future);
                const weak = row.todayWeak === null || row.futureWeak === null ? null : pick(row.todayWeak, row.futureWeak);
                const belowLine = row.today < result.keptUpToday * 0.99;
                return (
                  <li key={row.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 py-3 md:grid-cols-[130px_minmax(0,1fr)_120px]">
                    <span className="order-1 text-sm font-medium text-foreground">{row.label}</span>
                    <div className="relative order-3 col-span-2 h-3 md:order-2 md:col-span-1">
                      <div className="absolute inset-0 rounded-full bg-muted" />
                      <div className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-300 ease-out motion-reduce:transition-none"
                        style={{ width: pct(value) }} />
                      {weak !== null && (
                        <span className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-card transition-[left] duration-300 ease-out motion-reduce:transition-none"
                          style={{ left: pct(weak) }} />
                      )}
                      <span className="absolute -bottom-1.5 -top-1.5 border-l-2 border-dashed border-muted-foreground transition-[left] duration-300 ease-out motion-reduce:transition-none"
                        style={{ left: pct(lineValue) }} />
                    </div>
                    <div className="order-2 text-right md:order-3">
                      <p className="text-sm font-bold text-foreground">{formatInr(value)}</p>
                      {weak !== null && <p className="text-xs text-muted-foreground">Weak years {formatInr(weak)}</p>}
                    </div>
                    <div className="order-4 col-span-2 md:col-span-3">
                      {belowLine && <p className="text-xs font-medium text-muted-foreground">{COPY.belowLine}</p>}
                      <p className="text-xs text-muted-foreground/80">{row.factLine}</p>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Same values for screen readers */}
            <ul className="sr-only">
              {result.rows.map((row) => {
                const weak = row.todayWeak === null || row.futureWeak === null ? null : pick(row.todayWeak, row.futureWeak);
                return (
                  <li key={row.key}>
                    {row.label}: {formatInr(pick(row.today, row.future))} most likely
                    {weak !== null ? `, ${formatInr(weak)} if returns are weak` : ''}.
                  </li>
                );
              })}
              <li>Just kept up with prices: {formatInr(lineValue)}.</li>
            </ul>

            {/* Legend */}
            <div aria-hidden="true" className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><span className="inline-block h-2 w-5 rounded-full bg-primary" /> Most likely</span>
              <span className="inline-flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full border-2 border-primary bg-card" /> If returns are weak</span>
              <span className="inline-flex items-center gap-1.5"><span className="inline-block h-3.5 border-l-2 border-dashed border-muted-foreground" /> Just kept up with prices</span>
            </div>
          </div>

          {/* Assumptions */}
          <div className="text-xs text-muted-foreground">
            <p className="flex flex-wrap items-center gap-x-1.5">
              <span>Before tax</span><span aria-hidden="true">·</span>
              <span>Inflation {effectiveInflation}% a year</span><span aria-hidden="true">·</span>
              <button type="button" onClick={() => togglePanel('inflation')} className="min-h-[44px] font-semibold text-primary underline-offset-2 hover:underline" aria-expanded={panel === 'inflation'}>Change</button>
              <span aria-hidden="true">·</span>
              <button type="button" onClick={() => togglePanel('rates')} className="min-h-[44px] font-semibold text-primary underline-offset-2 hover:underline" aria-expanded={panel === 'rates'}>See the rates we use</button>
            </p>

            {panel === 'inflation' && (
              <div className="mt-2 space-y-3 rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-4">
                  <Slider
                    min={rates.settings.inflationMin}
                    max={rates.settings.inflationMax}
                    step={0.5}
                    value={[effectiveInflation]}
                    onValueChange={([v]) => setInflation(v)}
                    onValueCommit={() => track('real_worth_inflation_changed')}
                    aria-label="Inflation a year"
                    className="flex-1"
                  />
                  <span className="w-12 text-right text-sm font-semibold text-foreground">{effectiveInflation}%</span>
                </div>
                <Button type="button" variant="outline" size="sm" className="min-h-[44px]"
                  onClick={() => { setInflation(rates.settings.inflationDefault); track('real_worth_inflation_changed'); }}>
                  Reset to {rates.settings.inflationDefault}%
                </Button>
                <p>{COPY.whyInflation}</p>
              </div>
            )}

            {panel === 'rates' && (
              <div className="mt-2 rounded-lg border border-border bg-card p-4">
                <div className="space-y-4">
                  {effectiveAssets.map((a) => (
                    <div key={a.key} className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="w-32 text-sm font-medium text-foreground">{a.label}</span>
                        <RateInput label="Typical" value={a.typicalRate} onChange={(v) => updateRate(a.key, 'typicalRate', v)} />
                        {a.weakRate !== null && (
                          <RateInput label="Weak years" value={a.weakRate} onChange={(v) => updateRate(a.key, 'weakRate', v)} />
                        )}
                      </div>
                      <p>{a.sourceNote}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button type="button" variant="outline" size="sm" className="min-h-[44px]" disabled={!ratesEdited} onClick={() => setAssets(null)}>
                    Reset to our rates
                  </Button>
                </div>
                <p className="mt-3">Rates as of {rates.settings.asOfDate}. Past performance may or may not be sustained in future.</p>
              </div>
            )}
          </div>

          {/* Next steps */}
          <div className="space-y-3 rounded-xl border border-border bg-card p-4 sm:p-5">
            <Button type="button" size="lg" onClick={goToFfr} className="h-auto min-h-[52px] w-full flex-col gap-0 py-3 sm:w-auto sm:px-8">
              <span className="text-base font-semibold">Will this last through my retirement?</span>
              <span className="text-xs font-normal opacity-90">Check in 2 minutes</span>
            </Button>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <Button type="button" variant="outline" onClick={onSave} disabled={saveState !== 'idle'} className="min-h-[44px]">
                {saveState === 'saved' ? <><Check className="mr-1.5 h-4 w-4" /> Saved</>
                  : saveState === 'saving' ? 'Saving…'
                  : mode === 'dashboard' ? 'Save to my plan' : 'Save this'}
              </Button>
              <button type="button" onClick={talkToTeam} className="min-h-[44px] text-sm font-semibold text-primary underline-offset-2 hover:underline">
                Talk to our team
              </button>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="space-y-1 text-xs leading-relaxed text-muted-foreground">
            <p>{COPY.disclaimer}</p>
            <p>{COPY.entity}</p>
          </div>
        </div>
      </div>

      {/* FAQ (public page only) */}
      {mode === 'public' && (
        <section aria-labelledby="real-worth-faq" className="mx-auto mt-12 max-w-3xl pb-16">
          <h2 id="real-worth-faq" className="mb-4 text-xl font-bold text-foreground">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {REAL_WORTH_FAQS.map((faq) => (
              <details key={faq.question} className="rounded-xl border border-border bg-card px-4 py-3">
                <summary className="min-h-[28px] cursor-pointer text-sm font-semibold text-foreground">{faq.question}</summary>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ChipsRow({ label, chips, value, onPick }: { label: string; chips: number[]; value: number; onPick: (v: number) => void }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5">
      <span className="w-16 text-xs text-muted-foreground">{label}</span>
      {chips.map((c) => (
        <button key={c} type="button" onClick={() => onPick(c)}
          className={`min-h-[44px] min-w-[44px] rounded-full border px-3 text-xs font-semibold transition-colors ${
            value === c ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/60 hover:text-foreground'
          }`}>
          {chipLabel(c)}
        </button>
      ))}
    </div>
  );
}

function RateInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);
  return (
    <label className="flex items-center gap-1.5">
      <span>{label}</span>
      <input
        inputMode="decimal"
        value={text}
        onChange={(e) => {
          const t = e.target.value.replace(/[^\d.]/g, '').slice(0, 5);
          setText(t);
          if (t !== '' && !t.endsWith('.') && !isNaN(Number(t))) onChange(Number(t));
        }}
        onBlur={() => setText(String(value))}
        className="h-11 w-16 rounded-md border border-input bg-background px-2 text-center text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
      <span>%</span>
    </label>
  );
}
