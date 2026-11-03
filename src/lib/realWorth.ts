/**
 * Real Worth Calculator maths: what money kept in each place could be worth
 * at retirement, in today's money after inflation, before tax. Pure functions
 * (only type imports) so they can be unit-tested.
 * Tests: src/lib/realWorth.test.ts (npm test).
 */
import type { RealWorthAsset, RealWorthAssetKey } from '../content/realWorth';

export interface RealWorthInputs {
  age: number;
  retireAge: number;
  /** Money saved today, ₹ */
  savedToday: number;
  /** Money added every month, ₹ */
  monthly: number;
}

export interface RealWorthRow {
  key: RealWorthAssetKey;
  label: string;
  factLine: string;
  /** Value at retirement in rupees of that year */
  future: number;
  futureWeak: number | null;
  /** Same values in today's money */
  today: number;
  todayWeak: number | null;
}

export interface RealWorthResult {
  years: number;
  rows: RealWorthRow[];
  totalPutIn: number;
  cashToday: number;
  /** What the money would be worth if it grew exactly with prices */
  keptUpFuture: number;
  keptUpToday: number;
}

/** Carries the numbers into the Financial Freedom calculator (sessionStorage, never the URL) */
export const FFR_PREFILL_KEY = 'ffr_prefill';

// ── Limits ──────────────────────────────────────────────────────────────────
export const AGE_MIN = 18;
export const AGE_MAX = 70;
export const RETIRE_MAX = 80;
export const SAVED_MAX = 50_00_00_000; // ₹50 crore
export const MONTHLY_MAX = 10_00_000; // ₹10 lakh
export const RATE_MIN = 0;
export const RATE_MAX = 20;

/** Validation messages for each field (null when fine) */
export const validate = (i: RealWorthInputs) => ({
  age: i.age < AGE_MIN || i.age > AGE_MAX ? `Enter an age between ${AGE_MIN} and ${AGE_MAX}` : null,
  retireAge:
    i.retireAge <= i.age ? 'Retirement age must be more than your age'
    : i.retireAge > RETIRE_MAX ? `Enter a retirement age up to ${RETIRE_MAX}`
    : null,
  savedToday: i.savedToday > SAVED_MAX ? 'Enter an amount up to ₹50 crore' : null,
  monthly: i.monthly > MONTHLY_MAX ? 'Enter an amount up to ₹10 lakh' : null,
  amounts: i.savedToday <= 0 && i.monthly <= 0 ? 'Enter money saved, a monthly amount, or both' : null,
});

export const isValid = (i: RealWorthInputs) => Object.values(validate(i)).every((m) => m === null);

// ── Maths ───────────────────────────────────────────────────────────────────
/**
 * Future value at an annual rate (decimal), compounded monthly, with the
 * monthly amount added at the end of each month
 */
export const futureValue = (savedToday: number, monthly: number, months: number, annualRate: number) => {
  if (annualRate === 0) return savedToday + monthly * months;
  const m = Math.pow(1 + annualRate, 1 / 12) - 1;
  const growth = Math.pow(1 + m, months);
  return savedToday * growth + (monthly * (growth - 1)) / m;
};

export const calculateRealWorth = (inputs: RealWorthInputs, assets: RealWorthAsset[], inflationPct: number): RealWorthResult => {
  const years = inputs.retireAge - inputs.age;
  const months = years * 12;
  const inflation = inflationPct / 100;
  const deflator = Math.pow(1 + inflation, years);
  const fv = (ratePct: number) => futureValue(inputs.savedToday, inputs.monthly, months, ratePct / 100);

  const rows = assets.map((a) => {
    const future = fv(a.typicalRate);
    const futureWeak = a.weakRate === null ? null : fv(a.weakRate);
    return {
      key: a.key,
      label: a.label,
      factLine: a.factLine,
      future,
      futureWeak,
      today: future / deflator,
      todayWeak: futureWeak === null ? null : futureWeak / deflator,
    };
  });

  const totalPutIn = inputs.savedToday + inputs.monthly * months;
  const keptUpFuture = fv(inflationPct);
  return {
    years,
    rows,
    totalPutIn,
    cashToday: totalPutIn / deflator,
    keptUpFuture,
    keptUpToday: keptUpFuture / deflator,
  };
};

/** Lower weak to match when typical drops below it, and keep both within 0-20% */
export const clampRates = (typical: number, weak: number | null): { typical: number; weak: number | null } => {
  const t = Math.min(RATE_MAX, Math.max(RATE_MIN, typical));
  if (weak === null) return { typical: t, weak: null };
  const w = Math.min(RATE_MAX, Math.max(RATE_MIN, weak));
  return { typical: t, weak: Math.min(w, t) };
};

// ── Chart scale ─────────────────────────────────────────────────────────────
/** Larger of the highest typical value and the line, x 1.15, rounded up to a neat number */
export const axisMax = (values: number[], line: number) => {
  const raw = Math.max(...values, line) * 1.15;
  if (raw <= 0) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((s) => s * magnitude >= raw) ?? 10;
  return step * magnitude;
};

// ── Display ─────────────────────────────────────────────────────────────────
/** Indian style: ₹1.25 Cr, ₹46.7 L, ₹85,000 */
export const formatInr = (value: number) => {
  const v = Math.round(value);
  if (v >= 1_00_00_000) return `₹${(v / 1_00_00_000).toFixed(2)} Cr`;
  if (v >= 1_00_000) return `₹${(v / 1_00_000).toFixed(1)} L`;
  return `₹${v.toLocaleString('en-IN')}`;
};

/** Digits typed into an amount box, shown with Indian grouping (5,00,000) */
export const formatTyping = (value: number) => (value > 0 ? value.toLocaleString('en-IN') : '');
export const parseTyping = (text: string) => Number(text.replace(/[^\d]/g, '').slice(0, 10)) || 0;
