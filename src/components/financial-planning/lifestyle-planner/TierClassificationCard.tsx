import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers } from 'lucide-react';
import { LifestyleTier } from '@/types/financial-planning';

interface TierClassificationCardProps {
  tier: LifestyleTier;
  adjustedExpenses: number;
  lifestyleShift: number;
}

const tierConfig: Record<LifestyleTier, {
  description: string;
  items: string[];
}> = {
  Essentials: {
    description: 'Needs-focused living with lean buffer',
    items: ['Basic housing', 'Essential healthcare', 'Basic transport', 'Groceries'],
  },
  Comfortable: {
    description: 'Comfort upgrades with flexibility',
    items: ['Better housing', 'Regular travel', 'Hobbies', 'Quality healthcare'],
  },
  Premium: {
    description: 'Experiences and higher flexibility',
    items: ['Premium housing', 'International travel', 'Premium healthcare', 'Luxury experiences'],
  },
};

export function TierClassificationCard({ tier, adjustedExpenses, lifestyleShift }: TierClassificationCardProps) {
  const formatCurrency = (value: number) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const config = tierConfig[tier];

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Layers className="w-5 h-5 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg">Lifestyle Tier</CardTitle>
          </div>
          <Badge variant="outline">
            {lifestyleShift >= 0 ? `+${lifestyleShift}%` : `${lifestyleShift}%`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tier selector */}
        <div className="flex gap-2">
          {(['Essentials', 'Comfortable', 'Premium'] as LifestyleTier[]).map((t) => (
            <div
              key={t}
              className={`flex-1 p-2 rounded-lg text-center text-xs font-medium ${
                t === tier
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {t}
            </div>
          ))}
        </div>

        {/* Monthly expense */}
        <div className="p-3 rounded-lg border bg-muted/30">
          <p className="text-xs text-muted-foreground">Monthly Expense</p>
          <p className="text-xl font-semibold tabular-nums">{formatCurrency(adjustedExpenses)}</p>
        </div>

        {/* Included items */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Typically includes</p>
          <div className="flex flex-wrap gap-2">
            {config.items.map((item, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
