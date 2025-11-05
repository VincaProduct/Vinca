import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CalculatorInputs } from '@/types/calculator';
import { Calculator } from 'lucide-react';

interface CompactCalculatorFormProps {
  inputs: CalculatorInputs;
  onInputChange: (inputs: CalculatorInputs) => void;
  onCalculate: () => void;
}

const CompactCalculatorForm: React.FC<CompactCalculatorFormProps> = ({ 
  inputs, 
  onInputChange, 
  onCalculate 
}) => {
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

  const isFormValid = inputs.age > 0 && inputs.currentMonthlyExpenses > 0 && 
                      inputs.sipAmount > 0 && inputs.yearsForSIP > 0;

  return (
    <Card className="shadow-xl border-2 border-primary/20">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Current Age</Label>
            <Input
              type="number"
              value={inputs.age || ''}
              onChange={(e) => handleChange('age', e.target.value)}
              placeholder="30"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Current Savings (₹)</Label>
            <Input
              type="number"
              value={inputs.initialPortfolioValue || ''}
              onChange={(e) => handleChange('initialPortfolioValue', e.target.value)}
              placeholder="500000"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Monthly Expenses (₹)</Label>
            <Input
              type="number"
              value={inputs.currentMonthlyExpenses || ''}
              onChange={(e) => handleChange('currentMonthlyExpenses', e.target.value)}
              placeholder="50000"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Monthly SIP (₹)</Label>
            <Input
              type="number"
              value={inputs.sipAmount || ''}
              onChange={(e) => handleChange('sipAmount', e.target.value)}
              placeholder="25000"
              className="h-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Investment Years</Label>
            <Input
              type="number"
              value={inputs.yearsForSIP || ''}
              onChange={(e) => handleChange('yearsForSIP', e.target.value)}
              placeholder="25"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Waiting Years</Label>
            <Input
              type="number"
              value={inputs.waitingYearsBeforeSWP || ''}
              onChange={(e) => handleChange('waitingYearsBeforeSWP', e.target.value)}
              placeholder="5"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Life Expectancy</Label>
            <Input
              type="number"
              value={inputs.lifeExpectancy || ''}
              onChange={(e) => handleChange('lifeExpectancy', e.target.value)}
              placeholder="85"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Inflation (%)</Label>
            <Input
              type="number"
              value={inputs.inflation || ''}
              onChange={(e) => handleChange('inflation', e.target.value)}
              placeholder="7"
              className="h-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">SIP Returns (%)</Label>
            <Input
              type="number"
              value={inputs.returnDuringSIPAndWaiting || ''}
              onChange={(e) => handleChange('returnDuringSIPAndWaiting', e.target.value)}
              placeholder="12"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">SWP Returns (%)</Label>
            <Input
              type="number"
              value={inputs.returnDuringSWP || ''}
              onChange={(e) => handleChange('returnDuringSWP', e.target.value)}
              placeholder="10"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">SIP Growth (%)</Label>
            <Input
              type="number"
              value={inputs.growthInSIP || ''}
              onChange={(e) => handleChange('growthInSIP', e.target.value)}
              placeholder="10"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">SWP Growth (%)</Label>
            <Input
              type="number"
              value={inputs.growthInSWP || ''}
              onChange={(e) => handleChange('growthInSWP', e.target.value)}
              placeholder="7"
              className="h-10"
            />
          </div>
        </div>

        <Button 
          onClick={onCalculate}
          disabled={!isFormValid}
          className="w-full h-12 text-lg font-semibold"
          size="lg"
        >
          <Calculator className="w-5 h-5 mr-2" />
          Calculate Financial Freedom
        </Button>
      </CardContent>
    </Card>
  );
};

export default CompactCalculatorForm;
