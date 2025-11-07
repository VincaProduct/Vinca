import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from "lucide-react";
import { FFRBandCard } from "@/components/ffr/FFRBandCard";
import { EssentialsPanel } from "@/components/ffr/EssentialsPanel";
import { ProgressPathway } from "@/components/ffr/ProgressPathway";
import { BusinessOpportunitiesPreview } from "@/components/ffr/BusinessOpportunitiesPreview";
// import { ExportResults } from '@/components/ffr/ExportResults';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit } from "lucide-react";
import TimelineCalculatorForm from "@/components/calculator/TimelineCalculatorForm";
import { calculateFinancialFreedom } from "@/utils/calculatorUtils";
import { toast } from "sonner";
import { HeadlineInsights } from "@/components/ffr/HeadlineInsights";
import { YearlyCorpusAnalysis } from "@/components/ffr/YearlyCorpusAnalysis";
import { EducationalContent } from "@/components/ffr/EducationalContent";
import { useFFR } from "@/hooks/useFFR";
import { useAuth } from "@/contexts/AuthContext";
import { CalculatorInputs, CalculationResults } from "@/types/calculator";
import MinimalResultsCard from "@/components/calculator/MinimalResultsCard";
import { FV, CEILING } from "@/pages/FinancialFreedomCalculator";

export default function FFRHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { ffrProgress, checklist, loading, initializeUserData, getCurrentScores } = useFFR();
  const [calculatorInputs, setCalculatorInputs] = useState<CalculatorInputs | null>(null);
  const [calculatorResults, setCalculatorResults] = useState<CalculationResults | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editedInputs, setEditedInputs] = useState<CalculatorInputs | null>(null);

  const handleCalculate = async () => {
    if (!editedInputs) return;

    const newResults = calculateFinancialFreedom(editedInputs);

    // Store in localStorage
    localStorage.setItem("financial_calculator_inputs", JSON.stringify(editedInputs));
    localStorage.setItem("financial_calculator_results", JSON.stringify(newResults));

    // Save to database if user is logged in
    if (user) {
      try {
        await supabase.from("user_calculations").insert({
          user_id: user.id,
          calculation_type: "financial_freedom",
          inputs: editedInputs as any,
          results: newResults as any,
        });
      } catch (error) {
        console.error("Error saving to database:", error);
      }
    }

    // Update state
    setCalculatorInputs(editedInputs);
    setCalculatorResults(newResults);

    setIsEditOpen(false);
    toast.success("Your financial plan has been updated!");
  };

  useEffect(() => {
    const loadData = async () => {
      if (user && !ffrProgress) {
        initializeUserData();
      }

      // Try to load from DB first if user is logged in
      if (user) {
        try {
          const { data, error } = await supabase
            .from("user_calculations")
            .select("inputs, results")
            .eq("user_id", user.id)
            .eq("calculation_type", "financial_freedom")
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (!error && data) {
            const inputs = data.inputs as unknown as CalculatorInputs;
            const results = data.results as unknown as CalculationResults;
            setCalculatorInputs(inputs);
            setCalculatorResults(results);
            setEditedInputs(inputs);
            return; // DB data found, don't check localStorage
          }
        } catch (error) {
          console.log("No DB data found, checking localStorage");
        }
      }

      // Fallback to localStorage
      const storedInputs = localStorage.getItem("financial_calculator_inputs");
      const storedResults = localStorage.getItem("financial_calculator_results");

      if (storedInputs && storedResults) {
        const inputs = JSON.parse(storedInputs);
        const results = JSON.parse(storedResults);
        setCalculatorInputs(inputs);
        setCalculatorResults(results);
        setEditedInputs(inputs);
      }
    };

    loadData();
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
      calculatorInputs.currentMonthlyExpenses * Math.pow(1 + calculatorInputs.inflation / 100, swpStartYear),
      1000,
    );

    let previousMonthlySWP = 0;

    for (let year = 1; year <= Math.min(50, calculatorInputs.lifeExpectancy - currentAge); year++) {
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

  const handlePortfolioLoginClick = () => {
    window.open(
      "https://portfolio.vincawealth.com/login?_gl=1*1c7uhfu*_gcl_au*MTg1NjAzODIzOC4xNzQ5Mjk4MTEy*_ga*MTg1NzI3NTc0MC4xNzQ5Mjk4MTEy*_ga_6MQBMGPXJJ*czE3NDkzNzE3MTkkbzIkZzAkdDE3NDkzNzE3MTkkajYwJGwwJGgw",
      "_blank",
      "noopener,noreferrer",
    );
  };

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
              <p className="text-muted-foreground">Your personalized roadmap to financial independence</p>
            </div>
            {calculatorInputs && (
              <Dialog
                open={isEditOpen}
                onOpenChange={(open) => {
                  setIsEditOpen(open);
                  if (open) setEditedInputs(calculatorInputs);
                }}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Edit className="w-4 h-4" />
                    Edit Inputs
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Your Financial Plan</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    {editedInputs && (
                      <TimelineCalculatorForm
                        inputs={editedInputs}
                        onInputChange={setEditedInputs}
                        onCalculate={handleCalculate}
                      />
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Calculator Results */}
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
              <MinimalResultsCard inputs={calculatorInputs} results={calculatorResults} projections={projections} />
            </CardContent>
          </Card>
        )}

        {/* b. FFR Scorecard */}
        {/* {scores && (
          <FFRBandCard scores={scores} />
        )} */}

        {/* c. Headline Insights / Big Picture
        // {calculatorInputs && calculatorResults && projections.length > 0 && (
        //   <HeadlineInsights
        //     inputs={calculatorInputs}
        //     results={calculatorResults}
        //     projections={projections}
        //   />
        // )} */}

        {/* d. Year-on-Year Corpus Analysis */}
        {projections.length > 0 && calculatorInputs && (
          <YearlyCorpusAnalysis projections={projections} inputs={calculatorInputs} />
        )}

        {/* Story-driven CTA Journey */}
        <div className="space-y-8">
          {/* Step 1: Satisfied with Planning? */}
          <Card className="border-primary/30 overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8">
              <div className="max-w-3xl">
                <h2 className="text-2xl font-bold mb-4">✅ Satisfied with Your Financial Planning?</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  You've taken the first step by calculating your path to financial freedom. But a solid plan is just
                  the beginning of your journey.
                </p>
              </div>
            </div>
          </Card>

          {/* Step 2: Financial Essentials */}
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                🛡️ Are You Covered with Financial Essentials?
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Before building wealth, ensure your foundation is solid. These essentials protect you and your family
                from unexpected events.
              </p>
            </CardHeader>
            <CardContent>
              <EssentialsPanel
                checklist={checklist}
                calculatorResults={calculatorResults}
                inputs={calculatorInputs || undefined}
                projections={projections}
              />
            </CardContent>
          </Card>

          {/* Step 4: Main CTA - Portfolio Login */}
          <Card className="border-2 border-primary bg-gradient-to-br from-primary/10 via-primary/5 to-background overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
            <CardContent className="pt-8 pb-8 relative z-10">
              <div className="max-w-3xl mx-auto text-center space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
                  <span className="text-3xl">🎯</span>
                </div>

                <h2 className="text-3xl font-bold">Take the Next Step with Professional Guidance</h2>

                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Your financial journey deserves expert support. Login to your Portfolio and connect with our advisors
                  who will personally guide you through:
                </p>

                <div className="grid md:grid-cols-3 gap-4 my-8">
                  <div className="p-4 rounded-lg bg-background/50 border border-primary/20">
                    <div className="text-2xl mb-2">📊</div>
                    <h3 className="font-semibold mb-1">Personalized Strategy</h3>
                    <p className="text-sm text-muted-foreground">
                      Tailored investment plans based on your unique goals
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-background/50 border border-primary/20">
                    <div className="text-2xl mb-2">💼</div>
                    <h3 className="font-semibold mb-1">Exclusive Access</h3>
                    <p className="text-sm text-muted-foreground">
                      Premium investment opportunities and business ventures
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-background/50 border border-primary/20">
                    <div className="text-2xl mb-2">🤝</div>
                    <h3 className="font-semibold mb-1">Expert Support</h3>
                    <p className="text-sm text-muted-foreground">
                      One-on-one guidance from experienced wealth managers
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-lg px-8 py-6 w-full sm:w-auto"
                    onClick={() => navigate("/dashboard/book-wealth-manager")}
                  >
                    Talk to an Advisor
                  </Button>
                  <Button size="lg" className="text-lg px-8 py-6 w-full sm:w-auto" onClick={handlePortfolioLoginClick}>
                    Access Your Portfolio Now
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground mt-6">
                  ⭐ Trusted by 1000+ investors achieving their financial goals
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* i. Compliance Note */}
        <div className="bg-muted/30 border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground text-center">
            📚 <strong>Educational & Execution-Only Platform</strong> • No investment advice provided • All transactions
            conducted through authorized partners • Consult a qualified financial advisor for personalized
            recommendations
          </p>
        </div>
      </div>
    </div>
  );
}
