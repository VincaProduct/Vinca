import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, TrendingUp, PieChart, Target, Shield, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const tools = [
  {
    id: 'financial-freedom-readiness',
    title: 'Financial Freedom Readiness (FFR)',
    description: 'Assess your financial freedom readiness with educational modules and track your progress.',
    icon: Shield,
    href: '/dashboard/tools/ffr/home',
    category: 'Assessment',
    featured: true,
  },
  {
    id: 'financial-freedom-calculator',
    title: 'Financial Freedom Calculator',
    description: 'Calculate your path to financial independence with detailed projections and scenarios.',
    icon: Calculator,
    href: '/dashboard/tools/financial-freedom-calculator',
    category: 'Planning',
    featured: true,
  },
  {
    id: 'achievers-club',
    title: 'Achievers Club',
    description: 'Join our community and unlock premium resources, events, and personalized guidance.',
    icon: Sparkles,
    href: '/dashboard/achievers-club',
    category: 'Community',
    featured: true,
  },
  {
    id: 'investment-tracker',
    title: 'Investment Tracker',
    description: 'Track your portfolio performance and analyze investment returns.',
    icon: TrendingUp,
    href: '/dashboard/tools/investment-tracker',
    category: 'Tracking',
    comingSoon: true,
  },
  {
    id: 'retirement-planner',
    title: 'Retirement Planner',
    description: 'Plan your retirement with detailed savings and withdrawal strategies.',
    icon: PieChart,
    href: '/dashboard/tools/retirement-planner',
    category: 'Planning',
    comingSoon: true,
  },
  {
    id: 'goal-tracker',
    title: 'Financial Goals Tracker',
    description: 'Set and track progress towards your financial goals.',
    icon: Target,
    href: '/dashboard/tools/goal-tracker',
    category: 'Tracking',
    comingSoon: true,
  },
];

const ToolsPage = () => {
  const featuredTools = tools.filter(tool => tool.featured);
  const otherTools = tools.filter(tool => !tool.featured);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Financial Tools</h1>
        <p className="text-muted-foreground mt-2">
          Powerful tools to help you plan, track, and achieve your financial goals.
        </p>
      </div>

      {/* Featured Tools */}
      {featuredTools.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Featured Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTools.map((tool) => (
              <Card key={tool.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <tool.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{tool.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {tool.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {tool.category}
                      </span>
                      {tool.comingSoon ? (
                        <Button variant="outline" size="sm" disabled>
                          Coming Soon
                        </Button>
                      ) : (
                        <Button asChild size="sm">
                          <Link to={tool.href}>Open Tool</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Other Tools */}
      {otherTools.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">All Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherTools.map((tool) => (
              <Card key={tool.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <tool.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{tool.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {tool.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {tool.category}
                      </span>
                      {tool.comingSoon ? (
                        <Button variant="outline" size="sm" disabled>
                          Coming Soon
                        </Button>
                      ) : (
                        <Button asChild size="sm">
                          <Link to={tool.href}>Open Tool</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolsPage;
