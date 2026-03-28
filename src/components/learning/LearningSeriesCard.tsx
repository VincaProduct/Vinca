import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LearningSeries } from "@/types/learning";
import { getSeriesTotalPoints, getSeriesVideos } from "@/utils/learningUtils";

interface LearningSeriesCardProps {
  series: LearningSeries;
  status: "Not Started" | "In Progress" | "Completed";
  progressPercent: number;
  onStart: () => void;
  onViewDetails: () => void;
}

const SeriesProgressRing = ({ value }: { value: number }) => {
  const size = 44;
  const strokeWidth = 4;
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
        <span className="text-[10px] font-semibold text-foreground">{value}%</span>
      </div>
    </div>
  );
};

export const LearningSeriesCard = ({
  series,
  status,
  progressPercent,
  onStart,
  onViewDetails,
}: LearningSeriesCardProps) => {
  const actionLabel = status === "Not Started" ? "Start Series" : "Continue";
  const seriesVideos = getSeriesVideos(series);
  const totalVideos = seriesVideos.length;
  const totalPoints = getSeriesTotalPoints(series);
  const thumbnail = seriesVideos[0]?.sample_thumbnail || "/sample_thumbnail.jpg";

  return (
    <Card className="h-full overflow-hidden">
      <div className="aspect-video bg-muted">
        <img
          src={thumbnail}
          alt={`${series.title} thumbnail`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <CardContent className="p-4 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-foreground">{series.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{series.description}</p>
          </div>
          <SeriesProgressRing value={progressPercent} />
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>{totalVideos} videos</span>
          <span>{totalPoints} points available</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{status}</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onViewDetails}>
              View Details
            </Button>
            <Button size="sm" onClick={onStart}>
              {actionLabel}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
