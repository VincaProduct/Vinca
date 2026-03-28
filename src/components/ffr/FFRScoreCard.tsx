import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { CalculatorInputs, CalculationResults } from '@/types/calculator';
import type { FFRFoundationsChecklist } from '@/types/ffr';
import { calculateFFRScore, FFR_SCORE_STATUS } from '@/utils/ffrScore';

interface FFRScoreCardProps {
  inputs: CalculatorInputs;
  results: CalculationResults;
  projections: any[];
  checklist: FFRFoundationsChecklist | null;
}

export function FFRScoreCard({ inputs, results, projections, checklist }: FFRScoreCardProps) {
  const score = useMemo(
    () => calculateFFRScore(inputs, results, projections, checklist),
    [inputs, results, projections, checklist]
  );

  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const essentialsCoverage = checklist
    ? (checklist.insurance_evidence ? 10 : 0) +
      (checklist.emergency_fund_baseline ? 5 : 0) +
      (checklist.sip_mandate_active ? 5 : 0)
    : undefined;

  const sustainabilityScore = results.corpusDepletesBeforeLifeExpectancy && results.corpusDepletionAge
    ? (inputs.lifeExpectancy - results.corpusDepletionAge <= 10 ? 5 : 0)
    : 10;

  const { status, statusColor } = FFR_SCORE_STATUS(score, essentialsCoverage, sustainabilityScore);

  const summarySentence = useMemo(() => {
    if (score <= 30) {
      const depletionAge = results.corpusDepletionAge;
      const yearsEarly = depletionAge ? inputs.lifeExpectancy - depletionAge : null;
      return yearsEarly != null && yearsEarly > 0
        ? `Your corpus runs out ${yearsEarly} years before your life expectancy. Action needed.`
        : 'Your plan needs significant improvement. Action needed.';
    }
    if (score <= 60) return 'Your plan is close but has gaps. Small changes make a big difference.';
    return 'Your current plan reaches your retirement goal. Keep it up.';
  }, [score, results, inputs]);

  return (
    <Card className="border-primary/30 shadow-md">
      <CardContent className="pt-6 pb-6">
        <div className="text-center space-y-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Your Financial Freedom Score
          </p>
          <div className="flex items-end justify-center gap-1">
            <span className="text-6xl font-bold text-primary">{score}</span>
            <span className="text-2xl font-semibold text-muted-foreground mb-2"> / 100</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 max-w-sm mx-auto">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-500"
              style={{ width: `${score}%` }}
            />
          </div>
          <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold ${statusColor}`}>
            {status}
          </span>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">{summarySentence}</p>
          <p className="text-xs text-muted-foreground">Last updated: {today}</p>
          <p className="text-xs text-muted-foreground text-center mt-1">
            Score recalibrated on 28 March 2026 to reflect a more accurate assessment.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
