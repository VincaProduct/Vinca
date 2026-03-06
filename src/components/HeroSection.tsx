import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, TrendingUp, Users, BarChart3, DollarSign, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  // Sample portfolio data for the model portfolio card
  const portfolioData = [65, 72, 68, 78, 85, 92, 88, 95, 101, 108, 115, 122];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-secondary/30 pt-16 sm:pt-18 lg:pt-20">{/* Account for fixed header */}
      {/* Modern Grid Pattern Background */}
      <div 
        className="absolute inset-0 opacity-[0.08] dark:opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--muted-foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--muted-foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-4.5rem)] lg:min-h-[calc(100vh-5rem)]">{/* Subtract header height */}
          {/* Left Column - Content */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">{/* Adjusted text sizes for mobile */}
                <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  Expert Mutual Fund Selection for
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Wealth Creation
                </span>
              </h1>

              <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground font-medium leading-relaxed">{/* Responsive text sizing */}
                Professional fund curation • Zero fees • 15%+ returns
              </p>
            </div>

            {/* Feature Badges */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
                <TrendingUp className="w-4 h-4 mr-2" />
                Professional Curation
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
                <DollarSign className="w-4 h-4 mr-2" />
                Zero Fees
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
                <BarChart3 className="w-4 h-4 mr-2" />
                15%+ Returns
              </Badge>
            </div>

            {/* CTA Buttons */}
            <div className="pt-4 flex gap-4 justify-center lg:justify-start">
              <Button
                onClick={() => navigate('/auth')}
                size="lg"
                className="text-lg font-semibold px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                📅 Get My Free Portfolio
              </Button>
              <Button
                onClick={() => navigate('/pricing')}
                size="lg"
                className="text-lg font-semibold px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Join Membership
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-8 space-y-4">
              <h3 className="text-lg font-semibold text-muted-foreground">Why Choose Our Expertise</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>SEBI-registered research partners</span>
                </div>
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Diversified across categories</span>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Back-tested strategies</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Monthly insights</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Model Portfolio Card */}
          <div className="relative flex justify-center lg:justify-end mt-8 lg:mt-0">{/* Add margin top for mobile spacing */}
            <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border shadow-2xl">
              <CardContent className="p-6 space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold">Model Portfolio</h3>
                  <p className="text-sm text-muted-foreground">Sample Growth Performance</p>
                </div>

                {/* Growth Chart (Simple SVG Sparkline) */}
                <div className="relative h-24 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4">
                  <svg className="w-full h-full" viewBox="0 0 300 60">
                    <polyline
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                      points={portfolioData.map((value, index) => 
                        `${(index * 300) / (portfolioData.length - 1)},${60 - ((value - 65) / (122 - 65)) * 60}`
                      ).join(' ')}
                    />
                    <defs>
                      <linearGradient id="portfolioGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    <polygon
                      fill="url(#portfolioGradient)"
                      points={`0,60 ${portfolioData.map((value, index) => 
                        `${(index * 300) / (portfolioData.length - 1)},${60 - ((value - 65) / (122 - 65)) * 60}`
                      ).join(' ')} 300,60`}
                    />
                  </svg>
                  <div className="absolute top-2 right-2 text-xs font-medium text-primary">
                    ↗ +87%
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">15.2%</div>
                    <div className="text-sm text-muted-foreground">CAGR</div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold">12</div>
                      <div className="text-xs text-muted-foreground">Funds</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">0.8%</div>
                      <div className="text-xs text-muted-foreground">Expense Ratio</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">6M</div>
                      <div className="text-xs text-muted-foreground">Rebalance</div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground text-center">
                    Past performance doesn't guarantee future results
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
