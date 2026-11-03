import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import type { CalculatorInputs, CalculationResults } from '@/types/calculator';
import type { FFRFoundationsChecklist } from '@/types/ffr';
import { useSprints, type Sprint } from '@/hooks/useSprints';
import { scoreBreakdown } from '@/utils/ffrScore';

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

  // Same formula and wording as the score card (src/utils/ffrScore.ts)
  const components = useMemo(
    () => scoreBreakdown(inputs, results, projections, checklist),
    [inputs, results, projections, checklist],
  );

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
