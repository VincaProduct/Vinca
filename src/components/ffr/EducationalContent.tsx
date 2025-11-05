import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Video, FileText, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EducationalContentProps {
  ffrScores?: {
    foundation_score: number;
    habit_score: number;
    literacy_score: number;
  };
}

export const EducationalContent = ({ ffrScores }: EducationalContentProps) => {
  const getRecommendedContent = () => {
    const content = [];
    
    if (!ffrScores || ffrScores.foundation_score < 30) {
      content.push({
        title: 'Building Your Financial Foundation',
        description: 'Essential steps for financial security including emergency funds and insurance',
        type: 'video',
        icon: <Video className="w-5 h-5" />,
        duration: '12 min',
        level: 'Beginner',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 dark:bg-blue-950/20'
      });
    }
    
    if (!ffrScores || ffrScores.habit_score < 20) {
      content.push({
        title: 'Mastering the SIP Habit',
        description: 'How to maintain consistent investments and build long-term wealth',
        type: 'article',
        icon: <FileText className="w-5 h-5" />,
        duration: '8 min read',
        level: 'Beginner',
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-950/20'
      });
    }
    
    if (!ffrScores || ffrScores.literacy_score < 15) {
      content.push({
        title: 'Understanding Mutual Funds',
        description: 'Learn about equity, debt, and hybrid funds for different goals',
        type: 'explainer',
        icon: <BookOpen className="w-5 h-5" />,
        duration: '15 min',
        level: 'Intermediate',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50 dark:bg-purple-950/20'
      });
    }
    
    content.push({
      title: 'Tax-Efficient Investing',
      description: 'Maximize returns by understanding LTCG, STCG, and tax-saving investments',
      type: 'video',
      icon: <Video className="w-5 h-5" />,
      duration: '10 min',
      level: 'Intermediate',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20'
    });
    
    return content;
  };

  const recommendedContent = getRecommendedContent();

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Your Learning Path
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Personalized content to fill knowledge gaps
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard/tools/ffr/learn">
              View All Content
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendedContent.map((item, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg border-2 ${item.bgColor} border-current/10 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className={`${item.color} mt-1`}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{item.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="capitalize">{item.type}</span>
                    <span>•</span>
                    <span>{item.duration}</span>
                    <span>•</span>
                    <span>{item.level}</span>
                  </div>
                </div>
              </div>
              <Button size="sm" variant="ghost" className={item.color}>
                <Play className="w-4 h-4 mr-1" />
                Start
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};