import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CalculatorInputs } from '@/types/calculator';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

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
  const [currentStep, setCurrentStep] = useState(1);
  
  const handleChange = (field: keyof CalculatorInputs, value: string) => {
    if (value === '') {
      onInputChange({ ...inputs, [field]: 0 });
      return;
    }
    const numericValue = Number(value);
    if (!isNaN(numericValue) && numericValue >= 0) {
      onInputChange({ ...inputs, [field]: numericValue });
    }
  };

  const formatCurrency = (value: number) => {
    if (value === 0) return '';
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)} Cr`;
    }
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)} L`;
    }
    if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)} K`;
    }
    return `₹${value}`;
  };

  const getRetirementAge = () => {
    return inputs.age + inputs.yearsForSIP + inputs.waitingYearsBeforeSWP;
  };

  const isStep1Valid = inputs.age > 0 && inputs.initialPortfolioValue >= 0 && 
                       inputs.currentMonthlyExpenses > 0;
  const isStep2Valid = inputs.sipAmount > 0 && inputs.yearsForSIP > 0 && 
                       inputs.returnDuringSIPAndWaiting > 0;
  const isStep3Valid = inputs.lifeExpectancy > 0 && inputs.inflation > 0 && 
                       inputs.returnDuringSWP > 0;

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCalculateClick = () => {
    onCalculate();
  };

  return (
    <Card className="shadow-2xl border-2 border-primary/20 bg-card/95 backdrop-blur-sm">
      <CardContent className="p-4 md:p-6">
        {/* Progress Indicators */}
        <div className="flex justify-center gap-3 mb-4">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-2 rounded-full transition-all duration-300 ${
                step === currentStep 
                  ? 'w-12 bg-primary' 
                  : step < currentStep 
                    ? 'w-8 bg-primary/60' 
                    : 'w-8 bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Step Indicator */}
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground">Step {currentStep} of 3</p>
        </div>

        {/* Step 1: Current Situation */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center space-y-1">
              <h2 className="text-xl md:text-2xl font-bold">Current Situation</h2>
              <p className="text-sm text-muted-foreground">Tell us about your current age and existing savings</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <span className="text-primary">📅</span>
                  What's your current age?
                </Label>
                <Input
                  type="number"
                  value={inputs.age || ''}
                  onChange={(e) => handleChange('age', e.target.value)}
                  placeholder="26"
                  className="h-12 text-xl text-center font-semibold"
                />
                <p className="text-xs text-muted-foreground text-center">
                  {inputs.age > 0 ? `Perfect! You have ${85 - inputs.age} years ahead of you` : 'Enter your age'}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <span className="text-primary">💰</span>
                  Money saved so far
                </Label>
                <Input
                  type="number"
                  value={inputs.initialPortfolioValue || ''}
                  onChange={(e) => handleChange('initialPortfolioValue', e.target.value)}
                  placeholder="50000"
                  className="h-12 text-xl text-center font-semibold"
                />
                <p className="text-xs text-muted-foreground text-center">
                  {inputs.initialPortfolioValue > 0 ? `Great start! That's ${formatCurrency(inputs.initialPortfolioValue)}` : 'Current savings amount'}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <span className="text-primary">🏠</span>
                  Monthly expenses today
                </Label>
                <Input
                  type="number"
                  value={inputs.currentMonthlyExpenses || ''}
                  onChange={(e) => handleChange('currentMonthlyExpenses', e.target.value)}
                  placeholder="100000"
                  className="h-12 text-xl text-center font-semibold"
                />
                <p className="text-xs text-muted-foreground text-center">
                  {inputs.currentMonthlyExpenses > 0 ? `${formatCurrency(inputs.currentMonthlyExpenses)} covers your current lifestyle 🏡` : 'Your monthly spending'}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <span className="text-primary">🎯</span>
                  Retirement Age
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={inputs.yearsForSIP || ''}
                    onChange={(e) => handleChange('yearsForSIP', e.target.value)}
                    placeholder="20"
                    className="h-12 text-xl text-center font-semibold opacity-0"
                  />
                  <div className="absolute inset-0 flex items-center justify-center h-12 text-xl font-semibold bg-muted/30 rounded-md border">
                    {getRetirementAge() || '--'}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {getRetirementAge() > 0 ? `Patience pays off! You'll start withdrawals at age ${getRetirementAge()} 💎` : 'Calculated based on investment years'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Investment Plan */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center space-y-1">
              <h2 className="text-xl md:text-2xl font-bold">Investment Plan</h2>
              <p className="text-sm text-muted-foreground">Set your monthly investment amount and duration</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <span className="text-primary">📈</span>
                  Monthly investment amount
                </Label>
                <Input
                  type="number"
                  value={inputs.sipAmount || ''}
                  onChange={(e) => handleChange('sipAmount', e.target.value)}
                  placeholder="30000"
                  className="h-12 text-xl text-center font-semibold"
                />
                <p className="text-xs text-muted-foreground text-center">
                  {inputs.sipAmount > 0 ? `${formatCurrency(inputs.sipAmount)} monthly = ${formatCurrency(inputs.sipAmount * 12)} yearly! 📊` : 'Your monthly SIP amount'}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <span className="text-primary">⏱️</span>
                  Investment duration (years)
                </Label>
                <Input
                  type="number"
                  value={inputs.yearsForSIP || ''}
                  onChange={(e) => handleChange('yearsForSIP', e.target.value)}
                  placeholder="20"
                  className="h-12 text-xl text-center font-semibold"
                />
                <p className="text-xs text-muted-foreground text-center">
                  {inputs.yearsForSIP > 0 && inputs.age > 0 ? `You'll invest until age ${inputs.age + inputs.yearsForSIP}. Time is your friend! 🕐` : 'How long you will invest'}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  Expected yearly returns (%)
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={inputs.returnDuringSIPAndWaiting || ''}
                    onChange={(e) => handleChange('returnDuringSIPAndWaiting', e.target.value)}
                    placeholder="12"
                    className="h-12 text-xl text-center font-semibold pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Diversified equity funds typically give 10-15% returns 📊
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  Yearly investment increase (%)
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={inputs.growthInSIP || ''}
                    onChange={(e) => handleChange('growthInSIP', e.target.value)}
                    placeholder="10"
                    className="h-12 text-xl text-center font-semibold pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Increase with salary hikes to supercharge growth! 🚀
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Retirement Goals */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center space-y-1">
              <h2 className="text-xl md:text-2xl font-bold">Retirement Goals</h2>
              <p className="text-sm text-muted-foreground">Define your retirement expenses and expectations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <span className="text-primary">📅</span>
                  Expected lifespan
                </Label>
                <Input
                  type="number"
                  value={inputs.lifeExpectancy || ''}
                  onChange={(e) => handleChange('lifeExpectancy', e.target.value)}
                  placeholder="85"
                  className="h-12 text-xl text-center font-semibold"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Planning for a long, healthy life! 🌟
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  Yearly withdrawal increase (%)
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={inputs.growthInSWP || ''}
                    onChange={(e) => handleChange('growthInSWP', e.target.value)}
                    placeholder="7"
                    className="h-12 text-xl text-center font-semibold pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Keep up with rising expenses and lifestyle improvements 📈
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  Expected inflation rate (%)
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={inputs.inflation || ''}
                    onChange={(e) => handleChange('inflation', e.target.value)}
                    placeholder="7"
                    className="h-12 text-xl text-center font-semibold pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  India's historical average is around 6-8% 📊
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  Returns during retirement (%)
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={inputs.returnDuringSWP || ''}
                    onChange={(e) => handleChange('returnDuringSWP', e.target.value)}
                    placeholder="10"
                    className="h-12 text-xl text-center font-semibold pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Conservative but steady returns in retirement 🛡️
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <span className="text-primary">⏸️</span>
                  Waiting years before withdrawal
                </Label>
                <Input
                  type="number"
                  value={inputs.waitingYearsBeforeSWP || ''}
                  onChange={(e) => handleChange('waitingYearsBeforeSWP', e.target.value)}
                  placeholder="5"
                  className="h-12 text-xl text-center font-semibold"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Let your corpus grow before you start withdrawals 🌱
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t gap-4">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </Button>

          {currentStep === 3 ? (
            <Button
              onClick={handleCalculateClick}
              disabled={!isStep3Valid}
              size="lg"
              className="gap-2 bg-primary hover:bg-primary/90 text-lg px-8"
            >
              <Sparkles className="w-5 h-5" />
              Calculate My Freedom! 🔥
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={currentStep === 1 ? !isStep1Valid : !isStep2Valid}
              size="lg"
              className="gap-2"
            >
              Next Step
              <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimelineCalculatorForm;
