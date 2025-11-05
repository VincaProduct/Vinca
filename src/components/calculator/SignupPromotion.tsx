import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart3, Calculator, TrendingUp } from 'lucide-react';

const SignupPromotion = () => {
  const handleSignup = () => {
    window.location.href = '/auth';
  };

  return (
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 py-12 animate-fade-in">
      <div className="container mx-auto px-4 lg:px-8">
        <Card className="p-8 border-primary/20 shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Want More Detailed Analysis?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Sign up to access our comprehensive dashboard with advanced calculators, 
              detailed projections, and personalized insights to optimize your financial journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Year-by-year detailed breakdowns with interactive charts
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Multiple Calculators</h3>
              <p className="text-sm text-muted-foreground">
                Access all our financial planning tools in one place
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Scenario Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Compare different investment strategies and outcomes
              </p>
            </div>
          </div>

          <div className="text-center">
            <Button 
              onClick={handleSignup}
              size="lg"
              className="px-8 py-6 text-lg font-semibold"
            >
              Sign Up for Free Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-muted-foreground mt-3">
              Free signup • No credit card required • Instant access
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SignupPromotion;