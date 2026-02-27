import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalculatorInputs } from '@/types/calculator';
import { calculateEarlyRetirementOutcome } from '@/utils/earlyRetirementEngine';
import { AlertCircle, TrendingUp, CheckCircle, Zap } from 'lucide-react';

interface Props {
  inputs: CalculatorInputs;
}

export const SmartSurplusEarlyRetirement: React.FC<Props> = ({ inputs }) => {
  const [allocationPercent, setAllocationPercent] = useState(0);

  // Handle missing monthly income
  if (!inputs.monthlyIncome || inputs.monthlyIncome <= 0) {
    return (
      <Card className="mt-6 border-amber-200/50 bg-amber-50 dark:bg-amber-950/20">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
              <Zap className="w-5 h-5 text-amber-600 dark:text-amber-500" />
            </div>
            <div>
              <CardTitle className="text-lg text-amber-900 dark:text-amber-200">Smart Surplus Lever</CardTitle>
              <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                Set your monthly income to calculate surplus
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Please enter your monthly take-home income in Step 1 to see how allocating surplus can enable earlier retirement.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate outcome using engine
  const outcome = calculateEarlyRetirementOutcome({
    ...inputs,
    surplusAllocationPercent: allocationPercent
  });

  const isDisabled = outcome.monthlySurplus <= 0;

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)} Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)} L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)} K`;
    }
    return `₹${value}`;
  };

  return (
    <Card className="mt-6 border-primary/20 bg-gradient-to-br from-primary/5 via-primary/0 to-transparent">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">How allocating surplus can enable earlier retirement</CardTitle>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Context line */}
        {!isDisabled && (
          <div className="p-4 rounded-lg bg-muted/50 border border-muted-foreground/20">
            <p className="text-sm text-foreground">
              <span className="font-semibold">Monthly Surplus Available:</span> {formatCurrency(outcome.monthlySurplus)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              This is your income after covering current expenses. Allocate part of it to SIPs to accelerate retirement—no lifestyle changes needed.
            </p>
          </div>
        )}

        {/* Slider */}
        {!isDisabled && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Allocate to Investments
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  What percentage of surplus would you like to invest?
                </p>
              </div>
              <Badge variant="secondary" className="text-base">
                {allocationPercent}%
              </Badge>
            </div>
            
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={allocationPercent}
              onChange={(e) => setAllocationPercent(parseInt(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            
            <div className="flex gap-2 text-xs text-muted-foreground justify-between px-1">
              <span>No investment</span>
              <span>Full surplus</span>
            </div>
          </div>
        )}

        {/* KPIs - 2x2 grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg border border-muted-foreground/20 bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground font-medium mb-1">Surplus Used</p>
            <p className="text-sm sm:text-base font-semibold text-foreground">
              {formatCurrency(outcome.surplusUsed)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">/month</p>
          </div>

          <div className="rounded-lg border border-muted-foreground/20 bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground font-medium mb-1">Adjusted SIP</p>
            <p className="text-sm sm:text-base font-semibold text-foreground">
              {formatCurrency(outcome.adjustedMonthlySIP)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">/month</p>
          </div>

          <div className="rounded-lg border border-muted-foreground/20 bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground font-medium mb-1">
              {outcome.earlyRetirementAge 
                ? 'Corpus at Early Retirement' 
                : 'Corpus at Planned Retirement'}
            </p>
            <p className="text-sm sm:text-base font-semibold text-foreground">
              {outcome.earlyRetirementAge 
                ? formatCurrency(outcome.corpusAtEarlyRetirement || 0)
                : formatCurrency(outcome.corpusAtPlannedRetirement)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              at age {outcome.earlyRetirementAge || (inputs.age + inputs.yearsForSIP + inputs.waitingYearsBeforeSWP)}
            </p>
          </div>

          <div className="rounded-lg border border-muted-foreground/20 bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground font-medium mb-1">Earliest Retirement</p>
            <p className="text-sm sm:text-base font-semibold text-foreground">
              {outcome.earlyRetirementAge !== null ? `${outcome.earlyRetirementAge} years` : '–'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {outcome.yearsEarly !== null ? `${outcome.yearsEarly} years early` : 'Not feasible'}
            </p>
          </div>
        </div>

        {/* Result message */}
        <div className="mt-4">
          {isDisabled ? (
            <div className="flex gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/50">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-amber-900 dark:text-amber-200">No surplus available</p>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                  Your income equals or is less than your expenses. Consider increasing income or reducing expenses to create surplus.
                </p>
              </div>
            </div>
          ) : outcome.earlyRetirementAge !== null && outcome.earlyRetirementAge < inputs.age + inputs.yearsForSIP + inputs.waitingYearsBeforeSWP ? (
            <div className="flex gap-3 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/50">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                  You can retire {outcome.yearsEarly} {outcome.yearsEarly === 1 ? 'year' : 'years'} earlier! 🎉
                </p>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1">
                  By allocating {allocationPercent}% of surplus to SIPs, you'll have {formatCurrency(outcome.corpusAtEarlyRetirement || 0)} and can retire at <strong>age {outcome.earlyRetirementAge}</strong> instead of age {inputs.age + inputs.yearsForSIP + inputs.waitingYearsBeforeSWP}—without any lifestyle changes.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-amber-900 dark:text-amber-200">
                  Early retirement is not feasible at your current SIP level
                </p>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                Use the surplus lever to see how allocating extra savings can change your retirement timeline.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
