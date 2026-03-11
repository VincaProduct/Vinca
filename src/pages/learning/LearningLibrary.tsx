import CanonicalPageHeader from '@/components/ui/CanonicalPageHeader';
import { useMemo } from "react";
import { videoSeries } from "@/data/investorHub/resourcesData";
import { useLearningProgress } from "@/hooks/useLearningProgress";
import { LearningSeriesCard } from "@/components/learning/LearningSeriesCard";
import {
  getSeriesProgress,
  getSeriesStatus,
  getSeriesVideos,
} from "@/utils/learningUtils";
import { LearningSeries } from "@/types/learning";
import { useNavigate } from "react-router-dom";

const LearningLibrary = () => {
  const navigate = useNavigate();
  const { progress } = useLearningProgress();
  const seriesList = useMemo(() => {
    const primarySeries = videoSeries.find((series) => series.id === "wealth-secret");
    const sampleSeries = videoSeries.find((series) => series.id === "sample-series");
    return [primarySeries, sampleSeries].filter(Boolean) as LearningSeries[];
  }, []);

  const findSeriesStartTarget = (series: LearningSeries) => {
    const firstVideo = getSeriesVideos(series)[0];
    if (!firstVideo) return null;
    return { seriesId: series.id, videoId: firstVideo.videoId };
  };

  return (
    <div className="space-y-6">
      <CanonicalPageHeader
        title="Learning Library"
        children={<p className="text-sm text-muted-foreground mt-1">Two focused series to start now.</p>}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {seriesList.map((series) => {
          const status = getSeriesStatus(series, progress);
          const progressData = getSeriesProgress(series, progress);
          const startTarget = findSeriesStartTarget(series);

          return (
            <LearningSeriesCard
              key={series.id}
              series={series}
              status={status}
              progressPercent={progressData.percent}
              onStart={() => {
                if (startTarget) {
                  navigate(
                    `/dashboard/learning/series/${startTarget.seriesId}/video/${startTarget.videoId}`
                  );
                } else {
                  navigate(`/dashboard/learning/series/${series.id}`);
                }
              }}
              onViewDetails={() => navigate(`/dashboard/learning/series/${series.id}`)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default LearningLibrary;
