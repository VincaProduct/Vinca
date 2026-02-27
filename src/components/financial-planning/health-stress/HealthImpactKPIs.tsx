import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingDown, Calendar, Wallet, ArrowDown, CheckCircle, AlertTriangle } from 'lucide-react';
import { HealthStressData, HEALTH_COSTS } from '@/types/financial-planning';
import { CalculatorInputs } from '@/types/calculator';

interface HealthImpactKPIsProps {
  healthStressData: HealthStressData;
  inputs: CalculatorInputs;
}

export function HealthImpactKPIs({ healthStressData, inputs }: HealthImpactKPIsProps) {
  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)} L`;
    }
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const retirementAge = inputs.age + inputs.yearsForSIP + inputs.waitingYearsBeforeSWP;
  const retirementDuration = inputs.lifeExpectancy - retirementAge;
  const healthCost = HEALTH_COSTS[healthStressData.category];

  const originalSustainabilityPercent = Math.min(100, ((healthStressData.originalSustainableTillAge - retirementAge) / retirementDuration) * 100);
  const newSustainabilityPercent = Math.min(100, (healthStressData.sustainabilityYears / retirementDuration) * 100);

  const severity = healthStressData.yearsLost === 0 ? 'minimal' :
                   healthStressData.yearsLost <= 3 ? 'moderate' : 'significant';

  return (
    <div className="space-y-6">
      {/* Impact Summary */}
      <Card className={`border ${
        severity === 'minimal' ? 'border-emerald-200 dark:border-emerald-800' :
        severity === 'moderate' ? 'border-amber-200 dark:border-amber-800' :
        'border-rose-200 dark:border-rose-800'
      }`}>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg ${
              severity === 'minimal' ? 'bg-emerald-100 dark:bg-emerald-900/50' :
              severity === 'moderate' ? 'bg-amber-100 dark:bg-amber-900/50' :
              'bg-rose-100 dark:bg-rose-900/50'
            }`}>
              {severity === 'minimal' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertTriangle className={`w-5 h-5 ${
                  severity === 'moderate' ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
                }`} />
              )}
            </div>
            <div>
              <h3 className={`font-medium ${
                severity === 'minimal' ? 'text-emerald-700 dark:text-emerald-300' :
                severity === 'moderate' ? 'text-amber-700 dark:text-amber-300' :
                'text-rose-700 dark:text-rose-300'
              }`}>
                {severity === 'minimal' ? 'Minimal Impact' :
                 severity === 'moderate' ? 'Moderate Impact' : 'Significant Impact'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {severity === 'minimal'
                  ? `${healthCost.label} has minimal effect on sustainability`
                  : `Reduces sustainable retirement by ${healthStressData.yearsLost} year${healthStressData.yearsLost > 1 ? 's' : ''}`
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Adjusted Expenses</p>
            </div>
            <p className="text-xl font-semibold tabular-nums">{formatCurrency(healthStressData.healthAdjustedExpenses)}</p>
            <p className="text-xs text-muted-foreground mt-1">+{formatCurrency(HEALTH_COSTS[healthStressData.category].monthly)}/mo</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-rose-500" />
              <p className="text-xs text-muted-foreground">Corpus Impact</p>
            </div>
            <p className="text-xl font-semibold tabular-nums text-rose-600 dark:text-rose-400">-{formatCurrency(healthStressData.corpusImpact)}</p>
            <p className="text-xs text-muted-foreground mt-1">Health cost deduction</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Sustainable Till</p>
            </div>
            <p className="text-xl font-semibold tabular-nums">Age {healthStressData.sustainableTillAge}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {healthStressData.sustainableTillAge >= inputs.lifeExpectancy
                ? 'Full coverage'
                : `${inputs.lifeExpectancy - healthStressData.sustainableTillAge} years short`
              }
            </p>
          </CardContent>
        </Card>

        <Card className={`${
          severity === 'minimal' ? 'bg-emerald-50 dark:bg-emerald-950/30' :
          severity === 'moderate' ? 'bg-amber-50 dark:bg-amber-950/30' :
          'bg-rose-50 dark:bg-rose-950/30'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDown className={`w-4 h-4 ${
                severity === 'minimal' ? 'text-emerald-600' :
                severity === 'moderate' ? 'text-amber-600' : 'text-rose-600'
              }`} />
              <p className="text-xs text-muted-foreground">Years Lost</p>
            </div>
            <p className={`text-xl font-semibold tabular-nums ${
              severity === 'minimal' ? 'text-emerald-700 dark:text-emerald-300' :
              severity === 'moderate' ? 'text-amber-700 dark:text-amber-300' :
              'text-rose-700 dark:text-rose-300'
            }`}>
              {healthStressData.yearsLost} year{healthStressData.yearsLost !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-muted-foreground mt-1">vs. original plan</p>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Chart */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Sustainability Comparison</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Without Health Costs</span>
              <span className="text-muted-foreground tabular-nums">Till age {healthStressData.originalSustainableTillAge}</span>
            </div>
            <Progress value={originalSustainabilityPercent} className="h-2 [&>div]:bg-emerald-500" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">With {healthCost.label}</span>
              <span className={`tabular-nums ${
                severity === 'minimal' ? 'text-emerald-600' :
                severity === 'moderate' ? 'text-amber-600' : 'text-rose-600'
              }`}>
                Till age {healthStressData.sustainableTillAge}
              </span>
            </div>
            <Progress
              value={newSustainabilityPercent}
              className={`h-2 ${
                severity === 'minimal' ? '[&>div]:bg-emerald-500' :
                severity === 'moderate' ? '[&>div]:bg-amber-500' :
                '[&>div]:bg-rose-500'
              }`}
            />
          </div>

          <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
            <span>Retirement (Age {retirementAge})</span>
            <span>Life Expectancy (Age {inputs.lifeExpectancy})</span>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-muted-foreground mt-2"></span>
              Consider adequate health insurance to cover major expenses
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-muted-foreground mt-2"></span>
              Build a separate health emergency fund
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-muted-foreground mt-2"></span>
              Review and update insurance coverage regularly
            </li>
            {healthStressData.yearsLost > 3 && (
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-muted-foreground mt-2"></span>
                Consider increasing your SIP to build a larger buffer
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
