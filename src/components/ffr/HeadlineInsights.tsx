import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target, Calendar, AlertTriangle } from 'lucide-react';
import { CalculatorInputs, CalculationResults } from '@/types/calculator';

interface HeadlineInsightsProps {
  inputs: CalculatorInputs;
  results: CalculationResults;
}

export const HeadlineInsights = ({ inputs, results }: HeadlineInsightsProps) => {
  const formatCurrency = (value: number) => {
    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
    return formatted.replace('₹', '₹ ');
  };

  const corpusGap = results.requiredCorpus - results.currentProgress * results.requiredCorpus / 100;
  const sipGap = results.requiredMonthlySIP - inputs.sipAmount;
  const retirementAge = inputs.age + inputs.yearsForSIP + inputs.waitingYearsBeforeSWP;
  
  const insights = [
    {
      icon: <Calendar className="w-5 h-5" />,
      title: 'Retirement Plan',
      value: `Age ${retirementAge}`,
      subtitle: `In ${inputs.yearsForSIP + inputs.waitingYearsBeforeSWP} years`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: 'Target Corpus',
      value: formatCurrency(results.requiredCorpus),
      subtitle: results.canAchieveGoal ? 'On track' : `Gap: ${formatCurrency(corpusGap)}`,
      color: results.canAchieveGoal ? 'text-green-600' : 'text-orange-600',
      bgColor: results.canAchieveGoal ? 'bg-green-50 dark:bg-green-950/20' : 'bg-orange-50 dark:bg-orange-950/20',
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'Monthly SIP',
      value: formatCurrency(inputs.sipAmount),
      subtitle: sipGap > 0 ? `Need ${formatCurrency(sipGap)} more` : 'Adequate',
      color: sipGap > 0 ? 'text-orange-600' : 'text-green-600',
      bgColor: sipGap > 0 ? 'bg-orange-50 dark:bg-orange-950/20' : 'bg-green-50 dark:bg-green-950/20',
    },
  ];

  const urgentActions = [];
  if (!results.canAchieveGoal) {
    urgentActions.push('Increase monthly SIP to meet retirement goals');
  }
  if (sipGap > 5000) {
    urgentActions.push('Significant SIP gap detected - review budget');
  }
  if (results.corpusDepletesBeforeLifeExpectancy) {
    urgentActions.push('Corpus may deplete before life expectancy - adjust plan');
  }

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Big Picture Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          {insights.map((insight, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border-2 ${insight.bgColor} border-current/10`}
            >
              <div className={`flex items-center gap-2 mb-2 ${insight.color}`}>
                {insight.icon}
                <span className="text-sm font-medium text-muted-foreground">{insight.title}</span>
              </div>
              <div className="text-2xl font-bold mb-1">{insight.value}</div>
              <div className="text-sm text-muted-foreground">{insight.subtitle}</div>
            </div>
          ))}
        </div>

        {urgentActions.length > 0 && (
          <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                  Action Required
                </h4>
                <ul className="space-y-1">
                  {urgentActions.map((action, index) => (
                    <li key={index} className="text-sm text-orange-800 dark:text-orange-200">
                      • {action}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};