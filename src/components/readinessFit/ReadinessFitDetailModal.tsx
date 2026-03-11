/**
 * ReadinessFitDetailModal Component
 * Detailed breakdown view of financial and lifestyle readiness metrics
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ReadinessFitResult } from '@/utils/readinessFit/types';
import { X } from 'lucide-react';

interface ReadinessFitDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: ReadinessFitResult | null;
}

/**
 * Renders severity badge with appropriate styling
 */
function SeverityBadge({ severity }: { severity: 'high' | 'medium' | 'low' }) {
  const severityConfig = {
    high: { bg: 'bg-red-100', text: 'text-red-800', label: 'Critical' },
    medium: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Important' },
    low: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Monitor' },
  };

  const config = severityConfig[severity];
  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

/**
 * Renders a metric card with value and description
 */
function MetricCard({
  label,
  value,
  unit,
  interpretation,
}: {
  label: string;
  value: number | string;
  unit?: string;
  interpretation: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium text-slate-900">{label}</h4>
      </div>
      <div className="mb-2">
        <p className="text-2xl font-bold text-emerald-600">
          {typeof value === 'number' ? value.toFixed(1) : value}
          {unit && <span className="text-lg text-slate-600 ml-1">{unit}</span>}
        </p>
      </div>
      <p className="text-xs text-slate-600">{interpretation}</p>
    </div>
  );
}

/**
 * Renders a gap/mismatch item with severity
 */
function GapItem({
  type,
  description,
  severity,
}: {
  type: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 mb-3">
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-semibold text-slate-900">{type}</h4>
        <SeverityBadge severity={severity} />
      </div>
      <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

/**
 * Main detail modal component
 */
export function ReadinessFitDetailModal({
  open,
  onOpenChange,
  result,
}: ReadinessFitDetailModalProps) {
  if (!result) {
    return null;
  }

  const { score, financial, lifestyle } = result;
  const financialMetrics = financial.metrics;
  const lifestyleMetrics = lifestyle.metrics;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-slate-200">
          <div className="flex-1">
            <DialogTitle>Readiness Fit Breakdown</DialogTitle>
            <DialogDescription>Detailed analysis of your financial and lifestyle readiness</DialogDescription>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-slate-500 hover:text-slate-700 rounded-md p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overall Score Section */}
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200">
            <h3 className="text-sm font-semibold text-emerald-900 mb-2">OVERALL READINESS FIT</h3>
            <div className="flex items-end gap-4">
              <div>
                <p className="text-5xl font-bold text-emerald-600">{score}</p>
                <p className="text-sm text-emerald-700 mt-1">out of 100</p>
              </div>
              <div className="flex-1">
                <div className="bg-white rounded-full h-3 border border-emerald-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                    style={{ width: `${score}%` }}
                  />
                </div>
                <p className="text-xs text-emerald-700 mt-2">
                  {score >= 85
                    ? 'Excellent readiness'
                    : score >= 75
                    ? 'Good readiness'
                    : score >= 60
                    ? 'Moderate readiness'
                    : score >= 45
                    ? 'Below target'
                    : 'Critical attention needed'}
                </p>
              </div>
            </div>
          </div>

          {/* Financial Readiness Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Financial Readiness</h3>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {financial.score}/100
              </Badge>
            </div>

            {/* Financial Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MetricCard
                label="Emergency Fund Coverage"
                value={financialMetrics.emergencyFundCoverage}
                unit="%"
                interpretation={
                  financialMetrics.emergencyFundCoverage >= 80
                    ? 'Strong emergency safety net'
                    : financialMetrics.emergencyFundCoverage >= 60
                    ? 'Adequate for most situations'
                    : 'Needs strengthening'
                }
              />
              <MetricCard
                label="Retirement Corpus Completion"
                value={financialMetrics.retirementCorpusCompletion}
                unit="%"
                interpretation={
                  financialMetrics.retirementCorpusCompletion >= 75
                    ? 'On track for retirement target'
                    : 'Additional SIP contributions recommended'
                }
              />
              <MetricCard
                label="Savings Adequacy Ratio"
                value={financialMetrics.savingsAdequacyRatio}
                unit="months"
                interpretation="Months of essential expenses covered by liquid savings"
              />
              <MetricCard
                label="Income Stability Index"
                value={financialMetrics.incomeStabilityIndex}
                unit="%"
                interpretation={
                  financialMetrics.incomeStabilityIndex >= 80
                    ? 'Solid income cushion'
                    : 'Focus on income growth'
                }
              />
              <MetricCard
                label="SIP Consistency Score"
                value={financialMetrics.sipConsistencyScore}
                unit="%"
                interpretation="Reward for consistent investment discipline"
              />
            </div>

            {/* Financial Gaps */}
            {financial.gaps.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Priority Areas</h4>
                {financial.gaps.map((gap, idx) => (
                  <GapItem
                    key={idx}
                    type={gap.type}
                    description={gap.description}
                    severity={gap.severity}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Lifestyle Readiness Section */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Lifestyle Readiness</h3>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                {lifestyle.score}/100
              </Badge>
            </div>

            {/* Lifestyle Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MetricCard
                label="Years to Retirement"
                value={lifestyleMetrics.yearsToRetirement}
                unit="years"
                interpretation="Time remaining to prepare and strengthen readiness"
              />
              <MetricCard
                label="Inflation-Adjusted Cost"
                value={`₹${(lifestyleMetrics.inflationAdjustedLifestyleCost / 1000).toFixed(1)}k`}
                unit="/month"
                interpretation="Desired lifestyle cost adjusted for inflation at retirement"
              />
              <MetricCard
                label="Lifestyle Sustainability Ratio"
                value={lifestyleMetrics.sustainabilityRatio}
                unit="%"
                interpretation={
                  lifestyleMetrics.sustainabilityRatio >= 100
                    ? 'Passive income fully covers lifestyle'
                    : 'Income covers ' + Math.round(lifestyleMetrics.sustainabilityRatio) + '% of lifestyle'
                }
              />
              <MetricCard
                label="Longevity Risk Coverage"
                value={lifestyleMetrics.longevityRiskYears}
                unit="years"
                interpretation="Duration your passive income will sustain retirement lifestyle"
              />
            </div>

            {/* Lifestyle Mismatches */}
            {lifestyle.mismatches.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Alignment Issues</h4>
                {lifestyle.mismatches.map((mismatch, idx) => (
                  <GapItem
                    key={idx}
                    type={mismatch.category}
                    description={mismatch.description}
                    severity={mismatch.severity}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Action Panel */}
          <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 mt-4">
            <h4 className="text-sm font-semibold text-emerald-900 mb-2">Next Steps</h4>
            <p className="text-sm text-emerald-800 leading-relaxed mb-4">
              Focus on the priority areas above that impact your readiness most significantly. Small,
              consistent improvements compound over time.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Dismiss
              </Button>
              <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                Consult an Expert
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
