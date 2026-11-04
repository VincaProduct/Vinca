/**
 * "Index P/E vs 5-year median" for Market Pulse. Each month an admin enters,
 * for every index, the month-end P/E and the 5-year median P/E (calculated
 * outside the site); the gap and label are calculated here. Pure functions
 * (no imports) so they can be unit-tested and reused on a public page later.
 * Tests: src/lib/indexValuation.test.ts (npm test).
 */

// ── Settings ────────────────────────────────────────────────────────────────
export const NEAR_BAND = 0.10;
export const FAR_BAND = 0.20;

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
  median_pe: number;
}

export interface ValuationRow {
  code: IndexCode;
  name: string;
  segment: string;
  pe: number | null;
  median: number | null;
  /** P/E ÷ median − 1 (negative = discount, positive = premium) */
  gap: number | null;
  label: ValuationLabel | null;
}

// ── Calculation ─────────────────────────────────────────────────────────────
// Gaps are compared after rounding to 4 decimals (0.01%), so a gap shown as
// exactly 10.00% is "Near" despite floating-point noise
const roundGap = (gap: number) => Math.round(gap * 10000) / 10000;

export const gapFor = (pe: number, median: number) => pe / median - 1;

export const labelForGap = (gap: number): ValuationLabel => {
  const g = roundGap(gap);
  if (g > FAR_BAND) return 'Well above';
  if (g > NEAR_BAND) return 'Above';
  if (g >= -NEAR_BAND) return 'Near';
  if (g >= -FAR_BAND) return 'Below';
  return 'Well below';
};

/** The table for one month: each index's P/E, 5-year median, gap and label */
export const computeValuation = (rows: IndexPeRow[], month: string): ValuationRow[] =>
  INDICES.map(({ code, name, segment }) => {
    const row = rows.find((r) => r.index_code === code && r.month === month);
    if (!row) return { code, name, segment, pe: null, median: null, gap: null, label: null };
    const pe = Number(row.pe);
    const median = Number(row.median_pe);
    const gap = gapFor(pe, median);
    return { code, name, segment, pe, median, gap, label: labelForGap(gap) };
  });

/** Months with all four indices, newest first (the table opens on the first) */
export const completeMonths = (rows: IndexPeRow[]) => {
  const codes = new Map<string, Set<string>>();
  rows.forEach((r) => codes.set(r.month, (codes.get(r.month) ?? new Set()).add(r.index_code)));
  return [...codes.entries()]
    .filter(([, c]) => INDICES.every((i) => c.has(i.code)))
    .map(([m]) => m)
    .sort()
    .reverse();
};

export const latestCompleteMonth = (rows: IndexPeRow[]): string | null => completeMonths(rows)[0] ?? null;

/** YYYY-MM-01 of the month `offset` months from `month` */
export const addMonths = (month: string, offset: number) => {
  const [year, m] = month.split('-').map(Number);
  const index = year * 12 + (m - 1) + offset;
  return `${String(Math.floor(index / 12)).padStart(4, '0')}-${String((index % 12) + 1).padStart(2, '0')}-01`;
};

// ── Display ─────────────────────────────────────────────────────────────────
export const formatPe = (value: number | null) => (value === null ? '—' : value.toFixed(1));

/** "10.45% discount" below the median, "19.50% premium" above, "At the median" when equal */
export const formatGap = (gap: number | null) => {
  if (gap === null) return '—';
  const pct = roundGap(gap) * 100;
  if (pct === 0) return 'At the median';
  return `${Math.abs(pct).toFixed(2)}% ${pct < 0 ? 'discount' : 'premium'}`;
};

export const formatAsOf = (date: string | null) =>
  date ? new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
export const formatMonth = (month: string) =>
  new Date(`${month}T00:00:00`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

/** Where the numbers come from, shown under the table */
export const SOURCE_NOTE =
  'Source: NSE Indices (niftyindices.com › Reports › Historical Data › P/E, P/B & Div. Yield). Updated monthly.';

export const DISCLOSURE =
  'For educational purposes only. Not a recommendation to buy, sell or switch any fund. Mutual Fund investments are subject to market risks, read all scheme related documents carefully.';
