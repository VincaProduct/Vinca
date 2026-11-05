import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { CalculatorInputs, CalculationResults } from '@/types/calculator';
import type { FFRFoundationsChecklist } from '@/types/ffr';
import { scoreBreakdown, type ScoreComponentKey } from '@/utils/ffrScore';

interface FFRScoreBreakdownProps {
  inputs: CalculatorInputs;
  results: CalculationResults;
  projections: Array<{ age: number; expectedCorpus: number }>;
  checklist: FFRFoundationsChecklist | null;
}

/** Where each incomplete part of the score can be worked on */
const NEXT_STEP: Partial<Record<ScoreComponentKey, { label: string; url: string }>> = {
  corpus_progress: { label: 'Discuss my SIP in a consultation', url: '/dashboard/compass' },
  time_buffer: { label: 'Discuss my retirement date', url: '/dashboard/compass' },
  essentials_coverage: { label: 'Review my protection', url: '/dashboard/insurance' },
  lifestyle_sustainability: { label: 'Discuss my withdrawal plan', url: '/dashboard/compass' },
};

function tileColor(points: number, max: number): { bar: string; border: string; label: string } {
  const pct = max > 0 ? points / max : 0;
  if (pct >= 0.8) return { bar: 'bg-primary', border: 'border-primary/30', label: 'text-primary' };
  if (pct >= 0.5) return { bar: 'bg-amber-500', border: 'border-amber-400/40', label: 'text-amber-600 dark:text-amber-400' };
  return { bar: 'bg-red-500', border: 'border-red-400/40', label: 'text-red-600 dark:text-red-400' };
}

export function FFRScoreBreakdown({ inputs, results, projections, checklist }: FFRScoreBreakdownProps) {
  const navigate = useNavigate();
  // Same formula and wording as the score card (src/utils/ffrScore.ts)
  const components = useMemo(
    () => scoreBreakdown(inputs, results, projections, checklist),
    [inputs, results, projections, checklist],
  );

  const total = components.reduce((sum, c) => sum + c.points, 0);

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
            const action = NEXT_STEP[c.scoreComponent];

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

                {isIncomplete && action && (
                  <button
                    type="button"
                    onClick={() => navigate(action.url)}
                    className="group mt-1 inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    {action.label}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
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
