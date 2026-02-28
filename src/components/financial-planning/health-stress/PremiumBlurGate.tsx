import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Heart, Target, Headphones, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PremiumBlurGateProps {
  isLocked: boolean;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function PremiumBlurGate({ isLocked, title, subtitle, children }: PremiumBlurGateProps) {
  const navigate = useNavigate();

  if (!isLocked) {
    return <div className="space-y-6">{children}</div>;
  }

  return (
    <div className="relative">
      {/* Blurred Content Preview */}
      <div className="filter blur-sm pointer-events-none select-none opacity-50">
        <div className="space-y-6">
          {children}
        </div>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/90">
        <Card className="max-w-md mx-4 border shadow-lg">
          <CardContent className="pt-8 pb-8 text-center">
            {/* Lock Icon */}
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Lock className="w-6 h-6 text-muted-foreground" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground mb-6">{subtitle}</p>

            {/* Benefits */}
            <div className="space-y-2 mb-6 text-left">
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20">
                <Heart className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">Health Stress Analysis</p>
                  <p className="text-xs text-muted-foreground">See how health scenarios impact your retirement</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20">
                <Target className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">Personalized Recommendations</p>
                  <p className="text-xs text-muted-foreground">Get actionable insights to protect your future</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20">
                <Headphones className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">Priority Support</p>
                  <p className="text-xs text-muted-foreground">Direct access to our wealth management team</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Button
              size="lg"
              className="w-full gap-2 cursor-pointer"
              onClick={() => navigate('/dashboard/upgrade')}
            >
              Upgrade to Pro
              <ArrowRight className="w-4 h-4" />
            </Button>

            <p className="text-xs text-muted-foreground mt-4">
              One-time payment · Lifetime access · No recurring fees
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
