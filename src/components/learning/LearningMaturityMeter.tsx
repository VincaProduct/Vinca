import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getProgressToNextAchievement } from "@/utils/learningUtils";
import { Link } from "react-router-dom";

interface LearningMaturityMeterProps {
  totalPoints: number;
  latestAchievementLabel: string;
  nextAchievementLabel: string;
}

const ProgressRing = ({ value }: { value: number }) => {
  const size = 64;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stroke-primary transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold text-foreground">{value}%</span>
      </div>
    </div>
  );
};

export const LearningMaturityMeter = ({
  totalPoints,
  latestAchievementLabel,
  nextAchievementLabel,
}: LearningMaturityMeterProps) => {
  const progress = getProgressToNextAchievement(totalPoints);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="p-4 space-y-2">
          <p className="text-xs uppercase text-muted-foreground tracking-wide">
            Total Learning Points
          </p>
          <p className="text-lg font-semibold text-foreground">{totalPoints}</p>
          <p className="text-xs text-muted-foreground">Points earned</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 space-y-2">
          <p className="text-xs uppercase text-muted-foreground tracking-wide">
            Latest Achievement
          </p>
          <p className="text-lg font-semibold text-foreground">{latestAchievementLabel}</p>
            {latestAchievementLabel === "None yet" ? (
              <Link
                to="/dashboard/learning/achievements"
                className="text-xs font-medium text-green-600 hover:text-green-700 mt-1"
              >
                View Learning Ladder
              </Link>
            ) : null}
            {latestAchievementLabel !== "None yet" && (
              <Link
                to="/dashboard/learning/achievements"
                className="text-sm font-medium text-primary hover:text-primary/80"
              >
                View Learning Ladder
              </Link>
            )}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 space-y-2">
          <p className="text-xs uppercase text-muted-foreground tracking-wide">
            Progress to Next Achievement
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{nextAchievementLabel}</span>
            <span>{progress.percent}%</span>
          </div>
          <Progress value={progress.percent} />
        </CardContent>
      </Card>
    </div>
  );
};
