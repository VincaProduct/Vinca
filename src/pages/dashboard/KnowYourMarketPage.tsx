import { useState, useEffect } from 'react';
import CanonicalPageHeader from '@/components/ui/CanonicalPageHeader';
import { TrendingUp, Loader2, Building2, Shield, ArrowUpRight, Landmark, Home as HomeIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ── Nifty 50 P/E historical monthly averages (approximate) ───────────────────
// Source: NSE India historical data. Update current month manually each month.
// Last updated: March 2025

const PE_DATA: Record<number, Record<number, number>> = {
  2000: { 1:22.5, 2:23.2, 3:25.0, 4:22.0, 5:20.5, 6:19.8, 7:19.2, 8:19.0, 9:18.5, 10:18.2, 11:17.8, 12:17.5 },
  2001: { 1:17.0, 2:16.5, 3:15.8, 4:15.2, 5:15.5, 6:15.0, 7:14.8, 8:14.5, 9:13.5, 10:14.0, 11:14.2, 12:14.0 },
  2002: { 1:14.2, 2:14.0, 3:14.5, 4:14.2, 5:14.0, 6:13.8, 7:13.5, 8:13.2, 9:13.0, 10:12.8, 11:13.2, 12:13.5 },
  2003: { 1:13.2, 2:12.8, 3:12.5, 4:13.0, 5:13.5, 6:14.2, 7:15.0, 8:15.8, 9:16.5, 10:17.2, 11:18.0, 12:18.8 },
  2004: { 1:19.5, 2:20.2, 3:20.8, 4:21.5, 5:18.5, 6:19.5, 7:20.2, 8:20.8, 9:21.5, 10:22.0, 11:22.5, 12:23.0 },
  2005: { 1:22.8, 2:23.2, 3:23.5, 4:23.8, 5:24.2, 6:24.5, 7:25.0, 8:25.2, 9:25.5, 10:25.0, 11:25.5, 12:26.0 },
  2006: { 1:26.2, 2:26.8, 3:27.2, 4:27.5, 5:22.5, 6:21.8, 7:22.5, 8:23.2, 9:24.0, 10:24.8, 11:25.2, 12:26.0 },
  2007: { 1:26.5, 2:27.0, 3:27.5, 4:27.8, 5:27.2, 6:26.8, 7:27.5, 8:27.0, 9:27.5, 10:28.0, 11:27.5, 12:27.8 },
  2008: { 1:26.5, 2:24.5, 3:22.0, 4:22.5, 5:20.5, 6:17.5, 7:16.5, 8:15.5, 9:13.5, 10:11.5, 11:12.0, 12:12.5 },
  2009: { 1:12.8, 2:12.2, 3:12.5, 4:14.5, 5:17.0, 6:17.5, 7:18.5, 8:19.5, 9:20.5, 10:21.0, 11:22.0, 12:22.5 },
  2010: { 1:23.0, 2:22.5, 3:23.0, 4:23.5, 5:22.8, 6:22.5, 7:23.0, 8:24.0, 9:25.0, 10:25.5, 11:24.0, 12:23.5 },
  2011: { 1:23.0, 2:22.5, 3:22.0, 4:22.5, 5:21.5, 6:21.0, 7:20.5, 8:19.0, 9:17.5, 10:18.0, 11:17.5, 12:17.8 },
  2012: { 1:18.5, 2:19.5, 3:20.0, 4:19.5, 5:18.8, 6:18.5, 7:19.5, 8:20.5, 9:21.0, 10:21.5, 11:21.8, 12:21.5 },
  2013: { 1:21.8, 2:21.5, 3:21.0, 4:21.5, 5:22.0, 6:20.5, 7:19.8, 8:18.5, 9:19.0, 10:20.0, 11:20.5, 12:21.0 },
  2014: { 1:20.8, 2:20.5, 3:21.0, 4:21.5, 5:23.5, 6:24.0, 7:24.5, 8:24.8, 9:25.0, 10:24.5, 11:24.8, 12:23.5 },
  2015: { 1:24.0, 2:24.5, 3:24.2, 4:23.8, 5:23.5, 6:23.0, 7:23.5, 8:22.0, 9:21.5, 10:22.0, 11:22.5, 12:22.0 },
  2016: { 1:21.5, 2:20.5, 3:21.0, 4:21.5, 5:22.0, 6:22.5, 7:23.0, 8:23.5, 9:23.8, 10:23.5, 11:21.0, 12:21.5 },
  2017: { 1:22.0, 2:22.5, 3:23.0, 4:23.5, 5:24.0, 6:24.5, 7:25.0, 8:25.5, 9:26.0, 10:26.5, 11:26.2, 12:26.5 },
  2018: { 1:26.5, 2:25.8, 3:24.2, 4:23.8, 5:24.1, 6:24.3, 7:27.2, 8:28.0, 9:26.4, 10:23.6, 11:23.8, 12:25.1 },
  2019: { 1:26.8, 2:27.5, 3:28.2, 4:29.1, 5:28.5, 6:27.6, 7:28.3, 8:27.0, 9:27.8, 10:28.5, 11:28.9, 12:29.4 },
  2020: { 1:28.8, 2:26.5, 3:20.5, 4:22.8, 5:24.5, 6:28.0, 7:30.5, 8:32.8, 9:33.5, 10:35.2, 11:36.8, 12:38.2 },
  2021: { 1:40.1, 2:38.5, 3:38.0, 4:35.8, 5:32.5, 6:30.8, 7:30.2, 8:28.5, 9:27.8, 10:27.2, 11:25.5, 12:24.8 },
  2022: { 1:23.5, 2:22.8, 3:22.5, 4:22.9, 5:20.2, 6:18.8, 7:20.5, 8:22.1, 9:21.2, 10:22.0, 11:23.1, 12:22.8 },
  2023: { 1:21.9, 2:21.5, 3:21.2, 4:22.0, 5:22.8, 6:23.2, 7:23.5, 8:23.1, 9:22.5, 10:22.0, 11:22.8, 12:23.5 },
  2024: { 1:23.2, 2:23.5, 3:24.1, 4:23.8, 5:23.5, 6:22.8, 7:23.5, 8:23.8, 9:24.2, 10:23.2, 11:21.8, 12:22.1 },
  2025: { 1:22.0, 2:21.2, 3:20.5 },
};

const PE_ZONES = [
  { label: 'Very Cheap',    max: 18,       color: 'bg-emerald-600', cellText: 'text-white'     },
  { label: 'Reasonable',    max: 22,       color: 'bg-emerald-300', cellText: 'text-slate-800' },
  { label: 'Elevated',      max: 26,       color: 'bg-amber-400',   cellText: 'text-slate-800' },
  { label: 'Expensive',     max: 32,       color: 'bg-orange-500',  cellText: 'text-white'     },
  { label: 'Very Expensive',max: Infinity, color: 'bg-red-500',     cellText: 'text-white'     },
] as const;

function getPeZone(pe: number) {
  return PE_ZONES.find(z => pe < z.max) ?? PE_ZONES[PE_ZONES.length - 1];
}

// ── MF patterns & helpers ─────────────────────────────────────────────────────

interface FundRow { name: string; category: string; return1Y: number | null; return3Y: number | null; return5Y: number | null; }

const EQUITY_PATTERNS: { pattern: RegExp; category: string }[] = [
  { pattern: /parag parikh flexi cap.*regular.*growth/i,           category: 'Flexi Cap' },
  { pattern: /mirae asset large cap.*regular.*growth/i,            category: 'Large Cap' },
  { pattern: /sbi small cap.*regular.*growth/i,                    category: 'Small Cap' },
  { pattern: /nippon india small cap.*regular.*growth/i,           category: 'Small Cap' },
  { pattern: /hdfc mid.?cap opportunities.*regular.*growth/i,      category: 'Mid Cap' },
  { pattern: /kotak emerging equity.*regular.*growth/i,            category: 'Mid Cap' },
  { pattern: /axis bluechip.*regular.*growth/i,                    category: 'Large Cap' },
  { pattern: /canara robeco emerging equities.*regular.*growth/i,  category: 'Large & Mid Cap' },
  { pattern: /quant small cap.*regular.*growth/i,                  category: 'Small Cap' },
  { pattern: /hdfc flexi cap.*regular.*growth/i,                   category: 'Flexi Cap' },
  { pattern: /motilal oswal midcap.*regular.*growth/i,             category: 'Mid Cap' },
  { pattern: /icici prudential bluechip.*regular.*growth/i,        category: 'Large Cap' },
  { pattern: /dsp midcap.*regular.*growth/i,                       category: 'Mid Cap' },
  { pattern: /franklin india smaller companies.*regular.*growth/i, category: 'Small Cap' },
  { pattern: /mirae asset emerging bluechip.*regular.*growth/i,    category: 'Large & Mid Cap' },
];

const RETIREMENT_PATTERNS: { pattern: RegExp; category: string }[] = [
  { pattern: /hdfc retirement savings.*equity.*regular.*growth/i,               category: 'Retirement – Equity' },
  { pattern: /hdfc retirement savings.*hybrid.*equity.*regular.*growth/i,       category: 'Retirement – Hybrid' },
  { pattern: /tata retirement savings.*progressive.*regular.*growth/i,          category: 'Retirement – Aggressive' },
  { pattern: /tata retirement savings.*moderate.*regular.*growth/i,             category: 'Retirement – Moderate' },
  { pattern: /sbi retirement benefit.*aggressive.*regular.*growth/i,            category: 'Retirement – Aggressive' },
  { pattern: /franklin india pension.*regular.*growth/i,                        category: 'Retirement – Balanced' },
  { pattern: /uti retirement benefit pension.*regular.*growth/i,                category: 'Retirement – Balanced' },
  { pattern: /nippon india retirement.*wealth creation.*regular.*growth/i,      category: 'Retirement – Equity' },
  { pattern: /icici prudential retirement.*pure equity.*regular.*growth/i,      category: 'Retirement – Equity' },
  { pattern: /icici prudential retirement.*hybrid aggressive.*regular.*growth/i,category: 'Retirement – Hybrid' },
];

function parseNavDate(str: string): Date {
  const [d, m, y] = str.split('-');
  const months: Record<string, number> = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
  return new Date(parseInt(y), months[m] ?? 0, parseInt(d));
}

function navAtDaysAgo(navData: { date: string; nav: string }[], daysAgo: number): number | null {
  const cutoff = Date.now() - daysAgo * 86_400_000;
  for (const entry of navData) {
    if (parseNavDate(entry.date).getTime() <= cutoff) return parseFloat(entry.nav);
  }
  return null;
}

function cagr(current: number, past: number, years: number): number {
  if (past <= 0) return 0;
  return (Math.pow(current / past, 1 / years) - 1) * 100;
}

function cleanName(name: string): string {
  return name.replace(/\s*[-–]\s*(Regular Plan|Regular)\s*[-–].*$/i, '').trim();
}

function fmtReturn(r: number | null): string {
  if (r === null) return '—';
  return `${r >= 0 ? '+' : ''}${r.toFixed(1)}%`;
}

function returnColor(r: number | null): string {
  if (r === null) return 'text-slate-400';
  return r >= 0 ? 'text-emerald-600 font-semibold' : 'text-red-500 font-semibold';
}

async function fetchFundsByPatterns(patterns: { pattern: RegExp; category: string }[]): Promise<FundRow[]> {
  const allSchemes: { schemeCode: number; schemeName: string }[] =
    await fetch('https://api.mfapi.in/mf').then(r => r.json());
  const matched = patterns.map(({ pattern, category }) => {
    const found = allSchemes.find(s => pattern.test(s.schemeName));
    return found ? { schemeCode: found.schemeCode, schemeName: found.schemeName, category } : null;
  }).filter(Boolean) as { schemeCode: number; schemeName: string; category: string }[];
  const navResults = await Promise.allSettled(
    matched.map(m =>
      fetch(`https://api.mfapi.in/mf/${m.schemeCode}`)
        .then(r => r.json())
        .then(json => ({ meta: json.meta, data: json.data as { date: string; nav: string }[], category: m.category }))
    )
  );
  const rows: FundRow[] = navResults
    .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value?.data?.length > 0)
    .map(r => {
      const { meta, data, category } = r.value;
      const current = parseFloat(data[0].nav);
      return {
        name:     cleanName(meta.scheme_name),
        category,
        return1Y: navAtDaysAgo(data, 365)     ? cagr(current, navAtDaysAgo(data, 365)!,    1) : null,
        return3Y: navAtDaysAgo(data, 365 * 3) ? cagr(current, navAtDaysAgo(data, 365 * 3)!, 3) : null,
        return5Y: navAtDaysAgo(data, 365 * 5) ? cagr(current, navAtDaysAgo(data, 365 * 5)!, 5) : null,
      };
    });
  rows.sort((a, b) => {
    if (a.return3Y === null && b.return3Y === null) return 0;
    if (a.return3Y === null) return 1;
    if (b.return3Y === null) return -1;
    return b.return3Y - a.return3Y;
  });
  return rows;
}

// ── Static data ───────────────────────────────────────────────────────────────

const NPS_SCHEMES = [
  { scheme: 'Scheme E – Equity', tier: 'Tier 1', description: 'Up to 75% in equities. Highest growth potential within NPS. Allocation reduces automatically as you approach retirement (auto-choice).', taxBenefit: 'Sec 80CCD(1) + 80CCD(1B)', lockIn: 'Till age 60', minInvest: '₹500/year', note: 'Ideal for investors below 45 seeking long-term equity growth.' },
  { scheme: 'Scheme C – Corporate Bonds', tier: 'Tier 1', description: 'Invests in AA+ and above rated corporate debt. Stable income with moderate credit risk. Good complement to Scheme E.', taxBenefit: 'Sec 80CCD(1) + 80CCD(1B)', lockIn: 'Till age 60', minInvest: '₹500/year', note: 'Suitable as a debt component in NPS Active Choice.' },
  { scheme: 'Scheme G – Govt Securities', tier: 'Tier 1', description: 'Invests exclusively in central and state government bonds. Lowest risk, sovereign-backed returns.', taxBenefit: 'Sec 80CCD(1) + 80CCD(1B)', lockIn: 'Till age 60', minInvest: '₹500/year', note: 'Capital preservation with government guarantee. Lower return potential.' },
  { scheme: 'Scheme E – Equity', tier: 'Tier 2', description: 'Same equity strategy as Tier 1 Scheme E but fully liquid — withdraw anytime with no lock-in.', taxBenefit: 'No tax benefit (except govt employees)', lockIn: 'None', minInvest: '₹250/contribution', note: 'Use as a flexible top-up alongside your Tier 1 account.' },
];

const PMS_STRATEGIES = [
  { house: 'Motilal Oswal PMS', strategy: 'NTDO – Next Trillion Dollar Opportunity', category: 'Multi Cap', aum: '₹8,000 Cr+', minInvest: '₹50L', description: 'Concentrated portfolio of 20–25 high-quality businesses with a long runway for earnings growth. Buy-and-hold philosophy with very low churn.' },
  { house: 'ASK Investment Managers', strategy: 'ASK Growth Portfolio', category: 'Large & Mid Cap', aum: '₹12,000 Cr+', minInvest: '₹50L', description: 'Quality-focused portfolio emphasising high return on equity, low debt, and consistent earnings growth. One of India\'s largest PMS managers by AUM.' },
  { house: 'Marcellus Investment Managers', strategy: 'Consistent Compounders Portfolio', category: 'Large Cap', aum: '₹4,000 Cr+', minInvest: '₹50L', description: 'Portfolio of 10–15 stocks with decades of earnings consistency and clean accounting. Forensic accounting-based stock screening.' },
  { house: '360 ONE Asset Management', strategy: 'Focused Equity Portfolio', category: 'Flexi Cap', aum: '₹3,000 Cr+', minInvest: '₹50L', description: 'High-conviction bets across market caps with focus on capital efficiency and free cash flow generation.' },
  { house: 'Kotak PMS', strategy: 'Classic Opportunities', category: 'Large Cap', aum: '₹5,000 Cr+', minInvest: '₹50L', description: 'Top-down and bottom-up approach combining macroeconomic sector bets with individual stock selection at reasonable valuations.' },
  { house: 'White Oak Capital', strategy: 'India Pioneer Equity', category: 'Flexi Cap', aum: '₹2,500 Cr+', minInvest: '₹50L', description: 'Proprietary research-driven approach with emphasis on earnings quality, balance sheet strength, and management integrity.' },
];

const AIF_STRATEGIES = [
  { house: 'Edelweiss Alternatives', fund: 'Long Short Equity Fund', category: 'Category III', strategy: 'Long-Short Equity', minInvest: '₹1 Cr', description: 'Equity long-short strategy with limited directional market exposure. Aims to generate positive absolute returns regardless of market direction.' },
  { house: 'IIFL Asset Management', fund: 'Special Opportunities Fund', category: 'Category II', strategy: 'Special Situations', minInvest: '₹1 Cr', description: 'Invests in pre-IPO equity, structured credit, and high-yield opportunities. Targets companies at inflection points before public listing.' },
  { house: 'Avendus Capital', fund: 'Absolute Return Fund', category: 'Category III', strategy: 'Market Neutral', minInvest: '₹1 Cr', description: 'Market-neutral strategy using equity derivatives to generate consistent risk-adjusted alpha with low correlation to equity indices.' },
  { house: 'DSP Alternatives', fund: 'Alpha Equity Fund', category: 'Category III', strategy: 'Quantitative Long-Short', minInvest: '₹1 Cr', description: 'Systematic quantitative long-short equity strategy leveraging factor models and momentum signals across a broad universe of listed stocks.' },
  { house: 'Mirae Asset AIF', fund: 'India Equity Allocator Fund', category: 'Category III', strategy: 'Dynamic Allocation', minInvest: '₹1 Cr', description: 'Dynamic allocation across equity, debt, and derivatives based on macroeconomic signals and valuation models.' },
];

const REITS = [
  { name: 'Embassy Office Parks REIT', ticker: 'EMBASSY', type: 'Commercial – Office', yield: '~6.0%', distribution: 'Quarterly', minInvest: '1 unit (~₹350)', description: 'India\'s first and largest REIT. ~45 mn sq ft of Grade A office space across Bengaluru, Mumbai, Pune, NCR. Major MNC tenants.' },
  { name: 'Mindspace Business Parks REIT', ticker: 'MINDSPACE', type: 'Commercial – Office', yield: '~5.8%', distribution: 'Quarterly', minInvest: '1 unit (~₹310)', description: 'Grade A office portfolio across Hyderabad, Mumbai, Pune, Chennai. Backed by K Raheja Corp. ~32 mn sq ft of leasable area.' },
  { name: 'Brookfield India REIT', ticker: 'BIRET', type: 'Commercial – Office', yield: '~6.5%', distribution: 'Quarterly', minInvest: '1 unit (~₹285)', description: 'Managed by Brookfield Asset Management. Quality office assets in Mumbai, Gurugram, Noida, Kolkata with global institutional backing.' },
  { name: 'Nexus Select Trust', ticker: 'NEXUS', type: 'Retail – Shopping Malls', yield: '~5.5%', distribution: 'Quarterly', minInvest: '1 unit (~₹130)', description: 'India\'s first retail REIT. 17 Grade A shopping malls across 14 cities. Consumer spending resilience makes this a stable income asset.' },
];

const FRACTIONAL_RE = [
  { name: 'Strata', type: 'Commercial Real Estate', yield: '8–10% p.a.', minInvest: '₹25 Lakh', payout: 'Monthly', description: 'SEBI-regulated fractional ownership platform (SM REIT framework). Curated Grade A commercial properties. Monthly rent + capital appreciation upside.' },
  { name: 'hBits', type: 'Commercial Real Estate', yield: '8–9% p.a.', minInvest: '₹25 Lakh', payout: 'Monthly', description: 'Mumbai-based fractional platform. Focuses on high-yield commercial assets in Tier 1 cities. SEBI-registered Alternative Investment Fund structure.' },
  { name: 'PropertyShare', type: 'Commercial Real Estate', yield: '8–10% p.a.', minInvest: '₹10 Lakh', payout: 'Monthly', description: 'One of India\'s earliest fractional platforms. Office, warehousing, and retail assets. Lower ticket size makes it accessible for early retirees.' },
];

const DEBT_FUNDS = [
  { name: 'Short Duration Funds', horizon: '1–3 years', risk: 'Low-Medium', yieldRange: '6–7%', description: 'Invest in debt instruments with 1–3 year maturities. Low interest rate risk. Suitable as a stable income base post-retirement.' },
  { name: 'Banking & PSU Debt Funds', horizon: '2–3 years', risk: 'Low', yieldRange: '6–7%', description: 'Invest only in bonds from banks and public sector units. Near-sovereign credit quality. Ideal for conservative retirees.' },
  { name: 'Dynamic Bond Funds', horizon: '3+ years', risk: 'Medium', yieldRange: '6–8%', description: 'Fund manager adjusts duration based on interest rate outlook. Can benefit significantly in a falling rate cycle.' },
  { name: 'Target Maturity Funds', horizon: 'Fixed (3–10 years)', risk: 'Low', yieldRange: '6.5–7.5%', description: 'Passive funds that hold bonds till a fixed maturity date. Predictable returns if held to maturity — more tax-efficient than FDs.' },
];

// ── Sub-components ────────────────────────────────────────────────────────────

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
// Descending: newest first
const PE_YEARS_DESC = Object.keys(PE_DATA).map(Number).sort((a, b) => b - a);
const VISIBLE_YEARS = 5;

function PeHeatmap() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const [expanded, setExpanded] = useState(false);

  const visibleYears = expanded ? PE_YEARS_DESC : PE_YEARS_DESC.slice(0, VISIBLE_YEARS);
  const hiddenCount  = PE_YEARS_DESC.length - VISIBLE_YEARS;

  function HeatRow({ year }: { year: number }) {
    return (
      <div className="flex items-center gap-1">
        <div className="w-10 text-xs text-slate-500 font-semibold text-right pr-2 flex-shrink-0">{year}</div>
        {MONTHS.map((_, i) => {
          const month = i + 1;
          const pe = PE_DATA[year]?.[month];
          const isCurrentMonth = year === currentYear && month === currentMonth;
          if (!pe) return <div key={month} className="w-14 h-8 rounded-md bg-slate-100" />;
          const zone = getPeZone(pe);
          return (
            <div key={month} className="relative group">
              <div
                className={`w-14 h-8 rounded-md ${zone.color} ${zone.cellText} flex items-center justify-center text-[11px] font-bold tracking-tight transition-transform hover:scale-105 cursor-default select-none ${
                  isCurrentMonth ? 'ring-2 ring-offset-1 ring-slate-700' : ''
                }`}
              >
                {pe.toFixed(1)}
              </div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-lg">
                <span className="font-semibold">{MONTHS[i]} {year}</span>
                <span className="text-slate-300 mx-1">·</span>
                P/E {pe.toFixed(1)}
                <span className="text-slate-300 mx-1">·</span>
                {zone.label}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto">
        <div className="w-max space-y-1">
          {/* Month headers */}
          <div className="flex gap-1 ml-12 mb-1">
            {MONTHS.map(m => (
              <div key={m} className="w-14 text-center text-xs text-slate-400 font-medium">{m}</div>
            ))}
          </div>
          {/* Year rows — newest first */}
          {visibleYears.map(year => <HeatRow key={year} year={year} />)}

          {/* Expand / collapse — w-full of w-max container = exactly table width */}
          <button
            onClick={() => setExpanded(e => !e)}
            className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-dashed border-emerald-300 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-400 transition-colors"
          >
            <span className="text-sm leading-none text-emerald-600">{expanded ? '▲' : '▼'}</span>
            <span className="text-xs font-semibold text-emerald-700">
              {expanded ? 'Show less' : `Show ${hiddenCount} more years (2000–${PE_YEARS_DESC[VISIBLE_YEARS - 1] - 1})`}
            </span>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {PE_ZONES.map(zone => (
          <div key={zone.label} className="flex items-center gap-1.5 text-xs text-slate-600">
            <div className={`w-4 h-4 rounded-sm ${zone.color} flex items-center justify-center text-[9px] font-bold ${zone.cellText}`}>
              {zone.max === Infinity ? '32+' : `<${zone.max}`}
            </div>
            {zone.label}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <div className="w-3.5 h-3.5 rounded-sm bg-slate-100" />
          No data
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Monthly average P/E ratio, Nifty 50 (2000–present). Highlighted cell = current month. Data is approximate — sourced from NSE India historical records. Updated manually each month.
      </p>
    </div>
  );
}

function FundTable({ data, loading, error }: { data: FundRow[]; loading: boolean; error: string | null }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
        <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
        <p className="text-sm">Fetching live NAV data from MFapi.in…</p>
      </div>
    );
  }
  if (error) {
    return <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-sm text-red-800">{error}</div>;
  }
  if (data.length === 0) return null;
  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-5 py-4 font-semibold text-slate-700 w-8">#</th>
              <th className="text-left px-5 py-4 font-semibold text-slate-700">Fund</th>
              <th className="text-left px-5 py-4 font-semibold text-slate-700">Category</th>
              <th className="text-right px-5 py-4 font-semibold text-slate-700">1Y</th>
              <th className="text-right px-5 py-4 font-semibold text-slate-700 bg-emerald-50">3Y</th>
              <th className="text-right px-5 py-4 font-semibold text-slate-700">5Y</th>
            </tr>
          </thead>
          <tbody>
            {data.map((fund, i) => (
              <tr key={fund.name} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-5 py-4 text-slate-400 text-xs">{i + 1}</td>
                <td className="px-5 py-4 font-medium text-slate-900">{fund.name}</td>
                <td className="px-5 py-4">
                  <span className="inline-block px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">{fund.category}</span>
                </td>
                <td className={`px-5 py-4 text-right tabular-nums ${returnColor(fund.return1Y)}`}>{fmtReturn(fund.return1Y)}</td>
                <td className={`px-5 py-4 text-right tabular-nums bg-emerald-50/50 ${returnColor(fund.return3Y)}`}>{fmtReturn(fund.return3Y)}</td>
                <td className={`px-5 py-4 text-right tabular-nums ${returnColor(fund.return5Y)}`}>{fmtReturn(fund.return5Y)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400">CAGR (annualised). Regular growth plans. Live from MFapi.in. Sorted by 3Y return.</p>
    </>
  );
}

function SubTabPills<T extends string>({ tabs, active, onChange }: { tabs: { value: T; label: string }[]; active: T; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {tabs.map(t => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`px-4 py-1.5 text-sm font-medium rounded-full transition whitespace-nowrap ${
            active === t.value ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function ElevateCta({ label }: { label: string }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
      <div>
        <p className="font-semibold text-slate-900 text-sm">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">Your wealth manager can help you pick the right products for your plan.</p>
      </div>
      <button
        onClick={() => navigate('/dashboard/elevate')}
        className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition flex-shrink-0"
      >
        Talk to wealth manager <ArrowUpRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type CorpusTab = 'equity' | 'retirement' | 'pms' | 'aif';
type IncomeTab = 'nps' | 'reits' | 'fractional' | 'debt';

const CORPUS_TABS: { value: CorpusTab; label: string }[] = [
  { value: 'equity',     label: 'Equity MFs' },
  { value: 'retirement', label: 'Retirement MFs' },
  { value: 'pms',        label: 'PMS' },
  { value: 'aif',        label: 'AIF' },
];

const INCOME_TABS: { value: IncomeTab; label: string }[] = [
  { value: 'nps',        label: 'NPS' },
  { value: 'reits',      label: 'REITs' },
  { value: 'fractional', label: 'Fractional Real Estate' },
  { value: 'debt',       label: 'Debt MFs' },
];

export default function KnowYourMarketPage() {
  const [corpusTab, setCorpusTab] = useState<CorpusTab>('equity');
  const [incomeTab, setIncomeTab] = useState<IncomeTab>('nps');

  const [equityData,     setEquityData]     = useState<FundRow[]>([]);
  const [equityLoading,  setEquityLoading]  = useState(false);
  const [equityError,    setEquityError]    = useState<string | null>(null);

  const [retData,     setRetData]     = useState<FundRow[]>([]);
  const [retLoading,  setRetLoading]  = useState(false);
  const [retError,    setRetError]    = useState<string | null>(null);

  useEffect(() => {
    if (corpusTab !== 'equity' || equityData.length > 0 || equityLoading) return;
    setEquityLoading(true);
    fetchFundsByPatterns(EQUITY_PATTERNS)
      .then(setEquityData)
      .catch(() => setEquityError('Unable to load fund data. Please check your connection.'))
      .finally(() => setEquityLoading(false));
  }, [corpusTab]);

  useEffect(() => {
    if (corpusTab !== 'retirement' || retData.length > 0 || retLoading) return;
    setRetLoading(true);
    fetchFundsByPatterns(RETIREMENT_PATTERNS)
      .then(setRetData)
      .catch(() => setRetError('Unable to load fund data. Please check your connection.'))
      .finally(() => setRetLoading(false));
  }, [corpusTab]);

  return (
    <>
      <CanonicalPageHeader
        title="Explore market valuations, growth assets, and income-generating products for your retirement plan."
      />

      <div className="py-12 px-6 lg:px-8 space-y-16">

        {/* ── Section 1: Market Pulse ───────────────────────────────────────── */}
        <section className="space-y-6">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-1">Market Context</p>
            <h2 className="text-2xl font-bold text-slate-900">Market Pulse</h2>
            <p className="text-sm text-slate-500 mt-1">
              Is the Indian equity market cheap or expensive right now? Historical P/E tells you.
              Use this before making lump sum decisions.
            </p>
          </div>
          <PeHeatmap />
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
            <p className="text-sm text-blue-900 leading-relaxed">
              <strong>How to use this:</strong> During green months (low P/E), lump sum investments have historically offered better entry points. During red months (high P/E), SIPs remain the right approach — averaging out over time. This is not a buy/sell signal.
            </p>
          </div>
        </section>

        {/* ── Section 2: Build Your Corpus ─────────────────────────────────── */}
        <section className="space-y-6">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-3">
              <TrendingUp className="w-3.5 h-3.5" /> Accumulation Phase
            </span>
            <h2 className="text-2xl font-bold text-slate-900">Build Your Corpus</h2>
            <p className="text-sm text-slate-500 mt-1">
              Growth-oriented assets for your SIP years. Typically held 7–15+ years to build the retirement corpus.
            </p>
          </div>

          <SubTabPills tabs={CORPUS_TABS} active={corpusTab} onChange={setCorpusTab} />

          {corpusTab === 'equity' && (
            <FundTable data={equityData} loading={equityLoading} error={equityError} />
          )}

          {corpusTab === 'retirement' && (
            <>
              <p className="text-sm text-slate-500">
                AMFI "Solution Oriented – Retirement Fund" category. Designed specifically for retirement with automatic glide-path in some schemes.
              </p>
              <FundTable data={retData} loading={retLoading} error={retError} />
            </>
          )}

          {corpusTab === 'pms' && (
            <>
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <Building2 className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">Portfolio Management Services — Minimum ₹50 Lakh</p>
                  <p className="text-xs text-amber-700 mt-0.5">SEBI-regulated. Separately managed accounts with direct stock ownership. Data curated from APMI industry reports — updated monthly.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PMS_STRATEGIES.map((pms, i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{pms.house}</p>
                        <p className="font-semibold text-slate-900 mt-0.5 leading-snug">{pms.strategy}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">{pms.category}</span>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 whitespace-nowrap flex-shrink-0">Min {pms.minInvest}</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{pms.description}</p>
                    <p className="text-xs text-slate-400">AUM: {pms.aum}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {corpusTab === 'aif' && (
            <>
              <div className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <Building2 className="w-5 h-5 text-purple-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-purple-900">Alternative Investment Funds — Minimum ₹1 Crore</p>
                  <p className="text-xs text-purple-700 mt-0.5">SEBI-regulated pooled vehicles in non-traditional strategies. Data curated from APMI/SEBI disclosures — updated quarterly.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AIF_STRATEGIES.map((aif, i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{aif.house}</p>
                        <p className="font-semibold text-slate-900 mt-0.5 leading-snug">{aif.fund}</p>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-medium">{aif.category}</span>
                          <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">{aif.strategy}</span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 whitespace-nowrap flex-shrink-0">Min {aif.minInvest}</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{aif.description}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          <ElevateCta label="Ready to start building your corpus?" />
        </section>

        {/* ── Section 3: Generate Income ────────────────────────────────────── */}
        <section className="space-y-6">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-blue-700 bg-blue-50 px-3 py-1 rounded-full mb-3">
              <Landmark className="w-3.5 h-3.5" /> Distribution Phase
            </span>
            <h2 className="text-2xl font-bold text-slate-900">Generate Income</h2>
            <p className="text-sm text-slate-500 mt-1">
              Income-generating assets for your SWP years. Monthly or quarterly payouts to replace your salary in retirement.
            </p>
          </div>

          <SubTabPills tabs={INCOME_TABS} active={incomeTab} onChange={setIncomeTab} />

          {incomeTab === 'nps' && (
            <>
              <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <Shield className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-emerald-900">ICICI Prudential Pension Fund – NPS</p>
                  <p className="text-xs text-emerald-700 mt-0.5">Extra ₹50,000 tax deduction under Sec 80CCD(1B) — over and above the ₹1.5L 80C limit. One of India's top-performing NPS fund managers.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {NPS_SCHEMES.map((scheme, i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{scheme.scheme}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">{scheme.tier}</span>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 whitespace-nowrap flex-shrink-0">Min {scheme.minInvest}</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{scheme.description}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span><strong>Tax:</strong> {scheme.taxBenefit}</span>
                      <span><strong>Lock-in:</strong> {scheme.lockIn}</span>
                    </div>
                    <p className="text-xs text-slate-400 italic">{scheme.note}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400">NPS returns published monthly by PFRDA at npstrust.org.in.</p>
            </>
          )}

          {incomeTab === 'reits' && (
            <>
              <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <Landmark className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Listed Real Estate Investment Trusts</p>
                  <p className="text-xs text-slate-600 mt-0.5">Traded on NSE/BSE. Quarterly distributions. No lock-in — fully liquid like a stock. Ideal for retirement income with real estate exposure.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {REITS.map((reit, i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900 leading-snug">{reit.name}</p>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">{reit.ticker}</span>
                          <span className="inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">{reit.type}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-emerald-600">{reit.yield}</p>
                        <p className="text-xs text-slate-400">{reit.distribution}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{reit.description}</p>
                    <p className="text-xs text-slate-400">Min investment: {reit.minInvest}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400">Yields are approximate and vary with unit price. Data is indicative — verify current distribution yield before investing.</p>
            </>
          )}

          {incomeTab === 'fractional' && (
            <>
              <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <HomeIcon className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Fractional Commercial Real Estate</p>
                  <p className="text-xs text-slate-600 mt-0.5">SEBI-regulated SM REIT framework. Own a fraction of Grade A commercial property. Monthly rental income credited directly. Higher yield than listed REITs, lower liquidity.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {FRACTIONAL_RE.map((re, i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{re.name}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">{re.type}</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-bold text-emerald-600">{re.yield}</p>
                        <p className="text-xs text-slate-400">{re.payout} payout</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{re.description}</p>
                    <p className="text-xs text-slate-400">Min: {re.minInvest}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400">Yields are indicative based on platform disclosures. Fractional real estate is illiquid — suitable for 5+ year holding periods. SEBI-regulated under SM REIT framework.</p>
            </>
          )}

          {incomeTab === 'debt' && (
            <>
              <p className="text-sm text-slate-500">
                Debt mutual funds as a systematic withdrawal vehicle in retirement. More tax-efficient than FDs for holding periods above 3 years.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DEBT_FUNDS.map((fund, i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{fund.name}</p>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">{fund.horizon}</span>
                          <span className="inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">Risk: {fund.risk}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-bold text-emerald-600">{fund.yieldRange}</p>
                        <p className="text-xs text-slate-400">typical yield</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{fund.description}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          <ElevateCta label="Want help structuring your retirement income?" />
        </section>

        {/* ── Global disclaimer ─────────────────────────────────────────────── */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <p className="text-sm text-blue-900 leading-relaxed">
            <strong>Educational data only:</strong> All information on this page is for reference and learning purposes. Past returns do not guarantee future performance. Nothing here constitutes a recommendation to invest in any specific product. Mutual fund, REIT, PMS, and AIF investments are subject to market risk. Please read all scheme documents carefully.
          </p>
        </div>

      </div>
    </>
  );
}
