import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FinancialPlanningProvider, useFinancialPlanning } from '@/components/financial-planning/context/FinancialPlanningContext';
import { ReadinessFitCard } from '@/components/readinessFit/ReadinessFitCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CanonicalPageHeader from '@/components/ui/CanonicalPageHeader';
import { Sparkles, Target, TrendingUp, HeartHandshake } from 'lucide-react';

function ReadinessFitPageContent() {
  const navigate = useNavigate();
  const { inputs, results } = useFinancialPlanning();
  
  // Carousel state for mobile
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  const infoCards = [
    {
      icon: Target,
      title: "Sustainability Gap",
      description: "Measures the difference between your target retirement age and how long your corpus will sustain.",
      color: "emerald"
    },
    {
      icon: TrendingUp,
      title: "Lifestyle Gap",
      description: "Shows how your expected corpus coverage aligns with your lifestyle expectations.",
      color: "emerald"
    },
    {
      icon: HeartHandshake,
      title: "Optimization Potential",
      description: "Higher scores mean more room to optimize your financial and lifestyle plans.",
      color: "emerald"
    }
  ];

  // Auto-slide on mobile only
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentCardIndex((prev) => (prev + 1) % infoCards.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying, infoCards.length]);

  // Pause auto-play when user interacts
  const handleManualNext = () => {
    setIsAutoPlaying(false);
    setCurrentCardIndex((prev) => (prev + 1) % infoCards.length);
  };

  const handleManualPrev = () => {
    setIsAutoPlaying(false);
    setCurrentCardIndex((prev) => (prev - 1 + infoCards.length) % infoCards.length);
  };

  const handleDotClick = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentCardIndex(index);
  };

  return (
    <>
      <CanonicalPageHeader 
        title="How well does Vinca support your financial readiness" 
      />
      
      <div className="w-full px-3 sm:px-4 lg:px-6 py-6">
        {/* Mobile Carousel */}
        <div className="block sm:hidden mb-8">
          <div className="relative">
            {/* Cards Container */}
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentCardIndex * 100}%)` }}
              >
                {infoCards.map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <div key={idx} className="w-full flex-shrink-0 px-1">
                      <Card className="border border-border bg-card shadow-sm min-h-[140px]">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center flex-shrink-0">
                              <Icon className="w-4 h-4" />
                            </div>
                            <h3 className="font-semibold text-sm text-foreground line-clamp-1">{card.title}</h3>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                            {card.description}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-1.5 mt-3">
              {infoCards.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDotClick(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentCardIndex 
                      ? 'bg-primary w-4' 
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  aria-label={`Go to card ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-3 mb-8">
          {infoCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Card key={idx} className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground">{card.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Card */}
        <div className="mb-8">
          <ReadinessFitCard
            onUpgradeClick={() => navigate('/dashboard/pricing')}
            financialData={
              inputs && results
                ? {
                    currentSavings: inputs.initialPortfolioValue || 0,
                    monthlySIP: inputs.sipAmount || 0,
                    emergencyFundMonths: 6,
                    currentRetirementCorpus: inputs.initialPortfolioValue || 0,
                    targetRetirementCorpus: results.requiredCorpus || 0,
                    monthlyIncome: inputs.monthlyIncome || 0,
                    monthlyEssentialExpenses: inputs.currentMonthlyExpenses || 0,
                    sipConsistencyMonths: inputs.yearsForSIP ? inputs.yearsForSIP * 12 : 0,
                  }
                : undefined
            }
            lifestyleData={
              inputs
                ? {
                    desiredRetirementAge: inputs.age + inputs.yearsForSIP + inputs.waitingYearsBeforeSWP,
                    currentAge: inputs.age,
                    desiredMonthlyLifestyleCost: inputs.currentMonthlyExpenses || 0,
                    projectedPassiveIncome: 0,
                    inflationRate: 0.06,
                    lifeExpectancy: inputs.lifeExpectancy || 85,
                    hasDependents: false,
                    dependentsEducationPlanned: false,
                  }
                : undefined
            }
          />
        </div>

        {/* Next Steps - Mobile Optimized with better text handling */}
        <Card className="border border-border bg-card shadow-md">
          <CardContent className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">
              Understanding Your Score
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {/* Score 80-100 */}
              <div className="flex gap-2 sm:gap-4">
                <div className="flex-shrink-0 w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-primary/15 flex items-center justify-center">
                  <span className="text-[9px] sm:text-sm font-semibold text-primary">1</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-[11px] sm:text-sm text-foreground break-words">
                    80-100: High Improvement Potential
                  </h3>
                  <p className="text-[9px] sm:text-xs text-muted-foreground mt-0.5 leading-relaxed break-words">
                    Your plan has significant gaps. Explore the Financial Readiness and Lifestyle Planner tools to optimize.
                  </p>
                </div>
              </div>

              {/* Score 60-79 */}
              <div className="flex gap-2 sm:gap-4">
                <div className="flex-shrink-0 w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-primary/15 flex items-center justify-center">
                  <span className="text-[9px] sm:text-sm font-semibold text-primary">2</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-[11px] sm:text-sm text-foreground break-words">
                    60-79: Moderate Optimization Scope
                  </h3>
                  <p className="text-[9px] sm:text-xs text-muted-foreground mt-0.5 leading-relaxed break-words">
                    There are meaningful opportunities to strengthen your plan through adjustments.
                  </p>
                </div>
              </div>

              {/* Score 40-59 */}
              <div className="flex gap-2 sm:gap-4">
                <div className="flex-shrink-0 w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-primary/15 flex items-center justify-center">
                  <span className="text-[9px] sm:text-sm font-semibold text-primary">3</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-[11px] sm:text-sm text-foreground break-words">
                    40-59: Some Gaps Identified
                  </h3>
                  <p className="text-[9px] sm:text-xs text-muted-foreground mt-0.5 leading-relaxed break-words">
                    Minor adjustments to either financial strategy or lifestyle expectations could help.
                  </p>
                </div>
              </div>

              {/* Score 0-39 */}
              <div className="flex gap-2 sm:gap-4">
                <div className="flex-shrink-0 w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-primary/15 flex items-center justify-center">
                  <span className="text-[9px] sm:text-sm font-semibold text-primary">4</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-[11px] sm:text-sm text-foreground break-words">
                    0-39: Plan Largely Aligned
                  </h3>
                  <p className="text-[9px] sm:text-xs text-muted-foreground mt-0.5 leading-relaxed break-words">
                    Your financial and lifestyle expectations are well-balanced. Continue refining as needed.
                  </p>
                </div>
              </div>
            </div>

            {/* Upgrade CTA */}
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-border">
              <Button
                onClick={() => navigate('/dashboard/pricing')}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm py-2 h-auto"
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 flex-shrink-0" />
                <span className="truncate">Upgrade to Pro</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export function ReadinessFitPage() {
  return (
    <FinancialPlanningProvider>
      <ReadinessFitPageContent />
    </FinancialPlanningProvider>
  );
}

export default ReadinessFitPage;