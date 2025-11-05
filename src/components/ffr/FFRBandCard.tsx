import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { FFRScoringEngine } from '@/utils/ffrScoring';
import type { FFRScore } from '@/types/ffr';

interface FFRBandCardProps {
  scores: FFRScore;
  className?: string;
}

export const FFRBandCard = ({ scores, className }: FFRBandCardProps) => {
  const baseBand = FFRScoringEngine.getFFRBand(scores.base);
  const conservativeBand = FFRScoringEngine.getFFRBand(scores.conservative);
  const optimisticBand = FFRScoringEngine.getFFRBand(scores.optimistic);

  const getScoreIcon = (score: number, baseScore: number) => {
    if (score > baseScore) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (score < baseScore) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  return (
    <Card className={`bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 ${className}`}>
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center">
          Financial Freedom Readiness (FFR)
        </CardTitle>
        <div className="text-center">
          <Badge variant="outline" className={`${baseBand.color} border-current`}>
            {baseBand.band}
          </Badge>
          <p className="text-sm text-muted-foreground mt-2">{baseBand.description}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-background/50">
            <div className="flex items-center justify-center gap-1 mb-1">
              {getScoreIcon(scores.conservative, scores.base)}
              <span className="text-lg font-bold">{scores.conservative}</span>
            </div>
            <p className="text-xs text-muted-foreground">Conservative</p>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-2xl font-bold text-primary">{scores.base}</span>
            </div>
            <p className="text-xs font-medium">Base Score</p>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-background/50">
            <div className="flex items-center justify-center gap-1 mb-1">
              {getScoreIcon(scores.optimistic, scores.base)}
              <span className="text-lg font-bold">{scores.optimistic}</span>
            </div>
            <p className="text-xs text-muted-foreground">Optimistic</p>
          </div>
        </div>

        <div className="text-center">
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(scores.base, 10)}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Range: {scores.conservative}–{scores.optimistic}/100
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
          <p className="text-xs text-amber-800 font-medium">
            📚 Educational & execution-only. No investment advice.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};