
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalculatorInputs } from '@/types/calculator';
import { calculateFinancialFreedom } from '@/utils/calculatorUtils';

interface ScenariosTableProps {
  inputs: CalculatorInputs;
}

const ScenariosTable: React.FC<ScenariosTableProps> = ({ inputs }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const currentAge = inputs.age;
  const retirementAge = currentAge + inputs.yearsForSIP + inputs.waitingYearsBeforeSWP;

  // Generate different scenarios
  const scenarios = [
    {
      name: 'Conservative (8% returns)',
      returns: 8,
      inflation: 6
    },
    {
      name: 'Moderate (12% returns)',
      returns: 12,
      inflation: 6
    },
    {
      name: 'Aggressive (15% returns)',
      returns: 15,
      inflation: 6
    },
    {
      name: 'High Inflation (12% returns, 8% inflation)',
      returns: 12,
      inflation: 8
    },
    {
      name: 'Early Retirement (Retire 5 years early)',
      returns: 12,
      inflation: 6,
      retirementAge: retirementAge - 5
    }
  ];

  const scenarioResults = scenarios.map(scenario => {
    const modifiedInputs = {
      ...inputs,
      returnDuringSIPAndWaiting: scenario.returns,
      inflation: scenario.inflation,
      yearsForSIP: scenario.retirementAge ? scenario.retirementAge - currentAge - inputs.waitingYearsBeforeSWP : inputs.yearsForSIP
    };
    
    const results = calculateFinancialFreedom(modifiedInputs);
    
    return {
      ...scenario,
      requiredSIP: results.requiredMonthlySIP,
      totalCorpus: results.requiredCorpus,
      yearsToFreedom: results.yearsToFreedom,
      canAchieve: results.canAchieveGoal,
      calculatedRetirementAge: scenario.retirementAge || retirementAge
    };
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Compare different scenarios to understand how changes in returns, inflation, and retirement age affect your financial freedom plan.
      </p>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Scenario</TableHead>
            <TableHead>Returns/Inflation</TableHead>
            <TableHead>Retirement Age</TableHead>
            <TableHead>Required SIP</TableHead>
            <TableHead>Total Corpus</TableHead>
            <TableHead>Years to Freedom</TableHead>
            <TableHead>Achievable?</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scenarioResults.map((scenario, index) => (
            <TableRow key={index} className={scenario.canAchieve ? '' : 'bg-yellow-50'}>
              <TableCell className="font-medium">{scenario.name}</TableCell>
              <TableCell>{scenario.returns}% / {scenario.inflation}%</TableCell>
              <TableCell>{scenario.calculatedRetirementAge}</TableCell>
              <TableCell>{formatCurrency(scenario.requiredSIP)}</TableCell>
              <TableCell>{formatCurrency(scenario.totalCorpus)}</TableCell>
              <TableCell>{scenario.yearsToFreedom}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  scenario.canAchieve 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {scenario.canAchieve ? 'Yes' : 'Challenging'}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ScenariosTable;
