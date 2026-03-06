/**
 * Readiness Fit - Financial Readiness Calculations
 * Pure functions for calculating financial readiness gap
 */

import {
  FinancialInputs,
  FinancialReadinessResult,
} from './types';

/**
 * Validates that all required financial inputs are provided
 * @param inputs - Financial inputs to validate
 * @returns Array of missing input names, empty if all present
 */
export function validateFinancialInputs(inputs: Partial<FinancialInputs>): string[] {
  const missing: string[] = [];
  const required: (keyof FinancialInputs)[] = [
    'currentSavings',
    'monthlySIP',
    'emergencyFundMonths',
    'currentRetirementCorpus',
    'targetRetirementCorpus',
    'monthlyIncome',
    'monthlyEssentialExpenses',
    'sipConsistencyMonths',
  ];

  for (const key of required) {
    if (inputs[key] === undefined || inputs[key] === null || inputs[key] === 0) {
      missing.push(key);
    }
  }

  return missing;
}

/**
 * Calculates savings adequacy ratio
 * Higher ratio = more savings relative to monthly expenses
 * @param currentSavings - Total liquid savings
 * @param monthlyEssentialExpenses - Monthly essential expenses
 * @returns Ratio between 0-10 (capped at 10 for 100% adequacy)
 */
export function calculateSavingsAdequacyRatio(
  currentSavings: number,
  monthlyEssentialExpenses: number
): number {
  if (monthlyEssentialExpenses === 0) return 0;
  const ratio = currentSavings / monthlyEssentialExpenses;
  return Math.min(ratio, 10); // Cap at 10x (10 months covered)
}

/**
 * Calculates emergency fund coverage percentage
 * Goal: 6-12 months of essential expenses
 * @param emergencyFundMonths - Months of expenses covered
 * @returns Score from 0-100
 */
export function calculateEmergencyFundScore(emergencyFundMonths: number): number {
  const targetMin = 6;
  const targetMax = 12;

  if (emergencyFundMonths >= targetMax) return 100;
  if (emergencyFundMonths < targetMin) {
    return (emergencyFundMonths / targetMin) * 60; // Max 60 if below target
  }
  return 60 + ((emergencyFundMonths - targetMin) / (targetMax - targetMin)) * 40;
}

/**
 * Calculates SIP consistency score
 * Rewards consistent SIP investment over time
 * @param sipConsistencyMonths - How long SIP has been running
 * @param monthlySIP - Monthly SIP amount
 * @param targetRetirementCorpus - Target retirement savings needed
 * @returns Score from 0-100
 */
export function calculateSIPConsistencyScore(
  sipConsistencyMonths: number,
  monthlySIP: number,
  targetRetirementCorpus: number
): number {
  // SIP value accumulated so far (simple, not compound)
  const sipValueAccumulated = monthlySIP * sipConsistencyMonths;
  const consistencyFactor = Math.min(sipConsistencyMonths / 24, 1); // Max 24 months
  const sufficiencyRatio = Math.min(sipValueAccumulated / (targetRetirementCorpus * 0.1), 1);

  return Math.round((consistencyFactor * 0.4 + sufficiencyRatio * 0.6) * 100);
}

/**
 * Calculates retirement corpus completion percentage
 * How close current savings are to target
 * @param currentRetirementCorpus - Current retirement savings
 * @param targetRetirementCorpus - Target retirement corpus
 * @returns Percentage from 0-100
 */
export function calculateRetirementCorpusCompletion(
  currentRetirementCorpus: number,
  targetRetirementCorpus: number
): number {
  if (targetRetirementCorpus === 0) return 100;
  return Math.min((currentRetirementCorpus / targetRetirementCorpus) * 100, 100);
}

/**
 * Calculates income stability index
 * Higher income relative to essential expenses = more financial cushion
 * @param monthlyIncome - Post-tax monthly income
 * @param monthlyEssentialExpenses - Essential monthly expenses
 * @returns Score from 0-100
 */
export function calculateIncomeStabilityIndex(
  monthlyIncome: number,
  monthlyEssentialExpenses: number
): number {
  if (monthlyIncome === 0) return 0;
  const coverage = monthlyIncome / monthlyEssentialExpenses;
  
  if (coverage >= 3) return 100; // 3x expense coverage = excellent
  if (coverage >= 2) return 80;
  if (coverage >= 1.5) return 60;
  if (coverage >= 1) return 40;
  return 20;
}

/**
 * Identifies financial readiness gaps
 * @param inputs - Financial inputs
 * @param metrics - Calculated metrics
 * @returns Array of identified gaps with severity
 */
export function identifyFinancialGaps(
  inputs: FinancialInputs,
  metrics: FinancialReadinessResult['metrics']
): FinancialReadinessResult['gaps'] {
  const gaps: FinancialReadinessResult['gaps'] = [];

  // Emergency fund gap
  if (inputs.emergencyFundMonths < 6) {
    gaps.push({
      type: 'Emergency Fund',
      description: `You have ${inputs.emergencyFundMonths} months of emergency coverage. Target is 6-12 months for financial security.`,
      severity: inputs.emergencyFundMonths < 3 ? 'high' : 'medium',
    });
  }

  // Retirement corpus gap
  const corpusGapPercent = 100 - metrics.retirementCorpusCompletion;
  if (corpusGapPercent > 20) {
    gaps.push({
      type: 'Retirement Corpus',
      description: `Your retirement savings are ${Math.round(metrics.retirementCorpusCompletion)}% of target. Continue SIP to close this gap.`,
      severity: corpusGapPercent > 50 ? 'high' : 'medium',
    });
  }

  // SIP consistency gap
  if (metrics.sipConsistencyScore < 50) {
    gaps.push({
      type: 'Investment Discipline',
      description: 'Your SIP duration is shorter than ideal. Consistency over time is key to reaching your target.',
      severity: 'medium',
    });
  }

  // Income stability gap
  if (metrics.incomeStabilityIndex < 60) {
    gaps.push({
      type: 'Income Stability',
      description: 'Your essential expenses consume most of your income. Focus on income growth or expense optimization.',
      severity: 'high',
    });
  }

  return gaps;
}

/**
 * Calculates complete financial readiness
 * @param inputs - Financial inputs
 * @returns Financial readiness result with score and gaps
 */
export function calculateFinancialReadiness(
  inputs: FinancialInputs
): FinancialReadinessResult {
  // Calculate individual metrics
  const savingsAdequacyRatio = calculateSavingsAdequacyRatio(
    inputs.currentSavings,
    inputs.monthlyEssentialExpenses
  );
  
  const emergencyFundCoverage = calculateEmergencyFundScore(inputs.emergencyFundMonths);
  
  const sipConsistencyScore = calculateSIPConsistencyScore(
    inputs.sipConsistencyMonths,
    inputs.monthlySIP,
    inputs.targetRetirementCorpus
  );
  
  const retirementCorpusCompletion = calculateRetirementCorpusCompletion(
    inputs.currentRetirementCorpus,
    inputs.targetRetirementCorpus
  );
  
  const incomeStabilityIndex = calculateIncomeStabilityIndex(
    inputs.monthlyIncome,
    inputs.monthlyEssentialExpenses
  );

  // Combine metrics into overall score
  // Weights: Emergency Fund (25%), Retirement Corpus (30%), SIP Consistency (20%), Income Stability (25%)
  const score = Math.round(
    emergencyFundCoverage * 0.25 +
    retirementCorpusCompletion * 0.3 +
    sipConsistencyScore * 0.2 +
    incomeStabilityIndex * 0.25
  );

  const metrics = {
    savingsAdequacyRatio,
    emergencyFundCoverage,
    sipConsistencyScore,
    retirementCorpusCompletion,
    incomeStabilityIndex,
  };

  const gaps = identifyFinancialGaps(inputs, metrics);

  return {
    score: Math.min(100, Math.max(0, score)),
    metrics,
    gaps,
  };
}
