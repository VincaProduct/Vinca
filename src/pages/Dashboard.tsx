import { useAuth } from '@/contexts/AuthContext';
import { useMembership } from '@/hooks/useMembership';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  Lock, 
  Play, 
  Calendar,
  FileText,
  Target,
  Trophy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const { tier, isPro } = useMembership();
  const navigate = useNavigate();

  // Free content items
  const freeContent = [
    {
      title: 'Financial Freedom Basics',
      type: 'Guide',
      duration: '10 min read',
      icon: FileText,
    },
    {
      title: 'Introduction to SIP Investing',
      type: 'Video',
      duration: '15 min',
      icon: Play,
    },
    {
      title: 'Emergency Fund Calculator',
      type: 'Tool',
      duration: 'Interactive',
      icon: Target,
    },
  ];

  // Premium locked content
  const premiumContent = [
    {
      title: 'Advanced Tax Optimization Strategies',
      type: 'Masterclass',
      duration: '45 min',
    },
    {
      title: 'Portfolio Rebalancing Workshop',
      type: 'Workshop',
      duration: '1 hour',
    },
    {
      title: 'One-on-One Wealth Review',
      type: 'Consultation',
      duration: '30 min',
    },
  ];

  // Upcoming events
  const upcomingEvents = [
    {
      title: 'Wealth Building Masterclass',
      date: 'Dec 28, 2025',
      time: '6:00 PM IST',
      seats: '15 spots left',
    },
    {
      title: 'Year-End Tax Planning Webinar',
      date: 'Dec 30, 2025',
      time: '7:00 PM IST',
      seats: 'Open to all',
    },
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">
          Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Explorer'}! 👋
        </h1>
        <p className="text-lg text-muted-foreground">
          Your journey to financial freedom continues here.
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card 
            className="hover:shadow-lg transition-all cursor-pointer border-primary/20 hover:border-primary/40"
            onClick={() => navigate('/dashboard/ffr')}
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    Continue Your Financial Freedom Plan
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Track your progress and complete milestones
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-all cursor-pointer border-primary/20 hover:border-primary/40"
            onClick={() => navigate('/dashboard/investment-opportunities')}
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    View Investment Opportunities
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Pre-IPO, real estate & franchise deals
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Roadmap Progress */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Your Financial Freedom Roadmap</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold">1</span>
                  </div>
                  <div className="w-0.5 h-16 bg-primary/30 my-1"></div>
                </div>
                <div className="flex-1 pt-2">
                  <h4 className="font-semibold text-foreground">Foundation Setup</h4>
                  <p className="text-sm text-muted-foreground">Emergency fund, insurance, and documentation</p>
                  <Badge variant="secondary" className="mt-2 bg-green-500/10 text-green-600 border-green-500/20">
                    Completed
                  </Badge>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold">2</span>
                  </div>
                  <div className="w-0.5 h-16 bg-border my-1"></div>
                </div>
                <div className="flex-1 pt-2">
                  <h4 className="font-semibold text-foreground">Wealth Accumulation</h4>
                  <p className="text-sm text-muted-foreground">SIP investments and portfolio building</p>
                  <Badge variant="secondary" className="mt-2">In Progress - 60%</Badge>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground font-bold">3</span>
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h4 className="font-semibold text-muted-foreground">Retirement Planning</h4>
                  <p className="text-sm text-muted-foreground">Long-term wealth preservation</p>
                  <Badge variant="outline" className="mt-2">Upcoming</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Free Featured Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              Featured Free Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {freeContent.map((item, index) => (
                <button
                  key={index}
                  className="w-full p-4 text-left rounded-lg border border-border hover:bg-accent transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">{item.type}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{item.duration}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Premium Locked Content */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Premium Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {premiumContent.map((item, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    isPro ? 'border-border hover:bg-accent cursor-pointer' : 'border-primary/20 bg-primary/5'
                  } transition-colors`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {isPro ? (
                        <Play className="h-5 w-5 text-primary" />
                      ) : (
                        <Lock className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{item.title}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">{item.type}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{item.duration}</span>
                      </div>
                    </div>
                    {!isPro && (
                      <Badge variant="outline" className="border-primary text-primary">
                        Pro Only
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              
              {!isPro && (
                <Button 
                  className="w-full mt-4" 
                  onClick={() => navigate('/achievers-club')}
                >
                  Upgrade to Pro - ₹25,000 Lifetime
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Events & Webinars
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingEvents.map((event, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-border hover:shadow-md transition-all"
              >
                <h4 className="font-semibold text-foreground mb-2">{event.title}</h4>
                <div className="space-y-1 text-sm text-muted-foreground mb-3">
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {event.date} at {event.time}
                  </p>
                  <p className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {event.seats}
                  </p>
                </div>
                <Button variant="outline" className="w-full">
                  RSVP Now
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Community Highlight */}
      <Card className="bg-gradient-to-br from-primary/5 to-background border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Community Success Story
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-primary">RS</span>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">Rajesh S. achieved financial freedom at 45!</h4>
              <p className="text-muted-foreground mb-3">
                "With disciplined SIP investing and expert guidance from Vinca Wealth, I built a corpus of ₹2.5 Cr 
                in just 12 years. Now I'm living my dream of early retirement and traveling the world."
              </p>
              <Button variant="outline" size="sm">
                Read Full Story
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
