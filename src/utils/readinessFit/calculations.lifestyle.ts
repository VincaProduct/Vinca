/**
 * Readiness Fit - Lifestyle Readiness Calculations
 * Pure functions for calculating lifestyle readiness gap
 */

import {
  LifestyleInputs,
  LifestyleReadinessResult,
} from './types';

/**
 * Validates that all required lifestyle inputs are provided
 * @param inputs - Lifestyle inputs to validate
 * @returns Array of missing input names, empty if all present
 */
export function validateLifestyleInputs(inputs: Partial<LifestyleInputs>): string[] {
  const missing: string[] = [];
  const required: (keyof LifestyleInputs)[] = [
    'desiredRetirementAge',
    'currentAge',
    'desiredMonthlyLifestyleCost',
    'projectedPassiveIncome',
    'inflationRate',
    'lifeExpectancy',
    'hasDependents',
  ];

  for (const key of required) {
    if (inputs[key] === undefined || inputs[key] === null) {
      missing.push(key);
    }
  }

  return missing;
}

/**
 * Calculates years until desired retirement
 * @param desiredRetirementAge - Age you want to retire at
 * @param currentAge - Current age
 * @returns Years until retirement (minimum 1)
 */
export function calculateYearsToRetirement(
  desiredRetirementAge: number,
  currentAge: number
): number {
  const years = desiredRetirementAge - currentAge;
  return Math.max(1, years);
}

/**
 * Calculates inflation-adjusted lifestyle cost at retirement
 * Uses compound inflation formula: Future = Present × (1 + rate)^years
 * @param desiredMonthlyLifestyleCost - Current desired monthly lifestyle cost
 * @param inflationRate - Annual inflation rate (e.g., 0.06 for 6%)
 * @param yearsToRetirement - Years until retirement
 * @returns Monthly lifestyle cost adjusted for inflation
 */
export function calculateInflationAdjustedCost(
  desiredMonthlyLifestyleCost: number,
  inflationRate: number,
  yearsToRetirement: number
): number {
  const adjustedCost =
    desiredMonthlyLifestyleCost * Math.pow(1 + inflationRate, yearsToRetirement);
  return Math.round(adjustedCost);
}

/**
 * Calculates lifestyle sustainability ratio
 * How well passive income covers the desired retirement lifestyle
 * @param projectedPassiveIncome - Expected monthly passive income at retirement
 * @param monthlyRetirementCost - Monthly cost to maintain desired lifestyle
 * @returns Ratio 0-100+ (100 = fully sustainable)
 */
export function calculateLifestyleSustainabilityRatio(
  projectedPassiveIncome: number,
  monthlyRetirementCost: number
): number {
  if (monthlyRetirementCost === 0) return 100;
  const ratio = (projectedPassiveIncome / monthlyRetirementCost) * 100;
  return Math.round(ratio);
}

/**
 * Calculates longevity risk (how long your passive income will last)
 * Assumes passive income stays constant while you live
 * @param projectedPassiveIncome - Monthly passive income at retirement
 * @param monthlyRetirementCost - Monthly lifestyle cost
 * @param lifeExpectancy - Expected lifespan
 * @param retirementAge - Age when you plan to retire
 * @returns Years your passive income will sustain lifestyle
 */
export function calculateLongevityRisk(
  projectedPassiveIncome: number,
  monthlyRetirementCost: number,
  lifeExpectancy: number,
  retirementAge: number
): number {
  if (projectedPassiveIncome === 0) return 0;
  
  const surplus = projectedPassiveIncome - monthlyRetirementCost;
  
  // If surplus is positive or zero, you can sustain indefinitely (capped at longevity)
  if (surplus >= 0) {
    return lifeExpectancy - retirementAge;
  }

  // If deficit, calculate how long savings will cover the gap
  // This is simplified; in reality would need to account for corpus depletion
  const monthlyDeficit = Math.abs(surplus);
  const yearsOfCoverage = (monthlyRetirementCost * 12) / (monthlyDeficit * 12);
  
  return Math.min(yearsOfCoverage, lifeExpectancy - retirementAge);
}

/**
 * Calculates dependent education cost factor
 * Adds buffer to lifestyle cost if education is planned
 * @param hasDependents - Whether there are dependents
 * @param dependentsEducationPlanned - Whether education costs are expected
 * @param currentLifestyleCost - Current monthly lifestyle cost
 * @returns Adjusted cost factoring in education
 */
export function calculateDependentEducationFactor(
  hasDependents: boolean,
  dependentsEducationPlanned: boolean | undefined,
  currentLifestyleCost: number
): number {
  if (!hasDependents || !dependentsEducationPlanned) {
    return currentLifestyleCost;
  }

  // Add 25% buffer for dependent education costs
  return Math.round(currentLifestyleCost * 1.25);
}

/**
 * Identifies lifestyle readiness mismatches
 * @param inputs - Lifestyle inputs
 * @param metrics - Calculated metrics
 * @returns Array of identified mismatches with severity
 */
export function identifyLifestyleMismatches(
  inputs: LifestyleInputs,
  metrics: LifestyleReadinessResult['metrics']
): LifestyleReadinessResult['mismatches'] {
  const mismatches: LifestyleReadinessResult['mismatches'] = [];

  // Sustainability gap
  const sustainabilityGap = 100 - metrics.sustainabilityRatio;
  if (sustainabilityGap > 0) {
    mismatches.push({
      category: 'Lifestyle Gap',
      description: `Your passive income covers ${Math.round(metrics.sustainabilityRatio)}% of desired retirement lifestyle. Consider increasing passive income or adjusting lifestyle expectations.`,
      gap: sustainabilityGap,
      severity: sustainabilityGap > 50 ? 'high' : 'medium',
    });
  }

  // Longevity risk
  const yearsToLive = (inputs.lifeExpectancy || 85) - inputs.desiredRetirementAge;
  if (metrics.longevityRiskYears < yearsToLive * 0.7) {
    mismatches.push({
      category: 'Longevity Risk',
      description: `Your passive income may not sustain the full retirement period (${metrics.longevityRiskYears.toFixed(0)} years vs ${yearsToLive} year expectancy). Plan for income growth or lifestyle adjustment.`,
      gap: yearsToLive - metrics.longevityRiskYears,
      severity: 'high',
    });
  }

  // Short time horizon (less than 2 years to retirement)
  if (metrics.yearsToRetirement < 2) {
    mismatches.push({
      category: 'Short Time Horizon',
      description: 'You have limited time to close the readiness gap. Focus on stabilizing cash flow and ensuring all passive income sources are secured.',
      gap: 2 - metrics.yearsToRetirement,
      severity: 'high',
    });
  }

  return mismatches;
}

/**
 * Calculates lifestyle readiness score (0-100)
 * @param sustainabilityRatio - How well passive income covers lifestyle
 * @param longevityRisk - Years income will last
 * @param yearsToRetirement - Time to prepare
 * @param lifeExpectancy - Expected lifespan
 * @returns Composite score 0-100
 */
export function calculateLifestyleReadinessScore(
  sustainabilityRatio: number,
  longevityRiskYears: number,
  yearsToRetirement: number,
  lifeExpectancy: number
): number {
  // Sustainability component (how well income covers lifestyle) - 50% weight
  const sustainabilityScore = Math.min(sustainabilityRatio, 100);

  // Longevity component (will income last) - 30% weight
  const expectedYearsInRetirement = Math.max(1, lifeExpectancy - (lifeExpectancy - yearsToRetirement));
  const longevityScore =
    longevityRiskYears >= expectedYearsInRetirement
      ? 100
      : (longevityRiskYears / expectedYearsInRetirement) * 100;

  // Time to prepare component (more time is better) - 20% weight
  let timeScore = 40;
  if (yearsToRetirement >= 5) timeScore = 100;
  else if (yearsToRetirement >= 3) timeScore = 80;
  else if (yearsToRetirement >= 1) timeScore = 60;

  return Math.round(sustainabilityScore * 0.5 + longevityScore * 0.3 + timeScore * 0.2);
}

/**
 * Calculates complete lifestyle readiness
 * @param inputs - Lifestyle inputs
 * @returns Lifestyle readiness result with score and mismatches
 */
export function calculateLifestyleReadiness(
  inputs: LifestyleInputs
): LifestyleReadinessResult {
  const yearsToRetirement = calculateYearsToRetirement(
    inputs.desiredRetirementAge,
    inputs.currentAge
  );

  const adjustedLifestyleCostFinal = calculateDependentEducationFactor(
    inputs.hasDependents,
    inputs.dependentsEducationPlanned,
    inputs.desiredMonthlyLifestyleCost
  );

  const inflationAdjustedLifestyleCost = calculateInflationAdjustedCost(
    adjustedLifestyleCostFinal,
    inputs.inflationRate || 0.06,
    yearsToRetirement
  );

  const sustainabilityRatio = calculateLifestyleSustainabilityRatio(
    inputs.projectedPassiveIncome,
    inflationAdjustedLifestyleCost
  );

  const longevityRiskYears = calculateLongevityRisk(
    inputs.projectedPassiveIncome,
    inflationAdjustedLifestyleCost,
    inputs.lifeExpectancy || 85,
    inputs.desiredRetirementAge
  );

  const score = calculateLifestyleReadinessScore(
    sustainabilityRatio,
    longevityRiskYears,
    yearsToRetirement,
    inputs.lifeExpectancy || 85
  );

  const metrics = {
    yearsToRetirement,
    inflationAdjustedLifestyleCost,
    sustainabilityRatio,
    longevityRiskYears,
  };

  const mismatches = identifyLifestyleMismatches(inputs, metrics);

  return {
    score: Math.min(100, Math.max(0, score)),
    metrics,
    mismatches,
  };
}
