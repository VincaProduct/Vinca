import type { CalculatorInputs, CalculationResults } from '@/types/calculator';
import type { FFRFoundationsChecklist } from '@/types/ffr';

/**
 * Single source of truth for the FFR score formula.
 * Used by both the public calculator and the dashboard score card.
 * Pass checklist=null when checklist data is unavailable (e.g. public calculator).
 */
export function calculateFFRScore(
  inputs: CalculatorInputs,
  results: CalculationResults,
  projections: Array<{ age: number; expectedCorpus: number }>,
  checklist: FFRFoundationsChecklist | null
): number {
  // Component 1: Corpus Progress (30 pts)
  const retirementAge = inputs.age + inputs.yearsForSIP + inputs.waitingYearsBeforeSWP;
  const retirementProjection = projections.find(p => p.age === retirementAge);
  const expectedCorpus = retirementProjection?.expectedCorpus || 0;
  const corpusProgress = results.requiredCorpus > 0
    ? Math.min((expectedCorpus / results.requiredCorpus) * 30, 30)
    : 0;

  // Component 2: Time Buffer (20 pts)
  const freedomAge = results.freedomAge;
  const yearsEarlyBuffer = retirementAge - freedomAge;
  let timeBuffer = 0;
  if (yearsEarlyBuffer >= 10) timeBuffer = 20;
  else if (yearsEarlyBuffer >= 5) timeBuffer = 15;
  else if (yearsEarlyBuffer >= 1) timeBuffer = 10;
  else if (yearsEarlyBuffer === 0) timeBuffer = 5;
  else timeBuffer = 0;

  // Component 3: Savings Rate (20 pts)
  const sipRate = inputs.monthlyIncome > 0 ? inputs.sipAmount / inputs.monthlyIncome : 0;
  let savingsRateScore = 5;
  if (sipRate >= 0.20) savingsRateScore = 20;
  else if (sipRate >= 0.10) savingsRateScore = 10;

  // Component 4: Essentials Coverage (20 pts) — 5 pts each
  const lifeInsurance = checklist?.insurance_evidence ? 5 : 0;
  const healthInsurance = checklist?.insurance_evidence ? 5 : 0;
  const emergencyFund = checklist?.emergency_fund_baseline ? 5 : 0;
  const sipAdequacy = checklist?.sip_mandate_active ? 5 : 0;
  const essentialsCoverage = lifeInsurance + healthInsurance + emergencyFund + sipAdequacy;

  // Component 5: Lifestyle Sustainability (10 pts)
  let sustainabilityScore = 10;
  if (results.corpusDepletesBeforeLifeExpectancy && results.corpusDepletionAge) {
    const yearsEarly = inputs.lifeExpectancy - results.corpusDepletionAge;
    sustainabilityScore = yearsEarly <= 10 ? 5 : 0;
  }

  const total = corpusProgress + timeBuffer + savingsRateScore + essentialsCoverage + sustainabilityScore;
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
