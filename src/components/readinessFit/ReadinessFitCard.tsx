/**
 * ReadinessFitCard Component
 * Displays Gap Awareness Score showing improvement potential in user's plan
 */

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { calculateGapAwarenessScore, getGapInsights } from '@/utils/readinessFit/gapAwarenessService';
import { ChevronRight, TrendingUp, AlertCircle, Info } from 'lucide-react';

interface ReadinessFitCardProps {
  onUpgradeClick?: () => void;
  financialData?: {
    currentSavings: number;
    monthlySIP: number;
    emergencyFundMonths: number;
    currentRetirementCorpus: number;
    targetRetirementCorpus: number;
    monthlyIncome: number;
    monthlyEssentialExpenses: number;
    sipConsistencyMonths: number;
  };
  lifestyleData?: {
    desiredRetirementAge: number;
    currentAge: number;
    desiredMonthlyLifestyleCost: number;
    projectedPassiveIncome: number;
    inflationRate?: number;
    lifeExpectancy?: number;
    hasDependents: boolean;
    dependentsEducationPlanned?: boolean;
  };
}

/**
 * Score color interpretation
 */
function getScoreColor(
  score: number
): { bgColor: string; textColor: string; progressColor: string } {
  if (score >= 80) {
    return {
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-700',
      progressColor: 'from-cyan-400 to-cyan-600',
    };
  }
  if (score >= 60) {
    return {
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      progressColor: 'from-blue-400 to-blue-600',
    };
  }
  if (score >= 40) {
    return {
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      progressColor: 'from-amber-400 to-amber-600',
    };
  }
  return {
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    progressColor: 'from-emerald-400 to-emerald-600',
  };
}

/**
 * Main ReadinessFit Card Component
 * Shows gap awareness score (improvement potential)
 */
export function ReadinessFitCard({
  onUpgradeClick,
  financialData,
  lifestyleData,
}: ReadinessFitCardProps) {
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  // Calculate gap awareness score when data is available
  const gapAwarenessResult = useMemo(() => {
    if (!financialData || !lifestyleData) {
      return null;
    }

    // Derive needed values from financial/lifestyle data
    // Sustainability: sustainableTillAge based on corpus projection
    const yearsToRetire = lifestyleData.desiredRetirementAge - lifestyleData.currentAge;
    const lifeExpectancy = lifestyleData.lifeExpectancy || 85;
    const sustainableTillAge = lifestyleData.currentAge + yearsToRetire + Math.round(financialData.currentRetirementCorpus / Math.max(lifestyleData.projectedPassiveIncome * 12, 1) / 12);
    
    // For realistic calculation, use lifestyle planner data to estimate sustainability
    const estimatedSustainableTillAge = Math.min(
      lifeExpectancy,
      lifestyleData.desiredRetirementAge + Math.round((financialData.currentRetirementCorpus / Math.max(lifestyleData.desiredMonthlyLifestyleCost * 12, 1)) / 12)
    );

    return calculateGapAwarenessScore({
      targetRetirementAge: lifestyleData.desiredRetirementAge,
      sustainableTillAge: estimatedSustainableTillAge,
      expectedCorpusAtRetirement: financialData.currentRetirementCorpus,
      requiredCorpusForLifestyle: Math.round(
        (lifestyleData.desiredMonthlyLifestyleCost * 12 * 25) // 4% rule = 25x annual
      ),
    });
  }, [financialData, lifestyleData]);

  // Get specific gap insights
  const gapInsights = useMemo(() => {
    if (!gapAwarenessResult) return null;
    return getGapInsights(gapAwarenessResult.breakdown);
  }, [gapAwarenessResult]);

  // Loading skeleton
  if (!gapAwarenessResult && !financialData && !lifestyleData) {
    return (
      <Card className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-4">
          <div className="h-4 bg-slate-200 rounded w-1/3 animate-pulse" />
          <div className="h-16 bg-slate-100 rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-3 bg-slate-100 rounded w-full animate-pulse" />
            <div className="h-3 bg-slate-100 rounded w-4/5 animate-pulse" />
          </div>
        </div>
      </Card>
    );
  }

  // No data state
  if (!gapAwarenessResult) {
    return (
      <Card className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-center py-8">
          <Info className="h-8 w-8 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 font-medium mb-2">No Improvement Data Yet</p>
          <p className="text-xs text-slate-500 mb-4">
            Complete your Financial Readiness and Lifestyle Planner to see your improvement potential.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center flex-wrap">
            <Button size="sm" variant="outline" className="w-full sm:w-auto whitespace-normal text-center">
              Go to Financial Readiness
            </Button>
            <Button size="sm" variant="outline" className="w-full sm:w-auto whitespace-normal text-center">
              Go to Lifestyle Planner
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  const colors = getScoreColor(gapAwarenessResult.score);
  const { breakdown, isPartialScore } = gapAwarenessResult;

  return (
    <Card className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Header removed as requested */}
        {isPartialScore && (
          <div className="flex justify-end">
            <span className="text-xs text-slate-500 italic">Updates as you explore</span>
          </div>
        )}

        {/* Main Score Display */}
        <div className={`rounded-xl p-6 border-2 ${colors.bgColor} border-current`}>
          <div className="flex items-baseline gap-3 mb-3">
            <p className={`text-5xl font-bold ${colors.textColor}`}>
              {gapAwarenessResult.score}
            </p>
            <p className="text-sm font-medium text-slate-600">/100</p>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-full h-2 border border-slate-300 overflow-hidden mb-4">
            <div
              className={`h-full bg-gradient-to-r ${colors.progressColor} transition-all duration-500`}
              style={{ width: `${gapAwarenessResult.score}%` }}
            />
          </div>

          {/* Label */}
          <p className={`text-sm font-semibold ${colors.textColor}`}>
            {gapAwarenessResult.label}
          </p>
          <p className="text-xs text-slate-600 mt-2">{gapAwarenessResult.description}</p>
        </div>

        {/* Gap Breakdown removed as requested */}

        {/* Insights removed as requested */}

        {/* Partial Score Note */}
        {isPartialScore && (
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
            <p className="text-xs text-amber-800">
              💡 <strong>Tip:</strong> {gapAwarenessResult.missingDataMessage}
            </p>
          </div>
        )}


        {/* Updated Timestamp */}
        <p className="text-xs text-slate-500 text-center">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        {/* Definition Footer */}
        <div className="text-center">
          <p className="text-xs text-slate-500 italic">
            "This score reflects how much your current plan can still be improved and how well we can support you in you financial readiness journey."
          </p>
        </div>
      </div>
    </Card>
  );
}

export default ReadinessFitCard;
