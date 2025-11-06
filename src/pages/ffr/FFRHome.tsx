import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator } from 'lucide-react';
import { FFRBandCard } from '@/components/ffr/FFRBandCard';
import { EssentialsPanel } from '@/components/ffr/EssentialsPanel';
import { ProgressPathway } from '@/components/ffr/ProgressPathway';
import { BusinessOpportunitiesPreview } from '@/components/ffr/BusinessOpportunitiesPreview';
// import { ExportResults } from '@/components/ffr/ExportResults';
import { InputParametersPanel } from '@/components/ffr/InputParametersPanel';
import { HeadlineInsights } from '@/components/ffr/HeadlineInsights';
import { YearlyCorpusAnalysis } from '@/components/ffr/YearlyCorpusAnalysis';
import { EducationalContent } from '@/components/ffr/EducationalContent';
import { useFFR } from '@/hooks/useFFR';
import { useAuth } from '@/contexts/AuthContext';
import { CalculatorInputs, CalculationResults } from '@/types/calculator';
import MinimalResultsCard from '@/components/calculator/MinimalResultsCard';
import { FV, CEILING } from '@/pages/FinancialFreedomCalculator';

export default function FFRHome() {
  const { user } = useAuth();
  const { ffrProgress, checklist, loading, initializeUserData, getCurrentScores } = useFFR();
  const [calculatorInputs, setCalculatorInputs] = useState<CalculatorInputs | null>(null);
  const [calculatorResults, setCalculatorResults] = useState<CalculationResults | null>(null);

  const handleInputsUpdate = (newInputs: CalculatorInputs, newResults: CalculationResults) => {
    setCalculatorInputs(newInputs);
    setCalculatorResults(newResults);
  };

  useEffect(() => {
    if (user && !ffrProgress) {
      initializeUserData();
    }
    
    // Load calculator results from localStorage
    const storedInputs = localStorage.getItem('financial_calculator_inputs');
    const storedResults = localStorage.getItem('financial_calculator_results');
    
    if (storedInputs && storedResults) {
      setCalculatorInputs(JSON.parse(storedInputs));
      setCalculatorResults(JSON.parse(storedResults));
    }
  }, [user, ffrProgress]);

  const scores = getCurrentScores();

  // Generate projections for calculator results display
  const generateDetailedProjections = () => {
    if (!calculatorInputs) return [];
    
    const projections = [];
    let currentCorpus = calculatorInputs.initialPortfolioValue;
    const annualReturn = calculatorInputs.returnDuringSIPAndWaiting / 100;
    const swpReturn = calculatorInputs.returnDuringSWP / 100;
    const currentAge = calculatorInputs.age;
    const sipEndYear = calculatorInputs.yearsForSIP;
    const swpStartYear = calculatorInputs.yearsForSIP + calculatorInputs.waitingYearsBeforeSWP;

    const inflatedMonthlyExpenses = CEILING(
      calculatorInputs.currentMonthlyExpenses *
        Math.pow(1 + calculatorInputs.inflation / 100, swpStartYear),
      1000
    );

    let previousMonthlySWP = 0;

    for (
      let year = 1;
      year <= Math.min(50, calculatorInputs.lifeExpectancy - currentAge);
      year++
    ) {
      const age = currentAge + year;
      const yearNumber = year;

      const isInSIPPhase = year <= sipEndYear;
      const isInWaitingPhase = year > sipEndYear && year <= swpStartYear;
      const isInSWPPhase = year > swpStartYear;

      let monthlySIP = 0;
      if (isInSIPPhase) {
        const sipGrowthRate = calculatorInputs.growthInSIP / 100;
        monthlySIP = calculatorInputs.sipAmount * Math.pow(1 + sipGrowthRate, year - 1);
      }

      const returnRate = isInSWPPhase ? swpReturn : annualReturn;

      let monthlySWP = 0;
      if (isInSWPPhase) {
        if (calculatorInputs.yearsForSIP + calculatorInputs.waitingYearsBeforeSWP + 1 === year) {
          monthlySWP = inflatedMonthlyExpenses;
        } else {
          monthlySWP = previousMonthlySWP * (1 + calculatorInputs.growthInSWP / 100);
        }
        previousMonthlySWP = monthlySWP;
      }

      let beginningCorpus = currentCorpus;

      if (isInSIPPhase || isInWaitingPhase) {
        const rate = Math.pow(1 + annualReturn, 1 / 12) - 1;
        beginningCorpus = FV(rate, 12, -monthlySIP, -beginningCorpus, 1);
      } else {
        const rate = Math.pow(1 + swpReturn, 1 / 12) - 1;
        beginningCorpus = FV(rate, 12, monthlySWP, -beginningCorpus, 1);
      }

      const expectedCorpus = beginningCorpus;

      projections.push({
        year: currentAge + year,
        yearNumber,
        age,
        amountInHand: currentCorpus,
        lumpsumInvestment: 0,
        monthlySIP,
        returnRate: returnRate * 100,
        monthlySWP,
        lumpsumWithdrawal: 0,
        expectedCorpus,
        isInSIPPhase,
        isInWaitingPhase,
        isInSWPPhase,
      });

      currentCorpus = expectedCorpus;
    }

    return projections;
  };

  const projections = calculatorInputs ? generateDetailedProjections() : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-b">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Financial Freedom Readiness</h1>
              <p className="text-muted-foreground">
                Your personalized roadmap to financial independence
              </p>
            </div>
            {/* <ExportResults 
              ffrProgress={ffrProgress}
              calculatorResults={calculatorResults}
            /> */}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* a. Top Panel: Calculator Results with Edit */}
        {calculatorInputs && (
          <InputParametersPanel 
            inputs={calculatorInputs}
            onInputsUpdate={handleInputsUpdate}
          />
        )}

        {calculatorInputs && calculatorResults && (
          <Card className="border-primary/50 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-lg">
                  <Calculator className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Your Calculation Results</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Personalized insights based on your financial goals
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <MinimalResultsCard
                inputs={calculatorInputs}
                results={calculatorResults}
                projections={projections}
              />
            </CardContent>
          </Card>
        )}

        {/* b. FFR Scorecard */}
        {scores && (
          <FFRBandCard scores={scores} />
        )}

        {/* c. Headline Insights / Big Picture */}
        {calculatorInputs && calculatorResults && (
          <HeadlineInsights 
            inputs={calculatorInputs}
            results={calculatorResults}
          />
        )}

        {/* d. Year-on-Year Corpus Analysis */}
        {projections.length > 0 && calculatorInputs && (
          <YearlyCorpusAnalysis 
            projections={projections}
            inputs={calculatorInputs}
          />
        )}

        {/* e. Foundations Checklist */}
        <EssentialsPanel 
          checklist={checklist}
          calculatorResults={calculatorResults}
        />

        {/* f. Action Plan & g. Journey Progress */}
        <ProgressPathway ffrProgress={ffrProgress} />

        {/* h. Educational Content & Learning Path */}
        <EducationalContent 
          ffrScores={ffrProgress ? {
            foundation_score: ffrProgress.foundation_score,
            habit_score: ffrProgress.habit_score,
            literacy_score: ffrProgress.literacy_score
          } : undefined}
        />

        {/* Business Opportunities Guidance */}
        <BusinessOpportunitiesPreview />

        {/* Motivational Summary */}
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardContent className="pt-6 text-center">
            <h3 className="text-2xl font-bold mb-3">
              You're {scores ? Math.round(scores.base) : 0}% Ready for Financial Freedom
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              {scores && scores.base < 50 
                ? "Every journey begins with a single step. Complete your essentials and build momentum towards your financial goals."
                : scores && scores.base < 75
                ? "You're making great progress! Stay consistent with your habits and continue learning to accelerate your journey."
                : "Outstanding work! You're well-positioned for financial freedom. Keep exploring opportunities to optimize your wealth."}
            </p>
          </CardContent>
        </Card>

        {/* i. Compliance Note */}
        <div className="bg-muted/30 border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground text-center">
            📚 <strong>Educational & Execution-Only Platform</strong> • No investment advice provided • 
            All transactions conducted through authorized partners • 
            Consult a qualified financial advisor for personalized recommendations
          </p>
        </div>
      </div>
    </div>
  );
}