import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { CalculatorInputs, CalculationResults } from '@/types/calculator';
import type { FFRFoundationsChecklist } from '@/types/ffr';

interface FFRScoreCardProps {
  inputs: CalculatorInputs;
  results: CalculationResults;
  projections: any[];
  checklist: FFRFoundationsChecklist | null;
}

function calculateFFRScore(
  inputs: CalculatorInputs,
  results: CalculationResults,
  projections: any[],
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
  const timeBuffer = freedomAge <= retirementAge
    ? 20
    : (retirementAge / freedomAge) * 20;

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

  let status: string;
  let statusColor: string;
  if (score <= 30) {
    status = 'Needs Attention 🔴';
    statusColor = 'bg-red-500/10 text-red-600 dark:text-red-400';
  } else if (score <= 60) {
    status = 'In Progress 🟡';
    statusColor = 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
  } else if (score <= 80) {
    status = 'On Track 🟢';
    statusColor = 'bg-green-500/10 text-green-600 dark:text-green-400';
  } else {
    status = 'Excellent 🌟';
    statusColor = 'bg-primary/10 text-primary';
  }

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
          <p className="text-xs text-muted-foreground">Last updated: {today}</p>
        </div>
      </CardContent>
    </Card>
  );
}
