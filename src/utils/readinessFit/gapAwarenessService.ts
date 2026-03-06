/**
 * Gap Awareness Score Service
 * 
 * Measures improvement potential in your financial plan based on:
 * - Sustainability gaps (retirement duration vs current plan)
 * - Lifestyle-corpus alignment (needed vs available corpus)
 * 
 * Score range: 0-100 (higher = more optimization potential)
 */

export interface GapAwarenessInputs {
  // Sustainability metrics
  targetRetirementAge: number;
  sustainableTillAge: number;
  
  // Corpus metrics
  expectedCorpusAtRetirement: number;
  requiredCorpusForLifestyle: number;
}

export interface GapAwarenessBreakdown {
  sustainabilityGapScore: number;      // 0-50 pts
  lifestyleGapScore: number;           // 0-50 pts
  totalScore: number;                  // 0-100
  sustainabilityGapYears: number;      // years difference
  lifestyleGapRatio: number;           // corpus ratio
}

export interface GapAwarenessResult {
  score: number;
  label: string;
  description: string;
  breakdown: GapAwarenessBreakdown;
  isPartialScore: boolean;             // true if missing critical data
  missingDataMessage?: string;
}

/**
 * Calculate Sustainability Gap Score (0-50 pts)
 * 
 * Logic:
 * - Large surplus (>= 25 years) = 50 pts (room to optimize lifestyle/reduce corpus)
 * - Gradual scale for 0-25 year surplus = (years / 25) * 50
 * - Shortfall (negative) = max(0, 50 + (years * 2)) 
 *   (e.g., -5 year shortfall = 40 pts, critical issue)
 */
function calculateSustainabilityGapScore(
  targetRetirementAge: number,
  sustainableTillAge: number
): { score: number; gapYears: number } {
  const sustainabilityGapYears = sustainableTillAge - targetRetirementAge;
  
  let score = 0;
  if (sustainabilityGapYears >= 25) {
    // Perfect surplus: 0 pts
    score = 0;
  } else if (sustainabilityGapYears >= 0) {
    // Any gap below 25 years is penalized: (25-gap)/25*30+10 (0 gap = 40 pts, 12 gap ≈ 25 pts)
    score = ((25 - sustainabilityGapYears) / 25) * 30 + 10;
  } else {
    // Any shortfall: 40 + min(10, abs(gap))
    score = 40 + Math.min(10, Math.abs(sustainabilityGapYears));
  }
  return { score: Math.round(score), gapYears: sustainabilityGapYears };
}

/**
 * Calculate Lifestyle-Corpus Gap Score (0-50 pts)
 * 
 * Logic:
 * - If corpus >= required (ratio >= 1.0) → 20 pts (well aligned)
 * - If 70-100% covered (0.7 ≤ ratio < 1.0) → 30-50 pts (moderate gap)
 * - If < 70% covered (ratio < 0.7) → 50 pts (large gap = high optimization potential)
 */
function calculateLifestyleGapScore(
  expectedCorpusAtRetirement: number,
  requiredCorpusForLifestyle: number
): { score: number; ratio: number } {
  if (requiredCorpusForLifestyle === 0) {
    return { score: 20, ratio: 1.0 };
  }
  
  const lifestyleGapRatio = expectedCorpusAtRetirement / requiredCorpusForLifestyle;
  
  let score = 0;
  if (lifestyleGapRatio >= 1.0) {
    // Perfect coverage: 0 pts
    score = 0;
  } else if (lifestyleGapRatio >= 0.7) {
    // Any gap below 100% is penalized: (1-ratio)/0.3*30+10 (0.9 = 13 pts, 0.7 = 40 pts)
    score = ((1 - lifestyleGapRatio) / 0.3) * 30 + 10;
  } else {
    // Large shortfall: 40 + min(10, (0.7-ratio)*100)
    score = 40 + Math.min(10, (0.7 - lifestyleGapRatio) * 100);
  }
  return { score: Math.round(score), ratio: Math.round(lifestyleGapRatio * 100) / 100 };
}

/**
 * Main API: Calculate Gap Awareness Score
 * 
 * Returns overall improvement potential (0-100) with breakdown of both gaps
 */
export function calculateGapAwarenessScore(
  inputs: GapAwarenessInputs
): GapAwarenessResult {
  // Validation
  const hasAllData =
    inputs.targetRetirementAge > 0 &&
    inputs.sustainableTillAge > 0 &&
    inputs.expectedCorpusAtRetirement >= 0 &&
    inputs.requiredCorpusForLifestyle > 0;

  // Calculate both gap scores
  const { score: sustainabilityScore, gapYears } = calculateSustainabilityGapScore(
    inputs.targetRetirementAge,
    inputs.sustainableTillAge
  );

  const { score: lifestyleScore, ratio: lifestyleRatio } = calculateLifestyleGapScore(
    inputs.expectedCorpusAtRetirement,
    inputs.requiredCorpusForLifestyle
  );

  // Combine scores
  const totalScore = Math.min(100, Math.max(0, sustainabilityScore + lifestyleScore));

  // Generate breakdown
  const breakdown: GapAwarenessBreakdown = {
    sustainabilityGapScore: sustainabilityScore,
    lifestyleGapScore: lifestyleScore,
    totalScore: totalScore,
    sustainabilityGapYears: gapYears,
    lifestyleGapRatio: lifestyleRatio,
  };

  // Generate label and description
  const { label, description } = getGapAwarenessLabel(totalScore);

  return {
    score: totalScore,
    label,
    description,
    breakdown,
    isPartialScore: !hasAllData,
    missingDataMessage: !hasAllData
      ? "Score updates as you explore more scenarios in Financial Readiness and Lifestyle Planner."
      : undefined,
  };
}

/**
 * Get non-judgmental labels based on improvement potential
 */
function getGapAwarenessLabel(
  score: number
): { label: string; description: string } {
  if (score >= 80) {
    return {
      label: "High Improvement Potential",
      description: "Your plan has significant room for optimization.",
    };
  }
  if (score >= 60) {
    return {
      label: "Moderate Optimization Scope",
      description: "There are meaningful opportunities to strengthen your plan.",
    };
  }
  if (score >= 40) {
    return {
      label: "Some Gaps Identified",
      description: "Minor adjustments could enhance your retirement readiness.",
    };
  }
  return {
    label: "Plan Largely Aligned",
    description: "Your financial and lifestyle expectations are well-balanced.",
  };
}

/**
 * Get insights about specific gaps
 */
export function getGapInsights(breakdown: GapAwarenessBreakdown): {
  sustainabilityMessage: string;
  lifestyleMessage: string;
} {
  // Sustainability insights
  let sustainabilityMessage = "";
  if (breakdown.sustainabilityGapYears >= 25) {
    sustainabilityMessage = `You have a strong ${breakdown.sustainabilityGapYears}-year surplus. Consider lifestyle optimization or earlier retirement.`;
  } else if (breakdown.sustainabilityGapYears > 0) {
    sustainabilityMessage = `Plan sustains till age ${Math.round(breakdown.sustainabilityGapYears + (100 - 85) / 2 + 85)}. Review withdrawal strategy.`;
  } else if (breakdown.sustainabilityGapYears === 0) {
    sustainabilityMessage = "Plan aligns with target retirement age.";
  } else {
    sustainabilityMessage = `Shortfall of ${Math.abs(breakdown.sustainabilityGapYears)} years. Increase corpus or adjust retirement age.`;
  }

  // Lifestyle insights
  let lifestyleMessage = "";
  const percentCovered = Math.round(breakdown.lifestyleGapRatio * 100);
  if (breakdown.lifestyleGapRatio >= 1.0) {
    lifestyleMessage = `Corpus covers ${percentCovered}% of lifestyle needs. Room to enhance lifestyle or reduce target.`;
  } else if (breakdown.lifestyleGapRatio >= 0.7) {
    lifestyleMessage = `Corpus covers ${percentCovered}% of lifestyle needs. Gap of ${100 - percentCovered}% to address.`;
  } else {
    lifestyleMessage = `Critical gap: Only ${percentCovered}% covered. Increase corpus or reduce lifestyle expectations.`;
  }

  return { sustainabilityMessage, lifestyleMessage };
}
