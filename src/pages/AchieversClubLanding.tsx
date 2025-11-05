import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, TrendingUp, Users, Award, Lock, Zap } from 'lucide-react';
import Header from '@/components/Header';

const AchieversClubLanding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard/achievers-club');
    } else {
      navigate('/auth');
    }
  };

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Financial Freedom Tools',
      description: 'Access calculators, planners, and guides to accelerate your wealth journey',
      free: true,
    },
    {
      icon: Users,
      title: 'Community Network',
      description: 'Connect with like-minded achievers and share success strategies',
      free: true,
    },
    {
      icon: Award,
      title: 'Achievement Milestones',
      description: 'Track your progress and celebrate wins with our gamified system',
      free: true,
    },
    {
      icon: Sparkles,
      title: 'Exclusive Events & Webinars',
      description: 'Premium workshops with industry leaders and wealth experts',
      free: false,
    },
    {
      icon: Zap,
      title: 'Personalized Guidance',
      description: 'One-on-one sessions with certified financial advisors',
      free: false,
    },
    {
      icon: Lock,
      title: 'Advanced Resources',
      description: 'Premium courses, templates, and investment frameworks',
      free: false,
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.1),transparent_50%)]" />
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 backdrop-blur-sm rounded-full border border-primary/20">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">Join the Movement</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              Welcome to the <span className="text-primary">Achievers Club!</span>
            </h1>
          
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Unlock your path to financial freedom and business success. Join a thriving community
              of ambitious individuals committed to building lasting wealth and achieving their dreams.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button 
                size="lg" 
                onClick={handleGetStarted} 
                className="text-base md:text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {user ? 'Go to Dashboard' : 'Start Your Journey Free'}
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate('/about')}
                className="text-base md:text-lg px-8 py-6"
              >
                Learn More
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              ✨ No credit card required • Full access to starter resources
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">What You'll Get</h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Start with powerful free tools, upgrade to unlock your full potential
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <Card 
              key={index} 
              className={`transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                benefit.free ? 'bg-card' : 'border-primary/30 bg-primary/5'
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${benefit.free ? 'bg-primary/10' : 'bg-primary/20'}`}>
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  {!benefit.free && (
                    <span className="text-xs font-semibold px-3 py-1 bg-primary text-primary-foreground rounded-full">
                      Premium
                    </span>
                  )}
                </div>
                <CardTitle className="text-xl mt-4">{benefit.title}</CardTitle>
                <CardDescription className="text-base">{benefit.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">Choose Your Path</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Every great journey starts with a single step
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Tier */}
            <Card className="relative bg-card hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl">Explorer</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-bold text-foreground">Free</span>
                </div>
              </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Basic financial tools
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Starter guides & resources
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Community access
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Progress tracking
                </li>
              </ul>
              <Button className="w-full" onClick={handleGetStarted}>
                Get Started
              </Button>
            </CardContent>
          </Card>

            {/* Premium Tier */}
            <Card className="relative border-primary shadow-xl scale-105 bg-card">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-semibold shadow-lg">
                  Most Popular
                </span>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Achiever</CardTitle>
                <CardDescription>Accelerate your success</CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-bold text-primary">Premium</span>
                  <p className="text-sm text-muted-foreground mt-1">Subscription required</p>
                </div>
              </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Everything in Explorer
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Exclusive webinars & events
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Premium courses & templates
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Priority support
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Advanced analytics
                </li>
              </ul>
              <Button className="w-full" variant="default">
                Upgrade Now
              </Button>
            </CardContent>
          </Card>

            {/* Client Tier */}
            <Card className="relative border-primary/30 hover:shadow-lg transition-all duration-300 bg-card">
              <CardHeader>
                <CardTitle className="text-2xl">Elite</CardTitle>
                <CardDescription>Full VIP access</CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-bold text-foreground">Client</span>
                  <p className="text-sm text-muted-foreground mt-1">Wealth management required</p>
                </div>
              </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Everything in Achiever
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Personal wealth advisor
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  1-on-1 strategy sessions
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  VIP networking events
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Custom investment frameworks
                </li>
              </ul>
              <Button className="w-full" variant="outline">
                Contact Us
              </Button>
            </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,hsl(var(--primary)/0.1),transparent_50%)]" />
          <div className="relative py-16 px-6 text-center space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of achievers who are building wealth, gaining knowledge,
              and creating the life they've always dreamed of.
            </p>
            <Button 
              size="lg" 
              onClick={handleGetStarted} 
              className="text-base md:text-lg px-12 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Join Free Today
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AchieversClubLanding;
