import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Check, Loader2 } from 'lucide-react';
import { useRazorpayPayment } from '@/hooks/useRazorpayPayment';
import { razorpayConfig } from '@/config/razorpay';
import { useState } from 'react';
import { PaymentSuccess } from '@/components/payment/PaymentSuccess';

const UpgradeOptions = () => {
  const { initiatePayment, isProcessing } = useRazorpayPayment();
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleProUpgrade = async () => {
    const planConfig = razorpayConfig.plans.pro_lifetime;
    
    await initiatePayment({
      planType: 'pro_lifetime',
      amount: planConfig.amount,
      onSuccess: () => {
        setPaymentSuccess(true);
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      },
      onFailure: (error) => {
        console.error('Payment failed:', error);
      }
    });
  };

  const proBenefits = [
    'Advanced investment tools',
    'Startup co-founder matching',
    'Pre-IPO investment opportunities',
    'Real estate & franchise deals',
    'Priority support',
    'Exclusive webinars & workshops',
    'Advanced analytics dashboard',
    'Downloadable resource library',
  ];

  if (paymentSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <PaymentSuccess onContinue={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-2">
          <Crown className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold text-primary">Coming Soon</span>
        </div>
        <h2 className="text-3xl font-bold">Pro Version</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Unlock exclusive features and opportunities - Launching Soon
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="border-primary shadow-lg bg-gradient-to-br from-primary/5 to-background">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary mb-2">
              <Crown className="h-6 w-6" />
              <span className="text-sm font-semibold px-2 py-1 bg-primary/10 rounded-full">
                Lifetime Access
              </span>
            </div>
            <CardTitle className="text-2xl">Pro Version</CardTitle>
            <CardDescription className="text-base">
              All features unlocked forever with one payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-2">
              <div className="text-3xl font-bold mb-2 text-muted-foreground">₹25,000<span className="text-lg font-normal"> one-time</span></div>
              <p className="text-sm text-muted-foreground">Lifetime platform access • No recurring fees</p>
            </div>

            <div className="space-y-3">
              {proBenefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Payment button - Phase 2 implementation
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleProUpgrade}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Crown className="mr-2 h-5 w-5" />
                  Upgrade to Pro Version
                </>
              )}
            </Button>
            */}
            
            <div className="text-center py-4 px-6 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm font-medium mb-2">Pro Version Launching Soon</p>
              <p className="text-xs text-muted-foreground">
                We're preparing something special. Stay tuned for exclusive access to premium features and opportunities.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="max-w-2xl mx-auto bg-muted/30">
        <CardContent className="py-6">
          <p className="text-center text-sm text-muted-foreground">
            <strong>Wealth management clients</strong> automatically receive Pro Version access for free 
            as part of their wealth management service.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpgradeOptions;
