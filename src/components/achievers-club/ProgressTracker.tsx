import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Target, Zap } from 'lucide-react';

interface ProgressTrackerProps {
  tier: 'free' | 'pro' | 'premium' | 'client';
}

const ProgressTracker = ({ tier }: ProgressTrackerProps) => {
  const levels = [
    { name: 'Explorer', minPoints: 0, icon: Star, color: 'text-blue-500' },
    { name: 'Achiever', minPoints: 100, icon: Target, color: 'text-purple-500' },
    { name: 'Master', minPoints: 500, icon: Zap, color: 'text-orange-500' },
    { name: 'Elite', minPoints: 1000, icon: Trophy, color: 'text-yellow-500' },
  ];

  // For demo purposes - in real app, this would come from achievements data
  const currentPoints = tier === 'free' ? 25 : (tier === 'premium' || tier === 'pro') ? 150 : 750;
  
  const currentLevel = levels.reduce((acc, level) => {
    return currentPoints >= level.minPoints ? level : acc;
  }, levels[0]);

  const nextLevel = levels.find(level => level.minPoints > currentPoints) || levels[levels.length - 1];
  const progressToNext = nextLevel ? ((currentPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100 : 100;

  const milestones = [
    { title: 'Profile Complete', completed: true, points: 10 },
    { title: 'First Tool Used', completed: true, points: 15 },
    { title: 'Community Post', completed: tier !== 'free', points: 20 },
    { title: 'Webinar Attended', completed: tier === 'client', points: 30 },
    { title: 'Strategy Session', completed: tier === 'client', points: 50 },
  ];

  const CurrentIcon = currentLevel.icon;

  return (
    <div className="space-y-6">
      {/* Current Level Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-background border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <CurrentIcon className={`h-8 w-8 ${currentLevel.color}`} />
            <div>
              <div className="text-2xl">{currentLevel.name}</div>
              <div className="text-sm font-normal text-muted-foreground">
                {currentPoints} points
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress to {nextLevel.name}</span>
              <span className="font-medium">{Math.round(progressToNext)}%</span>
            </div>
            <Progress value={progressToNext} className="h-3" />
          </div>
          
          <div className="flex justify-between text-sm text-muted-foreground pt-2">
            <span>{currentLevel.minPoints} pts</span>
            <span>{nextLevel.minPoints} pts</span>
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Recent Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  milestone.completed
                    ? 'bg-primary/5 border-primary/20'
                    : 'bg-muted/30 border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                      milestone.completed
                        ? 'bg-primary border-primary'
                        : 'border-muted-foreground'
                    }`}
                  >
                    {milestone.completed && (
                      <Star className="h-3 w-3 text-primary-foreground fill-current" />
                    )}
                  </div>
                  <span className={milestone.completed ? 'font-medium' : 'text-muted-foreground'}>
                    {milestone.title}
                  </span>
                </div>
                <span className={`text-sm font-semibold ${
                  milestone.completed ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  +{milestone.points}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressTracker;
