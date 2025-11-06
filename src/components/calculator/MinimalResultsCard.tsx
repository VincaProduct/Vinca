import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorInputs, CalculationResults } from "@/types/calculator";
import { calculateFinancialFreedom } from "@/utils/calculatorUtils";
import {
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
  DollarSign,
  Target,
  Info,
  ArrowRight,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CEILING, FV } from "@/pages/FinancialFreedomCalculator";

interface MinimalResultsCardProps {
  inputs: CalculatorInputs;
  results: CalculationResults;
  projections: any[];
}

// Trial and error function to find optimal SIP amount
const findOptimalSIP = (
  inputs: CalculatorInputs
): { suggestedSIP: number; originalSIP: number } => {
  const originalSIP = inputs.sipAmount;
  let testInputs = { ...inputs };
  let increment = 5000; // Start with 5k increments
  let testSIP = originalSIP;
  let maxAttempts = 100;
  let attempts = 0;

  // First, try increasing in larger increments to find a ballpark
  while (attempts < maxAttempts) {
    testInputs.sipAmount = testSIP;
    const testResults = calculateFinancialFreedom(testInputs);

    if (
      !testResults.corpusDepletesBeforeLifeExpectancy &&
      testResults.canAchieveGoal
    ) {
      // Found a working amount, now fine-tune
      break;
    }

    testSIP += increment;
    attempts++;

    // If we're still not close after many attempts, increase increment
    if (attempts > 20 && attempts % 10 === 0) {
      increment += 5000;
    }
  }

  // Fine-tune with smaller increments
  increment = 1000;
  testSIP -= 5000; // Step back a bit
  attempts = 0;

  while (attempts < 20) {
    testInputs.sipAmount = testSIP;
    const testResults = calculateFinancialFreedom(testInputs);

    if (
      !testResults.corpusDepletesBeforeLifeExpectancy &&
      testResults.canAchieveGoal
    ) {
      return { suggestedSIP: testSIP, originalSIP };
    }

    testSIP += increment;
    attempts++;
  }

  return { suggestedSIP: testSIP, originalSIP };
};

const formatCurrency = (value: number): string => {
  if (value >= 10000000) {
    // 1 crore or more
    return `₹${(value / 10000000).toFixed(1)}Cr`;
  } else if (value >= 100000) {
    // 1 lakh or more
    return `₹${(value / 100000).toFixed(1)}L`;
  } else if (value >= 1000) {
    // 1 thousand or more
    return `₹${(value / 1000).toFixed(0)}K`;
  } else {
    return `₹${Math.round(value).toLocaleString("en-IN")}`;
  }
};

const MinimalResultsCard: React.FC<MinimalResultsCardProps> = ({
  inputs,
  results,
  projections,
}) => {
  const isNegativeCorpus = projections.some(
    (projection) => projection.expectedCorpus < 0
  );
  const needsOptimization = isNegativeCorpus;

  const generateDetailedProjections = (inputs: CalculatorInputs) => {
    const projections = [];
    let currentCorpus = inputs.initialPortfolioValue;
    const monthlyReturn = inputs.returnDuringSIPAndWaiting / 100 / 12;
    const annualReturn = inputs.returnDuringSIPAndWaiting / 100;
    const swpReturn = inputs.returnDuringSWP / 100;
    const currentAge = inputs.age;
    const sipEndYear = inputs.yearsForSIP;
    const swpStartYear = inputs.yearsForSIP + inputs.waitingYearsBeforeSWP;

    // Calculate inflated monthly expenses for SWP period
    const inflatedMonthlyExpenses = CEILING(
      inputs.currentMonthlyExpenses *
        Math.pow(1 + inputs.inflation / 100, swpStartYear),
      1000
    );

    // Track previous year's SWP amount for proper growth calculation
    let previousMonthlySWP = 0;

    // Start from year 1 (first investment year)
    for (
      let year = 1;
      year <= Math.min(50, inputs.lifeExpectancy - currentAge);
      year++
    ) {
      const age = currentAge + year;
      const yearNumber = year;

      // Determine phase
      const isInSIPPhase = year <= sipEndYear;
      const isInWaitingPhase = year > sipEndYear && year <= swpStartYear;
      const isInSWPPhase = year > swpStartYear;

      // Calculate SIP amount (with growth if applicable)
      let monthlySIP = 0;
      if (isInSIPPhase) {
        const sipGrowthRate = inputs.growthInSIP / 100;
        monthlySIP = inputs.sipAmount * Math.pow(1 + sipGrowthRate, year - 1);
      }

      // Get user-defined lumpsum values
      const lumpsumInvestment = 0;
      const lumpsumWithdrawal = 0;

      // Calculate returns
      const returnRate = isInSWPPhase ? swpReturn : annualReturn;

      // Calculate SWP amount
      let monthlySWP = 0;
      if (isInSWPPhase) {
        if (inputs.yearsForSIP + inputs.waitingYearsBeforeSWP + 1 === year) {
          // First year of SWP - use base inflated monthly expenses
          monthlySWP = inflatedMonthlyExpenses;
        } else {
          // Subsequent years - apply growth to previous year's SWP amount
          monthlySWP = previousMonthlySWP * (1 + inputs.growthInSWP / 100);
        }
        // Update previousMonthlySWP for next year's calculation
        previousMonthlySWP = monthlySWP;
      }

      // Calculate corpus at beginning of year
      let beginningCorpus = currentCorpus;

      // Add SIP contributions throughout the year and calculate compounding
      if (isInSIPPhase || isInWaitingPhase) {
        // for (let month = 1; month <= 12; month++) {
        // beginningCorpus += monthlySIP;
        const rate = Math.pow(1 + annualReturn, 1 / 12) - 1;
        beginningCorpus =
          FV(rate, 12, -monthlySIP, -(beginningCorpus + lumpsumInvestment), 1) -
          lumpsumWithdrawal;
        // }
      } else {
        const rate = Math.pow(1 + swpReturn, 1 / 12) - 1;
        beginningCorpus =
          FV(rate, 12, monthlySWP, -beginningCorpus, 1) - lumpsumWithdrawal;
      }

      // Calculate expected corpus at end of year
      const expectedCorpus = beginningCorpus;

      projections.push({
        year: currentAge + year,
        yearNumber,
        age,
        amountInHand: currentCorpus,
        lumpsumInvestment,
        monthlySIP,
        returnRate: returnRate * 100,
        monthlySWP,
        lumpsumWithdrawal,
        expectedCorpus,
        isInSIPPhase,
        isInWaitingPhase,
        isInSWPPhase,
      });

      currentCorpus = expectedCorpus;
    }

    return projections;
  };

  const trailError = () => {
    const testInputs = { ...inputs };
    let currentSipAmount = testInputs.sipAmount;
    let iterationCount = 0;
    const maxIterations = 200;
    const targetCorpus = (() => {
      const swpProjection = projections.find((element) => element.isInSWPPhase === true);
      return swpProjection ? formatCurrency(swpProjection.expectedCorpus) : "₹0";
    })();

    while (iterationCount < maxIterations) {
      iterationCount++;

      // Update the SIP amount for this iteration
      testInputs.sipAmount = currentSipAmount;

      // Calculate results with current SIP amount
      const testProjections = generateDetailedProjections(testInputs);

      // Check if any expectedCorpus is negative
      const hasNegativeCorpus = testProjections.some(
        (projection) => projection.expectedCorpus < 0
      );
      if (hasNegativeCorpus) {
        // Find the first negative corpus for logging
        const firstNegative = testProjections.find(
          (projection) => projection.expectedCorpus < 0
        );

        // Increase SIP amount by 500 for next iteration
        currentSipAmount += 500;
      } else {
        const targetCorpus = (() => {
          const swpProjection = testProjections.find((element) => element.isInSWPPhase === true);
          return swpProjection ? formatCurrency(swpProjection.expectedCorpus) : "₹0";
        })();
        return { currentSipAmount, targetCorpus };
      }
    }

    return { currentSipAmount, targetCorpus };
  };
  const [trailErrorData, setTrailErrorData] = useState<{
    currentSipAmount: number;
    targetCorpus: string;
  }>({ currentSipAmount: 0, targetCorpus: "" });

  useEffect(() => {
    const data = trailError();
    setTrailErrorData(data);
  }, [inputs]);

  // Calculate optimal SIP only if needed
  const optimizationData = needsOptimization ? findOptimalSIP(inputs) : null;
  const suggestedIncrease = optimizationData
    ? optimizationData.suggestedSIP - optimizationData.originalSIP
    : 0;

  // Calculate expected corpus at retirement age
  const retirementProjection = results.yearlyProjections.find(
    (p) => p.age === results.freedomAge
  );

  const expectedCorpus = (() => {
    const swpProjection = projections.find((element) => element.isInSWPPhase === true);
    return swpProjection ? formatCurrency(swpProjection.expectedCorpus) : "₹0";
  })();

  return (
    <TooltipProvider>
      <Card className="relative overflow-hidden bg-gradient-to-br from-background via-background/95 to-muted/40 border-2 border-primary/10 shadow-2xl backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <div className="relative p-4 lg:p-6 space-y-4">
          {/* Status Header */}
          <div className="text-center space-y-2">
            {needsOptimization ? (
              <>
                <div className="flex justify-center">
                  <AlertTriangle className="w-10 h-10 text-orange-600" />
                </div>
                <h2 className="text-xl lg:text-2xl font-bold text-orange-600">
                  Plan Needs Adjustment
                </h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Your current plan may not sustain your financial goals. Let's optimize it.
                </p>
              </>
            ) : (
              <>
                <div className="flex justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-xl lg:text-2xl font-bold text-green-600">
                  You're On Track!
                </h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Your financial freedom plan looks solid.
                </p>
              </>
            )}
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent rounded-lg blur-lg group-hover:blur-sm transition-all duration-300" />
              <div className="relative text-center p-3 rounded-lg bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 mb-2">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  Financial Freedom Age
                </div>
                <div className="text-xl font-bold text-foreground mb-1">
                  {results.freedomAge}
                </div>
                <div className="text-xs text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full inline-block">
                  In {results.yearsToFreedom} years
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-accent/5 to-transparent rounded-lg blur-lg group-hover:blur-sm transition-all duration-300" />
              <div className="relative text-center p-3 rounded-lg bg-card/80 backdrop-blur-sm border border-border/50 hover:border-accent/30 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 mb-2">
                  <Target className="w-4 h-4 text-accent" />
                </div>
                <div className="flex items-center justify-center gap-1 text-xs font-medium text-muted-foreground mb-1">
                  Expected Corpus
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-muted-foreground hover:text-foreground cursor-help transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        The total amount you're expected to accumulate by your
                        retirement age based on your current investment plan
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="text-xl font-bold text-foreground mb-1">
                  {expectedCorpus}
                </div>
                <div className="text-xs text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full inline-block">
                  At retirement
                </div>
              </div>
            </div>

            {needsOptimization && (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-300/20 via-blue-200/5 to-transparent rounded-lg blur-lg group-hover:blur-sm transition-all duration-300" />
                <div className="relative text-center p-3 rounded-lg bg-card/80 backdrop-blur-sm border border-border/50 hover:border-blue-300/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-300/10">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100/50 dark:bg-blue-900/30 mb-2">
                    <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex items-center justify-center gap-1 text-xs font-medium text-muted-foreground mb-1">
                    Required Corpus
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-muted-foreground hover:text-foreground cursor-help transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          The target corpus needed to achieve your financial goals without depletion
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {trailErrorData.targetCorpus}
                  </div>
                  <div className="text-xs text-blue-600/80 dark:text-blue-400/80 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full inline-block">
                    Target needed
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recommendation */}
          {needsOptimization && optimizationData && (
            <div className="relative overflow-hidden rounded-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-yellow-950/20" />
              <div className="relative bg-card/95 backdrop-blur-sm border-2 border-red-200 dark:border-red-800/50 rounded-xl shadow-lg">
                {/* Header */}
                <div className="p-4 border-b border-red-200 dark:border-red-800/30 bg-gradient-to-r from-red-500/5 to-orange-500/5">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-700 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-1">
                        SIP Adjustment Required
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Your corpus may deplete around age{" "}
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          {results.corpusDepletionAge}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Investment Comparison */}
                <div className="p-4 space-y-4">
                  {/* Current vs Required SIP */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-background/80 rounded-lg p-3 border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Current Monthly SIP
                        </span>
                        <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-full">
                          Insufficient
                        </span>
                      </div>
                      <div className="text-xl font-bold text-foreground">
                        {formatCurrency(optimizationData.originalSIP)}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-3 border border-green-200 dark:border-green-800/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-green-700 dark:text-green-400">
                          Required Monthly SIP
                        </span>
                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full">
                          Secure
                        </span>
                      </div>
                      <div className="text-xl font-bold text-green-700 dark:text-green-400">
                        {formatCurrency(trailErrorData.currentSipAmount)}
                      </div>
                    </div>
                  </div>

                  {/* Action Required - Prominent */}
                  <div className="bg-gradient-to-r from-primary/15 to-primary/5 rounded-xl p-4 border-2 border-primary/30">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-primary mb-1">
                        Action Required
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        Increase your monthly SIP by
                      </div>
                      <div className="text-2xl font-bold text-primary mb-1">
                        +
                        {formatCurrency(
                          trailErrorData.currentSipAmount -
                            optimizationData.originalSIP
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        to secure your retirement goal
                      </div>
                    </div>
                  </div>

                  {/* Why This Matters */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800/50">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex-shrink-0 mt-0.5 flex items-center justify-center">
                        <span className="text-xs text-blue-600 dark:text-blue-400">
                          💡
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                          Why increase SIP?
                        </div>
                        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                          With your current plan, you may run out of money at
                          age {results.corpusDepletionAge}. The additional
                          investment ensures your corpus lasts throughout your{" "}
                          {inputs.lifeExpectancy - inputs.age} year retirement.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {!needsOptimization && (
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-green-500/5 to-emerald-500/10 rounded-xl" />
              <div className="relative bg-card/90 backdrop-blur-sm border-2 border-green-500/30 rounded-xl p-4 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-500/10 border-2 border-green-500/20">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-green-600 mb-1">
                      Excellent Financial Planning!
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Your investment strategy should provide sustainable
                      retirement income. Stay consistent with SIP investments.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => {
              localStorage.setItem('redirect_after_login', '/dashboard/ffr');
              window.location.href = '/auth';
            }}
            size="lg"
            className="px-6 py-3 font-semibold flex-1 sm:flex-none bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Get Detailed Analysis
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
            <Button 
              onClick={() => window.location.href = '/#contact'}
              variant="outline"
              size="lg"
              className="px-6 py-3 font-semibold flex-1 sm:flex-none border-primary/30 hover:bg-primary/5 transition-all duration-300"
            >
              Schedule Call
            </Button>
          </div>
        </div>
      </Card>
    </TooltipProvider>
  );
};

export default MinimalResultsCard;
