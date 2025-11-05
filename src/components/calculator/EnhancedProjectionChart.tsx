
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { CalculatorInputs } from '@/types/calculator';

interface EnhancedProjectionData {
  age: number;
  year: number;
  amountInHand: number;
  sipContributions: number;
  lumpsumInvestments: number;
  totalWithdrawals: number;
  netWorth: number;
  phase: string;
}

interface EnhancedProjectionChartProps {
  inputs: CalculatorInputs;
}

const EnhancedProjectionChart: React.FC<EnhancedProjectionChartProps> = ({ inputs }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
      notation: 'compact'
    }).format(Math.abs(value));
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

  const generateEnhancedData = (): EnhancedProjectionData[] => {
  const currentAge = inputs.age;
    const data: EnhancedProjectionData[] = [];
    
    let currentCorpus = inputs.initialPortfolioValue;
    let totalSIPContributions = 0;
    let totalLumpsumInvestments = 0;
    let totalWithdrawals = 0;
    
    const sipEndYear = inputs.yearsForSIP;
    const swpStartYear = inputs.yearsForSIP + inputs.waitingYearsBeforeSWP;
    const monthlyReturn = inputs.returnDuringSIPAndWaiting / 100 / 12;
    const annualReturn = inputs.returnDuringSIPAndWaiting / 100;
    const swpReturn = inputs.returnDuringSWP / 100;
    
    for (let year = 0; year <= Math.min(50, inputs.lifeExpectancy - currentAge); year++) {
      const age = currentAge + year;
      const isInSIPPhase = year > 0 && year <= sipEndYear;
      const isInWaitingPhase = year > sipEndYear && year <= swpStartYear;
      const isInSWPPhase = year > swpStartYear;
      
      let phase = 'Initial';
      if (isInSIPPhase) phase = 'SIP Phase';
      else if (isInWaitingPhase) phase = 'Waiting Phase';
      else if (isInSWPPhase) phase = 'SWP Phase';
      
      // Calculate SIP contributions
      if (isInSIPPhase) {
        const sipGrowthRate = inputs.growthInSIP / 100;
        const yearlyContribution = inputs.sipAmount * 12 * Math.pow(1 + sipGrowthRate, year - 1);
        totalSIPContributions += yearlyContribution;
        
        // Add monthly SIP with compounding
        for (let month = 1; month <= 12; month++) {
          currentCorpus += inputs.sipAmount * Math.pow(1 + sipGrowthRate, year - 1);
          currentCorpus *= (1 + monthlyReturn);
        }
      } else if (year > 0) {
        // Apply return without SIP
        const returnRate = isInSWPPhase ? swpReturn : annualReturn;
        currentCorpus *= (1 + returnRate);
      }
      
      // Add lumpsum investments (periodic)
      let yearlyLumpsum = 0;
      if (isInSIPPhase && year % 2 === 0) {
        yearlyLumpsum = inputs.sipAmount * 12; // One year worth of SIP
        totalLumpsumInvestments += yearlyLumpsum;
        currentCorpus += yearlyLumpsum;
      }
      
      // Calculate withdrawals
      let yearlyWithdrawals = 0;
      if (isInSWPPhase) {
        const inflatedExpenses = inputs.currentMonthlyExpenses * 
          Math.pow(1 + inputs.inflation / 100, year);
        const swpGrowthRate = inputs.growthInSWP / 100;
        yearlyWithdrawals = inflatedExpenses * 12 * Math.pow(1 + swpGrowthRate, year - swpStartYear);
        totalWithdrawals += yearlyWithdrawals;
        currentCorpus -= yearlyWithdrawals;
        
        // Add lumpsum withdrawals
        if (year % 5 === 0) {
          const lumpsumWithdrawal = yearlyWithdrawals * 0.5;
          totalWithdrawals += lumpsumWithdrawal;
          currentCorpus -= lumpsumWithdrawal;
        }
      }
      
      data.push({
        age,
        year: currentAge + year,
        amountInHand: currentCorpus,
        sipContributions: totalSIPContributions,
        lumpsumInvestments: totalLumpsumInvestments,
        totalWithdrawals,
        netWorth: currentCorpus,
        phase
      });
    }
    
    return data;
  };

  const chartData = generateEnhancedData();
  const currentAge = inputs.age;
  const sipEndAge = currentAge + inputs.yearsForSIP;
  const swpStartAge = currentAge + inputs.yearsForSIP + inputs.waitingYearsBeforeSWP;

  const chartConfig = {
    'Net Worth': {
      label: 'Net Worth',
      color: '#f59e0b'
    },
    'SIP Contributions': {
      label: 'Total SIP Invested',
      color: '#10b981'
    },
    'Lumpsum Investments': {
      label: 'Lumpsum Investments',
      color: '#8b5cf6'
    },
    'Total Withdrawals': {
      label: 'Total Withdrawals',
      color: '#ef4444'
    }
  };

  return (
    <ChartContainer config={chartConfig} className="h-[500px]">
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="age" 
          label={{ value: 'Age', position: 'insideBottom', offset: -5 }}
        />
        <YAxis 
          tickFormatter={formatCurrency}
          label={{ value: 'Amount', angle: -90, position: 'insideLeft' }}
        />
        <ChartTooltip 
          content={<ChartTooltipContent />}
          formatter={(value: number, name: string) => [
            formatCurrency(value), 
            name
          ]}
          labelFormatter={(age) => `Age: ${age}`}
        />
        <Legend />
        
        {/* Reference lines for phase transitions */}
        <ReferenceLine 
          x={sipEndAge} 
          stroke="#666" 
          strokeDasharray="5 5" 
          label={{ value: "SIP Ends", position: "top" }}
        />
        <ReferenceLine 
          x={swpStartAge} 
          stroke="#666" 
          strokeDasharray="5 5" 
          label={{ value: "SWP Starts", position: "top" }}
        />
        
        <Line 
          type="monotone" 
          dataKey="sipContributions" 
          stroke="#10b981" 
          strokeWidth={2}
          dot={false}
          name="SIP Contributions"
        />
        <Line 
          type="monotone" 
          dataKey="lumpsumInvestments" 
          stroke="#8b5cf6" 
          strokeWidth={2}
          dot={false}
          name="Lumpsum Investments"
        />
        <Line 
          type="monotone" 
          dataKey="totalWithdrawals" 
          stroke="#ef4444" 
          strokeWidth={2}
          dot={false}
          name="Total Withdrawals"
        />
        <Line 
          type="monotone" 
          dataKey="netWorth" 
          stroke="#f59e0b" 
          strokeWidth={3}
          dot={false}
          name="Net Worth"
        />
      </LineChart>
    </ChartContainer>
  );
};

export default EnhancedProjectionChart;
