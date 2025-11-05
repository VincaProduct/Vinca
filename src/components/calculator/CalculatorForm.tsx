import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalculatorInputs } from '@/types/calculator';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalculatorFormProps {
  inputs: CalculatorInputs;
  onInputChange: (inputs: CalculatorInputs) => void;
  onCalculate: () => void;
}

const CalculatorForm: React.FC<CalculatorFormProps> = ({ inputs, onInputChange, onCalculate }) => {
  const [currentTab, setCurrentTab] = useState("personal");
  
  const tabs = ["personal", "investment", "withdrawal"];
  const currentTabIndex = tabs.indexOf(currentTab);
  
  const handleChange = (field: keyof CalculatorInputs, value: number) => {
    onInputChange({
      ...inputs,
      [field]: value
    });
  };

  const handleNext = () => {
    const nextIndex = Math.min(currentTabIndex + 1, tabs.length - 1);
    setCurrentTab(tabs[nextIndex]);
  };

  const handlePrevious = () => {
    const prevIndex = Math.max(currentTabIndex - 1, 0);
    setCurrentTab(tabs[prevIndex]);
  };

  const handleCalculateAndScroll = () => {
    onCalculate();
    // Smooth scroll to results section after a brief delay to allow results to render
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
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Convert number to words in Indian format
  const convertToWords = (amount: number): string => {
    if (amount === 0) return "Zero";
    
    const crore = Math.floor(amount / 10000000);
    const lakh = Math.floor((amount % 10000000) / 100000);
    const thousand = Math.floor((amount % 100000) / 1000);
    const hundred = Math.floor((amount % 1000) / 100);
    const remainder = amount % 100;
    
    let result = "";
    
    if (crore > 0) {
      result += `${crore} Crore${crore > 1 ? 's' : ''} `;
    }
    
    if (lakh > 0) {
      result += `${lakh} Lakh${lakh > 1 ? 's' : ''} `;
    }
    
    if (thousand > 0) {
      result += `${thousand} Thousand `;
    }
    
    if (hundred > 0) {
      result += `${hundred} Hundred `;
    }
    
    if (remainder > 0) {
      result += `${remainder} `;
    }
    
    return result.trim();
  };

  // Validation - check if all fields are filled
  const isFormValid = () => {
    return (
      inputs.age > 0 &&
      inputs.lifeExpectancy > 0 &&
      inputs.initialPortfolioValue >= 0 &&
      inputs.sipAmount > 0 &&
      inputs.yearsForSIP > 0 &&
      inputs.returnDuringSIPAndWaiting > 0 &&
      inputs.growthInSIP >= 0 &&
      inputs.waitingYearsBeforeSWP >= 0 &&
      inputs.currentMonthlyExpenses > 0 &&
      inputs.inflation > 0 &&
      inputs.returnDuringSWP > 0 &&
      inputs.growthInSWP >= 0
    );
  };

  return (
    <div className="p-6 space-y-4">
      <div className="text-center border-b pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2 justify-center">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <span className="text-primary font-bold text-sm">📊</span>
          </div>
          Financial Details
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-2">Enter your information to get started</p>
      </div>
      
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="personal" className="text-xs">👤 Personal</TabsTrigger>
          <TabsTrigger value="investment" className="text-xs">💼 Investment</TabsTrigger>
          <TabsTrigger value="withdrawal" className="text-xs">💸 Withdrawal</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="age" className="text-sm font-medium">Age *</Label>
              <Input
                id="age"
                type="number"
                value={inputs.age}
                onChange={(e) => handleChange('age', Number(e.target.value))}
                min="18"
                max="80"
                className="h-9"
                placeholder="Your current age"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lifeExpectancy" className="text-sm font-medium">Life Expectancy *</Label>
              <Input
                id="lifeExpectancy"
                type="number"
                value={inputs.lifeExpectancy}
                onChange={(e) => handleChange('lifeExpectancy', Number(e.target.value))}
                min="60"
                max="100"
                className="h-9"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="investment" className="space-y-4 mt-4">
          <div className="space-y-4">
            <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
              <h4 className="text-sm font-medium text-primary">💼 Investment Details</h4>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="initialPortfolioValue" className="text-xs">Initial Portfolio *</Label>
                  <Input
                    id="initialPortfolioValue"
                    type="number"
                    value={inputs.initialPortfolioValue}
                    onChange={(e) => handleChange('initialPortfolioValue', Number(e.target.value))}
                    min="0"
                    step="10000"
                    className="h-8 text-sm"
                    placeholder="Current savings"
                  />
                  <span className="text-xs text-muted-foreground">
                    {inputs.initialPortfolioValue > 0 ? convertToWords(inputs.initialPortfolioValue) : ""}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="sipAmount" className="text-xs">Monthly SIP *</Label>
                    <Input
                      id="sipAmount"
                      type="number"
                      value={inputs.sipAmount}
                      onChange={(e) => handleChange('sipAmount', Number(e.target.value))}
                      min="1"
                      step="1000"
                      className="h-8 text-sm"
                    />
                    <span className="text-xs text-muted-foreground">
                      {inputs.sipAmount > 0 ? convertToWords(inputs.sipAmount) : ""}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="yearsForSIP" className="text-xs">SIP Years *</Label>
                    <Input
                      id="yearsForSIP"
                      type="number"
                      value={inputs.yearsForSIP}
                      onChange={(e) => handleChange('yearsForSIP', Number(e.target.value))}
                      min="1"
                      max="50"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-4 bg-green-50/50 dark:bg-green-950/20 rounded-lg">
              <h4 className="text-sm font-medium text-green-700 dark:text-green-400">📈 Returns & Growth</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="returnDuringSIPAndWaiting" className="text-xs">SIP Return *</Label>
                  <div className="relative">
                    <Input
                      id="returnDuringSIPAndWaiting"
                      type="number"
                      value={inputs.returnDuringSIPAndWaiting}
                      onChange={(e) => handleChange('returnDuringSIPAndWaiting', Number(e.target.value))}
                      min="1"
                      max="30"
                      step="0.5"
                      className="h-8 text-sm pr-8"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">%</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="growthInSIP" className="text-xs">SIP Growth *</Label>
                  <div className="relative">
                    <Input
                      id="growthInSIP"
                      type="number"
                      value={inputs.growthInSIP}
                      onChange={(e) => handleChange('growthInSIP', Number(e.target.value))}
                      min="0"
                      max="20"
                      step="0.5"
                      className="h-8 text-sm pr-8"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="withdrawal" className="space-y-4 mt-4">
          <div className="space-y-4">
            <div className="space-y-3 p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg">
              <h4 className="text-sm font-medium text-blue-700 dark:text-blue-400">💸 Withdrawal Phase</h4>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="waitingYearsBeforeSWP" className="text-xs">Waiting Years Before SWP *</Label>
                  <Input
                    id="waitingYearsBeforeSWP"
                    type="number"
                    value={inputs.waitingYearsBeforeSWP}
                    onChange={(e) => handleChange('waitingYearsBeforeSWP', Number(e.target.value))}
                    min="0"
                    max="20"
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="currentMonthlyExpenses" className="text-xs">Current Monthly Expenses *</Label>
                  <Input
                    id="currentMonthlyExpenses"
                    type="number"
                    value={inputs.currentMonthlyExpenses}
                    onChange={(e) => handleChange('currentMonthlyExpenses', Number(e.target.value))}
                    min="1"
                    step="5000"
                    className="h-8 text-sm"
                  />
                  <span className="text-xs text-muted-foreground">
                    {inputs.currentMonthlyExpenses > 0 ? convertToWords(inputs.currentMonthlyExpenses) : ""}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="inflation" className="text-xs">Inflation *</Label>
                    <div className="relative">
                      <Input
                        id="inflation"
                        type="number"
                        value={inputs.inflation}
                        onChange={(e) => handleChange('inflation', Number(e.target.value))}
                        min="1"
                        max="15"
                        step="0.5"
                        className="h-8 text-sm pr-8"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">%</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="returnDuringSWP" className="text-xs">SWP Return *</Label>
                    <div className="relative">
                      <Input
                        id="returnDuringSWP"
                        type="number"
                        value={inputs.returnDuringSWP}
                        onChange={(e) => handleChange('returnDuringSWP', Number(e.target.value))}
                        min="1"
                        max="20"
                        step="0.5"
                        className="h-8 text-sm pr-8"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="growthInSWP" className="text-xs">SWP Growth *</Label>
                  <div className="relative">
                    <Input
                      id="growthInSWP"
                      type="number"
                      value={inputs.growthInSWP}
                      onChange={(e) => handleChange('growthInSWP', Number(e.target.value))}
                      min="0"
                      max="10"
                      step="0.5"
                      className="h-8 text-sm pr-8"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Navigation Buttons */}
      <div className="border-t pt-4">
        <div className="flex gap-2">
          <Button 
            onClick={handlePrevious}
            disabled={currentTabIndex === 0}
            variant="outline"
            className="flex-1 h-10"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          
          {currentTab === "withdrawal" ? (
            <Button 
              onClick={handleCalculateAndScroll}
              disabled={!isFormValid()}
              className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium disabled:opacity-50"
            >
              🧮 Calculate Financial Freedom
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              disabled={currentTabIndex === tabs.length - 1}
              className="flex-1 h-10"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalculatorForm;