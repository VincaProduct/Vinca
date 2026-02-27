import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { LineChart } from 'lucide-react';
import { CalculatorInputs } from '@/types/calculator';
import { DetailedProjection } from '@/types/financial-planning';

interface CorpusProjectionChartProps {
  projections: DetailedProjection[];
  inputs: CalculatorInputs;
}

export function CorpusProjectionChart({ projections, inputs }: CorpusProjectionChartProps) {
  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)}Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(0)}L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}K`;
    }
    return `₹${value.toFixed(0)}`;
  };

  const chartData = useMemo(() => {
    return projections.map(p => ({
      age: p.age,
      corpus: Math.max(0, p.expectedCorpus),
      phase: p.isInSIPPhase ? 'SIP' : p.isInWaitingPhase ? 'Growth' : 'Withdrawal',
    }));
  }, [projections]);

  const retirementAge = inputs.age + inputs.yearsForSIP + inputs.waitingYearsBeforeSWP;
  const sipEndAge = inputs.age + inputs.yearsForSIP;
  const maxCorpus = Math.max(...chartData.map(d => d.corpus));
  const peakCorpusAge = chartData.find(d => d.corpus === maxCorpus)?.age || retirementAge;

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ payload: { corpus: number; phase: string } }>; label?: string | number }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border rounded-lg shadow-lg p-3">
          <p className="font-medium text-sm">Age {label}</p>
          <p className="text-sm text-muted-foreground">
            Corpus: <span className="font-medium text-foreground tabular-nums">{formatCurrency(data.corpus)}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">{data.phase} Phase</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <LineChart className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-lg">Corpus Projection</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Wealth growth through accumulation and withdrawal
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="corpusGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis
                dataKey="age"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={formatCurrency}
                width={60}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                x={sipEndAge}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              />
              <ReferenceLine
                x={retirementAge}
                stroke="hsl(142.1 76.2% 36.3%)"
                strokeDasharray="3 3"
                strokeOpacity={0.7}
              />
              <Area
                type="monotone"
                dataKey="corpus"
                name="Corpus"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#corpusGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Phase indicators */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
            <span className="text-xs text-muted-foreground">SIP ({inputs.age}–{sipEndAge})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            <span className="text-xs text-muted-foreground">Growth ({sipEndAge}–{retirementAge})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
            <span className="text-xs text-muted-foreground">Withdrawal ({retirementAge}+)</span>
          </div>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Peak Corpus</p>
            <p className="font-semibold tabular-nums">{formatCurrency(maxCorpus)}</p>
            <p className="text-xs text-muted-foreground">Age {peakCorpusAge}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">At Retirement</p>
            <p className="font-semibold tabular-nums">
              {formatCurrency(chartData.find(d => d.age === retirementAge)?.corpus || 0)}
            </p>
            <p className="text-xs text-muted-foreground">Age {retirementAge}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Final Corpus</p>
            <p className="font-semibold tabular-nums">
              {formatCurrency(chartData[chartData.length - 1]?.corpus || 0)}
            </p>
            <p className="text-xs text-muted-foreground">Age {inputs.lifeExpectancy}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
