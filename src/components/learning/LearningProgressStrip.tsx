import { LearningSeries } from "@/types/learning";
import { getSeriesVideos } from "@/utils/learningUtils";

interface LearningProgressStripProps {
  series: LearningSeries;
  completedVideoIds: string[];
  activeVideoId?: string;
}

export const LearningProgressStrip = ({
  series,
  completedVideoIds,
  activeVideoId,
}: LearningProgressStripProps) => {
  const videoIds = getSeriesVideos(series).map((video) => video.videoId);

  return (
    <div className="flex flex-wrap gap-1.5">
      {videoIds.map((videoId) => {
        const isCompleted = completedVideoIds.includes(videoId);
        const isActive = activeVideoId === videoId;

        return (
          <span
            key={videoId}
            className={`h-2.5 flex-1 min-w-[16px] rounded-full transition-colors ${
              isActive
                ? "bg-primary"
                : isCompleted
                  ? "bg-primary/60"
                  : "bg-muted"
            }`}
            aria-label={
              isCompleted
                ? "Completed video"
                : isActive
                  ? "Current video"
                  : "Remaining video"
            }
          />
        );
      })}
    </div>
  );
};
