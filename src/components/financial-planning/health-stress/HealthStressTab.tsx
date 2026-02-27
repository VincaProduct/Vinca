import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, AlertCircle, Lock, Wallet } from 'lucide-react';
import { useFinancialPlanning } from '../context/FinancialPlanningContext';
import { HealthCategorySelector } from './HealthCategorySelector';
import { HealthImpactKPIs } from './HealthImpactKPIs';
import { PremiumBlurGate } from './PremiumBlurGate';
import { useMembership } from '@/hooks/useMembership';

export function HealthStressTab() {
  const {
    inputs,
    results,
    healthCategory,
    healthStressData,
    hasCalculated,
    setHealthCategory,
  } = useFinancialPlanning();

  const { isPro, loading: membershipLoading } = useMembership();

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)} L`;
    }
    return `₹${value.toLocaleString('en-IN')}`;
  };

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

  const retirementAge = inputs.age + inputs.yearsForSIP + inputs.waitingYearsBeforeSWP;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/50">
                <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Health Stress Analysis</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Analyze health scenario impacts on retirement
                </p>
              </div>
            </div>
            {!isPro && !membershipLoading && (
              <Badge variant="outline" className="gap-1">
                <Lock className="w-3 h-3" />
                Premium
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Plan Summary */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Wallet className="w-5 h-5 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg">Plan Summary</CardTitle>
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

      {/* Premium Gated Content */}
      <PremiumBlurGate
        isLocked={!isPro && !membershipLoading}
        title="Unlock Health Stress Analysis"
        subtitle="See how health scenarios impact your retirement plan"
      >
        <HealthCategorySelector
          selectedCategory={healthCategory}
          onSelectCategory={setHealthCategory}
        />

        {healthStressData && (
          <HealthImpactKPIs
            healthStressData={healthStressData}
            inputs={inputs}
          />
        )}
      </PremiumBlurGate>

      {/* Advisor CTA */}
      {isPro && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-medium">Need personalized guidance?</h3>
                <p className="text-sm text-muted-foreground">
                  Discuss your health planning with a wealth manager
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => window.location.href = '/dashboard/book-wealth-manager'}
                className="cursor-pointer shrink-0"
              >
                Book Session
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
