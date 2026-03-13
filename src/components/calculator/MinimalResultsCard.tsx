import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
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
  Lock,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CEILING, FV } from "@/pages/FinancialFreedomCalculator";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();
  const navigate = useNavigate();
  console.log(user);

  const publicScore = useMemo(() => {
    const retirementAge = inputs.age + inputs.yearsForSIP + inputs.waitingYearsBeforeSWP;
    const retirementProjection = projections.find((p: any) => p.age === retirementAge);
    const expectedCorpus = retirementProjection?.expectedCorpus || 0;
    const corpusProgress = results.requiredCorpus > 0
      ? Math.min((expectedCorpus / results.requiredCorpus) * 30, 30)
      : 0;
    const timeBuffer = results.freedomAge <= retirementAge
      ? 20
      : (retirementAge / results.freedomAge) * 20;
    const sipRate = inputs.monthlyIncome > 0 ? inputs.sipAmount / inputs.monthlyIncome : 0;
    const savingsRateScore = sipRate >= 0.20 ? 20 : sipRate >= 0.10 ? 10 : 5;
    const sustainabilityScore = results.corpusDepletesBeforeLifeExpectancy && results.corpusDepletionAge
      ? (inputs.lifeExpectancy - results.corpusDepletionAge <= 10 ? 5 : 0)
      : 10;
    return Math.max(0, Math.min(100, Math.round(corpusProgress + timeBuffer + savingsRateScore + sustainabilityScore)));
  }, [inputs, results, projections]);

  const publicStatus = publicScore <= 30 ? 'Needs Attention 🔴'
    : publicScore <= 60 ? 'In Progress 🟡'
    : publicScore <= 80 ? 'On Track 🟢'
    : 'Excellent 🌟';
  const publicStatusColor = publicScore <= 30 ? 'bg-red-500/10 text-red-600 dark:text-red-400'
    : publicScore <= 60 ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
    : publicScore <= 80 ? 'bg-green-500/10 text-green-600 dark:text-green-400'
    : 'bg-primary/10 text-primary';
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
        <div className="relative p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
          {/* Blurred Score Card — public only */}
          {!user && (
            <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-background p-5 text-center space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Your Financial Freedom Score
              </p>
              <div className="flex items-end justify-center gap-1">
                <span className="text-6xl font-bold text-primary">{publicScore}</span>
                <span className="text-2xl font-semibold text-muted-foreground mb-2"> / 100</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 max-w-sm mx-auto">
                <div className="bg-primary h-3 rounded-full transition-all duration-500" style={{ width: `${publicScore}%` }} />
              </div>
              <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold ${publicStatusColor}`}>
                {publicStatus}
              </span>
              <p className="text-sm text-muted-foreground">Sign in to understand what this means and how to improve it</p>
            </div>
          )}

          {/* Status Header */}
          <div className="text-center space-y-2">
            {needsOptimization ? (
              <>
                <div className="flex justify-center">
                  <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600" />
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">
                  Plan Needs Adjustment
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto px-2">
                  Your current plan may not sustain your financial goals. Let's optimize it.
                </p>
              </>
            ) : (
              <>
                <div className="flex justify-center">
                  <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                  You're On Track!
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto px-2">
                  Your financial freedom plan looks solid.
                </p>
              </>
            )}
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent rounded-lg blur-lg group-hover:blur-sm transition-all duration-300" />
              <div className="relative text-center p-2.5 sm:p-3 rounded-lg bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                <div className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 mb-1.5 sm:mb-2">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                </div>
                <div className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-1">
                  Financial Freedom Age
                </div>
                <div className="text-lg sm:text-xl font-bold text-foreground mb-0.5 sm:mb-1">
                  {results.freedomAge}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground bg-muted/30 px-1.5 sm:px-2 py-0.5 rounded-full inline-block">
                  In {results.yearsToFreedom} years
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-accent/5 to-transparent rounded-lg blur-lg group-hover:blur-sm transition-all duration-300" />
              <div className="relative text-center p-2.5 sm:p-3 rounded-lg bg-card/80 backdrop-blur-sm border border-border/50 hover:border-accent/30 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
                <div className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-accent/10 mb-1.5 sm:mb-2">
                  <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
                </div>
                <div className="flex items-center justify-center gap-1 text-[10px] sm:text-xs font-medium text-muted-foreground mb-1">
                  Expected Corpus
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-muted-foreground hover:text-foreground cursor-help transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">
                        The total amount you're expected to accumulate by your
                        retirement age based on your current investment plan
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="text-lg sm:text-xl font-bold text-foreground mb-0.5 sm:mb-1 break-words">
                  {expectedCorpus}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground bg-muted/30 px-1.5 sm:px-2 py-0.5 rounded-full inline-block">
                  At retirement
                </div>
              </div>
            </div>

            {needsOptimization && (
              <div className="relative group sm:col-span-2 lg:col-span-1">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-300/20 via-blue-200/5 to-transparent rounded-lg blur-lg group-hover:blur-sm transition-all duration-300" />
                <div className="relative text-center p-2.5 sm:p-3 rounded-lg bg-card/80 backdrop-blur-sm border border-border/50 hover:border-blue-300/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-300/10">
                  <div className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100/50 dark:bg-blue-900/30 mb-1.5 sm:mb-2">
                    <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex items-center justify-center gap-1 text-[10px] sm:text-xs font-medium text-muted-foreground mb-1">
                    Required Corpus
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-muted-foreground hover:text-foreground cursor-help transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-xs">
                          The target corpus needed to achieve your financial goals without depletion
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400 mb-0.5 sm:mb-1 break-words">
                    {trailErrorData.targetCorpus}
                  </div>
                  <div className="text-[10px] sm:text-xs text-blue-600/80 dark:text-blue-400/80 bg-blue-50 dark:bg-blue-900/20 px-1.5 sm:px-2 py-0.5 rounded-full inline-block">
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
                <div className="p-3 sm:p-4 border-b border-red-200 dark:border-red-800/30 bg-gradient-to-r from-red-500/5 to-orange-500/5">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-100 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-700 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-red-700 dark:text-red-400 mb-1">
                        SIP Adjustment Required
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Your corpus may deplete around age{" "}
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          {results.corpusDepletionAge}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Investment Comparison */}
                <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                  {/* Current vs Required SIP */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <div className="bg-background/80 rounded-lg p-2.5 sm:p-3 border border-border/50">
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">
                          Current Monthly SIP
                        </span>
                        <span className="text-[10px] sm:text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
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

          {/* What your score reveals — public only */}
          {!user && (
            <div className="rounded-xl border border-border/50 bg-muted/30 p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">What your score reveals</p>
              {[
                'Exactly where you\'re losing points',
                'Which 2 actions move your score the most',
                'Your personalised freedom roadmap',
                'How you compare to people your age',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          )}

          {/* CTA — public only */}
          {!user && (
            <div className="flex flex-col items-center gap-2">
              <Button
                onClick={() => {
                  localStorage.setItem('redirect_after_login', '/dashboard/ffr');
                  window.location.href = '/auth';
                }}
                size="lg"
                className="w-full sm:w-auto px-10 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Unlock My Full Plan — Free →
              </Button>
              <p className="text-xs text-muted-foreground">Takes 10 seconds. No spam.</p>
            </div>
          )}
        </div>
      </Card>
    </TooltipProvider>
  );
};

export default MinimalResultsCard;
