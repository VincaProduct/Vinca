import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight, TrendingUp, Wallet } from 'lucide-react';
import { useFinancialPlanning } from '../context/FinancialPlanningContext';
import { LifestyleSlider } from './LifestyleSlider';
import { TierClassificationCard } from './TierClassificationCard';
import { SustainabilityCard } from './SustainabilityCard';

export function LifestylePlannerTab() {
  const {
    inputs,
    results,
    lifestyleShift,
    lifestyleData,
    hasCalculated,
    setActiveTab,
  } = useFinancialPlanning();

  if (!hasCalculated || !inputs || !results) {
    return (
      <div className="space-y-6">
        <Card className="border-dashed">
          <CardContent className="py-12 flex flex-col items-center text-center">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 mb-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="font-medium mb-1">Financial Readiness Required</h3>
            <p className="text-sm text-muted-foreground">
              Use the <span className="font-medium text-foreground">Enter Inputs</span> button above to calculate your plan first.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)} L`;
    }
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const retirementAge = inputs.age + inputs.yearsForSIP + inputs.waitingYearsBeforeSWP;

  return (
    <div className="space-y-6">
      {/* Plan Summary */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Wallet className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Current Plan Summary</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Based on your Financial Readiness inputs
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg border bg-muted/30">
              <p className="text-xs text-muted-foreground">Current Age</p>
              <p className="font-semibold tabular-nums">{inputs.age}</p>
            </div>
            <div className="p-3 rounded-lg border bg-muted/30">
              <p className="text-xs text-muted-foreground">Retirement Age</p>
              <p className="font-semibold tabular-nums">{retirementAge}</p>
            </div>
            <div className="p-3 rounded-lg border bg-muted/30">
              <p className="text-xs text-muted-foreground">Monthly Expenses</p>
              <p className="font-semibold tabular-nums">{formatCurrency(inputs.currentMonthlyExpenses)}</p>
            </div>
            <div className="p-3 rounded-lg border bg-muted/30">
              <p className="text-xs text-muted-foreground">Monthly SIP</p>
              <p className="font-semibold tabular-nums">{formatCurrency(inputs.sipAmount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lifestyle Slider */}
      <LifestyleSlider currentExpenses={inputs.currentMonthlyExpenses} />

      {/* Results */}
      {lifestyleData && (
        <>
          {/* Lifestyle Tier */}
          <TierClassificationCard
            tier={lifestyleData.tier}
            adjustedExpenses={lifestyleData.adjustedMonthlyExpenses}
            lifestyleShift={lifestyleShift}
          />

          {/* Required Resources */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <TrendingUp className="w-5 h-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg">Required Resources</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-1">Monthly Income at Retirement</p>
                  <p className="text-2xl font-semibold tabular-nums">
                    {formatCurrency(lifestyleData.expensesAtRetirement)}
                    <span className="text-sm font-normal text-muted-foreground">/mo</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Inflation-adjusted to age {retirementAge}</p>
                </div>
                <div className="p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-1">Required Corpus</p>
                  <p className="text-2xl font-semibold tabular-nums">{formatCurrency(lifestyleData.requiredCorpus)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Based on 4% safe withdrawal rate</p>
                </div>
              </div>

              {/* Gap indicator */}
              <div className={`mt-4 p-3 rounded-lg flex items-center gap-3 ${
                lifestyleData.corpusGap <= 0
                  ? 'bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800'
                  : 'bg-rose-50 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-800'
              }`}>
                <span className={`text-sm font-medium ${
                  lifestyleData.corpusGap <= 0
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-rose-700 dark:text-rose-300'
                }`}>
                  {lifestyleData.corpusGap <= 0
                    ? `Your plan exceeds requirements by ${formatCurrency(Math.abs(lifestyleData.corpusGap))}`
                    : `Gap: ${formatCurrency(lifestyleData.corpusGap)} — compared against your expected corpus ${formatCurrency(lifestyleData.expectedCorpus)}`
                  }
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Sustainability */}
          <SustainabilityCard lifestyleData={lifestyleData} inputs={inputs} />
        </>
      )}

      {/* Health CTA */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-medium">What about health costs?</h3>
              <p className="text-sm text-muted-foreground">
                See how health scenarios could impact your sustainability
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('health')}
              className="cursor-pointer shrink-0"
            >
              Analyze
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
