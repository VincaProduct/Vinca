/**
 * Real Worth Calculator: copy, default rates and FAQs. Shared by the page and
 * the pages edge function (which pre-renders it for search engines), so it
 * must not import anything that uses the "@/" alias.
 */

export type RealWorthAssetKey = 'savings' | 'fd' | 'debt' | 'gold' | 'equity';

export interface RealWorthAsset {
  key: RealWorthAssetKey;
  label: string;
  /** Annual rate in percent, e.g. 12 */
  typicalRate: number;
  /** Rate in weak years (gold and equity only) */
  weakRate: number | null;
  factLine: string;
  sourceNote: string;
}

export interface RealWorthSettings {
  inflationDefault: number;
  inflationMin: number;
  inflationMax: number;
  asOfDate: string;
  version: number;
}

/** Built-in rates, used until the real_worth_rates table has been set up */
export const DEFAULT_REAL_WORTH_ASSETS: RealWorthAsset[] = [
  {
    key: 'savings',
    label: 'Savings account',
    typicalRate: 2.5,
    weakRate: null,
    factLine: "Value doesn't fall · You can take it out any time · Interest is taxed every year",
    sourceNote: 'SBI savings account rate',
  },
  {
    key: 'fd',
    label: 'Fixed deposit',
    typicalRate: 6.25,
    weakRate: null,
    factLine: "Value doesn't fall · Bank deposits are insured up to a limit · Interest is taxed every year",
    sourceNote: 'SBI 1-2 year FD rate, Oct 2026',
  },
  {
    key: 'debt',
    label: 'Debt funds',
    typicalRate: 7,
    weakRate: null,
    factLine: 'Value can dip a little · Money reaches you in a few working days · Taxed when you take money out',
    sourceNote: 'Long-term returns of low duration and corporate bond funds: 6.8% over 10 years, 7.6% over 20 years',
  },
  {
    key: 'gold',
    label: 'Gold',
    typicalRate: 10,
    weakRate: 8,
    factLine: 'Value can fall, and has stayed flat for years at times · Taxed when you sell',
    sourceNote:
      'Typical: middle of all 10-year periods since 1990 (gold price in rupees). Weak years: worst 15-year period since 1990 (5.3%)',
  },
  {
    key: 'equity',
    label: 'Equity funds',
    typicalRate: 12,
    weakRate: 10,
    factLine: 'Value can fall a lot in some years · Money reaches you in a few working days · Taxed when you take money out',
    sourceNote:
      'Typical: Nifty 50 TRI, 12.3% over 10 years and 12.1% over 20 years. Weak years: worst 15-year period since 1999 (9%)',
  },
];

export const DEFAULT_REAL_WORTH_SETTINGS: RealWorthSettings = {
  inflationDefault: 7,
  inflationMin: 4,
  inflationMax: 10,
  asOfDate: 'November 2026',
  version: 1,
};

export const REAL_WORTH_DEFAULT_INPUTS = { age: 35, retireAge: 60, savedToday: 500000, monthly: 10000 };

export const REAL_WORTH_COPY = {
  h1: 'What will your money really be worth when you retire?',
  intro: 'Savings account, FD, debt funds, gold and equity funds, after inflation.',
  exampleLabel: 'Example numbers. Change them to yours.',
  shortTimeNote:
    'Retirement is less than 10 years away. Over a few years, gold and equity funds can do worse than the weak-years number, and can even fall in value.',
  toggleHelper: "Future rupees is the amount you'd see in your account. Today's money is what it can buy at today's prices.",
  belowLine: "Less than you put in, in today's money",
  whyInflation:
    'Why 7%? Official inflation has averaged about 5-6%, but costs families care about, like healthcare, often rise faster. We use 7% to stay on the safe side.',
  disclaimer:
    'This is an illustration based on the numbers you entered and the rates shown. Actual returns will be different and can be negative. It is not a promise of returns or a recommendation of any scheme. Past performance may or may not be sustained in future. Mutual Fund investments are subject to market risks, read all scheme related documents carefully.',
  entity: 'Vinca Investment Private Limited · AMFI-registered Mutual Fund Distributor · ARN-293401',
};

export const REAL_WORTH_FAQS = [
  {
    question: 'What does real worth mean?',
    answer:
      "It's what your money will be able to buy when you retire, shown in today's prices. ₹1 lakh in 25 years will buy much less than ₹1 lakh today, because prices keep rising.",
  },
  {
    question: 'Why do you use 7% inflation?',
    answer:
      'Official inflation in India has averaged about 5-6% in recent years, but costs families care about, like healthcare, often rise faster. We use 7% to stay on the safe side. You can change it.',
  },
  {
    question: 'What does "weak years" mean?',
    answer:
      'It shows what gold and equity funds could be worth if their returns were as low as their weakest 15-year stretch in the past. Real results can be even lower, especially over shorter periods.',
  },
  {
    question: 'Does this include tax?',
    answer:
      'No. All numbers are before tax. Interest on savings accounts and FDs is taxed every year, which can make their real worth lower than shown.',
  },
  {
    question: 'Is this a recommendation?',
    answer:
      "No. It's an illustration based on the numbers you enter and the rates shown. It does not suggest any scheme or product. To talk about your own situation, talk to our team.",
  },
];
