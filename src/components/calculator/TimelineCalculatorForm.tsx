import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalculatorInputs } from '@/types/calculator';
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, PiggyBank, Home, Sparkles, Target } from 'lucide-react';
import moneyStack from '@/assets/money-stack.png';
import growthPlant from '@/assets/growth-plant.png';
import retirementChair from '@/assets/retirement-chair.png';

interface TimelineCalculatorFormProps {
  inputs: CalculatorInputs;
  onInputChange: (inputs: CalculatorInputs) => void;
  onCalculate: () => void;
}

const TimelineCalculatorForm: React.FC<TimelineCalculatorFormProps> = ({
  inputs,
  onInputChange,
  onCalculate
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [retirementAge, setRetirementAge] = useState<number>(inputs.age + inputs.yearsForSIP + inputs.waitingYearsBeforeSWP);

  // Update retirement age when relevant inputs change
  React.useEffect(() => {
    setRetirementAge(inputs.age + inputs.yearsForSIP + inputs.waitingYearsBeforeSWP);
  }, [inputs.age, inputs.yearsForSIP, inputs.waitingYearsBeforeSWP]);

  const steps = [
    {
      id: 'today',
      title: 'Current Situation',
      subtitle: 'Step 1 of 3',
      color: 'bg-phase-current',
      icon: Calendar,
      image: moneyStack,
      description: 'Tell us about your current age and existing savings'
    },
    {
      id: 'building',
      title: 'Investment Plan',
      subtitle: 'Step 2 of 3',
      color: 'bg-phase-building',
      icon: TrendingUp,
      image: growthPlant,
      description: 'Set your monthly investment amount and duration'
    },
    {
      id: 'living',
      title: 'Retirement Goals',
      subtitle: 'Step 3 of 3',
      color: 'bg-phase-living',
      icon: Home,
      image: retirementChair,
      description: 'Define your retirement expenses and expectations'
    }
  ];

  const handleChange = (field: keyof CalculatorInputs, value: string) => {
    // Handle empty string case
    if (value === '') {
      onInputChange({
        ...inputs,
        [field]: 0
      });
      return;
    }

    // Convert string to number
    const numericValue = Number(value);

    // Only update if it's a valid positive number (or zero for fields that allow it)
    if (!isNaN(numericValue) && numericValue >= 0) {
      onInputChange({
        ...inputs,
        [field]: numericValue
      });
    }
  };

  const handleRetirementAgeChange = (value: string) => {
    if (value === '') {
      setRetirementAge(0);
      return;
    }

    const numericValue = Number(value);
    if (!isNaN(numericValue) && numericValue >= 0) {
      setRetirementAge(numericValue);

      // Calculate waitingYearsBeforeSWP = retirementAge - (currentAge + yearsForSIP)
      const calculatedWaitingYears = Math.max(0, numericValue - (inputs.age + inputs.yearsForSIP));
      onInputChange({
        ...inputs,
        waitingYearsBeforeSWP: calculatedWaitingYears
      });
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCalculateAndScroll = () => {
    onCalculate();
    setTimeout(() => {
      const resultsSection = document.querySelector('[data-results-section]');
      if (resultsSection) {
        resultsSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)} Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)} L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)} K`;
    }
    return `₹${value}`;
  };

  // Validation for each step
  const isStepValid = (step: number) => {
    switch (step) {
      case 0: // Today
        return inputs.age > 0 && inputs.initialPortfolioValue >= 0 && inputs.currentMonthlyExpenses > 0 && retirementAge >= (inputs.age + inputs.yearsForSIP);
      case 1: // Building
        return inputs.sipAmount > 0 && inputs.yearsForSIP > 0 && inputs.returnDuringSIPAndWaiting > 0;
      case 2: // Living
        return inputs.lifeExpectancy > 0 && inputs.returnDuringSWP > 0 && inputs.growthInSWP >= 0;
      default:
        return false;
    }
  };

  const canProceed = isStepValid(currentStep);
  const isFormComplete = steps.every((_, index) => isStepValid(index));

  // Calculate derived ages for the timeline
  const investmentStartAge = inputs.age;
  const investmentEndAge = inputs.age + inputs.yearsForSIP;
  const waitingEndAge = investmentEndAge + inputs.waitingYearsBeforeSWP;

  return (
    <div className="space-y-6">

      {/* Current Step Content */}
      <Card className="shadow-xl border-0 bg-gradient-to-br from-card via-card to-muted/10 hover-lift animate-scale-in">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="secondary" className="text-xs">
              {steps[currentStep].subtitle}
            </Badge>
            <div className="flex items-center gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-8 rounded-full transition-colors ${index === currentStep ? 'bg-primary' :
                      index < currentStep ? 'bg-primary/50' : 'bg-muted'
                    }`}
                />
              ))}
            </div>
          </div>
          <CardTitle className="text-xl font-semibold text-foreground mb-1">
            {steps[currentStep].title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {steps[currentStep].description}
          </p>
        </CardHeader>


        <CardContent className="space-y-6 px-6 pb-6">
          {/* Step 0: Today */}
          {currentStep === 0 && (
            <div className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    What's your current age?
                  </Label>
                  <Input
                    type="number"
                    value={inputs.age || ''}
                    onChange={(e) => handleChange('age', e.target.value)}
                    min="18"
                    max="80"
                    placeholder="e.g., 30"
                    className="text-center text-lg h-12 border-2 hover:border-primary/50 focus:border-primary transition-colors"
                  />
                  <p className="text-sm text-muted-foreground text-center bg-muted/30 rounded-lg p-2">
                    {inputs.age > 0 ? `Perfect! You have ${inputs.lifeExpectancy - inputs.age} years ahead of you` : "Your journey starts at any age"}
                  </p>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold text-foreground flex items-center gap-2">
                    <PiggyBank className="w-4 h-4 text-primary" />
                    Money saved so far
                  </Label>
                  <Input
                    type="number"
                    value={inputs.initialPortfolioValue || ''}
                    onChange={(e) => handleChange('initialPortfolioValue', e.target.value)}
                    min="0"
                    step="10000"
                    placeholder="e.g., 500000"
                    className="text-center text-lg h-12 border-2 hover:border-primary/50 focus:border-primary transition-colors"
                  />
                  <p className="text-sm text-muted-foreground text-center bg-muted/30 rounded-lg p-2">
                    {inputs.initialPortfolioValue > 0
                      ? `Great start! That's ${formatCurrency(inputs.initialPortfolioValue)}`
                      : "Starting fresh? No problem! 💪"
                    }
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Home className="w-4 h-4 text-primary" />
                    Monthly expenses today
                  </Label>
                  <Input
                    type="number"
                    value={inputs.currentMonthlyExpenses || ''}
                    onChange={(e) => handleChange('currentMonthlyExpenses', e.target.value)}
                    min="1"
                    step="5000"
                    placeholder="e.g., 50000"
                    className="text-center text-lg h-12 border-2 hover:border-primary/50 focus:border-primary transition-colors"
                  />
                  <p className="text-sm text-muted-foreground text-center bg-phase-living/10 rounded-lg p-3">
                    {inputs.currentMonthlyExpenses > 0
                      ? `${formatCurrency(inputs.currentMonthlyExpenses)} covers your current lifestyle 🏠`
                      : "What does your lifestyle cost today?"
                    }
                  </p>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold text-foreground flex items-center gap-2">
                    <PiggyBank className="w-4 h-4 text-primary" />
                    Retirement Age
                  </Label>
                  <Input
                    type="number"
                    value={retirementAge || ''}
                    onChange={(e) => handleRetirementAgeChange(e.target.value)}
                    min={inputs.age + inputs.yearsForSIP}
                    max="80"
                    placeholder={`${inputs.age + inputs.yearsForSIP}`}
                    className="text-center text-lg h-12 border-2 hover:border-primary/50 focus:border-primary transition-colors"
                  />
                  <p className="text-sm text-muted-foreground text-center bg-phase-growing/10 rounded-lg p-3">
                    {retirementAge > 0 && retirementAge === (inputs.age + inputs.yearsForSIP)
                      ? `You'll start enjoying your money immediately at age ${retirementAge}! 🎉`
                      : `Patience pays off! You'll start withdrawals at age ${retirementAge} 💎`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Building Wealth */}
          {currentStep === 1 && (
            <div className="space-y-6">

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-foreground flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      Monthly investment amount
                    </Label>
                    <Input
                      type="number"
                      value={inputs.sipAmount || ''}
                      onChange={(e) => handleChange('sipAmount', e.target.value)}
                      min="1"
                      step="1000"
                      placeholder="e.g., 25000"
                      className="text-center text-lg h-12 border-2 hover:border-primary/50 focus:border-primary transition-colors"
                    />
                    <p className="text-sm text-muted-foreground text-center bg-primary/5 rounded-lg p-3">
                      {inputs.sipAmount > 0
                        ? `${formatCurrency(inputs.sipAmount)} monthly = ${formatCurrency(inputs.sipAmount * 12)} yearly! 📈`
                        : "How much can you invest every month?"
                      }
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-foreground flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Investment duration (years)
                    </Label>
                    <Input
                      type="number"
                      value={inputs.yearsForSIP || ''}
                      onChange={(e) => handleChange('yearsForSIP', e.target.value)}
                      min="1"
                      max="50"
                      placeholder="e.g., 25"
                      className="text-center text-lg h-12 border-2 hover:border-primary/50 focus:border-primary transition-colors"
                    />
                    <p className="text-sm text-muted-foreground text-center bg-primary/5 rounded-lg p-3">
                      {inputs.yearsForSIP > 0
                        ? `You'll invest until age ${inputs.age + inputs.yearsForSIP}. Time is your friend! ⏰`
                        : "How long will you invest?"
                      }
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-foreground">Expected yearly returns (%)</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={inputs.returnDuringSIPAndWaiting || ''}
                        onChange={(e) => handleChange('returnDuringSIPAndWaiting', e.target.value)}
                        min="1"
                        max="30"
                        step="0.5"
                        placeholder="12"
                        className="text-center text-lg h-12 pr-8 border-2 hover:border-primary/50 focus:border-primary transition-colors"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-lg text-muted-foreground">%</span>
                    </div>
                    <p className="text-sm text-muted-foreground text-center bg-phase-growing/10 rounded-lg p-3">
                      Diversified equity funds typically give 10-15% returns 📊
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-foreground">Yearly investment increase (%)</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={inputs.growthInSIP || ''}
                        onChange={(e) => handleChange('growthInSIP', e.target.value)}
                        min="0"
                        max="20"
                        step="0.5"
                        placeholder="10"
                        className="text-center text-lg h-12 pr-8 border-2 hover:border-primary/50 focus:border-primary transition-colors"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-lg text-muted-foreground">%</span>
                    </div>
                    <p className="text-sm text-muted-foreground text-center bg-phase-growing/10 rounded-lg p-3">
                      Increase with salary hikes to supercharge growth! 🚀
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Living Dreams */}
          {currentStep === 2 && (
            <div className="space-y-6">

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Expected lifespan
                    </Label>
                    <Input
                      type="number"
                      value={inputs.lifeExpectancy || ''}
                      onChange={(e) => handleChange('lifeExpectancy', e.target.value)}
                      min="60"
                      max="100"
                      placeholder="85"
                      className="text-center text-lg h-12 border-2 hover:border-primary/50 focus:border-primary transition-colors"
                    />
                    <p className="text-sm text-muted-foreground text-center bg-phase-living/10 rounded-lg p-3">
                      Planning for a long, healthy life! 🌟
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-foreground">Yearly withdrawal increase (%)</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={inputs.growthInSWP || ''}
                        onChange={(e) => handleChange('growthInSWP', e.target.value)}
                        min="0"
                        max="10"
                        step="0.5"
                        placeholder="10"
                        className="text-center text-lg h-12 pr-8 border-2 hover:border-primary/50 focus:border-primary transition-colors"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-lg text-muted-foreground">%</span>
                    </div>
                    <p className="text-sm text-muted-foreground text-center bg-phase-growing/10 rounded-lg p-3">
                      Keep up with rising expenses and lifestyle improvements 📈
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-foreground">Expected inflation rate (%)</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={inputs.inflation || ''}
                        onChange={(e) => handleChange('inflation', e.target.value)}
                        min="1"
                        max="15"
                        step="0.5"
                        placeholder="7"
                        className="text-center text-lg h-12 pr-8 border-2 hover:border-primary/50 focus:border-primary transition-colors"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-lg text-muted-foreground">%</span>
                    </div>
                    <p className="text-sm text-muted-foreground text-center bg-phase-warning/10 rounded-lg p-3">
                      India's historical average is around 6-8% 📊
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-foreground">Returns during retirement (%)</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={inputs.returnDuringSWP || ''}
                        onChange={(e) => handleChange('returnDuringSWP', e.target.value)}
                        min="1"
                        max="20"
                        step="0.5"
                        placeholder="10"
                        className="text-center text-lg h-12 pr-8 border-2 hover:border-primary/50 focus:border-primary transition-colors"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-lg text-muted-foreground">%</span>
                    </div>
                    <p className="text-sm text-muted-foreground text-center bg-phase-warning/10 rounded-lg p-3">
                      Conservative but steady returns in retirement 🛡️
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center pt-6 border-t border-muted">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center justify-center gap-2 hover-lift w-full sm:w-auto"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed}
                className="flex items-center justify-center gap-2 button-primary hover-lift w-full sm:w-auto"
              >
                Next Step
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleCalculateAndScroll}
                disabled={!isFormComplete}
                className="flex items-center justify-center gap-2 button-primary hover-lift animate-bounce-gentle w-full sm:w-auto px-3 sm:px-4"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Calculate My Freedom! 🎯</span>
                <span className="sm:hidden">Calculate 🎯</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimelineCalculatorForm;