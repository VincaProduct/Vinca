import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Calendar, Activity } from 'lucide-react';
import { HealthCategory, HEALTH_COSTS } from '@/types/financial-planning';

interface HealthCategorySelectorProps {
  selectedCategory: HealthCategory;
  onSelectCategory: (category: HealthCategory) => void;
}

const categoryIcons = {
  everyday: Stethoscope,
  planned: Calendar,
  highImpact: Activity,
};

export function HealthCategorySelector({ selectedCategory, onSelectCategory }: HealthCategorySelectorProps) {
  const formatCurrency = (value: number) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(0)}L`;
    }
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const categories: { id: HealthCategory; cost: typeof HEALTH_COSTS.everyday }[] = [
    { id: 'everyday', cost: HEALTH_COSTS.everyday },
    { id: 'planned', cost: HEALTH_COSTS.planned },
    { id: 'highImpact', cost: HEALTH_COSTS.highImpact },
  ];

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Select Health Scenario</CardTitle>
        <p className="text-sm text-muted-foreground mt-0.5">
          Choose a category to see its impact on your plan
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-3 gap-4">
          {categories.map(({ id, cost }) => {
            const isSelected = selectedCategory === id;
            const Icon = categoryIcons[id];

            return (
              <button
                key={id}
                onClick={() => onSelectCategory(id)}
                className={`
                  p-4 rounded-lg border text-left transition-all duration-200 cursor-pointer
                  ${isSelected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border hover:border-muted-foreground/50'
                  }
                `}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected
                      ? 'bg-primary/10'
                      : 'bg-muted'
                  }`}>
                    <Icon className={`w-4 h-4 ${
                      isSelected
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm">{cost.label}</h3>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {cost.description}
                </p>

                <div className="space-y-1.5 pt-3 border-t">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Monthly</span>
                    <span className="font-medium tabular-nums">+{formatCurrency(cost.monthly)}/mo</span>
                  </div>
                  {cost.oneTime > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">One-time</span>
                      <span className="font-medium tabular-nums">{formatCurrency(cost.oneTime)}</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 p-3 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground">
            <strong>How it works:</strong> Monthly costs are added to regular expenses throughout retirement.
            One-time costs are deducted from corpus at retirement.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
