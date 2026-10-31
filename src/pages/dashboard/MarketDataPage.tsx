import { useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, LineChart, Loader2, Pencil, Save, Upload } from 'lucide-react';
import { describeDbError } from '@/lib/dbErrors';
import { useMarketData } from '@/hooks/useMarketData';
import { IndexValuationTable } from '@/components/market/IndexValuationTable';
import {
  INDICES,
  addMonths,
  computeValuation,
  formatGap,
  formatMonth,
  formatPe,
  missingWindowMonths,
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

const checkPe = (value: string): string | null => {
  const pe = Number(value);
  if (value.trim() === '' || Number.isNaN(pe)) return 'Enter a number';
  if (pe < MIN_PE || pe > MAX_PE) return `P/E must be between ${MIN_PE} and ${MAX_PE}`;
  return null;
};

const bigMoveWarning = (pe: number, previous: number | undefined, label: string) =>
  previous && Math.abs(pe / previous - 1) > BIG_MOVE
    ? `${label}: ${pe} is more than ${BIG_MOVE * 100}% away from last month (${previous}). Please double-check.`
    : null;

/**
 * Admin page for the monthly Market Pulse numbers: the Nifty 50 average P/E
 * (heatmap) and the month-end P/E of four indices (valuation table).
 */
const MarketDataPage = () => {
  const { toast } = useToast();
  const { niftyPe, indexPe, loading, error, reload } = useMarketData();

  const showError = (e: unknown) => toast({ title: 'Something went wrong', description: describeDbError(e), variant: 'destructive' });

  // ── Nifty 50 monthly average P/E (heatmap) ────────────────────────────────
  const [heatMonth, setHeatMonth] = useState('');
  const [heatPe, setHeatPe] = useState('');
  const [heatSaving, setHeatSaving] = useState(false);
  const heatByMonth = useMemo(() => new Map(niftyPe.map((r) => [r.month, r.pe])), [niftyPe]);
  const latestHeat = niftyPe.at(-1);

  const heatMonthKey = toMonth(heatMonth);
  const heatError = !heatMonthKey
    ? 'Choose a month'
    : isFutureMonth(heatMonthKey)
      ? "You can't add a future month"
      : checkPe(heatPe);
  const heatWarning =
    !heatError && heatMonthKey
      ? bigMoveWarning(Number(heatPe), heatByMonth.get(addMonths(heatMonthKey, -1)), 'Nifty 50')
      : null;

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
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const monthKey = toMonth(month);
  const formErrors: string[] = [];
  if (!monthKey) formErrors.push('Choose a month');
  else if (isFutureMonth(monthKey)) formErrors.push("You can't add a future month");
  if (!asOf) formErrors.push('Choose the as-of (trading) date');
  else if (monthKey && asOf.slice(0, 7) !== monthKey.slice(0, 7)) formErrors.push('The as-of date must be in the chosen month');
  INDICES.forEach((i) => {
    const err = checkPe(values[i.code] ?? '');
    if (err) formErrors.push(`${i.name}: ${err}`);
  });

  // The saved data with this form's numbers in place, for the preview and checks
  const draftRows = useMemo<IndexPeRow[]>(() => {
    if (!monthKey) return indexPe;
    const others = indexPe.filter((r) => r.month !== monthKey);
    const draft = INDICES.filter((i) => values[i.code]?.trim() && !Number.isNaN(Number(values[i.code]))).map((i) => ({
      index_code: i.code,
      month: monthKey,
      as_of_date: asOf || monthKey,
      pe: Number(values[i.code]),
    }));
    return [...others, ...draft];
  }, [indexPe, monthKey, asOf, values]);

  const formWarnings: string[] = [];
  if (monthKey) {
    INDICES.forEach((i) => {
      const pe = Number(values[i.code]);
      const previous = indexPe.find((r) => r.index_code === i.code && r.month === addMonths(monthKey, -1))?.pe;
      const move = values[i.code] ? bigMoveWarning(pe, previous, i.name) : null;
      if (move) formWarnings.push(move);
      const missing = missingWindowMonths(draftRows, i.code, monthKey).filter((m) => m !== monthKey);
      if (missing.length > 0) {
        formWarnings.push(
          `${i.name}: ${missing.length} of the last 60 months ${missing.length === 1 ? 'is' : 'are'} missing (e.g. ${formatMonth(missing[0])}), so its median shows "Not enough history".`,
        );
      }
    });
  }
  const preview = monthKey ? computeValuation(draftRows, monthKey) : [];
  const editingExisting = monthKey && indexPe.some((r) => r.month === monthKey);

  const saveMonth = async () => {
    if (formErrors.length > 0) return;
    setSaving(true);
    const { error: e } = await supabase.from('index_pe_monthly').upsert(
      INDICES.map((i) => ({ index_code: i.code, month: monthKey, as_of_date: asOf, pe: Number(values[i.code]) })),
      { onConflict: 'index_code,month' },
    );
    setSaving(false);
    if (e) return showError(e);
    toast({ title: 'Saved', description: `Index P/E for ${formatMonth(monthKey)} is live on Market Pulse.` });
    setMonth('');
    setAsOf('');
    setValues({});
    reload();
  };

  const editMonth = (m: string) => {
    const rows = indexPe.filter((r) => r.month === m);
    setMonth(m.slice(0, 7));
    setAsOf(rows.find((r) => r.index_code === 'NIFTY50')?.as_of_date ?? rows[0]?.as_of_date ?? '');
    setValues(Object.fromEntries(rows.map((r) => [r.index_code, String(r.pe)])));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const history = useMemo(() => {
    const byMonth = new Map<string, Record<string, number>>();
    indexPe.forEach((r) => byMonth.set(r.month, { ...(byMonth.get(r.month) ?? {}), [r.index_code]: r.pe }));
    return [...byMonth.entries()].sort(([a], [b]) => b.localeCompare(a));
  }, [indexPe]);

  // ── CSV import (one-time backfill) ────────────────────────────────────────
  const [importing, setImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<{ imported: number; rejected: string[] } | null>(null);

  const importCsv = async (file: File) => {
    setImporting(true);
    setImportSummary(null);
    const text = await file.text();
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const header = lines.shift()?.toLowerCase().replace(/\s/g, '');
    if (header !== 'month,as_of_date,index_code,pe') {
      setImporting(false);
      setImportSummary({ imported: 0, rejected: ['The first line must be: month,as_of_date,index_code,pe'] });
      return;
    }
    const existing = new Set(indexPe.map((r) => `${r.index_code}|${r.month}`));
    const seen = new Set<string>();
    const codes = new Set(INDICES.map((i) => i.code as string));
    const rejected: string[] = [];
    const rows: IndexPeRow[] = [];
    lines.forEach((line, n) => {
      const [m, d, code, pe] = line.split(',').map((c) => c.trim());
      const where = `Line ${n + 2}`;
      const key = `${code}|${m}`;
      if (!/^\d{4}-\d{2}-01$/.test(m || '')) return rejected.push(`${where}: month must be the 1st, e.g. 2026-10-01`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d || '') || d.slice(0, 7) !== m.slice(0, 7)) return rejected.push(`${where}: as_of_date must be a date in that month`);
      if (!codes.has(code)) return rejected.push(`${where}: unknown index_code "${code}"`);
      const peError = checkPe(pe ?? '');
      if (peError) return rejected.push(`${where}: ${peError}`);
      if (isFutureMonth(m)) return rejected.push(`${where}: future month`);
      if (existing.has(key)) return rejected.push(`${where}: ${code} ${m} is already saved (edit it instead)`);
      if (seen.has(key)) return rejected.push(`${where}: duplicate of an earlier line`);
      seen.add(key);
      rows.push({ index_code: code, month: m, as_of_date: d, pe: Number(pe) });
    });
    let imported = 0;
    for (let i = 0; i < rows.length; i += 500) {
      const { error: e } = await supabase.from('index_pe_monthly').insert(rows.slice(i, i + 500));
      if (e) {
        showError(e);
        break;
      }
      imported += rows.slice(i, i + 500).length;
    }
    setImporting(false);
    setImportSummary({ imported, rejected });
    reload();
  };

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
            {latestHeat && <> Latest saved: <strong>{formatMonth(latestHeat.month)} · {latestHeat.pe.toFixed(1)}</strong>.</>}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
            <div className="space-y-1.5">
              <Label htmlFor="heat-month">Month</Label>
              <Input id="heat-month" type="month" max={thisMonth().slice(0, 7)} value={heatMonth} onChange={(e) => {
                setHeatMonth(e.target.value);
                const saved = heatByMonth.get(toMonth(e.target.value));
                if (saved !== undefined) setHeatPe(String(saved));
              }} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="heat-pe">Average P/E</Label>
              <Input id="heat-pe" inputMode="decimal" placeholder="e.g. 21.8" value={heatPe} onChange={(e) => setHeatPe(e.target.value)} />
            </div>
            <Button onClick={saveHeat} disabled={!!heatError || heatSaving}>
              {heatSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {heatByMonth.has(heatMonthKey) ? 'Update' : 'Save'}
            </Button>
          </div>
          {(heatMonth || heatPe) && heatError && <p className="text-sm text-destructive">{heatError}</p>}
          {heatWarning && (
            <p className="text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" /> {heatWarning}
            </p>
          )}
          {heatByMonth.has(heatMonthKey) && <p className="text-xs text-muted-foreground">This month is already saved; saving replaces it.</p>}
        </CardContent>
      </Card>

      {/* Four indices */}
      <Card>
        <CardHeader>
          <CardTitle>2. Index P/E vs 5-year median (month-end)</CardTitle>
          <CardDescription>
            The P/E published by NSE Indices on the last trading day of the month, for all four indices. The median, gap and label are calculated automatically.
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {INDICES.map((i) => (
              <div key={i.code} className="space-y-1.5">
                <Label htmlFor={`pe-${i.code}`}>{i.name}</Label>
                <Input
                  id={`pe-${i.code}`}
                  inputMode="decimal"
                  placeholder="P/E"
                  value={values[i.code] ?? ''}
                  onChange={(e) => setValues((v) => ({ ...v, [i.code]: e.target.value }))}
                />
              </div>
            ))}
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
                      <th className="py-1.5 pr-3 font-medium text-right">Gap</th>
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
                        <td className="py-1.5">{r.label ?? `— ${r.note}`}</td>
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
          {(month || asOf || Object.keys(values).length > 0) && formErrors.length > 0 && (
            <ul className="space-y-0.5">
              {formErrors.map((e) => <li key={e} className="text-sm text-destructive">{e}</li>)}
            </ul>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={saveMonth} disabled={formErrors.length > 0 || saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {editingExisting ? `Update ${formatMonth(monthKey)}` : 'Save month'}
            </Button>
            {(month || asOf || Object.keys(values).length > 0) && (
              <Button variant="outline" onClick={() => { setMonth(''); setAsOf(''); setValues({}); }}>Clear</Button>
            )}
          </div>
          {editingExisting && <p className="text-xs text-muted-foreground">Changes to a saved month are logged.</p>}
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle>Saved months</CardTitle>
          <CardDescription>{history.length} month{history.length === 1 ? '' : 's'} saved. Edit loads a month into the form above.</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing saved yet. Import your history below, or add the latest month above.</p>
          ) : (
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="sticky top-0 bg-card">
                  <tr className="text-left text-muted-foreground border-b">
                    <th className="py-2 pr-3 font-medium">Month</th>
                    {INDICES.map((i) => <th key={i.code} className="py-2 pr-3 font-medium text-right">{i.name}</th>)}
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {history.map(([m, pes]) => (
                    <tr key={m} className="border-b last:border-0">
                      <td className="py-2 pr-3">{formatMonth(m)}</td>
                      {INDICES.map((i) => (
                        <td key={i.code} className="py-2 pr-3 text-right tabular-nums">
                          {pes[i.code] !== undefined ? pes[i.code].toFixed(1) : <span className="text-destructive">missing</span>}
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

      {/* CSV import */}
      <Card>
        <CardHeader>
          <CardTitle>Import history from CSV</CardTitle>
          <CardDescription>
            One-time backfill of past months (at least 60 months for each index). One row per index per month, with this first line:{' '}
            <code className="text-xs">month,as_of_date,index_code,pe</code>, e.g. <code className="text-xs">2026-10-01,2026-10-30,NIFTY50,19.7</code>.
            Index codes: {INDICES.map((i) => i.code).join(', ')}. Months already saved are skipped.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="csv" className="inline-flex">
            <span className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium cursor-pointer hover:bg-accent">
              {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {importing ? 'Importing…' : 'Choose CSV file'}
            </span>
          </Label>
          <input
            id="csv"
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            disabled={importing}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importCsv(file);
              e.target.value = '';
            }}
          />
          {importSummary && (
            <div className="rounded-lg border p-3 space-y-1 text-sm">
              <p><strong>{importSummary.imported}</strong> rows imported, <strong>{importSummary.rejected.length}</strong> rejected.</p>
              {importSummary.rejected.length > 0 && (
                <ul className="max-h-48 overflow-y-auto text-xs text-muted-foreground space-y-0.5">
                  {importSummary.rejected.slice(0, 200).map((r) => <li key={r}>{r}</li>)}
                </ul>
              )}
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
