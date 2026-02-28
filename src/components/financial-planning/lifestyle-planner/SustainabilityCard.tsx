import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { LifestyleData } from '@/types/financial-planning';
import { CalculatorInputs } from '@/types/calculator';

interface SustainabilityCardProps {
  lifestyleData: LifestyleData;
  inputs: CalculatorInputs;
}

export function SustainabilityCard({ lifestyleData, inputs }: SustainabilityCardProps) {
  const retirementAge = inputs.age + inputs.yearsForSIP + inputs.waitingYearsBeforeSWP;
  const retirementDuration = inputs.lifeExpectancy - retirementAge;
  const sustainabilityPercent = Math.min(100, (lifestyleData.sustainabilityYears / retirementDuration) * 100);

  let status: 'sustainable' | 'tight' | 'unsustainable';
  if (lifestyleData.isSustainable) {
    status = 'sustainable';
  } else if (sustainabilityPercent >= 60) {
    status = 'tight';
  } else {
    status = 'unsustainable';
  }

  const sustainableTillAge = retirementAge + lifestyleData.sustainabilityYears;

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)} L`;
    }
    return `₹${value.toLocaleString('en-IN')}`;
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            status === 'sustainable' ? 'bg-emerald-100 dark:bg-emerald-900/50' :
            status === 'tight' ? 'bg-amber-100 dark:bg-amber-900/50' :
            'bg-rose-100 dark:bg-rose-900/50'
          }`}>
            {status === 'sustainable' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ) : status === 'tight' ? (
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            )}
          </div>
          <CardTitle className="text-lg">Sustainability</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className={`p-3 rounded-lg border ${
          status === 'sustainable' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800' :
          status === 'tight' ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800' :
          'bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800'
        }`}>
          <p className={`font-medium ${
            status === 'sustainable' ? 'text-emerald-700 dark:text-emerald-300' :
            status === 'tight' ? 'text-amber-700 dark:text-amber-300' :
            'text-rose-700 dark:text-rose-300'
          }`}>
            {status === 'sustainable'
              ? `Sustainable till age ${inputs.lifeExpectancy}`
              : status === 'tight'
                ? `Sustainable till age ${sustainableTillAge} (tight)`
                : `Runs out around age ${sustainableTillAge}`
            }
          </p>
          <p className={`text-sm ${
            status === 'sustainable' ? 'text-emerald-600 dark:text-emerald-400' :
            status === 'tight' ? 'text-amber-600 dark:text-amber-400' :
            'text-rose-600 dark:text-rose-400'
          }`}>
            {status === 'sustainable'
              ? 'Corpus covers full retirement'
              : `${inputs.lifeExpectancy - sustainableTillAge} years short of life expectancy`
            }
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Coverage</span>
            <span className="font-medium tabular-nums">{Math.round(sustainabilityPercent)}%</span>
          </div>
          <Progress
            value={sustainabilityPercent}
            className={`h-2 ${
              status === 'sustainable' ? '[&>div]:bg-emerald-500' :
              status === 'tight' ? '[&>div]:bg-amber-500' :
              '[&>div]:bg-rose-500'
            }`}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Age {retirementAge}</span>
            <span>Age {inputs.lifeExpectancy}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
