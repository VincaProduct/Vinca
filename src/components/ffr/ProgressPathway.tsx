import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Circle, 
  TrendingUp, 
  BookOpen, 
  Target,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { FFRProgress } from '@/types/ffr';

interface ProgressPathwayProps {
  ffrProgress: FFRProgress | null;
}

interface PathwayStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  score: number;
  maxScore: number;
  color: string;
  tooltip: string;
  actionText: string;
  actionLink: string;
  isComplete: boolean;
}

export const ProgressPathway = ({ ffrProgress }: ProgressPathwayProps) => {
  const steps: PathwayStep[] = [
    {
      title: 'Foundation Steps',
      description: 'Essential financial building blocks',
      icon: <CheckCircle2 className="w-5 h-5" />,
      score: ffrProgress?.foundation_score || 0,
      maxScore: 40,
      color: 'text-green-600',
      tooltip: 'Complete KYC, nominations, emergency fund, SIP mandates, and document setup to build a solid financial foundation.',
      actionText: 'Complete Checklist',
      actionLink: '/dashboard/tools/ffr/checklist',
      isComplete: (ffrProgress?.foundation_score || 0) >= 40
    },
    {
      title: 'Saving Habits',
      description: 'Consistency in wealth building',
      icon: <TrendingUp className="w-5 h-5" />,
      score: ffrProgress?.habit_score || 0,
      maxScore: 25,
      color: 'text-blue-600',
      tooltip: 'Maintain consistent SIP contributions and demonstrate disciplined saving behavior to accelerate your journey to financial freedom.',
      actionText: 'Track Progress',
      actionLink: '/dashboard/tools/ffr/checklist',
      isComplete: (ffrProgress?.habit_score || 0) >= 25
    },
    {
      title: 'Financial Literacy',
      description: 'Knowledge is power',
      icon: <BookOpen className="w-5 h-5" />,
      score: ffrProgress?.literacy_score || 0,
      maxScore: 20,
      color: 'text-purple-600',
      tooltip: 'Engage with educational content about mutual funds, tax planning, and investment strategies to make informed decisions.',
      actionText: 'Start Learning',
      actionLink: '/dashboard/tools/ffr/learn',
      isComplete: (ffrProgress?.literacy_score || 0) >= 20
    },
    {
      title: 'Investment Opportunities',
      description: 'Explore and engage',
      icon: <Target className="w-5 h-5" />,
      score: ffrProgress?.opportunity_score || 0,
      maxScore: 10,
      color: 'text-orange-600',
      tooltip: 'Discover and explore investment opportunities aligned with your financial goals and risk profile.',
      actionText: 'View Opportunities',
      actionLink: '/dashboard/tools/ffr/opportunities',
      isComplete: (ffrProgress?.opportunity_score || 0) >= 10
    }
  ];

  const overallProgress = steps.reduce((acc, step) => acc + (step.score / step.maxScore) * 25, 0);

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Your Progress Pathway</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Track your journey to financial freedom step by step
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {Math.round(overallProgress)}%
            </div>
            <p className="text-xs text-muted-foreground">Complete</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <TooltipProvider>
          {steps.map((step, index) => {
            const progress = (step.score / step.maxScore) * 100;
            
            return (
              <div key={index} className="relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-12 bg-border" />
                )}
                
                <div className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${
                  step.isComplete 
                    ? 'border-green-200 bg-green-50/50 dark:bg-green-950/20' 
                    : 'border-border bg-card hover:shadow-md'
                }`}>
                  {/* Status Icon */}
                  <div className={`mt-1 ${step.isComplete ? 'text-green-600' : step.color}`}>
                    {step.isComplete ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={step.color}>
                        {step.icon}
                      </div>
                      <h4 className="font-semibold text-base">{step.title}</h4>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-muted-foreground hover:text-foreground transition-colors">
                            <Info className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-sm">{step.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                      {step.isComplete && (
                        <span className="ml-auto text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          Complete
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {step.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">
                          {step.score} / {step.maxScore} points
                        </span>
                        <span className="text-muted-foreground">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    
                    {!step.isComplete && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        asChild
                      >
                        <Link to={step.actionLink}>
                          {step.actionText}
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </TooltipProvider>
        
        {/* Motivational Message */}
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-sm font-medium text-foreground">
            {overallProgress < 25 
              ? "🌱 You're just getting started! Complete your foundation steps to accelerate your progress."
              : overallProgress < 50
              ? "🚀 Great momentum! Keep building your habits and knowledge."
              : overallProgress < 75
              ? "💪 You're doing excellent! Stay consistent and explore new opportunities."
              : "🌟 Outstanding progress! You're well on your way to financial freedom."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
