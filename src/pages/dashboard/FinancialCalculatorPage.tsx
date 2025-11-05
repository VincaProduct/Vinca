import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TimelineCalculatorForm from "@/components/calculator/TimelineCalculatorForm";
import MinimalResultsCard from "@/components/calculator/MinimalResultsCard";
import { CalculatorInputs, CalculationResults } from "@/types/calculator";
import { calculateFinancialFreedom } from "@/utils/calculatorUtils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, Download, History } from "lucide-react";

interface UserLumpsumData {
  [yearNumber: number]: {
    investment: number;
    withdrawal: number;
  };
}

/**
 * Calculate Future Value (FV) - TypeScript equivalent of Excel's FV function
 */
export function FV(
  rate: number,
  nper: number,
  pmt: number,
  pv: number = 0,
  type: number = 0
): number {
  if (rate === 0) {
    return -(pv + pmt * nper);
  }

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

  if (number < 0 && significance > 0) {
    return -Math.floor(Math.abs(number) / significance) * significance;
  }

  if (number > 0 && significance < 0) {
    return NaN;
  }

  if (number < 0 && significance < 0) {
    return (
      -Math.ceil(Math.abs(number) / Math.abs(significance)) *
      Math.abs(significance)
    );
  }

  return Math.ceil(number / significance) * significance;
}

const FinancialCalculatorPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
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
  const [isSaving, setIsSaving] = useState(false);

  // Load cached data from localStorage on component mount
  useEffect(() => {
    const cachedInputs = localStorage.getItem('financial_calculator_inputs');
    const cachedResults = localStorage.getItem('financial_calculator_results');
    
    if (cachedInputs) {
      try {
        const parsedInputs = JSON.parse(cachedInputs);
        setInputs(parsedInputs);
      } catch (error) {
        console.error('Error parsing cached inputs:', error);
      }
    }
    
    if (cachedResults) {
      try {
        const parsedResults = JSON.parse(cachedResults);
        setResults(parsedResults);
      } catch (error) {
        console.error('Error parsing cached results:', error);
      }
    }
  }, []);

  const handleInputChange = (newInputs: CalculatorInputs) => {
    setInputs(newInputs);
    // Update localStorage whenever inputs change
    localStorage.setItem('financial_calculator_inputs', JSON.stringify(newInputs));
  };

  const handleCalculate = () => {
    const calculatedResults = calculateFinancialFreedom(inputs);
    setResults(calculatedResults);
    
    // Cache results in localStorage
    localStorage.setItem('financial_calculator_results', JSON.stringify(calculatedResults));
  };

  const saveCalculation = async () => {
    if (!user || !results) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_calculations')
        .insert({
          user_id: user.id,
          calculation_type: 'financial_freedom',
          inputs: inputs as any,
          results: results as any
        });

      if (error) throw error;

      toast({
        title: "Calculation Saved",
        description: "Your financial plan has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving calculation:', error);
      toast({
        title: "Error",
        description: "Failed to save calculation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
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

    const inflatedMonthlyExpenses = CEILING(
      inputs.currentMonthlyExpenses *
        Math.pow(1 + inputs.inflation / 100, swpStartYear),
      1000
    );

    let previousMonthlySWP = 0;

    for (
      let year = 1;
      year <= Math.min(50, inputs.lifeExpectancy - currentAge);
      year++
    ) {
      const age = currentAge + year;
      const yearNumber = year;

      const isInSIPPhase = year <= sipEndYear;
      const isInWaitingPhase = year > sipEndYear && year <= swpStartYear;
      const isInSWPPhase = year > swpStartYear;

      let monthlySIP = 0;
      if (isInSIPPhase) {
        const sipGrowthRate = inputs.growthInSIP / 100;
        monthlySIP = inputs.sipAmount * Math.pow(1 + sipGrowthRate, year - 1);
      }

      const lumpsumInvestment = getUserLumpsumValue(yearNumber, "investment");
      const lumpsumWithdrawal = getUserLumpsumValue(yearNumber, "withdrawal");

      const returnRate = isInSWPPhase ? swpReturn : annualReturn;

      let monthlySWP = 0;
      if (isInSWPPhase) {
        if (inputs.yearsForSIP + inputs.waitingYearsBeforeSWP + 1 === year) {
          monthlySWP = inflatedMonthlyExpenses;
        } else {
          monthlySWP = previousMonthlySWP * (1 + inputs.growthInSWP / 100);
        }
        previousMonthlySWP = monthlySWP;
      }

      let beginningCorpus = currentCorpus;

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

  const [showEditForm, setShowEditForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Financial Freedom Calculator</h1>
          <p className="text-muted-foreground mt-2">
            Your complete financial independence analysis with detailed projections.
          </p>
        </div>
        
        {results && (
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setShowEditForm(!showEditForm)}
              variant="outline"
              size="sm"
            >
              {showEditForm ? 'Hide Form' : 'Edit Details'}
            </Button>
            <Button
              onClick={saveCalculation}
              disabled={isSaving}
              variant="outline"
              size="sm"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Plan'}
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <History className="h-4 w-4 mr-2" />
              History
            </Button>
          </div>
        )}
      </div>

      {!results ? (
        /* Input Section Only */
        <Card className="p-6">
          <TimelineCalculatorForm
            inputs={inputs}
            onInputChange={handleInputChange}
            onCalculate={handleCalculate}
          />
        </Card>
      ) : (
        /* Results with Optional Edit Form */
        <div className="space-y-6">
          {/* Edit Form (Collapsible) */}
          {showEditForm && (
            <Card className="p-6 animate-fade-in">
              <h3 className="text-lg font-semibold mb-4">Edit Your Parameters</h3>
              <TimelineCalculatorForm
                inputs={inputs}
                onInputChange={handleInputChange}
                onCalculate={handleCalculate}
              />
            </Card>
          )}

          {/* Full Results Display */}
          <div className="animate-fade-in">
            <MinimalResultsCard
              inputs={inputs}
              results={results}
              projections={projections}
            />
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {results && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start">
              Schedule Consultation
            </Button>
            <Button variant="outline" className="justify-start">
              Download Detailed Report
            </Button>
            <Button variant="outline" className="justify-start">
              Compare Scenarios
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default FinancialCalculatorPage;