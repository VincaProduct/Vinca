import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Shield,
  Heart,
  Wallet,
  TrendingUp,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import type { FFRFoundationsChecklist } from '@/types/ffr';
import type { CalculationResults, CalculatorInputs } from '@/types/calculator';
import { FV, CEILING } from '@/pages/FinancialFreedomCalculator';

interface EssentialsPanelProps {
  checklist: FFRFoundationsChecklist | null;
  calculatorResults: CalculationResults | null;
  inputs?: CalculatorInputs;
  projections?: any[];
}

interface EssentialItem {
  title: string;
  icon: React.ReactNode;
  status: 'complete' | 'incomplete';
  value: string;
  description: string;
}

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

export const EssentialsPanel = ({ checklist, calculatorResults, inputs, projections = [] }: EssentialsPanelProps) => {
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
    if (!inputs) {
      return { currentSipAmount: calculatorResults?.requiredMonthlySIP || 0, targetCorpus: "₹0" };
    }

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
  }>({ currentSipAmount: calculatorResults?.requiredMonthlySIP || 0, targetCorpus: "" });

  useEffect(() => {
    if (inputs) {
      const data = trailError();
      setTrailErrorData(data);
    }
  }, [inputs]);

  // Use trailErrorData.currentSipAmount if available, otherwise fallback to requiredMonthlySIP
  const requiredSIPAmount = trailErrorData.currentSipAmount || calculatorResults?.requiredMonthlySIP || 0;

  const essentials: EssentialItem[] = [
    {
      title: 'Life Insurance',
      icon: <Shield className="w-5 h-5" />,
      status: checklist?.insurance_evidence ? 'complete' : 'incomplete',
      value: '10x Annual Income',
      description: 'Protects your loved ones financially in case of unforeseen events'
    },
    {
      title: 'Health Insurance',
      icon: <Heart className="w-5 h-5" />,
      status: checklist?.insurance_evidence ? 'complete' : 'incomplete',
      value: 'Coverage of 50% of Annual Income',
      description: 'Comprehensive health coverage for medical emergencies'
    },
    {
      title: 'Emergency Fund',
      icon: <Wallet className="w-5 h-5" />,
      status: checklist?.emergency_fund_baseline ? 'complete' : 'incomplete',
      value: `₹${calculatorResults?.emergencyFundRequired.toLocaleString('en-IN') || '0'}`,
      description: '6-12 months of expenses as a financial safety net'
    },
    {
      title: 'Required Monthly SIP',
      icon: <TrendingUp className="w-5 h-5" />,
      status: checklist?.sip_mandate_active ? 'complete' : 'incomplete',
      value: `${formatCurrency(requiredSIPAmount)}/month`,
      description: 'Systematic investment for long-term wealth creation'
    }
  ];

  const completedCount = essentials.filter(e => e.status === 'complete').length;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {essentials.map((essential, index) => (
        <Card
          key={index}
          className="border border-border/40 hover:border-primary/30 transition-all"
        >
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${essential.status === 'complete'
                ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                : 'bg-muted/50 text-muted-foreground'
                }`}>
                {essential.icon}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-base">{essential.title}</h4>
                  {essential.status === 'complete' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-muted-foreground/40" />
                  )}
                </div>

                <p className="text-sm text-muted-foreground">
                  {essential.description}
                </p>

                <div className="pt-2">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${essential.status === 'complete'
                    ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                    : 'bg-muted text-muted-foreground'
                    }`}>
                    {essential.value}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
