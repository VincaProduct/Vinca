import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  // BarChart,
  // Bar,
} from "recharts";
import { CalculatorInputs } from "@/types/calculator";

interface ProjectionRow {
  year: number;
  yearNumber: number;
  age: number;
  amountInHand: number;
  lumpsumInvestment: number;
  monthlySIP: number;
  returnRate: number;
  monthlySWP: number;
  lumpsumWithdrawal: number;
  expectedCorpus: number;
  isInSIPPhase: boolean;
  isInWaitingPhase: boolean;
  isInSWPPhase: boolean;
}
interface WealthGrowthChartProps {
  inputs: CalculatorInputs;
  projections: ProjectionRow[];
}

const WealthGrowthChart: React.FC<WealthGrowthChartProps> = ({
  inputs,
  projections,
}) => {
  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)}Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    } else {
      return `₹${(value / 1000).toFixed(0)}K`;
    }
  };

  console.log(projections)
  const generateChartData = () => {
    const data = projections.map((projection) => ({
      age: projection.age,
      wealth: projection.expectedCorpus,
      invested:
        projection.amountInHand +
        projection.lumpsumInvestment +
        projection.monthlySIP * 12,
      withdrawals: projection.monthlySWP,
      phase: projection.isInSIPPhase
        ? "Building"
        : projection.isInSWPPhase
        ? "Withdrawing"
        : "Growing",
    }));

    return data;
  };

  const chartData = generateChartData();

  return (
    <>
      <div className="w-full h-[350px] md:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <defs>
              <linearGradient id="wealthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="#8b5cf6"
                  stopOpacity={0.8}
                />
                <stop
                  offset="100%"
                  stopColor="#8b5cf6"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="investedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.3}
            />

            <XAxis
              dataKey="age"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />

            <YAxis
              tickFormatter={formatCurrency}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              width={60}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number, name: string) => [
                formatCurrency(value),
                name === "wealth" ? "Total Wealth" : "Total Invested",
              ]}
              labelFormatter={(age) => `Age: ${age}`}
            />

            <Area
              type="monotone"
              dataKey="invested"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#investedGradient)"
              name="invested"
            />

            <Area
              type="monotone"
              dataKey="wealth"
              stroke="#8b5cf6"
              strokeWidth={3}
              fill="url(#wealthGradient)"
              name="wealth"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {/* <div className="w-full h-[350px] md:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.3}
            />

            <XAxis
              dataKey="age"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />

            <YAxis
              tickFormatter={formatCurrency}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              width={60}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number, name: string) => [
                formatCurrency(value),
                name === "wealth"
                  ? "Total Wealth"
                  : name === "invested"
                  ? "Total Invested"
                  : "Monthly Withdrawals",
              ]}
              labelFormatter={(age) => `Age: ${age}`}
            />

            <Bar
              dataKey="invested"
              fill="#10b981"
              name="invested"
              opacity={0.8}
            />

            <Bar
              dataKey="wealth"
              fill="hsl(var(--primary))"
              name="wealth"
              opacity={0.9}
            />

            <Bar
              dataKey="withdrawals"
              fill="#ef4444"
              name="withdrawals"
              opacity={0.7}
            />
          </BarChart>
        </ResponsiveContainer>
      </div> */}
    </>
  );
};

export default WealthGrowthChart;
