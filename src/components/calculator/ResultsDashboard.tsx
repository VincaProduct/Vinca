import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalculatorInputs, CalculationResults } from "@/types/calculator";
import WealthGrowthChart from "./WealthGrowthChart";
import DetailedProjectionTable from "./DetailedProjectionTable";
import {
  formatAmountInWords,
  formatAmountInCrores,
  formatAmountInLakhs,
} from "@/utils/numberToWords";

import {
  TrendingUp,
  Target,
  AlertCircle,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Download,
  Share,
  Lightbulb,
  Clock,
  PartyPopper,
} from "lucide-react";

interface ResultsDashboardProps {
  inputs: CalculatorInputs;
  results: CalculationResults;
}
interface UserLumpsumData {
  [yearNumber: number]: {
    investment: number;
    withdrawal: number;
  };
}
const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  inputs,
  results,
}) => {
  const [userLumpsumData, setUserLumpsumData] = useState<UserLumpsumData>({});

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const currentAge = inputs.age;

  // Generate personalized recommendations
  const getRecommendations = () => {
    const recommendations = [];

    // Calculate potential improvements
    const increasedSip = inputs.sipAmount * 1.5;
    const yearsSaved = Math.max(1, Math.round(results.yearsToFreedom * 0.15));
    const expenseReduction = 0.1;

    if (results.corpusDepletesBeforeLifeExpectancy) {
      recommendations.push(
        `Increase your monthly investment by ${formatAmountInLakhs(
          increasedSip - inputs.sipAmount
        )} to secure your retirement.`
      );
      recommendations.push(
        `Consider delaying retirement by 2 years to improve your monthly income.`
      );
    } else {
      recommendations.push(
        `Increase your monthly investment by ${formatAmountInLakhs(
          increasedSip - inputs.sipAmount
        )} to retire ${yearsSaved} years earlier.`
      );
      if (inputs.currentMonthlyExpenses > 50000) {
        recommendations.push(
          `Reducing expenses by 10% will help you reach your goal faster.`
        );
      }
    }

    // Limit to max 3 recommendations
    return recommendations.slice(0, 3);
  };

  const recommendations = getRecommendations();

  /**
   * Calculate Future Value (FV) - TypeScript equivalent of Excel's FV function
   * @param rate - Interest rate per period (as decimal, e.g., 0.01 for 1%)
   * @param nper - Number of periods
   * @param pmt - Payment amount per period (negative for payments out)
   * @param pv - Present Value (optional, default 0)
   * @param type - Payment type: 0 = end of period, 1 = beginning of period (optional, default 0)
   * @returns Future Value
   */
  function FV(
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
    const pmtFactor =
      ((Math.pow(1 + rate, nper) - 1) / rate) * (1 + rate * type);

    return -(pv * pvFactor + pmt * pmtFactor);
  }

  function CEILING(number, significance) {
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

  function safePercentageIncrease(initialValue, finalValue) {
    if (initialValue === 0) {
      return finalValue > 0 ? Infinity : 0;
    }
    return ((finalValue - initialValue) / initialValue) * 100;
  }

  console.log(projections.find((element) => element.isInSWPPhase === true).expectedCorpus);

  return (
    <div className="space-y-8">
      {/* Hero Section - Main Result */}
      <div className="text-center space-y-6">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium animate-fade-in">
          {!results.corpusDepletesBeforeLifeExpectancy ? (
            <div className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-4 py-2 rounded-full">
              <CheckCircle className="h-4 w-4 inline mr-2" />
              Plan is sustainable
            </div>
          ) : (
            <div className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 px-4 py-2 rounded-full">
              <AlertCircle className="h-4 w-4 inline mr-2" />
              Plan needs adjustment
            </div>
          )}
        </div>

        {/* Main Hero Card */}
        <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/15 max-w-3xl mx-auto">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full translate-y-12 -translate-x-12"></div>

          <CardContent className="pt-8 pb-8 px-8 relative">
            {/* Main Headline */}
            {!results.corpusDepletesBeforeLifeExpectancy ? (
              <>
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-green-500/10 rounded-full">
                    <PartyPopper className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <h1 className="text-2xl lg:text-4xl font-bold text-center mb-4">
                  You can achieve financial freedom in{" "}
                  <span className="text-4xl lg:text-5xl bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                    {results.yearsToFreedom} years
                  </span>
                </h1>

                <p className="text-center text-muted-foreground text-lg mb-6">
                  At age{" "}
                  <span className="font-semibold text-foreground">
                    {results.freedomAge}
                  </span>
                  , you'll have sustainable income to live comfortably
                  throughout your lifetime
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-amber-500/10 rounded-full">
                    <AlertTriangle className="h-8 w-8 text-amber-600" />
                  </div>
                </div>

                <h1 className="text-2xl lg:text-4xl font-bold text-center mb-4">
                  Your plan needs some adjustments
                </h1>

                <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                  <p className="text-center text-amber-800 dark:text-amber-200">
                    While you could retire in{" "}
                    <span className="font-bold">
                      {results.yearsToFreedom} years
                    </span>{" "}
                    at age {results.freedomAge}, your funds may run out by age{" "}
                    {results.corpusDepletionAge} — before your expected
                    lifetime.
                  </p>
                </div>

                <p className="text-center text-muted-foreground">
                  Don't worry! Small adjustments to your plan can secure your
                  entire retirement.
                </p>
              </>
            )}

            {/* Key Financial Metrics - Single Display */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <div className="text-center p-4 bg-background/50 rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">
                  Target Corpus
                </div>
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formatAmountInCrores(results.requiredCorpus)}
                </div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">
                  Estimated Corpus
                </div>
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatAmountInCrores(
                    inputs.initialPortfolioValue +
                      inputs.sipAmount * 12 * results.yearsToFreedom * 1.12
                  )}
                </div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">
                  Monthly Income
                </div>
                <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  {formatAmountInLakhs(results.futureAnnualExpenses / 12)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          <Button className="gap-2 hover:scale-105 transition-transform">
            <Download className="h-4 w-4" />
            Save Report
          </Button>
          <Button
            variant="outline"
            className="gap-2 hover:scale-105 transition-transform"
          >
            <Share className="h-4 w-4" />
            Share with Advisor
          </Button>
        </div>
      </div>

      {/* Personalized Recommendations */}
      {recommendations.length > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/5">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-3">
              💡 Tips to Improve Your Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-background/50 rounded-lg border"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-sm font-semibold">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {rec}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="visualization" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/30 p-1 rounded-lg">
          <TabsTrigger value="visualization" className="text-sm">
            📈 Journey Visualization
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="text-sm">
            💰 Financial Breakdown
          </TabsTrigger>
          <TabsTrigger value="projections" className="text-sm">
            📊 Year-by-Year
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visualization" className="space-y-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card via-card to-muted/10">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div>
                  <CardTitle className="text-lg font-semibold">
                    Your Financial Freedom Timeline
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Watch your wealth grow from age {currentAge} to{" "}
                    {Math.min(inputs.lifeExpectancy, currentAge + 40)}
                  </p>
                </div>
                <Badge
                  variant={results.canAchieveGoal ? "default" : "secondary"}
                  className="text-sm"
                >
                  {results.canAchieveGoal
                    ? "✅ On Track"
                    : "⚠️ Needs Adjustment"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <WealthGrowthChart inputs={inputs} projections={projections} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current vs Future Expenses */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50/50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                  </div>
                  Expense Inflation Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg border">
                    <span className="text-sm font-medium">
                      Today's Annual Expenses
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(inputs.currentMonthlyExpenses * 12)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg border">
                    <span className="text-sm font-medium">
                      At Retirement Annual Expenses (Age {results.freedomAge})
                    </span>
                    <span className="font-semibold text-orange-600">
                      {formatCurrency(
                        projections.find(
                          (element) => element.isInSWPPhase === true
                        ).monthlySWP * 12
                      )}
                    </span>
                  </div>
                  <div className="text-center p-2 bg-orange-500/10 rounded-lg">
                    <span className="text-sm text-orange-700 dark:text-orange-300">
                      {safePercentageIncrease(
                        inputs.currentMonthlyExpenses * 12,
                        projections.find(
                          (element) => element.isInSWPPhase === true
                        ).monthlySWP * 12
                      )}
                      % increase due to inflation
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investment Summary */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50/50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  Investment Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg border">
                    <span className="text-sm font-medium">
                      Current Portfolio
                    </span>
                    <span className="font-semibold text-blue-600">
                      {formatCurrency(inputs.initialPortfolioValue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg border">
                    <span className="text-sm font-medium">Monthly SIP</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(inputs.sipAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg border">
                    <span className="text-sm font-medium">
                    Expected Corpus at Retirement (Age {results.freedomAge})
                    </span>
                    <span className="font-semibold text-purple-600">
                      {formatCurrency(projections.find((element) => element.isInSWPPhase === true).expectedCorpus)}
                    </span>
                  </div>
                  <div className="text-center p-2 bg-blue-500/10 rounded-lg">
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      Expected return: {inputs.returnDuringSIPAndWaiting}%
                      during accumulation
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projections" className="space-y-4">
          <DetailedProjectionTable
            inputs={inputs}
            results={results}
            userLumpsumData={userLumpsumData}
            setUserLumpsumData={setUserLumpsumData}
            projections={projections}
          />
        </TabsContent>
      </Tabs>

      {/* Bottom CTA Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 text-center">
        <CardContent className="py-8">
          <h3 className="text-xl font-semibold mb-4">
            Ready to take the next step?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Your financial freedom journey starts with a single step. Whether
            you need to adjust your plan or you're on track, the key is to start
            now and stay consistent.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" className="gap-2">
              Plan Next Steps
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <Download className="h-4 w-4" />
              Download Full Report
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <Share className="h-4 w-4" />
              Share Results
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsDashboard;
