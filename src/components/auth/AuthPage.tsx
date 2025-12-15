import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

const AuthPage = () => {
  const { user, signInWithGoogle, signInWithPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [referralCode, setReferralCode] = useState('');

  // Check for referral code in URL and store immediately
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      // Store in localStorage immediately when detected
      localStorage.setItem('pending_referral_code', refCode);
      toast({
        title: 'Referral code applied!',
        description: `You're signing up with referral code: ${refCode}`,
      });
    }
  }, [searchParams, toast]);

  // Redirect if already authenticated
  if (user) {
    const redirectPath = localStorage.getItem('redirect_after_login');
    if (redirectPath) {
      localStorage.removeItem('redirect_after_login');
      return <Navigate to={redirectPath} replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  const handleGoogleSignIn = async () => {
    // Referral code already stored in localStorage from useEffect
    await signInWithGoogle(referralCode || undefined);
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signInWithPassword(email, password);
    
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Sign in failed',
        description: error.message,
      });
    }
    
    setLoading(false);
  };

  const handlePortfolioLoginClick = () => {
    window.open("https://portfolio.vincawealth.com/login?_gl=1*1c7uhfu*_gcl_au*MTg1NjAzODIzOC4xNzQ5Mjk4MTEy*_ga*MTg1NzI3NTc0MC4xNzQ5Mjk4MTEy*_ga_6MQBMGPXJJ*czE3NDkzNzE3MTkkbzIkZzAkdDE3NDkzNzE3MTkkajYwJGwwJGgw", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Header />
      <div className="min-h-screen flex items-center justify-center pt-20 pb-8 px-4">
        <div className="w-full max-w-4xl">
          <Card className="overflow-hidden shadow-2xl border-0">
            <div className="grid lg:grid-cols-2">
              {/* Left Side - Logo/Brand */}
              <div className="bg-muted/30 p-8 lg:p-12 flex flex-col items-center justify-center min-h-[300px] lg:min-h-[500px]">
                <img 
                  src="/12/vinca-wealth-logo.png" 
                  alt="Vinca Wealth" 
                  className="h-16 lg:h-20 object-contain"
                />
                <p className="mt-4 text-muted-foreground text-center text-sm">
                  Your trusted partner in wealth management
                </p>
              </div>

              {/* Right Side - Auth Forms */}
              <div className="p-8 lg:p-12 space-y-8">
                {/* Sign in to Investor Hub */}
                <div className="space-y-6">
                  <div className="text-4xl">👋</div>
                  <div className="space-y-2">
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                      Sign in to <span className="text-primary">Investor Hub</span>
                    </h1>
                    <p className="text-muted-foreground">
                      Please use your registered Google account to login
                    </p>
                  </div>
                  
                  <Button 
                    type="button" 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
                    onClick={handleGoogleSignIn}
                    size="lg"
                  >
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Login with Google
                  </Button>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-3 text-muted-foreground">
                      or
                    </span>
                  </div>
                </div>

                {/* Existing Portfolio Access */}
                <div className="space-y-4 p-6 rounded-xl bg-accent/10 border-2 border-accent/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">
                        <span className="text-primary">Existing Portfolio</span> Access
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Already have a portfolio account?
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full border-accent/50 hover:bg-accent/20"
                    size="lg"
                    onClick={handlePortfolioLoginClick}
                  >
                    Go to Portfolio Login
                    <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
