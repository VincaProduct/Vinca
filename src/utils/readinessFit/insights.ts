/**
 * Readiness Fit - Insights Generation
 * Generates context-aware, specific insights from readiness fit results
 */

import {
  ReadinessFitResult,
  ReadinessInsights,
  FinancialReadinessResult,
  LifestyleReadinessResult,
} from './types';

/**
 * Generates a one-sentence headline about readiness status
 * @param score - Combined readiness fit score (0-100)
 * @param financial - Financial readiness result
 * @param lifestyle - Lifestyle readiness result
 * @returns Plain English headline
 */
export function generateHeadline(
  score: number,
  financial: FinancialReadinessResult,
  lifestyle: LifestyleReadinessResult
): string {
  if (score >= 85) {
    return 'You are well-prepared for your financial goals and desired lifestyle.';
  }
  if (score >= 75) {
    return 'You are on track, but there are key areas to strengthen before retirement.';
  }
  if (score >= 60) {
    return 'You have a solid foundation, but significant work is needed to close readiness gaps.';
  }
  if (score >= 45) {
    return 'Your financial reality and lifestyle expectations have meaningful misalignments.';
  }
  return 'Your current trajectory requires immediate attention to align with retirement goals.';
}

/**
 * Identifies the most impactful blockers from financial and lifestyle gaps
 * Maximum 3 blockers, prioritized by severity and impact
 * @param financial - Financial readiness result
 * @param lifestyle - Lifestyle readiness result
 * @returns Array of blocker objects with title, description, and impact level
 */
export function identifyBlockers(
  financial: FinancialReadinessResult,
  lifestyle: LifestyleReadinessResult
): ReadinessInsights['blockers'] {
  const blockers: ReadinessInsights['blockers'] = [];

  // Financial gap objects with source label
  const financialBlockers = financial.gaps
    .map(gap => ({
      source: 'financial' as const,
      title: gap.type,
      description: gap.description,
      severity: gap.severity,
    }));

  // Lifestyle mismatch objects with source label (convert 'category' to 'title')
  const lifestyleBlockers = lifestyle.mismatches
    .map(mismatch => ({
      source: 'lifestyle' as const,
      title: mismatch.category,
      description: mismatch.description,
      severity: mismatch.severity,
    }));

  // Combine and sort by severity
  const allBlockers = [...financialBlockers, ...lifestyleBlockers];
  allBlockers.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  // Take top 3 and convert to insight blocker format
  for (let i = 0; i < Math.min(3, allBlockers.length); i++) {
    blockers.push({
      title: allBlockers[i].title,
      description: allBlockers[i].description,
      impact: allBlockers[i].severity as 'high' | 'medium' | 'low',
    });
  }

  return blockers;
}

/**
 * Generates a positive reinforcement message
 * Highlights something the user is doing well
 * @param financial - Financial readiness result
 * @param lifestyle - Lifestyle readiness result
 * @returns Confidence-building message
 */
export function generatePositiveReinforcement(
  financial: FinancialReadinessResult,
  lifestyle: LifestyleReadinessResult
): string {
  const strengths: string[] = [];

  // Financial strengths
  if (financial.metrics.emergencyFundCoverage >= 80) {
    strengths.push("You've built a strong emergency fund—this shows excellent financial discipline.");
  } else if (financial.metrics.incomeStabilityIndex >= 80) {
    strengths.push('Your income comfortably covers essential expenses—you have financial breathing room.');
  } else if (financial.metrics.sipConsistencyScore >= 70) {
    strengths.push(
      'You demonstrate consistent investment behavior—this discipline compounds over time.'
    );
  } else if (financial.metrics.retirementCorpusCompletion >= 50) {
    strengths.push('You have already accumulated half your retirement target—keep the momentum going.');
  }

  // Lifestyle strengths
  if (lifestyle.metrics.sustainabilityRatio >= 80) {
    strengths.push(
      'Your projected passive income provides strong coverage of desired lifestyle expenses.'
    );
  } else if (lifestyle.metrics.longevityRiskYears >= 30) {
    strengths.push(
      'Your passive income will sustain your lifestyle well into your later years with current planning.'
    );
  }

  const defaultMessages = [
    'You are taking steps to build your wealth—that puts you ahead of most people.',
    'You have time on your side to address the gaps ahead—use it wisely.',
    'You are aware enough to measure readiness—that awareness itself is valuable.',
  ];

  if (strengths.length > 0) {
    return strengths[0];
  }

  return defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
}

/**
 * Identifies the single best action maximizing short-term impact
 * Specific, quantified, NOT generic advice
 * @param financial - Financial readiness result
 * @param lifestyle - Lifestyle readiness result
 * @returns Specific next action recommendation
 */
export function identifyNextBestAction(
  financial: FinancialReadinessResult,
  lifestyle: LifestyleReadinessResult
): string {
  // Rule 1: If emergency fund is severely lacking
  if (financial.metrics.emergencyFundCoverage < 50 && financial.gaps.length > 0) {
    const emergencyGap = financial.gaps.find(g => g.type === 'Emergency Fund');
    if (emergencyGap) {
      return emergencyGap.description;
    }
  }

  // Rule 2: If retirement corpus gap is huge (>50%)
  const corpusGap = financial.gaps.find(g => g.type === 'Retirement Corpus');
  if (corpusGap && financial.metrics.retirementCorpusCompletion < 50) {
    return corpusGap.description;
  }

  // Rule 3: If sustainability ratio is critically low (<50%)
  if (lifestyle.metrics.sustainabilityRatio < 50) {
    const sustainabilityMismatch = lifestyle.mismatches.find(m => m.category === 'Lifestyle Gap');
    if (sustainabilityMismatch) {
      return sustainabilityMismatch.description;
    }
  }

  // Rule 4: If longevity risk is significant
  if (lifestyle.metrics.longevityRiskYears < 20) {
    const longevityMismatch = lifestyle.mismatches.find(m => m.category === 'Longevity Risk');
    if (longevityMismatch) {
      return longevityMismatch.description;
    }
  }

  // Rule 5: If income stability is weak
  if (financial.metrics.incomeStabilityIndex < 60) {
    return 'Focus on stabilizing or increasing your monthly income—it is the foundation for all other financial progress.';
  }

  // Rule 6: If time horizon is short
  if (lifestyle.metrics.yearsToRetirement < 2) {
    return 'With less than 2 years to retirement, prioritize securing all passive income sources and finalize your withdrawal strategy.';
  }

  // Default: work on SIP
  return 'Maintain consistent SIP contributions—this is the most reliable path to closing your retirement corpus gap.';
}

/**
 * Generates complete readiness insights from calculated results
 * @param result - Complete readiness fit result
 * @returns Insights object with headline, blockers, reinforcement, and action
 *
 * @example
 * const insights = generateReadinessInsights(readinessFitResult);
 * // Returns {
 * //   headline: "You are on track, but there are key areas to strengthen...",
 * //   blockers: [{ title, description, impact }, ...],
 * //   positiveReinforcement: "You have built...",
 * //   nextBestAction: "Focus on..."
 * // }
 */
export function generateReadinessInsights(result: ReadinessFitResult): ReadinessInsights {
  return {
    headline: generateHeadline(result.score, result.financial, result.lifestyle),
    blockers: identifyBlockers(result.financial, result.lifestyle),
    positiveReinforcement: generatePositiveReinforcement(result.financial, result.lifestyle),
    nextBestAction: identifyNextBestAction(result.financial, result.lifestyle),
  };
}

/**
 * Generates a summary snippet for quick UI display (< 200 chars)
 * @param insights - Generated insights object
 * @returns Brief summary text
 */
export function generateInsightsSummary(insights: ReadinessInsights): string {
  const blockerCount = insights.blockers.length;
  if (blockerCount === 0) {
    return 'All systems go for your financial goals.';
  }
  return `${blockerCount} area${blockerCount > 1 ? 's' : ''} to strengthen: ${insights.blockers.map(b => b.title.toLowerCase()).join(', ')}.`;
}
