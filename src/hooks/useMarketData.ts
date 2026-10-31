import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { IndexPeRow } from '@/lib/indexValuation';

/** Nifty 50 monthly P/E for the heatmap: year → month (1–12) → P/E */
export type NiftyPeByYear = Record<number, Record<number, number>>;

export interface NiftyPeRow {
  month: string;
  pe: number;
}

export const toPeByYear = (rows: NiftyPeRow[]): NiftyPeByYear => {
  const byYear: NiftyPeByYear = {};
  rows.forEach(({ month, pe }) => {
    const [year, m] = month.split('-').map(Number);
    (byYear[year] ??= {})[m] = Number(pe);
  });
  return byYear;
};

/** Monthly P/E data entered in Admin Tools → Market Data */
export const useMarketData = () => {
  const [niftyPe, setNiftyPe] = useState<NiftyPeRow[]>([]);
  const [indexPe, setIndexPe] = useState<IndexPeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const [nifty, indices] = await Promise.all([
      supabase.from('nifty_pe_monthly').select('month, pe').order('month'),
      supabase.from('index_pe_monthly').select('id, index_code, month, as_of_date, pe').order('month'),
    ]);
    setError(nifty.error?.message || indices.error?.message || null);
    setNiftyPe((nifty.data || []).map((r) => ({ month: r.month, pe: Number(r.pe) })));
    setIndexPe((indices.data || []).map((r) => ({ ...r, pe: Number(r.pe) })));
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { niftyPe, indexPe, loading, error, reload };
};
