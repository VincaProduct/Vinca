
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface ProjectionData {
  year: number;
  age: number;
  savings: number;
  sipContributions: number;
  totalValue: number;
}

interface ProjectionChartProps {
  data: ProjectionData[];
}

const ProjectionChart: React.FC<ProjectionChartProps> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
      notation: 'compact'
    }).format(value);
  };

  const chartData = data.map(item => ({
    age: item.age,
    'Current Savings Growth': item.savings,
    'SIP Contributions': item.sipContributions,
    'Total Wealth': item.totalValue
  }));

  const chartConfig = {
    'Current Savings Growth': {
      label: 'Current Savings Growth',
      color: '#3b82f6'
    },
    'SIP Contributions': {
      label: 'SIP Contributions',
      color: '#10b981'
    },
    'Total Wealth': {
      label: 'Total Wealth',
      color: '#f59e0b'
    }
  };

  return (
    <ChartContainer config={chartConfig} className="h-[400px]">
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
          formatter={(value: number) => [formatCurrency(value), '']}
          labelFormatter={(age) => `Age: ${age}`}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="Current Savings Growth" 
          stroke="#3b82f6" 
          strokeWidth={2}
          dot={false}
        />
        <Line 
          type="monotone" 
          dataKey="SIP Contributions" 
          stroke="#10b981" 
          strokeWidth={2}
          dot={false}
        />
        <Line 
          type="monotone" 
          dataKey="Total Wealth" 
          stroke="#f59e0b" 
          strokeWidth={3}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
};

export default ProjectionChart;
