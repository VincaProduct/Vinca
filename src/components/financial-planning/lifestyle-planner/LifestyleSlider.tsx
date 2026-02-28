import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { SlidersHorizontal } from 'lucide-react';
import { useFinancialPlanning } from '../context/FinancialPlanningContext';

interface LifestyleSliderProps {
  currentExpenses: number;
}

export function LifestyleSlider({ currentExpenses }: LifestyleSliderProps) {
  const { lifestyleShift, setLifestyleShift } = useFinancialPlanning();

  const formatCurrency = (value: number) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const adjustedExpenses = currentExpenses * (1 + lifestyleShift / 100);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-lg">Lifestyle Adjustment</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Adjust spending relative to current expenses
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
          <div>
            <p className="text-sm font-medium">
              {lifestyleShift >= 0 ? `+${lifestyleShift}%` : `${lifestyleShift}%`}
            </p>
            <p className="text-xs text-muted-foreground">
              {lifestyleShift === 0 ? 'Same as current' :
               lifestyleShift < 0 ? 'More frugal' :
               lifestyleShift <= 50 ? 'Comfortable upgrade' : 'Premium lifestyle'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold tabular-nums">{formatCurrency(adjustedExpenses)}</p>
            <p className="text-xs text-muted-foreground">per month</p>
          </div>
        </div>

        {/* Slider */}
        <div className="space-y-4 px-1">
          <Slider
            value={[lifestyleShift]}
            onValueChange={(values) => setLifestyleShift(values[0])}
            min={-50}
            max={100}
            step={5}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>-50%</span>
            <span>0%</span>
            <span>+50%</span>
            <span>+100%</span>
          </div>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap gap-2">
          {[
            { value: -25, label: 'Frugal' },
            { value: 0, label: 'Current' },
            { value: 30, label: 'Comfortable' },
            { value: 70, label: 'Premium' },
          ].map((preset) => (
            <button
              key={preset.value}
              onClick={() => setLifestyleShift(preset.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                lifestyleShift === preset.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {preset.label} ({preset.value >= 0 ? '+' : ''}{preset.value}%)
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
