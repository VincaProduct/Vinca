import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';
import { useFinancialPlanning } from '../context/FinancialPlanningContext';
import MinimalResultsCard from '@/components/calculator/MinimalResultsCard';
import { YearlyCorpusAnalysis } from '@/components/ffr/YearlyCorpusAnalysis';
import { EssentialsPanel } from '@/components/ffr/EssentialsPanel';
import { FFRScoreCard } from '@/components/ffr/FFRScoreCard';
import { useFFR } from '@/hooks/useFFR';

export function FinancialReadinessTab() {
  const navigate = useNavigate();
  const { inputs, results, projections, hasCalculated } = useFinancialPlanning();
  const { checklist } = useFFR(inputs && results ? { inputs, results } : undefined);

  if (!hasCalculated || !inputs || !results) {
    return (
      <div className="space-y-6">
        <Card className="border-dashed">
          <CardContent className="py-12 flex flex-col items-center text-center">
            <p className="text-sm text-muted-foreground mb-1">
              No financial plan yet.
            </p>
            <p className="text-sm text-muted-foreground">
              Use the <span className="font-medium text-foreground">Edit Inputs</span> button above to enter your details and generate projections.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Financial Freedom Score */}
      <FFRScoreCard inputs={inputs} results={results} projections={projections} checklist={checklist} />

      {/* Calculator Results */}
      <Card className="border-primary/50 shadow-lg">
        <CardContent className="pt-6">
          <MinimalResultsCard inputs={inputs} results={results} projections={projections} />
        </CardContent>
      </Card>

      {/* Year-on-Year Corpus Analysis (chart + table) */}
      {projections.length > 0 && (
        <YearlyCorpusAnalysis projections={projections} inputs={inputs} />
      )}

      {/* Story-driven CTA Journey */}
      <div className="space-y-6 sm:space-y-8">
        {/* Step 1 */}
        <Card className="border-primary/30 overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 sm:p-8">
            <div className="max-w-3xl">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">✅ Satisfied with Your Financial Planning?</h2>
              <p className="text-base sm:text-lg text-muted-foreground mb-4 sm:mb-6">
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
              calculatorResults={results}
              inputs={inputs}
              projections={projections}
            />
          </CardContent>
        </Card>

        {/* Step 3: Main CTA */}
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

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 my-6 sm:my-8">
                <div className="p-3 sm:p-4 rounded-lg bg-background/50 border border-primary/20">
                  <div className="text-2xl mb-2">📊</div>
                  <h3 className="font-semibold mb-1 text-sm sm:text-base">Personalized Strategy</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Tailored investment plans based on your unique goals
                  </p>
                </div>
                <div className="p-3 sm:p-4 rounded-lg bg-background/50 border border-primary/20">
                  <div className="text-2xl mb-2">💼</div>
                  <h3 className="font-semibold mb-1 text-sm sm:text-base">Exclusive Access</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Premium investment opportunities and business ventures
                  </p>
                </div>
                <div className="p-3 sm:p-4 rounded-lg bg-background/50 border border-primary/20 sm:col-span-2 md:col-span-1">
                  <div className="text-2xl mb-2">🤝</div>
                  <h3 className="font-semibold mb-1 text-sm sm:text-base">Expert Support</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    One-on-one guidance from experienced wealth managers
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto"
                  onClick={() => navigate('/dashboard/book-wealth-manager')}
                >
                  Talk to Wealth Manager
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mt-6">
                ⭐ Trusted by 1000+ investors achieving their financial goals
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
