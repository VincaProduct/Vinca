
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, TrendingDown, Target, DollarSign, Clock, ShoppingCart } from "lucide-react";

const MutualFundMistakesSection = () => {
  const mistakes = [
    {
      icon: TrendingDown,
      title: "Chasing Last Year's Winners",
      description: "Leads to buying high and underperforming returns.",
    },
    {
      icon: ShoppingCart,
      title: "Choosing Wrong Products",
      description: "Mis-sold products prioritize commissions over your goals.",
    },
    {
      icon: Target,
      title: "No Clear Investment Strategy",
      description: "Random investing delays or derails financial goals.",
    },
    {
      icon: AlertTriangle,
      title: "Over-Diversification Trap",
      description: "Too many similar funds dilute your overall returns.",
    },
    {
      icon: Clock,
      title: "Emotional Decisions",
      description: "Fear and greed cause poor timing and lost profits.",
    }
  ];

  return (
    <section className="py-4 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Ultra compact headline */}
        <div className="text-center mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 leading-tight">
            Are These <span className="text-red-600 dark:text-red-400">5 Mistakes</span> Destroying Your Wealth?
          </h2>
          
          <div className="inline-flex items-center gap-1.5 bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300 px-2.5 py-1 rounded-md text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            ⚠️ 9 out of 10 investors make these costly errors.
          </div>
        </div>

        {/* Ultra compact mistake cards */}
        <div className="grid gap-2 max-w-2xl mx-auto">
          {mistakes.map((mistake, index) => {
            const IconComponent = mistake.icon;
            return (
              <Card 
                key={index} 
                className="group hover:shadow-sm transition-all duration-200 border bg-background"
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-2.5">
                    {/* Smaller icon with number */}
                    <div className="flex-shrink-0 relative">
                      <div className="w-7 h-7 rounded-full bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 flex items-center justify-center">
                        <IconComponent className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                    </div>
                    
                    {/* Compact content */}
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-foreground mb-0.5">
                        {mistake.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {mistake.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MutualFundMistakesSection;
