import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart3, Calculator, TrendingUp, X } from 'lucide-react';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignupModal = ({ isOpen, onClose }: SignupModalProps) => {
  const handleSignup = () => {
    window.location.href = '/auth';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-8">
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-2 hover:bg-black/5 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <DialogHeader className="text-center mb-8">
            <DialogTitle className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              🎉 Great! Your Plan is Ready
            </DialogTitle>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Sign up now to unlock detailed analysis, advanced projections, and personalized recommendations to optimize your financial journey.
            </p>
          </DialogHeader>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="group text-center p-6 bg-card border border-border/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                <BarChart3 className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="font-semibold text-base mb-2 text-foreground">Year-by-Year Analysis</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Detailed projections with interactive charts and insights
              </p>
            </div>
            
            <div className="group text-center p-6 bg-card border border-border/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                <Calculator className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="font-semibold text-base mb-2 text-foreground">Multiple Calculators</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Access comprehensive financial planning tools
              </p>
            </div>
            
            <div className="group text-center p-6 bg-card border border-border/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                <TrendingUp className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="font-semibold text-base mb-2 text-foreground">Scenario Planning</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Compare multiple investment strategies
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={handleSignup}
              size="lg"
              className="px-8 py-6 text-lg font-semibold flex-1 sm:flex-none"
            >
              Access Free Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              onClick={onClose}
              variant="outline"
              size="lg"
              className="px-6 py-6 text-base"
            >
              Maybe Later
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center mt-4">
            Free signup • No credit card required • Instant access
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignupModal;