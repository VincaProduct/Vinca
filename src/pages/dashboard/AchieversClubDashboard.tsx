import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useMembership } from '@/hooks/useMembership';
import ProgressTracker from '@/components/achievers-club/ProgressTracker';
import LockedContent from '@/components/achievers-club/LockedContent';
import UpgradeOptions from '@/components/achievers-club/UpgradeOptions';
import { 
  Sparkles, 
  BookOpen, 
  Video, 
  Users, 
  TrendingUp, 
  Calendar,
  Award,
  Crown,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AchieversClubDashboard = () => {
  const { user } = useAuth();
  const { tier, isPro, isClient, loading } = useMembership();
  const { toast } = useToast();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Show celebration on upgrade
  useEffect(() => {
    if (isPro && !showCelebration) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 5000);
    }
  }, [isPro]);

  const handleUpgradeClick = () => {
    setShowUpgradeModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <Sparkles className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const freeResources = [
    {
      icon: BookOpen,
      title: 'Financial Freedom Guide',
      description: 'Learn the fundamentals of wealth building',
      action: 'Start Learning',
      unlocked: true,
    },
    {
      icon: TrendingUp,
      title: 'Wealth Calculator',
      description: 'Calculate your path to financial freedom',
      action: 'Calculate Now',
      unlocked: true,
    },
    {
      icon: Users,
      title: 'Community Forum',
      description: 'Connect with fellow achievers',
      action: 'Join Discussion',
      unlocked: true,
    },
  ];

  const premiumResources = [
    {
      icon: Video,
      title: 'Expert Webinars',
      description: 'Monthly sessions with financial experts',
      action: 'View Schedule',
      unlocked: isPro,
    },
    {
      icon: Award,
      title: 'Premium Courses',
      description: 'Advanced wealth building strategies',
      action: 'Browse Courses',
      unlocked: isPro,
    },
    {
      icon: Calendar,
      title: 'Exclusive Events',
      description: 'Networking and learning opportunities',
      action: 'See Events',
      unlocked: isPro,
    },
  ];

  const eliteResources = [
    {
      icon: Zap,
      title: '1-on-1 Strategy Sessions',
      description: 'Personal guidance from wealth advisors',
      action: 'Book Session',
      unlocked: isClient,
    },
    {
      icon: Crown,
      title: 'VIP Events',
      description: 'Exclusive networking with elite members',
      action: 'View Calendar',
      unlocked: isClient,
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Celebration Banner */}
      {showCelebration && (
        <Card className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground border-0 animate-in slide-in-from-top">
          <CardContent className="py-6">
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="h-6 w-6 animate-pulse" />
              <div className="text-center">
                <h3 className="text-xl font-bold mb-1">
                  {isClient ? '👑 Welcome to Elite Status!' : '🎉 Welcome to Premium!'}
                </h3>
                <p className="text-primary-foreground/90">
                  All exclusive content is now unlocked. Enjoy your new benefits!
                </p>
              </div>
              <Sparkles className="h-6 w-6 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold">Welcome Back, {user?.email?.split('@')[0] || 'Achiever'}!</h1>
          {isClient && <Crown className="h-8 w-8 text-primary" />}
          {isPro && !isClient && <Sparkles className="h-8 w-8 text-primary" />}
        </div>
        <p className="text-lg text-muted-foreground">
          {isClient 
            ? 'Elite Member • Full VIP Access'
            : isPro
            ? 'Premium Member • Keep building your legacy'
            : 'Explorer • Start your journey to financial freedom'
          }
        </p>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Progress */}
        <div className="lg:col-span-1">
          <ProgressTracker tier={tier} />
        </div>

        {/* Right Column - Resources */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="resources" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="resources">Resources & Tools</TabsTrigger>
              <TabsTrigger value="upgrade">Upgrade Options</TabsTrigger>
            </TabsList>

            <TabsContent value="resources" className="space-y-6">
              {/* Free Resources */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Your Resources
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {freeResources.map((resource, index) => (
                    <Card key={index} className="hover:border-primary/50 transition-colors">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <resource.icon className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <CardTitle className="text-lg">{resource.title}</CardTitle>
                        <CardDescription>{resource.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full">{resource.action}</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Premium Resources */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Premium Resources
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {premiumResources.map((resource, index) =>
                    resource.unlocked ? (
                      <Card key={index} className="hover:border-primary/50 transition-colors border-primary/30">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <resource.icon className="h-5 w-5 text-primary" />
                            </div>
                            <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded-full">
                              Unlocked
                            </span>
                          </div>
                          <CardTitle className="text-lg">{resource.title}</CardTitle>
                          <CardDescription>{resource.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button className="w-full">{resource.action}</Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <LockedContent
                        key={index}
                        title={resource.title}
                        description={resource.description}
                        requiredTier="premium"
                        onUpgrade={handleUpgradeClick}
                      />
                    )
                  )}
                </div>
              </div>

              {/* Elite Resources */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  Elite Resources
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {eliteResources.map((resource, index) =>
                    resource.unlocked ? (
                      <Card key={index} className="hover:border-primary/50 transition-colors border-primary/30 bg-gradient-to-br from-primary/5 to-background">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <resource.icon className="h-5 w-5 text-primary" />
                            </div>
                            <span className="text-xs font-semibold px-2 py-1 bg-primary text-primary-foreground rounded-full">
                              VIP
                            </span>
                          </div>
                          <CardTitle className="text-lg">{resource.title}</CardTitle>
                          <CardDescription>{resource.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button className="w-full">{resource.action}</Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <LockedContent
                        key={index}
                        title={resource.title}
                        description={resource.description}
                        requiredTier="client"
                        onUpgrade={handleUpgradeClick}
                      />
                    )
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="upgrade">
              {!isPro ? (
                <UpgradeOptions />
              ) : !isClient ? (
                <div className="space-y-6">
                  <Card className="bg-gradient-to-br from-primary/5 to-background border-primary/30">
                    <CardContent className="py-12 text-center space-y-4">
                      <Crown className="h-16 w-16 text-primary mx-auto" />
                      <h3 className="text-2xl font-bold">Ready for Elite Status?</h3>
                      <p className="text-muted-foreground max-w-lg mx-auto">
                        Take your wealth journey to the next level with personalized guidance,
                        VIP events, and exclusive one-on-one sessions with our expert advisors.
                      </p>
                      <Button size="lg" className="mt-4">
                        Become a Wealth Management Client
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center space-y-4">
                    <Crown className="h-16 w-16 text-primary mx-auto" />
                    <h3 className="text-2xl font-bold">You're an Elite Member!</h3>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                      You have full access to all Achievers Club benefits. Explore all premium
                      and elite resources to maximize your wealth-building journey.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AchieversClubDashboard;
