import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMembership } from '@/hooks/useMembership';
import { 
  TrendingUp, 
  Building2, 
  Store, 
  Lock,
  ArrowUpRight,
  MapPin,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InvestmentOpportunities = () => {
  const { isPro } = useMembership();
  const navigate = useNavigate();

  const preIPODeals = [
    {
      name: 'TechStart AI Solutions',
      sector: 'Technology',
      minInvestment: '₹5,00,000',
      expectedReturns: '3-4x in 18-24 months',
      location: 'Bangalore',
      fundingRound: 'Series B',
      slotsAvailable: 5,
    },
    {
      name: 'GreenEnergy Innovations',
      sector: 'Renewable Energy',
      minInvestment: '₹10,00,000',
      expectedReturns: '2-3x in 24-36 months',
      location: 'Mumbai',
      fundingRound: 'Series C',
      slotsAvailable: 3,
    },
  ];

  const realEstateDeals = [
    {
      name: 'Premium Commercial Plaza - Whitefield',
      type: 'Commercial Real Estate',
      minInvestment: '₹25,00,000',
      expectedReturns: '12-15% annual rental yield',
      location: 'Bangalore',
      possession: 'Q4 2026',
      slotsAvailable: 8,
    },
    {
      name: 'Luxury Residential Project - Powai',
      type: 'Residential Real Estate',
      minInvestment: '₹50,00,000',
      expectedReturns: '18-20% appreciation in 3 years',
      location: 'Mumbai',
      possession: 'Q2 2027',
      slotsAvailable: 4,
    },
  ];

  const franchiseDeals = [
    {
      name: 'Premium Coffee Chain Franchise',
      brand: 'Cafe Delight',
      minInvestment: '₹15,00,000',
      expectedReturns: 'ROI in 18-24 months',
      location: 'Tier 1 & 2 Cities',
      support: 'Complete setup & training',
      slotsAvailable: 10,
    },
    {
      name: 'Fitness Studio Franchise',
      brand: 'FitLife 360',
      minInvestment: '₹20,00,000',
      expectedReturns: 'ROI in 24-30 months',
      location: 'Metro Cities',
      support: 'Marketing & operations',
      slotsAvailable: 6,
    },
  ];

  const OpportunityCard = ({ opportunity, type }: { opportunity: any; type: string }) => {
    const isLocked = !isPro;

    return (
      <Card className={`hover:shadow-lg transition-all ${isLocked ? 'opacity-60' : ''}`}>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg text-foreground mb-1">{opportunity.name}</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {opportunity.sector || opportunity.type || opportunity.brand}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <MapPin className="h-3 w-3 mr-1" />
                    {opportunity.location}
                  </Badge>
                </div>
              </div>
              {isLocked && <Lock className="h-5 w-5 text-muted-foreground" />}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Min. Investment</p>
                <p className="font-semibold text-foreground flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {opportunity.minInvestment}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Expected Returns</p>
                <p className="font-semibold text-green-600 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {opportunity.expectedReturns}
                </p>
              </div>
            </div>

            {opportunity.possession && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Possession: <span className="text-foreground">{opportunity.possession}</span>
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-sm text-muted-foreground">
                {opportunity.slotsAvailable} slots available
              </span>
              {isLocked ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/achievers-club')}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Upgrade to View
                </Button>
              ) : (
                <Button size="sm">
                  View Details
                  <ArrowUpRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Investment Opportunities</h1>
        <p className="text-lg text-muted-foreground">
          Curated pre-IPO, real estate, and franchise opportunities for wealth creation
        </p>
      </div>

      {!isPro && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Lock className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-lg text-foreground mb-2">
                  Upgrade to Pro Version for Full Access
                </h3>
                <p className="text-muted-foreground mb-4">
                  Get lifetime access to all investment opportunities, co-founder matching, and premium tools for just ₹25,000 one-time fee.
                </p>
                <Button onClick={() => navigate('/achievers-club')}>
                  Upgrade to Pro Version
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="pre-ipo" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pre-ipo">
            <TrendingUp className="h-4 w-4 mr-2" />
            Pre-IPO Deals
          </TabsTrigger>
          <TabsTrigger value="real-estate">
            <Building2 className="h-4 w-4 mr-2" />
            Real Estate
          </TabsTrigger>
          <TabsTrigger value="franchise">
            <Store className="h-4 w-4 mr-2" />
            Franchise
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pre-ipo" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {preIPODeals.map((deal, index) => (
              <OpportunityCard key={index} opportunity={deal} type="pre-ipo" />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="real-estate" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {realEstateDeals.map((deal, index) => (
              <OpportunityCard key={index} opportunity={deal} type="real-estate" />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="franchise" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {franchiseDeals.map((deal, index) => (
              <OpportunityCard key={index} opportunity={deal} type="franchise" />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvestmentOpportunities;
