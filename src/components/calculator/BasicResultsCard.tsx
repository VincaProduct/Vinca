import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalculationResults, CalculatorInputs } from "@/types/calculator";
import { CheckCircle, AlertTriangle, Calendar, Target, TrendingUp, ArrowRight, Sparkles, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BasicResultsCardProps {
  results: CalculationResults;
  inputs: CalculatorInputs;
}

const formatCurrency = (value: number): string => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)}Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)}L`;
  } else {
    return `₹${Math.round(value).toLocaleString("en-IN")}`;
  }
};

const BasicResultsCard: React.FC<BasicResultsCardProps> = ({ results, inputs }) => {
  const navigate = useNavigate();
  const needsOptimization = results.corpusDepletesBeforeLifeExpectancy;

  const handleSignUp = () => {
    localStorage.setItem('redirect_after_login', '/dashboard/ffr');
    navigate("/auth");
  };

  // Calculate projected corpus at retirement
  const retirementAge = inputs.age + inputs.yearsForSIP + inputs.waitingYearsBeforeSWP;
  const yearsToRetirement = retirementAge - inputs.age;
  
  // Simple FV calculation for projected corpus
  const monthlyRate = inputs.returnDuringSIPAndWaiting / 100 / 12;
  const sipMonths = inputs.yearsForSIP * 12;
  let sipValue = 0;
  if (monthlyRate > 0) {
    sipValue = inputs.sipAmount * ((Math.pow(1 + monthlyRate, sipMonths) - 1) / monthlyRate);
  } else {
    sipValue = inputs.sipAmount * sipMonths;
  }
  const initialGrowth = inputs.initialPortfolioValue * Math.pow(1 + inputs.returnDuringSIPAndWaiting / 100, inputs.yearsForSIP);
  const corpusAfterSIP = initialGrowth + sipValue;
  const projectedCorpus = corpusAfterSIP * Math.pow(1 + inputs.returnDuringSIPAndWaiting / 100, inputs.waitingYearsBeforeSWP);

  const currentMonthlySIP = inputs.sipAmount;
  const sipGap = results.requiredMonthlySIP - currentMonthlySIP;
  const currentSIPStatus = sipGap > 0 ? "Insufficient" : "Secure";
  const requiredSIPStatus = sipGap > 0 ? "Secure" : "Excellent";

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-card via-card/50 to-muted/20 border-2">
        <div className="p-8 text-center space-y-4">
          {needsOptimization ? (
            <>
              <div className="flex justify-center">
                <AlertTriangle className="w-12 h-12 text-orange-500" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-orange-500">
                Plan Needs Adjustment
              </h2>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                Your current plan may not sustain your financial goals. Let's optimize it.
              </p>
            </>
          ) : (
            <>
              <div className="flex justify-center">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-green-500">
                You're On Track!
              </h2>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                Your financial freedom plan looks solid based on current projections.
              </p>
            </>
          )}
        </div>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="relative overflow-hidden bg-card/50 border">
          <div className="p-6 text-center space-y-3">
            <Calendar className="w-8 h-8 text-green-500 mx-auto" />
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Financial Freedom Age
            </div>
            <div className="text-4xl font-bold text-foreground">
              {results.freedomAge}
            </div>
            <div className="text-sm text-muted-foreground">
              In {results.yearsToFreedom} years
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-card/50 border">
          <div className="p-6 text-center space-y-3">
            <div className="flex items-center justify-center gap-1">
              <Target className="w-8 h-8 text-muted-foreground mx-auto" />
              <Info className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Expected Corpus
            </div>
            <div className="text-3xl font-bold text-foreground">
              {formatCurrency(projectedCorpus)}
            </div>
            <div className="text-sm text-muted-foreground">
              At retirement
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-card/50 border border-blue-500/30">
          <div className="p-6 text-center space-y-3">
            <div className="flex items-center justify-center gap-1">
              <Target className="w-8 h-8 text-blue-500 mx-auto" />
              <Info className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Required Corpus
            </div>
            <div className="text-3xl font-bold text-blue-500">
              {formatCurrency(results.requiredCorpus)}
            </div>
            <div className="text-sm text-blue-400">
              Target needed
            </div>
          </div>
        </Card>
      </div>

      {/* SIP Adjustment Section */}
      {needsOptimization && (
        <Card className="relative overflow-hidden border-2 border-red-500/30 bg-gradient-to-br from-red-500/5 to-card">
          <div className="p-6 space-y-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-red-500/10">
                <TrendingUp className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-red-500 mb-1">
                  SIP Adjustment Required
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your corpus may deplete around age <span className="font-bold text-red-500">{results.corpusDepletionAge}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-card/50 border border-border">
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Current Monthly SIP</span>
                    <Badge variant="destructive" className="text-xs">
                      {currentSIPStatus}
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-foreground">
                    {formatCurrency(currentMonthlySIP)}
                  </div>
                </div>
              </Card>

              <Card className="bg-green-500/5 border border-green-500/30">
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Required Monthly SIP</span>
                    <Badge className="text-xs bg-green-500/20 text-green-600 hover:bg-green-500/30">
                      {requiredSIPStatus}
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-green-600">
                    {formatCurrency(results.requiredMonthlySIP)}
                  </div>
                </div>
              </Card>
            </div>

            <Card className="bg-green-500/5 border border-green-500/30">
              <div className="p-6 text-center space-y-2">
                <h4 className="text-base font-semibold text-green-600">
                  Action Required
                </h4>
                <p className="text-sm text-muted-foreground">
                  Increase your monthly SIP by
                </p>
                <div className="text-4xl font-bold text-green-600">
                  +{formatCurrency(sipGap)}
                </div>
                <p className="text-sm text-muted-foreground">
                  to secure your retirement goal
                </p>
              </div>
            </Card>
          </div>
        </Card>
      )}

      {/* Sign Up CTA */}
      <Card className="relative overflow-hidden border-2 border-primary bg-gradient-to-br from-primary/10 via-card to-accent/10">
        <div className="relative p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-xl md:text-2xl font-bold text-foreground">
              Sign up free to view your full analysis and detailed action plan
            </h3>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Get year-by-year projections, deep-dive analytics, personalized recommendations, and expert guidance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={handleSignUp}
              size="lg"
              className="text-base px-8 py-6 shadow-lg hover:shadow-xl transition-all group"
            >
              Sign Up Free
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-sm text-muted-foreground">
              No credit card required
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border/50">
            <div className="text-center space-y-1">
              <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
              <p className="text-xs font-medium">Year-by-Year Projections</p>
            </div>
            <div className="text-center space-y-1">
              <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
              <p className="text-xs font-medium">Personalized Action Plan</p>
            </div>
            <div className="text-center space-y-1">
              <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
              <p className="text-xs font-medium">Expert Guidance</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BasicResultsCard;
