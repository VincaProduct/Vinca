/**
 * Readiness Fit - Combined Calculations
 * Main export file for all readiness fit calculations
 */

import {
  FinancialInputs,
  LifestyleInputs,
  FinancialReadinessResult,
  LifestyleReadinessResult,
  ReadinessFitResult,
} from './types';

import {
  calculateFinancialReadiness,
  validateFinancialInputs,
} from './calculations.financial';

import {
  calculateLifestyleReadiness,
  validateLifestyleInputs,
} from './calculations.lifestyle';

import { generateReadinessInsights } from './insights';

/**
 * Validates all inputs before calculation
 * @param financialInputs - Financial inputs
 * @param lifestyleInputs - Lifestyle inputs
 * @returns Object with isValid boolean and errors array
 */
export function validateAllInputs(
  financialInputs: Partial<FinancialInputs>,
  lifestyleInputs: Partial<LifestyleInputs>
): { isValid: boolean; errors: { financial: string[]; lifestyle: string[] } } {
  const financialErrors = validateFinancialInputs(financialInputs);
  const lifestyleErrors = validateLifestyleInputs(lifestyleInputs);

  return {
    isValid: financialErrors.length === 0 && lifestyleErrors.length === 0,
    errors: {
      financial: financialErrors,
      lifestyle: lifestyleErrors,
    },
  };
}

/**
 * Calculates combined Readiness Fit score
 * Final score = (Financial Score × 0.5) + (Lifestyle Score × 0.5)
 * @param financialScore - Financial readiness score (0-100)
 * @param lifestyleScore - Lifestyle readiness score (0-100)
 * @returns Combined readiness fit score (0-100)
 */
export function calculateCombinedReadinessFit(
  financialScore: number,
  lifestyleScore: number
): number {
  const combined = financialScore * 0.5 + lifestyleScore * 0.5;
  return Math.round(Math.min(100, Math.max(0, combined)));
}

/**
 * Calculates complete Readiness Fit assessment
 * Performs both financial and lifestyle readiness calculations
 * @param financialInputs - User's financial inputs
 * @param lifestyleInputs - User's lifestyle inputs
 * @returns Complete readiness fit result with combined score and insights data
 * @throws Error if required inputs are missing
 *
 * @example
 * const result = calculateReadinessFit({
 *   currentSavings: 500000,
 *   monthlySIP: 10000,
 *   emergencyFundMonths: 6,
 *   currentRetirementCorpus: 2000000,
 *   targetRetirementCorpus: 5000000,
 *   monthlyIncome: 100000,
 *   monthlyEssentialExpenses: 50000,
 *   sipConsistencyMonths: 18
 * }, {
 *   desiredRetirementAge: 50,
 *   currentAge: 35,
 *   desiredMonthlyLifestyleCost: 75000,
 *   projectedPassiveIncome: 80000,
 *   inflationRate: 0.06,
 *   lifeExpectancy: 85,
 *   hasDependents: false
 * });
 */
export function calculateReadinessFit(
  financialInputs: FinancialInputs,
  lifestyleInputs: LifestyleInputs
): ReadinessFitResult {
  // Validate inputs
  const validation = validateAllInputs(financialInputs, lifestyleInputs);
  if (!validation.isValid) {
    const errorMessages = [
      ...validation.errors.financial.map(e => `Financial: ${e}`),
      ...validation.errors.lifestyle.map(e => `Lifestyle: ${e}`),
    ];
    throw new Error(`Invalid inputs: ${errorMessages.join(', ')}`);
  }

  // Calculate financial and lifestyle readiness
  const financialResult = calculateFinancialReadiness(financialInputs);
  const lifestyleResult = calculateLifestyleReadiness(lifestyleInputs);

  // Calculate combined score
  const combinedScore = calculateCombinedReadinessFit(
    financialResult.score,
    lifestyleResult.score
  );

  // Calculate readiness flags
  const isFinanciallyReady = financialResult.score >= 75;
  const isLifestyleReady = lifestyleResult.score >= 75;
  const isFullyReady = combinedScore >= 75;

  // Generate insights - use a temporary object cast to satisfy the type requirement
  const tempResult: ReadinessFitResult = {
    score: combinedScore,
    financial: financialResult,
    lifestyle: lifestyleResult,
    isIncomplete: false,
    insights: { headline: '', blockers: [], positiveReinforcement: '', nextBestAction: '' },
  };

  const insights = generateReadinessInsights(tempResult);

  return {
    score: combinedScore,
    financial: financialResult,
    lifestyle: lifestyleResult,
    insights,
    isIncomplete: false,
  } as ReadinessFitResult;
}

// Export individual calculation functions for testing and modular use
export {
  calculateFinancialReadiness,
  validateFinancialInputs,
  calculateSavingsAdequacyRatio,
  calculateEmergencyFundScore,
  calculateSIPConsistencyScore,
  calculateRetirementCorpusCompletion,
  calculateIncomeStabilityIndex,
  identifyFinancialGaps,
} from './calculations.financial';

export {
  calculateLifestyleReadiness,
  validateLifestyleInputs,
  calculateYearsToRetirement,
  calculateInflationAdjustedCost,
  calculateLifestyleSustainabilityRatio,
  calculateLongevityRisk,
  calculateDependentEducationFactor,
  identifyLifestyleMismatches,
} from './calculations.lifestyle';

export * from './types';
