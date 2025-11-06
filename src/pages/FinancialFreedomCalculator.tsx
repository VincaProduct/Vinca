import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TimelineCalculatorForm from "@/components/calculator/TimelineCalculatorForm";
import MinimalResultsCard from "@/components/calculator/MinimalResultsCard";
// Keep ResultsDashboard for later use
// import ResultsDashboard from '@/components/calculator/ResultsDashboard';
import { CalculatorInputs, CalculationResults } from "@/types/calculator";
import { calculateFinancialFreedom } from "@/utils/calculatorUtils";
interface UserLumpsumData {
  [yearNumber: number]: {
    investment: number;
    withdrawal: number;
  };
}
/**
 * Calculate Future Value (FV) - TypeScript equivalent of Excel's FV function
 * @param rate - Interest rate per period (as decimal, e.g., 0.01 for 1%)
 * @param nper - Number of periods
 * @param pmt - Payment amount per period (negative for payments out)
 * @param pv - Present Value (optional, default 0)
 * @param type - Payment type: 0 = end of period, 1 = beginning of period (optional, default 0)
 * @returns Future Value
 */
export function FV(
  rate: number,
  nper: number,
  pmt: number,
  pv: number = 0,
  type: number = 0
): number {
  // Handle zero interest rate case
  if (rate === 0) {
    return -(pv + pmt * nper);
  }

  // Calculate future value with compound interest
  const pvFactor = Math.pow(1 + rate, nper);
  const pmtFactor = ((Math.pow(1 + rate, nper) - 1) / rate) * (1 + rate * type);

  return -(pv * pvFactor + pmt * pmtFactor);
}

export function CEILING(number, significance) {
  if (significance === 0) {
    return 0;
  }

  if (number === 0) {
    return 0;
  }

  // Handle negative numbers
  if (number < 0 && significance > 0) {
    return -Math.floor(Math.abs(number) / significance) * significance;
  }

  if (number > 0 && significance < 0) {
    return NaN; // Excel returns #NUM! error
  }

  if (number < 0 && significance < 0) {
    return (
      -Math.ceil(Math.abs(number) / Math.abs(significance)) *
      Math.abs(significance)
    );
  }

  // Standard case: positive number, positive significance
  return Math.ceil(number / significance) * significance;
}

const FinancialFreedomCalculator = () => {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    age: 26,
    lifeExpectancy: 85,
    initialPortfolioValue: 50000,
    sipAmount: 30000,
    yearsForSIP: 20,
    returnDuringSIPAndWaiting: 12,
    growthInSIP: 10,
    waitingYearsBeforeSWP: 5,
    currentMonthlyExpenses: 100000,
    inflation: 7,
    returnDuringSWP: 10,
    growthInSWP: 7,
  });

  const [results, setResults] = useState<CalculationResults | null>(null);
  const [userLumpsumData, setUserLumpsumData] = useState<UserLumpsumData>({});
  const handleInputChange = (newInputs: CalculatorInputs) => {
    setInputs(newInputs);
  };

  const handleCalculate = () => {
    const calculatedResults = calculateFinancialFreedom(inputs);
    setResults(calculatedResults);
  };

  const getUserLumpsumValue = (
    yearNumber: number,
    type: "investment" | "withdrawal"
  ) => {
    return userLumpsumData[yearNumber]?.[type] || 0;
  };

  const generateDetailedProjections = () => {
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
      const lumpsumInvestment = getUserLumpsumValue(yearNumber, "investment");
      const lumpsumWithdrawal = getUserLumpsumValue(yearNumber, "withdrawal");

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

  const projections = generateDetailedProjections();


  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Calculator Section */}
      <div className="container mx-auto px-4 lg:px-8 py-8 pt-24">
        {!results ? (
          /* Input Section Only */
          <div className="max-w-3xl mx-auto animate-slide-up">
            <TimelineCalculatorForm
              inputs={inputs}
              onInputChange={handleInputChange}
              onCalculate={handleCalculate}
            />
          </div>
        ) : (
          /* 2 Column Layout with Results */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {/* Left Column - Calculator Input */}
            <div className="animate-slide-up">
              <TimelineCalculatorForm
                inputs={inputs}
                onInputChange={handleInputChange}
                onCalculate={handleCalculate}
              />
            </div>

            {/* Right Column - Results */}
            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <MinimalResultsCard
                inputs={inputs}
                results={results}
                projections={projections}
              />
            </div>
          </div>
        )}
      </div>

      {/* CTAs Section */}
      <div className="bg-muted/30 py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Get personalized guidance from our financial experts to accelerate
              your path to financial freedom.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => window.location.href = '/#contact'}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
              >
                Schedule Free Consultation
              </button>
            </div>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FinancialFreedomCalculator;
