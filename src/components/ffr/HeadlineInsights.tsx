import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target, Calendar, AlertTriangle } from 'lucide-react';
import { CalculatorInputs, CalculationResults } from '@/types/calculator';
import { FV, CEILING } from '@/pages/FinancialFreedomCalculator';

interface HeadlineInsightsProps {
  inputs: CalculatorInputs;
  results: CalculationResults;
  projections: any[];
}

export const HeadlineInsights = ({ inputs, results, projections }: HeadlineInsightsProps) => {
  const formatCurrency = (value: number) => {
    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
    return formatted.replace('₹', '₹ ');
  };

  // Generate detailed projections function (same as MinimalResultsCard)
  const generateDetailedProjections = (testInputs: CalculatorInputs) => {
    const projections = [];
    let currentCorpus = testInputs.initialPortfolioValue;
    const annualReturn = testInputs.returnDuringSIPAndWaiting / 100;
    const swpReturn = testInputs.returnDuringSWP / 100;
    const currentAge = testInputs.age;
    const sipEndYear = testInputs.yearsForSIP;
    const swpStartYear = testInputs.yearsForSIP + testInputs.waitingYearsBeforeSWP;

    // Calculate inflated monthly expenses for SWP period
    const inflatedMonthlyExpenses = CEILING(
      testInputs.currentMonthlyExpenses *
      Math.pow(1 + testInputs.inflation / 100, swpStartYear),
      1000
    );

    // Track previous year's SWP amount for proper growth calculation
    let previousMonthlySWP = 0;

    // Start from year 1 (first investment year)
    for (
      let year = 1;
      year <= Math.min(50, testInputs.lifeExpectancy - currentAge);
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
        const sipGrowthRate = testInputs.growthInSIP / 100;
        monthlySIP = testInputs.sipAmount * Math.pow(1 + sipGrowthRate, year - 1);
      }

      // Get user-defined lumpsum values
      const lumpsumInvestment = 0;
      const lumpsumWithdrawal = 0;

      // Calculate returns
      const returnRate = isInSWPPhase ? swpReturn : annualReturn;

      // Calculate SWP amount
      let monthlySWP = 0;
      if (isInSWPPhase) {
        if (testInputs.yearsForSIP + testInputs.waitingYearsBeforeSWP + 1 === year) {
          // First year of SWP - use base inflated monthly expenses
          monthlySWP = inflatedMonthlyExpenses;
        } else {
          // Subsequent years - apply growth to previous year's SWP amount
          monthlySWP = previousMonthlySWP * (1 + testInputs.growthInSWP / 100);
        }
        // Update previousMonthlySWP for next year's calculation
        previousMonthlySWP = monthlySWP;
      }

      // Calculate corpus at beginning of year
      let beginningCorpus = currentCorpus;

      // Add SIP contributions throughout the year and calculate compounding
      if (isInSIPPhase || isInWaitingPhase) {
        const rate = Math.pow(1 + annualReturn, 1 / 12) - 1;
        beginningCorpus =
          FV(rate, 12, -monthlySIP, -(beginningCorpus + lumpsumInvestment), 1) -
          lumpsumWithdrawal;
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

  // Trail error function (same as MinimalResultsCard)
  const trailError = () => {
    const testInputs = { ...inputs };
    let currentSipAmount = testInputs.sipAmount;
    let iterationCount = 0;
    const maxIterations = 200;

    // Generate initial projections to get fallback target corpus
    const initialProjections = generateDetailedProjections(testInputs);
    const targetCorpus = (() => {
      const swpProjection = initialProjections.find((element) => element.isInSWPPhase === true);
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

  // Calculate target corpus numeric value from optimal projections
  // We need to recalculate with optimal SIP to get the numeric value
  const getTargetCorpusNumeric = () => {
    if (trailErrorData.currentSipAmount === 0) {
      // Fallback to current projections if trailError hasn't run yet
      const swpProjection = projections.find((element) => element.isInSWPPhase === true);
      return swpProjection ? swpProjection.expectedCorpus : 0;
    }

    // Generate projections with optimal SIP amount
    const optimalInputs = { ...inputs, sipAmount: trailErrorData.currentSipAmount };
    const optimalProjections = generateDetailedProjections(optimalInputs);
    const swpProjection = optimalProjections.find((element) => element.isInSWPPhase === true);
    return swpProjection ? swpProjection.expectedCorpus : 0;
  };

  const targetCorpusNumeric = getTargetCorpusNumeric();
  const targetCorpusDisplay = trailErrorData.targetCorpus || formatCurrency(targetCorpusNumeric);

  // Calculate expected corpus from current projections (same as MinimalResultsCard)
  const expectedCorpus = (() => {
    const swpProjection = projections.find((element) => element.isInSWPPhase === true);
    return swpProjection ? swpProjection.expectedCorpus : 0;
  })();

  // Calculate corpus gap: compare target corpus (optimal/required) against expected corpus (current)
  // This shows how much more corpus is needed
  const corpusGap = targetCorpusNumeric > expectedCorpus
    ? targetCorpusNumeric - expectedCorpus
    : 0;
  const sipGap = results.requiredMonthlySIP - inputs.sipAmount;
  const retirementAge = inputs.age + inputs.yearsForSIP + inputs.waitingYearsBeforeSWP;

  const insights = [
    {
      icon: <Calendar className="w-5 h-5" />,
      title: 'Retirement Plan',
      value: `Age ${retirementAge}`,
      subtitle: `In ${inputs.yearsForSIP + inputs.waitingYearsBeforeSWP} years`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: 'Target Corpus',
      value: formatCurrency(expectedCorpus),
      subtitle: results.canAchieveGoal ? 'On track' : `Gap: ${formatCurrency(corpusGap)}`,
      color: results.canAchieveGoal ? 'text-green-600' : 'text-orange-600',
      bgColor: results.canAchieveGoal ? 'bg-green-50 dark:bg-green-950/20' : 'bg-orange-50 dark:bg-orange-950/20',
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'Monthly SIP',
      value: formatCurrency(inputs.sipAmount),
      subtitle: sipGap > 0 ? `Need ${formatCurrency(sipGap)} more` : 'Adequate',
      color: sipGap > 0 ? 'text-orange-600' : 'text-green-600',
      bgColor: sipGap > 0 ? 'bg-orange-50 dark:bg-orange-950/20' : 'bg-green-50 dark:bg-green-950/20',
    },
  ];

  const urgentActions = [];
  if (!results.canAchieveGoal) {
    urgentActions.push('Increase monthly SIP to meet retirement goals');
  }
  if (sipGap > 5000) {
    urgentActions.push('Significant SIP gap detected - review budget');
  }
  if (results.corpusDepletesBeforeLifeExpectancy) {
    urgentActions.push('Corpus may deplete before life expectancy - adjust plan');
  }

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Big Picture Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${insight.bgColor} border-current/10`}
            >
              <div className={`flex items-center gap-2 mb-2 ${insight.color}`}>
                {insight.icon}
                <span className="text-sm font-medium text-muted-foreground">{insight.title}</span>
              </div>
              <div className="text-2xl font-bold mb-1">{insight.value}</div>
              <div className="text-sm text-muted-foreground">{insight.subtitle}</div>
            </div>
          ))}
        </div>

        {urgentActions.length > 0 && (
          <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                  Action Required
                </h4>
                <ul className="space-y-1">
                  {urgentActions.map((action, index) => (
                    <li key={index} className="text-sm text-orange-800 dark:text-orange-200">
                      • {action}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};