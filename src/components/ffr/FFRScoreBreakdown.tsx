import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import type { CalculatorInputs, CalculationResults } from '@/types/calculator';
import type { FFRFoundationsChecklist } from '@/types/ffr';
import { useSprints, type Sprint } from '@/hooks/useSprints';

interface FFRScoreBreakdownProps {
  inputs: CalculatorInputs;
  results: CalculationResults;
  projections: Array<{ age: number; expectedCorpus: number }>;
  checklist: FFRFoundationsChecklist | null;
}

interface ComponentScore {
  name: string;
  scoreComponent: Sprint['score_component'];
  points: number;
  max: number;
  feedback: string;
}

function tileColor(points: number, max: number): { bar: string; border: string; label: string } {
  const pct = max > 0 ? points / max : 0;
  if (pct >= 0.8) return { bar: 'bg-primary', border: 'border-primary/30', label: 'text-primary' };
  if (pct >= 0.5) return { bar: 'bg-amber-500', border: 'border-amber-400/40', label: 'text-amber-600 dark:text-amber-400' };
  return { bar: 'bg-red-500', border: 'border-red-400/40', label: 'text-red-600 dark:text-red-400' };
}

export function FFRScoreBreakdown({ inputs, results, projections, checklist }: FFRScoreBreakdownProps) {
  const navigate = useNavigate();
  const { getActiveSprint } = useSprints();
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);

  useEffect(() => {
    getActiveSprint().then(({ data }) => setActiveSprint(data));
  }, []);

  const components = useMemo((): ComponentScore[] => {
    // Component 1: Corpus Progress (30 pts)
    const retirementAge = inputs.age + inputs.yearsForSIP + inputs.waitingYearsBeforeSWP;
    const retirementProjection = projections.find(p => p.age === retirementAge);
    const expectedCorpus = retirementProjection?.expectedCorpus ?? 0;
    const corpusProgress = results.requiredCorpus > 0
      ? Math.min((expectedCorpus / results.requiredCorpus) * 30, 30)
      : 0;
    const corpusPct = results.requiredCorpus > 0
      ? Math.round((expectedCorpus / results.requiredCorpus) * 100)
      : 0;
    const corpusFeedback = results.requiredCorpus <= 0
      ? 'No required corpus to target — goal already covered.'
      : corpusPct >= 100
        ? 'Your projected corpus meets or exceeds the required amount.'
        : `Your projected corpus is ${corpusPct}% of the ₹${(results.requiredCorpus / 10000000).toFixed(1)}Cr target. Increase SIP to close the gap.`;

    // Component 2: Time Buffer (20 pts)
    const freedomAge = results.freedomAge;
    const yearsEarly = retirementAge - freedomAge;
    let timeBuffer = 0;
    if (yearsEarly >= 10) timeBuffer = 20;
    else if (yearsEarly >= 5) timeBuffer = 15;
    else if (yearsEarly >= 1) timeBuffer = 10;
    else if (yearsEarly === 0) timeBuffer = 5;
    else timeBuffer = 0;
    const timeBufferFeedback = yearsEarly >= 10
      ? `You reach financial freedom ${yearsEarly} years before your target — full points.`
      : yearsEarly >= 5
        ? `You reach financial freedom ${yearsEarly} years early. Reach 10 years early for full points.`
        : yearsEarly >= 1
          ? `You reach financial freedom ${yearsEarly} year${yearsEarly !== 1 ? 's' : ''} early. Aim for 5+ years early for more points.`
          : yearsEarly === 0
            ? 'You reach financial freedom exactly at your retirement target age.'
            : `Freedom age (${freedomAge}) is ${-yearsEarly} year${-yearsEarly !== 1 ? 's' : ''} after your retirement target (${retirementAge}). Boost SIP to retire earlier.`;

    // Component 3: Savings Rate (20 pts)
    const sipRate = inputs.monthlyIncome > 0 ? inputs.sipAmount / inputs.monthlyIncome : 0;
    let savingsRateScore = 5;
    if (sipRate >= 0.20) savingsRateScore = 20;
    else if (sipRate >= 0.10) savingsRateScore = 10;
    const sipPct = Math.round(sipRate * 100);
    const savingsRateFeedback = sipRate >= 0.20
      ? `Your SIP is ${sipPct}% of income — excellent savings rate.`
      : sipRate >= 0.10
        ? `Your SIP covers ${sipPct}% of income. Reach 20% for full points.`
        : `Your SIP covers ${sipPct}% of income. Aim for at least 10% for partial credit, 20% for full points.`;

    // Component 4: Essentials Coverage (20 pts)
    const lifeInsurance = checklist?.insurance_evidence ? 5 : 0;
    const healthInsurance = checklist?.insurance_evidence ? 5 : 0;
    const emergencyFund = checklist?.emergency_fund_baseline ? 5 : 0;
    const sipAdequacy = checklist?.sip_mandate_active ? 5 : 0;
    const essentialsCoverage = lifeInsurance + healthInsurance + emergencyFund + sipAdequacy;
    const missingItems: string[] = [];
    if (!checklist?.insurance_evidence) missingItems.push('insurance');
    if (!checklist?.emergency_fund_baseline) missingItems.push('emergency fund');
    if (!checklist?.sip_mandate_active) missingItems.push('SIP mandate');
    const essentialsFeedback = missingItems.length === 0
      ? 'All essentials covered — insurance, emergency fund, and SIP mandate active.'
      : `Missing: ${missingItems.join(', ')}. Complete these in your checklist to earn points.`;

    // Component 5: Lifestyle Sustainability (10 pts)
    let sustainabilityScore = 10;
    if (results.corpusDepletesBeforeLifeExpectancy && results.corpusDepletionAge) {
      const yearsEarlyDepletion = inputs.lifeExpectancy - results.corpusDepletionAge;
      sustainabilityScore = yearsEarlyDepletion <= 10 ? 5 : 0;
    }
    const sustainabilityFeedback = sustainabilityScore === 10
      ? 'Your corpus sustains withdrawals through your full life expectancy.'
      : results.corpusDepletionAge
        ? `Corpus depletes at age ${results.corpusDepletionAge}, ${inputs.lifeExpectancy - results.corpusDepletionAge} years before life expectancy. Reduce withdrawals or increase SIP.`
        : 'Corpus may not last through life expectancy. Review your withdrawal plan.';

    return [
      { name: 'Corpus Progress', scoreComponent: 'corpus_progress', points: Math.round(corpusProgress), max: 30, feedback: corpusFeedback },
      { name: 'Time Buffer', scoreComponent: 'time_buffer', points: Math.round(timeBuffer), max: 20, feedback: timeBufferFeedback },
      { name: 'Savings Rate', scoreComponent: 'savings_rate', points: savingsRateScore, max: 20, feedback: savingsRateFeedback },
      { name: 'Essentials Coverage', scoreComponent: 'essentials_coverage', points: essentialsCoverage, max: 20, feedback: essentialsFeedback },
      { name: 'Lifestyle Sustainability', scoreComponent: 'lifestyle_sustainability', points: sustainabilityScore, max: 10, feedback: sustainabilityFeedback },
    ];
  }, [inputs, results, projections, checklist]);

  const total = components.reduce((sum, c) => sum + c.points, 0);
  const hasActiveSprint = activeSprint !== null;

  return (
    <Card className="border-primary/20 shadow-md">
      <CardContent className="pt-6 pb-6 space-y-5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest text-center">
          Score Breakdown
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {components.map((c, i) => {
            const { bar, border, label } = tileColor(c.points, c.max);
            const barPct = Math.round((c.points / c.max) * 100);
            const isLast = i === components.length - 1;
            const isIncomplete = c.points < c.max;
            const isActiveSprintTile = activeSprint?.score_component === c.scoreComponent;

            return (
              <div key={c.name} className={`rounded-xl border ${border} bg-card p-4 space-y-2${isLast ? ' sm:col-span-2' : ''}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{c.name}</span>
                  <span className={`text-sm font-bold ${label}`}>
                    {c.points}<span className="font-normal text-muted-foreground">/{c.max}</span>
                  </span>
                </div>
                <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${bar}`}
                    style={{ width: `${barPct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground leading-snug">{c.feedback}</p>

                {isIncomplete && (
                  isActiveSprintTile ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      Sprint in progress
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={hasActiveSprint}
                      onClick={() => navigate(`/dashboard/sprints?component=${c.scoreComponent}`)}
                      className="text-xs font-medium text-primary hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed transition-colors"
                    >
                      {c.scoreComponent === 'corpus_progress' && 'Increase my SIP →'}
                      {c.scoreComponent === 'time_buffer' && 'Retire earlier →'}
                      {c.scoreComponent === 'essentials_coverage' && 'Get protected →'}
                      {c.scoreComponent === 'lifestyle_sustainability' && 'Fix my withdrawal plan →'}
                    </button>
                  )
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm font-semibold text-muted-foreground">Total Score</span>
          <span className="text-2xl font-bold text-primary">
            {total}<span className="text-base font-normal text-muted-foreground"> / 100</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
