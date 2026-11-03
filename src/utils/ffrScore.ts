import type { CalculatorInputs, CalculationResults } from '@/types/calculator';
import type { FFRFoundationsChecklist } from '@/types/ffr';

export type ScoreComponentKey =
  | 'corpus_progress'
  | 'time_buffer'
  | 'savings_rate'
  | 'essentials_coverage'
  | 'lifestyle_sustainability';

export interface ScoreComponent {
  name: string;
  scoreComponent: ScoreComponentKey;
  points: number;
  max: number;
  feedback: string;
}

const formatCr = (value: number) => `₹${(value / 10000000).toFixed(1)}Cr`;
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/**
 * Single source of truth for the FFR score: the five parts, their points and
 * the explanation shown for each. Used by the public calculator, the dashboard
 * score card and the score breakdown. Pass checklist=null when checklist data
 * is unavailable (e.g. public calculator); Essentials then scores 0.
 */
export function scoreBreakdown(
  inputs: CalculatorInputs,
  results: CalculationResults,
  projections: Array<{ age: number; expectedCorpus: number }>,
  checklist: FFRFoundationsChecklist | null
): ScoreComponent[] {
  const retirementAge = inputs.age + inputs.yearsForSIP + inputs.waitingYearsBeforeSWP;

  // Component 1: Corpus Progress (30 pts)
  const expectedCorpus = projections.find(p => p.age === retirementAge)?.expectedCorpus ?? 0;
  const corpusRatio = results.requiredCorpus > 0 ? expectedCorpus / results.requiredCorpus : 0;
  const corpusProgress = results.requiredCorpus > 0 ? Math.min(corpusRatio * 30, 30) : 0;
  const corpusPct = Math.round(corpusRatio * 100);
  const corpusFeedback = results.requiredCorpus <= 0
    ? 'No required corpus to target — goal already covered.'
    : corpusPct >= 100
      ? 'Your projected corpus meets or exceeds the required amount.'
      : `Your projected corpus is ${corpusPct}% of the ${formatCr(results.requiredCorpus)} target. Increase SIP to close the gap.`;

  // Component 2: Time Buffer (20 pts): how many years before the target
  // retirement age the money would already be enough
  const freedomAge = results.freedomAge;
  const yearsEarly = freedomAge === null ? null : retirementAge - freedomAge;
  let timeBuffer = 0;
  if (yearsEarly !== null) {
    if (yearsEarly >= 10) timeBuffer = 20;
    else if (yearsEarly >= 5) timeBuffer = 15;
    else if (yearsEarly >= 1) timeBuffer = 10;
    else if (yearsEarly === 0) timeBuffer = 5;
  }
  const timeBufferFeedback = yearsEarly === null
    ? `At your current SIP, the money isn't enough to retire at any age before ${inputs.lifeExpectancy}. Increase your SIP to bring this forward.`
    : yearsEarly >= 10
      ? `Your money would be enough by age ${freedomAge}, ${yearsEarly} years before your target — full points.`
      : yearsEarly >= 1
        ? `Your money would be enough by age ${freedomAge}, ${plural(yearsEarly, 'year')} before your target of ${retirementAge}. Aim for ${yearsEarly >= 5 ? 10 : 5}+ years early for more points.`
        : yearsEarly === 0
          ? `Your money is just enough at your target age of ${retirementAge}, with no extra margin.`
          : `Your money would only be enough by age ${freedomAge}, ${plural(-yearsEarly, 'year')} after your target of ${retirementAge}. Increase your SIP to retire on time.`;

  // Component 3: Savings Rate (20 pts)
  const hasIncome = inputs.monthlyIncome > 0;
  const sipRate = hasIncome ? inputs.sipAmount / inputs.monthlyIncome : 0;
  let savingsRateScore = 5;
  if (sipRate >= 0.20) savingsRateScore = 20;
  else if (sipRate >= 0.10) savingsRateScore = 10;
  const sipPct = Math.round(sipRate * 100);
  const savingsRateFeedback = !hasIncome
    ? 'Add your monthly income (Edit my inputs) to score your savings rate.'
    : sipRate >= 0.20
      ? `Your SIP is ${sipPct}% of your income — excellent savings rate.`
      : sipRate >= 0.10
        ? `Your SIP is ${sipPct}% of your income. Reach 20% for full points.`
        : `Your SIP is ${sipPct}% of your income. Aim for at least 10% for partial credit, 20% for full points.`;

  // Component 4: Essentials Coverage (20 pts) — 5 pts each
  const lifeInsurance = checklist?.insurance_evidence ? 5 : 0;
  const healthInsurance = checklist?.insurance_evidence ? 5 : 0;
  const emergencyFund = checklist?.emergency_fund_baseline ? 5 : 0;
  const sipAdequacy = checklist?.sip_mandate_active ? 5 : 0;
  const essentialsCoverage = lifeInsurance + healthInsurance + emergencyFund + sipAdequacy;
  const missingItems: string[] = [];
  if (!checklist?.insurance_evidence) missingItems.push('insurance');
  if (!checklist?.emergency_fund_baseline) missingItems.push('emergency fund');
  if (!checklist?.sip_mandate_active) missingItems.push('SIP mandate');
  const essentialsFeedback = missingItems.length === 0
    ? 'All essentials covered — insurance, emergency fund, and SIP mandate active.'
    : `Missing: ${missingItems.join(', ')}. Complete these in your checklist to earn points.`;

  // Component 5: Lifestyle Sustainability (10 pts)
  let sustainabilityScore = 10;
  if (results.corpusDepletesBeforeLifeExpectancy && results.corpusDepletionAge) {
    sustainabilityScore = inputs.lifeExpectancy - results.corpusDepletionAge <= 10 ? 5 : 0;
  }
  const sustainabilityFeedback = sustainabilityScore === 10
    ? 'Your corpus sustains withdrawals through your full life expectancy.'
    : results.corpusDepletionAge
      ? `Corpus depletes at age ${results.corpusDepletionAge}, ${inputs.lifeExpectancy - results.corpusDepletionAge} years before life expectancy. Reduce withdrawals or increase SIP.`
      : 'Corpus may not last through life expectancy. Review your withdrawal plan.';

  return [
    { name: 'Corpus Progress', scoreComponent: 'corpus_progress', points: Math.round(corpusProgress), max: 30, feedback: corpusFeedback },
    { name: 'Time Buffer', scoreComponent: 'time_buffer', points: timeBuffer, max: 20, feedback: timeBufferFeedback },
    { name: 'Savings Rate', scoreComponent: 'savings_rate', points: savingsRateScore, max: 20, feedback: savingsRateFeedback },
    { name: 'Essentials Coverage', scoreComponent: 'essentials_coverage', points: essentialsCoverage, max: 20, feedback: essentialsFeedback },
    { name: 'Lifestyle Sustainability', scoreComponent: 'lifestyle_sustainability', points: sustainabilityScore, max: 10, feedback: sustainabilityFeedback },
  ];
}

export function calculateFFRScore(
  inputs: CalculatorInputs,
  results: CalculationResults,
  projections: Array<{ age: number; expectedCorpus: number }>,
  checklist: FFRFoundationsChecklist | null
): number {
  const total = scoreBreakdown(inputs, results, projections, checklist).reduce((sum, c) => sum + c.points, 0);
  return Math.max(0, Math.min(100, Math.round(total)));
}

export const FFR_SCORE_STATUS = (
  score: number,
  essentialsCoverage?: number,
  sustainabilityScore?: number
): { status: string; statusColor: string } => {
  if (essentialsCoverage === 0 || sustainabilityScore === 0) {
    return { status: 'Needs Attention 🔴', statusColor: 'bg-red-500/10 text-red-600 dark:text-red-400' };
  }
  if (score <= 30) return { status: 'Needs Attention 🔴', statusColor: 'bg-red-500/10 text-red-600 dark:text-red-400' };
  if (score <= 60) return { status: 'In Progress 🟡', statusColor: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' };
  if (score <= 80) return { status: 'On Track 🟢', statusColor: 'bg-green-500/10 text-green-600 dark:text-green-400' };
  return { status: 'Excellent 🌟', statusColor: 'bg-primary/10 text-primary' };
};
