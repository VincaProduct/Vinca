import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  DEFAULT_REAL_WORTH_ASSETS,
  DEFAULT_REAL_WORTH_SETTINGS,
  type RealWorthAsset,
  type RealWorthAssetKey,
  type RealWorthSettings,
} from '@/content/realWorth';

/**
 * The Real Worth rates and settings from Supabase, falling back to the
 * built-in ones (src/content/realWorth.ts) until the tables are set up
 */
export const useRealWorthRates = () => {
  const [assets, setAssets] = useState<RealWorthAsset[]>(DEFAULT_REAL_WORTH_ASSETS);
  const [settings, setSettings] = useState<RealWorthSettings>(DEFAULT_REAL_WORTH_SETTINGS);
  const [fromDatabase, setFromDatabase] = useState(false);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const [ratesRes, settingsRes] = await Promise.all([
      supabase.from('real_worth_rates').select('*').order('sort_order'),
      supabase.from('real_worth_settings').select('*').eq('id', 1).maybeSingle(),
    ]);
    if (!ratesRes.error && ratesRes.data && ratesRes.data.length > 0) {
      setAssets(ratesRes.data.map((r) => ({
        key: r.asset_key as RealWorthAssetKey,
        label: r.label,
        typicalRate: Number(r.typical_rate),
        weakRate: r.weak_rate === null ? null : Number(r.weak_rate),
        factLine: r.fact_line,
        sourceNote: r.source_note,
      })));
      setFromDatabase(true);
    }
    if (!settingsRes.error && settingsRes.data) {
      const d = settingsRes.data;
      setSettings({
        inflationDefault: Number(d.inflation_default),
        inflationMin: Number(d.inflation_min),
        inflationMax: Number(d.inflation_max),
        asOfDate: d.as_of_date,
        version: d.version,
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { assets, settings, fromDatabase, loading, reload };
};
