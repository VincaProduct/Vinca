import { useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, LineChart, Loader2, Pencil, Save } from 'lucide-react';
import { describeDbError } from '@/lib/dbErrors';
import { useMarketData, toPeByYear } from '@/hooks/useMarketData';
import { IndexValuationTable } from '@/components/market/IndexValuationTable';
import {
  INDICES,
  addMonths,
  computeValuation,
  formatGap,
  formatMonth,
  formatPe,
  type IndexPeRow,
} from '@/lib/indexValuation';

const MIN_PE = 5;
const MAX_PE = 100;
/** A move bigger than this from the previous month is probably a typo */
const BIG_MOVE = 0.25;

/** YYYY-MM-01 for an <input type="month"> value (YYYY-MM) */
const toMonth = (value: string) => (value ? `${value}-01` : '');
const thisMonth = () => new Date().toISOString().slice(0, 7) + '-01';
const isFutureMonth = (month: string) => month > thisMonth();

const checkNumber = (value: string | undefined, what: string): string | null => {
  const n = Number(value);
  if (!value || value.trim() === '' || Number.isNaN(n)) return `enter the ${what}`;
  if (n < MIN_PE || n > MAX_PE) return `${what} must be between ${MIN_PE} and ${MAX_PE}`;
  return null;
};

const bigMoveWarning = (value: number, previous: number | undefined, label: string) =>
  previous && Math.abs(value / previous - 1) > BIG_MOVE
    ? `${label}: ${value} is more than ${BIG_MOVE * 100}% away from last month (${previous}). Please double-check.`
    : null;

type IndexDraft = Record<string, { pe: string; median: string }>;

/**
 * Admin page for the monthly Market Pulse numbers: the Nifty 50 average P/E
 * (heatmap) and, for four indices, the month-end P/E and 5-year median P/E
 * (valuation table; the discount/premium and label are calculated).
 */
const MarketDataPage = () => {
  const { toast } = useToast();
  const { niftyPe, indexPe, loading, error, reload } = useMarketData();

  const showError = (e: unknown) => toast({ title: 'Something went wrong', description: describeDbError(e), variant: 'destructive' });

  // ── Nifty 50 monthly average P/E (heatmap) ────────────────────────────────
  const [heatMonth, setHeatMonth] = useState('');
  const [heatPe, setHeatPe] = useState('');
  const [heatSaving, setHeatSaving] = useState(false);
  // Built-in history plus saved months, as the heatmap shows them
  const heatmap = useMemo(() => toPeByYear(niftyPe), [niftyPe]);
  const heatValue = (month: string) => {
    if (!month) return undefined;
    const [y, m] = month.split('-').map(Number);
    return heatmap[y]?.[m];
  };
  const savedHeatMonths = useMemo(() => new Set(niftyPe.map((r) => r.month)), [niftyPe]);
  const latestHeat = useMemo(() => {
    const year = Math.max(...Object.keys(heatmap).map(Number));
    const month = Math.max(...Object.keys(heatmap[year] ?? {}).map(Number));
    return Number.isFinite(month) ? { month: `${year}-${String(month).padStart(2, '0')}-01`, pe: heatmap[year][month] } : null;
  }, [heatmap]);

  const heatMonthKey = toMonth(heatMonth);
  const heatError = !heatMonthKey
    ? 'Choose a month'
    : isFutureMonth(heatMonthKey)
      ? "You can't add a future month"
      : checkNumber(heatPe, 'average P/E');
  const heatWarning =
    !heatError && heatMonthKey ? bigMoveWarning(Number(heatPe), heatValue(addMonths(heatMonthKey, -1)), 'Nifty 50') : null;

  const saveHeat = async () => {
    if (heatError) return;
    setHeatSaving(true);
    const { error: e } = await supabase
      .from('nifty_pe_monthly')
      .upsert({ month: heatMonthKey, pe: Number(heatPe) }, { onConflict: 'month' });
    setHeatSaving(false);
    if (e) return showError(e);
    toast({ title: 'Saved', description: `Nifty 50 P/E for ${formatMonth(heatMonthKey)} is live on Market Pulse.` });
    setHeatMonth('');
    setHeatPe('');
    reload();
  };

  // ── Index P/E vs 5-year median (four indices) ─────────────────────────────
  const [month, setMonth] = useState('');
  const [asOf, setAsOf] = useState('');
  const [values, setValues] = useState<IndexDraft>({});
  const [saving, setSaving] = useState(false);
  const setValue = (code: string, field: 'pe' | 'median', value: string) =>
    setValues((v) => ({ ...v, [code]: { pe: v[code]?.pe ?? '', median: v[code]?.median ?? '', [field]: value } }));

  const monthKey = toMonth(month);
  const touched = Boolean(month || asOf || Object.keys(values).length > 0);
  const formErrors: string[] = [];
  if (!monthKey) formErrors.push('Choose a month');
  else if (isFutureMonth(monthKey)) formErrors.push("You can't add a future month");
  if (!asOf) formErrors.push('Choose the as-of (trading) date');
  else if (monthKey && asOf.slice(0, 7) !== monthKey.slice(0, 7)) formErrors.push('The as-of date must be in the chosen month');
  INDICES.forEach((i) => {
    [checkNumber(values[i.code]?.pe, 'P/E'), checkNumber(values[i.code]?.median, '5-yr median')]
      .filter(Boolean)
      .forEach((err) => formErrors.push(`${i.name}: ${err}`));
  });

  const formWarnings: string[] = [];
  if (monthKey) {
    INDICES.forEach((i) => {
      const previous = indexPe.find((r) => r.index_code === i.code && r.month === addMonths(monthKey, -1));
      const pe = values[i.code]?.pe ? bigMoveWarning(Number(values[i.code].pe), previous?.pe, `${i.name} P/E`) : null;
      const med = values[i.code]?.median ? bigMoveWarning(Number(values[i.code].median), previous?.median_pe, `${i.name} median`) : null;
      [pe, med].filter(Boolean).forEach((w) => formWarnings.push(w as string));
    });
  }

  // Preview of what clients will see for this month
  const preview = useMemo(() => {
    if (!monthKey) return [];
    const draft: IndexPeRow[] = INDICES.filter(
      (i) => values[i.code]?.pe && values[i.code]?.median && !checkNumber(values[i.code].pe, 'P/E') && !checkNumber(values[i.code].median, 'median'),
    ).map((i) => ({
      index_code: i.code,
      month: monthKey,
      as_of_date: asOf || monthKey,
      pe: Number(values[i.code].pe),
      median_pe: Number(values[i.code].median),
    }));
    return computeValuation(draft, monthKey);
  }, [monthKey, asOf, values]);
  const editingExisting = Boolean(monthKey && indexPe.some((r) => r.month === monthKey));

  const clearForm = () => {
    setMonth('');
    setAsOf('');
    setValues({});
  };

  const saveMonth = async () => {
    if (formErrors.length > 0) return;
    setSaving(true);
    const { error: e } = await supabase.from('index_pe_monthly').upsert(
      INDICES.map((i) => ({
        index_code: i.code,
        month: monthKey,
        as_of_date: asOf,
        pe: Number(values[i.code].pe),
        median_pe: Number(values[i.code].median),
      })),
      { onConflict: 'index_code,month' },
    );
    setSaving(false);
    if (e) return showError(e);
    toast({ title: 'Saved', description: `Index P/E for ${formatMonth(monthKey)} is live on Market Pulse.` });
    clearForm();
    reload();
  };

  const editMonth = (m: string) => {
    const rows = indexPe.filter((r) => r.month === m);
    setMonth(m.slice(0, 7));
    setAsOf(rows.find((r) => r.index_code === 'NIFTY50')?.as_of_date ?? rows[0]?.as_of_date ?? '');
    setValues(Object.fromEntries(rows.map((r) => [r.index_code, { pe: String(r.pe), median: String(r.median_pe) }])));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const history = useMemo(() => {
    const byMonth = new Map<string, Record<string, IndexPeRow>>();
    indexPe.forEach((r) => byMonth.set(r.month, { ...(byMonth.get(r.month) ?? {}), [r.index_code]: r }));
    return [...byMonth.entries()].sort(([a], [b]) => b.localeCompare(a));
  }, [indexPe]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <LineChart className="h-7 w-7 text-primary" /> Market Data
        </h1>
        <p className="text-muted-foreground mt-1">
          Monthly numbers for Know Your Market → Market Pulse. Saved numbers go live straight away.
        </p>
        {error && <p className="text-sm text-destructive mt-2">{describeDbError({ message: error })}</p>}
      </div>

      {/* Nifty 50 heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>1. Nifty 50 monthly average P/E (heatmap)</CardTitle>
          <CardDescription>
            One number per month: the average of the daily Nifty 50 P/E from NSE (Indices → Historical Data → P/E, P/B &amp; Div. Yield).
            {latestHeat && <> Latest month on the heatmap: <strong>{formatMonth(latestHeat.month)} · {latestHeat.pe.toFixed(1)}</strong>.</>}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
            <div className="space-y-1.5">
              <Label htmlFor="heat-month">Month</Label>
              <Input id="heat-month" type="month" max={thisMonth().slice(0, 7)} value={heatMonth} onChange={(e) => {
                setHeatMonth(e.target.value);
                const shown = heatValue(toMonth(e.target.value));
                setHeatPe(shown !== undefined ? String(shown) : '');
              }} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="heat-pe">Average P/E</Label>
              <Input id="heat-pe" inputMode="decimal" placeholder="e.g. 21.8" value={heatPe} onChange={(e) => setHeatPe(e.target.value)} />
            </div>
            <Button onClick={saveHeat} disabled={!!heatError || heatSaving}>
              {heatSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {heatValue(heatMonthKey) !== undefined ? 'Update' : 'Save'}
            </Button>
          </div>
          {(heatMonth || heatPe) && heatError && <p className="text-sm text-destructive">{heatError}</p>}
          {heatWarning && (
            <p className="text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" /> {heatWarning}
            </p>
          )}
          {heatValue(heatMonthKey) !== undefined && (
            <p className="text-xs text-muted-foreground">
              {savedHeatMonths.has(heatMonthKey) ? 'This month is already saved' : 'This month is in the built-in history'}; saving replaces it.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Four indices */}
      <Card>
        <CardHeader>
          <CardTitle>2. Index P/E vs 5-year median (month-end)</CardTitle>
          <CardDescription>
            For each index, enter the P/E on the last trading day of the month and its 5-year median P/E. The discount or premium and the label are calculated automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="idx-month">Month</Label>
              <Input id="idx-month" type="month" max={thisMonth().slice(0, 7)} value={month} onChange={(e) => {
                const m = e.target.value;
                if (indexPe.some((r) => r.month === toMonth(m))) editMonth(toMonth(m));
                else setMonth(m);
              }} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="idx-asof">As-of date (last trading day)</Label>
              <Input id="idx-asof" type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[460px] text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-1.5 pr-3 font-medium">Index</th>
                  <th className="py-1.5 pr-3 font-medium">P/E</th>
                  <th className="py-1.5 font-medium">5-yr median P/E</th>
                </tr>
              </thead>
              <tbody>
                {INDICES.map((i) => (
                  <tr key={i.code}>
                    <td className="py-1.5 pr-3 font-medium whitespace-nowrap">{i.name}</td>
                    <td className="py-1.5 pr-3">
                      <Input
                        aria-label={`${i.name} P/E`}
                        inputMode="decimal"
                        placeholder="e.g. 19.7"
                        value={values[i.code]?.pe ?? ''}
                        onChange={(e) => setValue(i.code, 'pe', e.target.value)}
                      />
                    </td>
                    <td className="py-1.5">
                      <Input
                        aria-label={`${i.name} 5-year median P/E`}
                        inputMode="decimal"
                        placeholder="e.g. 22.0"
                        value={values[i.code]?.median ?? ''}
                        onChange={(e) => setValue(i.code, 'median', e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Preview, to compare with the Excel sheet before saving */}
          {monthKey && (
            <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
              <p className="text-sm font-semibold">Preview for {formatMonth(monthKey)}</p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="py-1.5 pr-3 font-medium">Index</th>
                      <th className="py-1.5 pr-3 font-medium text-right">P/E</th>
                      <th className="py-1.5 pr-3 font-medium text-right">5-yr median</th>
                      <th className="py-1.5 pr-3 font-medium text-right">Discount / premium</th>
                      <th className="py-1.5 font-medium">Label</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((r) => (
                      <tr key={r.code} className="border-t">
                        <td className="py-1.5 pr-3">{r.name}</td>
                        <td className="py-1.5 pr-3 text-right tabular-nums">{formatPe(r.pe)}</td>
                        <td className="py-1.5 pr-3 text-right tabular-nums">{formatPe(r.median)}</td>
                        <td className="py-1.5 pr-3 text-right tabular-nums">{formatGap(r.gap)}</td>
                        <td className="py-1.5">{r.label ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {formWarnings.length > 0 && (
            <ul className="space-y-1">
              {formWarnings.map((w) => (
                <li key={w} className="text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" /> {w}
                </li>
              ))}
            </ul>
          )}
          {touched && formErrors.length > 0 && (
            <ul className="space-y-0.5">
              {formErrors.map((e) => <li key={e} className="text-sm text-destructive">{e}</li>)}
            </ul>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={saveMonth} disabled={formErrors.length > 0 || saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {editingExisting ? `Update ${formatMonth(monthKey)}` : 'Save month'}
            </Button>
            {touched && <Button variant="outline" onClick={clearForm}>Clear</Button>}
          </div>
          {editingExisting && <p className="text-xs text-muted-foreground">This month is already saved; changes are logged.</p>}
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle>Saved months</CardTitle>
          <CardDescription>
            {history.length} month{history.length === 1 ? '' : 's'} saved (P/E / 5-yr median). Edit loads a month into the form above.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing saved yet. Add the latest month above.</p>
          ) : (
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full min-w-[620px] text-sm">
                <thead className="sticky top-0 bg-card">
                  <tr className="text-left text-muted-foreground border-b">
                    <th className="py-2 pr-3 font-medium">Month</th>
                    {INDICES.map((i) => <th key={i.code} className="py-2 pr-3 font-medium text-right">{i.name}</th>)}
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {history.map(([m, rows]) => (
                    <tr key={m} className="border-b last:border-0">
                      <td className="py-2 pr-3 whitespace-nowrap">{formatMonth(m)}</td>
                      {INDICES.map((i) => (
                        <td key={i.code} className="py-2 pr-3 text-right tabular-nums whitespace-nowrap">
                          {rows[i.code] ? `${formatPe(rows[i.code].pe)} / ${formatPe(rows[i.code].median_pe)}` : <span className="text-destructive">missing</span>}
                        </td>
                      ))}
                      <td className="py-2 text-right">
                        <Button size="sm" variant="ghost" onClick={() => editMonth(m)}>
                          <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* What clients see */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-muted-foreground">What clients see on Market Pulse</p>
        <IndexValuationTable rows={indexPe} />
      </div>
    </div>
  );
};

export default MarketDataPage;
