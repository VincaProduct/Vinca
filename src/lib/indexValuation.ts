/**
 * "Index P/E vs 5-year median" calculation for Market Pulse. Pure functions
 * (no imports) so they can be unit-tested and reused on a public page later.
 * Tests: src/lib/indexValuation.test.ts (npm test).
 */

// ── Settings ────────────────────────────────────────────────────────────────
export const WINDOW_MONTHS = 60;
export const NEAR_BAND = 0.10;
export const FAR_BAND = 0.20;
/** The window ends at (and includes) the month being shown */
export const INCLUDE_CURRENT_MONTH = true;

export const INDICES = [
  { code: 'NIFTY50', name: 'Nifty 50', segment: 'Large cap' },
  { code: 'NIFTYMIDCAP150', name: 'Nifty Midcap 150', segment: 'Mid cap' },
  { code: 'NIFTYSMALLCAP250', name: 'Nifty Smallcap 250', segment: 'Small cap' },
  { code: 'NIFTY500', name: 'Nifty 500', segment: 'Broad market' },
] as const;

export type IndexCode = (typeof INDICES)[number]['code'];
export type ValuationLabel = 'Well below' | 'Below' | 'Near' | 'Above' | 'Well above';

export interface IndexPeRow {
  index_code: string;
  /** First day of the month, YYYY-MM-01 */
  month: string;
  /** Trading date the P/E is for, YYYY-MM-DD */
  as_of_date: string;
  pe: number;
}

export interface ValuationRow {
  code: IndexCode;
  name: string;
  segment: string;
  pe: number | null;
  median: number | null;
  /** Unrounded: current P/E ÷ median − 1 */
  gap: number | null;
  label: ValuationLabel | null;
  /** Set when the 60-month window has a gap */
  note: string | null;
}

// ── Months ──────────────────────────────────────────────────────────────────
/** YYYY-MM-01 for a month index (months since year 0) */
const monthKey = (index: number) => {
  const year = Math.floor(index / 12);
  const month = (index % 12) + 1;
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-01`;
};
const monthIndex = (key: string) => {
  const [year, month] = key.split('-').map(Number);
  return year * 12 + (month - 1);
};
/** YYYY-MM-01 of the month `offset` months from `month` */
export const addMonths = (month: string, offset: number) => monthKey(monthIndex(month) + offset);
/** The WINDOW_MONTHS months ending at `month` (oldest first) */
export const windowMonths = (month: string) => {
  const end = monthIndex(month) - (INCLUDE_CURRENT_MONTH ? 0 : 1);
  return Array.from({ length: WINDOW_MONTHS }, (_, i) => monthKey(end - WINDOW_MONTHS + 1 + i));
};

// ── Calculation ─────────────────────────────────────────────────────────────
/** Median; for an even count, the average of the two middle values */
export const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
};

// Gaps are compared after rounding to 4 decimals (0.01%), so a gap shown as
// exactly 10.00% is "Near" despite floating-point noise
const roundGap = (gap: number) => Math.round(gap * 10000) / 10000;

export const labelForGap = (gap: number): ValuationLabel => {
  const g = roundGap(gap);
  if (g > FAR_BAND) return 'Well above';
  if (g > NEAR_BAND) return 'Above';
  if (g >= -NEAR_BAND) return 'Near';
  if (g >= -FAR_BAND) return 'Below';
  return 'Well below';
};

/** The table for one month: each index's P/E, 5-year median, gap and label */
export const computeValuation = (rows: IndexPeRow[], month: string): ValuationRow[] => {
  const window = windowMonths(month);
  return INDICES.map(({ code, name, segment }) => {
    const byMonth = new Map(rows.filter((r) => r.index_code === code).map((r) => [r.month, Number(r.pe)]));
    const pe = byMonth.get(month) ?? null;
    const values = window.map((m) => byMonth.get(m));
    if (pe === null || values.some((v) => v === undefined)) {
      return { code, name, segment, pe, median: null, gap: null, label: null, note: 'Not enough history' };
    }
    const med = median(values as number[]);
    const gap = pe / med - 1;
    return { code, name, segment, pe, median: med, gap, label: labelForGap(gap), note: null };
  });
};

/** Newest month where all four indices have a P/E (the table opens on it) */
export const latestCompleteMonth = (rows: IndexPeRow[]): string | null => {
  const counts = new Map<string, Set<string>>();
  rows.forEach((r) => counts.set(r.month, (counts.get(r.month) ?? new Set()).add(r.index_code)));
  const complete = [...counts.entries()].filter(([, codes]) => INDICES.every((i) => codes.has(i.code))).map(([m]) => m);
  return complete.sort().at(-1) ?? null;
};

/** Months with all four indices, newest first (for the past-months picker) */
export const completeMonths = (rows: IndexPeRow[]) => {
  const counts = new Map<string, Set<string>>();
  rows.forEach((r) => counts.set(r.month, (counts.get(r.month) ?? new Set()).add(r.index_code)));
  return [...counts.entries()]
    .filter(([, codes]) => INDICES.every((i) => codes.has(i.code)))
    .map(([m]) => m)
    .sort()
    .reverse();
};

/** Months missing for an index within the window ending at `month` */
export const missingWindowMonths = (rows: IndexPeRow[], code: string, month: string) => {
  const have = new Set(rows.filter((r) => r.index_code === code).map((r) => r.month));
  return windowMonths(month).filter((m) => !have.has(m));
};

// ── Display ─────────────────────────────────────────────────────────────────
export const formatPe = (value: number | null) => (value === null ? '—' : value.toFixed(1));
export const formatGap = (gap: number | null) => {
  if (gap === null) return '—';
  const pct = roundGap(gap) * 100;
  const sign = pct > 0 ? '+' : pct < 0 ? '−' : '';
  return `${sign}${Math.abs(pct).toFixed(2)}%`;
};
export const formatAsOf = (date: string | null) =>
  date ? new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
export const formatMonth = (month: string) =>
  new Date(`${month}T00:00:00`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

/** Methodology text built from the settings, so it always matches the code */
export const methodologyText = (asOf: string) =>
  `How we calculate this: for each index we take the P/E published by NSE Indices on the last trading day of the month. ` +
  `We compare it with the median of the last ${WINDOW_MONTHS} month-end P/E values. Gap = current P/E ÷ ${WINDOW_MONTHS / 12}-year median − 1. ` +
  `Within ±${NEAR_BAND * 100}% of the median is shown as “Near”; between ${NEAR_BAND * 100}% and ${FAR_BAND * 100}% as “Above” or “Below”; ` +
  `beyond ${FAR_BAND * 100}% as “Well above” or “Well below”. We use the same method and bands every month, and past months stay on record. ` +
  `Data as of ${asOf}.`;

export const DISCLOSURE =
  'Educational data only. This compares each index’s current P/E with its own 5-year median. It is not a recommendation to buy, sell or switch any fund, or to time your investments. ' +
  'P/E is one measure. Markets can stay above or below their median for long periods, and past patterns may not repeat. ' +
  'Mutual Fund investments are subject to market risks, read all scheme related documents carefully. ' +
  'Source: NSE Indices. Vinca Investment Pvt Ltd · AMFI-registered Mutual Fund Distributor · ARN-293401.';
