import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  TrendingUp, 
  Home,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface OpportunityPreview {
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  minInvestment: string;
  expectedReturn: string;
  risk: 'Low' | 'Medium' | 'High';
  color: string;
}

export const BusinessOpportunitiesPreview = () => {
  const opportunities: OpportunityPreview[] = [
    {
      title: 'Pre-IPO Opportunities',
      description: 'Invest in high-growth companies before they go public',
      icon: <TrendingUp className="w-6 h-6" />,
      category: 'Equity',
      minInvestment: '₹10 Lakhs',
      expectedReturn: '20-40%',
      risk: 'High',
      color: 'from-blue-500/20 to-blue-600/20'
    },
    {
      title: 'Real Estate Investment',
      description: 'Fractional ownership in premium commercial properties',
      icon: <Home className="w-6 h-6" />,
      category: 'Real Estate',
      minInvestment: '₹25 Lakhs',
      expectedReturn: '12-18%',
      risk: 'Medium',
      color: 'from-green-500/20 to-green-600/20'
    },
    {
      title: 'Franchise Opportunities',
      description: 'Partner with established brands and proven business models',
      icon: <Building2 className="w-6 h-6" />,
      category: 'Business',
      minInvestment: '₹15 Lakhs',
      expectedReturn: '15-25%',
      risk: 'Medium',
      color: 'from-orange-500/20 to-orange-600/20'
    }
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="border-primary/30 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-lg">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Business & Investment Opportunities</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Explore curated opportunities to grow your wealth
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {opportunities.map((opportunity, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className={`h-full p-6 rounded-lg border-2 border-border bg-gradient-to-br ${opportunity.color} hover:shadow-lg transition-all`}>
                  <div className={`inline-flex p-3 rounded-lg bg-background/80 mb-4`}>
                    {opportunity.icon}
                  </div>
                  
                  <h4 className="font-semibold text-lg mb-2">{opportunity.title}</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {opportunity.description}
                  </p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Category</span>
                      <Badge variant="outline">{opportunity.category}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Min Investment</span>
                      <span className="font-medium">{opportunity.minInvestment}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Expected Return</span>
                      <span className="font-medium text-green-600">{opportunity.expectedReturn}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Risk Level</span>
                      <Badge className={getRiskColor(opportunity.risk)}>
                        {opportunity.risk}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
        
        <div className="mt-6 flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="font-medium">Ready to explore more opportunities?</p>
            <p className="text-sm text-muted-foreground">
              View detailed information and requirements
            </p>
          </div>
          <Button asChild>
            <Link to="/dashboard/investment-opportunities">
              Explore All
              <ChevronRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
