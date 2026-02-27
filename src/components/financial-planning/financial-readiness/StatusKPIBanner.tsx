import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Calendar, Wallet, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { CalculatorInputs, CalculationResults } from '@/types/calculator';
import { DetailedProjection } from '@/types/financial-planning';

interface StatusKPIBannerProps {
  inputs: CalculatorInputs;
  results: CalculationResults;
  projections: DetailedProjection[];
}

export function StatusKPIBanner({ inputs, results, projections }: StatusKPIBannerProps) {
  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
      return `${(value / 100000).toFixed(1)} L`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)} K`;
    }
    return value.toFixed(0);
  };

  const retirementAge = inputs.age + inputs.yearsForSIP + inputs.waitingYearsBeforeSWP;
  const retirementProjection = projections.find(p => p.age === retirementAge);
  const corpusAtRetirement = retirementProjection?.expectedCorpus || 0;

  const isOnTrack = results.canAchieveGoal && !results.corpusDepletesBeforeLifeExpectancy;

  const kpis = [
    {
      label: 'Freedom Age',
      value: results.freedomAge,
      suffix: 'years',
      icon: Calendar,
      trend: results.freedomAge <= 60 ? 'positive' : results.freedomAge <= 65 ? 'neutral' : 'negative',
    },
    {
      label: 'Corpus at Retirement',
      value: formatCurrency(corpusAtRetirement),
      prefix: '₹',
      icon: Wallet,
      subtext: `At age ${retirementAge}`,
      trend: corpusAtRetirement > results.requiredCorpus ? 'positive' : 'negative',
    },
    {
      label: 'Monthly Income',
      value: formatCurrency(inputs.currentMonthlyExpenses * Math.pow(1 + inputs.inflation / 100, inputs.yearsForSIP + inputs.waitingYearsBeforeSWP)),
      prefix: '₹',
      icon: TrendingUp,
      subtext: 'Inflation-adjusted',
      trend: 'neutral',
    },
    {
      label: 'Sustainable Till',
      value: results.corpusDepletionAge || inputs.lifeExpectancy,
      suffix: 'years',
      icon: results.corpusDepletesBeforeLifeExpectancy ? AlertTriangle : Target,
      subtext: results.corpusDepletesBeforeLifeExpectancy
        ? `${inputs.lifeExpectancy - (results.corpusDepletionAge || 0)} years short`
        : 'Full coverage',
      trend: results.corpusDepletesBeforeLifeExpectancy ? 'negative' : 'positive',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Status indicator */}
      <div className={`flex items-center gap-3 p-4 rounded-lg border ${
        isOnTrack
          ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800'
          : 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800'
      }`}>
        {isOnTrack ? (
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        )}
        <div className="flex-1">
          <p className={`font-medium ${isOnTrack ? 'text-emerald-900 dark:text-emerald-100' : 'text-amber-900 dark:text-amber-100'}`}>
            {isOnTrack ? 'Your plan is on track' : 'Plan needs attention'}
          </p>
          <p className={`text-sm ${isOnTrack ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>
            {isOnTrack
              ? 'Current projections show sustainable retirement coverage'
              : `Corpus may deplete by age ${results.corpusDepletionAge}`
            }
          </p>
        </div>
        <Badge variant="outline" className="hidden sm:flex">
          Age {inputs.age} — {inputs.lifeExpectancy}
        </Badge>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${
                    kpi.trend === 'positive' ? 'bg-emerald-100 dark:bg-emerald-900/50' :
                    kpi.trend === 'negative' ? 'bg-rose-100 dark:bg-rose-900/50' :
                    'bg-muted'
                  }`}>
                    <Icon className={`w-4 h-4 ${
                      kpi.trend === 'positive' ? 'text-emerald-600 dark:text-emerald-400' :
                      kpi.trend === 'negative' ? 'text-rose-600 dark:text-rose-400' :
                      'text-muted-foreground'
                    }`} />
                  </div>
                  {kpi.trend !== 'neutral' && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${
                      kpi.trend === 'positive' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {kpi.trend === 'positive' ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
                <p className="text-xl font-semibold tabular-nums">
                  {kpi.prefix}{kpi.value}
                  {kpi.suffix && <span className="text-sm font-normal text-muted-foreground ml-1">{kpi.suffix}</span>}
                </p>
                {kpi.subtext && (
                  <p className="text-xs text-muted-foreground mt-1">{kpi.subtext}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
