import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import CanonicalPageHeader from '@/components/ui/CanonicalPageHeader';
import { supabase } from '@/integrations/supabase/client';
import { useRealWorthRates } from '@/hooks/useRealWorthRates';
import type { RealWorthAsset, RealWorthSettings } from '@/content/realWorth';
import { RATE_MAX, RATE_MIN } from '@/lib/realWorth';

/** Admin Tools → Real Worth rates: the rates and inflation the Real Worth Calculator uses */
export default function RealWorthRatesPage() {
  const { assets, settings, fromDatabase, loading, reload } = useRealWorthRates();
  const [draft, setDraft] = useState<RealWorthAsset[]>(assets);
  const [draftSettings, setDraftSettings] = useState<RealWorthSettings>(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => setDraft(assets), [assets]);
  useEffect(() => setDraftSettings(settings), [settings]);

  const setAsset = (key: string, patch: Partial<RealWorthAsset>) =>
    setDraft((prev) => prev.map((a) => (a.key === key ? { ...a, ...patch } : a)));

  const problems: string[] = [];
  draft.forEach((a) => {
    if (!(a.typicalRate >= RATE_MIN && a.typicalRate <= RATE_MAX)) problems.push(`${a.label}: typical rate must be 0% to 20%`);
    if (a.weakRate !== null && !(a.weakRate >= RATE_MIN && a.weakRate <= a.typicalRate)) problems.push(`${a.label}: weak-years rate must be 0% up to the typical rate`);
    if (!a.factLine.trim() || !a.sourceNote.trim()) problems.push(`${a.label}: fact line and source can't be empty`);
  });
  const s = draftSettings;
  if (!(s.inflationMin <= s.inflationDefault && s.inflationDefault <= s.inflationMax)) problems.push('Inflation: default must be between the lowest and highest');
  if (!s.asOfDate.trim()) problems.push('"Rates as of" can’t be empty');

  const save = async () => {
    if (problems.length) return;
    setSaving(true);
    const rows = draft.map((a, i) => ({
      asset_key: a.key,
      label: a.label,
      typical_rate: a.typicalRate,
      weak_rate: a.weakRate,
      fact_line: a.factLine.trim(),
      source_note: a.sourceNote.trim(),
      sort_order: i + 1,
      updated_at: new Date().toISOString(),
    }));
    const ratesRes = await supabase.from('real_worth_rates').upsert(rows);
    const settingsRes = ratesRes.error ? null : await supabase.from('real_worth_settings').upsert({
      id: 1,
      inflation_default: s.inflationDefault,
      inflation_min: s.inflationMin,
      inflation_max: s.inflationMax,
      as_of_date: s.asOfDate.trim(),
      // Each save is a new version, recorded with every snapshot clients save
      version: settings.version + 1,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    const error = ratesRes.error || settingsRes?.error;
    if (error) {
      console.error('Error saving real worth rates:', error);
      toast.error(/real_worth|schema cache/i.test(error.message) ? 'The database tables haven’t been created yet.' : 'Couldn’t save the rates.');
      return;
    }
    toast.success('Rates saved. The calculator uses them straight away.');
    reload();
  };

  const num = (v: string) => (v === '' ? NaN : Number(v));

  return (
    <>
      <CanonicalPageHeader title="Real Worth rates" />
      <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6 sm:px-6">
        {!loading && !fromDatabase && (
          <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            The rates table hasn’t been set up yet, so the calculator is using its built-in rates (shown below).
            Run <code>supabase/migrations/20261104000000_real_worth.sql</code> in Supabase to edit them here.
          </p>
        )}

        <section className="space-y-4">
          {draft.map((a) => (
            <div key={a.key} className="space-y-3 rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-end gap-4">
                <p className="w-full text-base font-semibold text-foreground sm:w-40">{a.label}</p>
                <label className="text-sm text-muted-foreground">
                  Typical %
                  <Input type="number" step="0.05" value={Number.isNaN(a.typicalRate) ? '' : a.typicalRate}
                    onChange={(e) => setAsset(a.key, { typicalRate: num(e.target.value) })} className="mt-1 w-28" />
                </label>
                {a.weakRate !== null && (
                  <label className="text-sm text-muted-foreground">
                    Weak years %
                    <Input type="number" step="0.05" value={Number.isNaN(a.weakRate) ? '' : a.weakRate}
                      onChange={(e) => setAsset(a.key, { weakRate: num(e.target.value) })} className="mt-1 w-28" />
                  </label>
                )}
              </div>
              <label className="block text-sm text-muted-foreground">
                Fact line
                <Input value={a.factLine} onChange={(e) => setAsset(a.key, { factLine: e.target.value })} className="mt-1" />
              </label>
              <label className="block text-sm text-muted-foreground">
                Where the rate comes from
                <Textarea value={a.sourceNote} rows={2} onChange={(e) => setAsset(a.key, { sourceNote: e.target.value })} className="mt-1" />
              </label>
            </div>
          ))}
        </section>

        <section className="space-y-3 rounded-xl border border-border bg-card p-4">
          <p className="text-base font-semibold text-foreground">Inflation and date</p>
          <div className="flex flex-wrap gap-4">
            {([['inflationDefault', 'Default %'], ['inflationMin', 'Lowest %'], ['inflationMax', 'Highest %']] as const).map(([field, label]) => (
              <label key={field} className="text-sm text-muted-foreground">
                {label}
                <Input type="number" step="0.5" value={Number.isNaN(s[field]) ? '' : s[field]}
                  onChange={(e) => setDraftSettings({ ...s, [field]: num(e.target.value) })} className="mt-1 w-28" />
              </label>
            ))}
            <label className="text-sm text-muted-foreground">
              Rates as of
              <Input value={s.asOfDate} onChange={(e) => setDraftSettings({ ...s, asOfDate: e.target.value })} className="mt-1 w-44" />
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            Equity 12% and inflation 7% should stay the same as the Financial Freedom calculator, which has them fixed in its code.
          </p>
        </section>

        {problems.length > 0 && (
          <ul className="list-disc space-y-1 pl-5 text-sm text-destructive">
            {problems.map((p) => <li key={p}>{p}</li>)}
          </ul>
        )}

        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={saving || problems.length > 0 || !fromDatabase}>{saving ? 'Saving…' : 'Save rates'}</Button>
          <span className="text-xs text-muted-foreground">Version {settings.version}</span>
        </div>
      </div>
    </>
  );
}
