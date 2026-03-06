import CanonicalPageHeader from '@/components/ui/CanonicalPageHeader';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LearningMaturityMeter } from "@/components/learning/LearningMaturityMeter";
import { LearningSeriesCard } from "@/components/learning/LearningSeriesCard";
import { videoSeries } from "@/data/investorHub/resourcesData";
import { useLearningProgress } from "@/hooks/useLearningProgress";
import { LearningSeries } from "@/types/learning";
import {
  getLatestAchievement,
  getNextAchievement,
  getSeriesVideos,
  getSeriesProgress,
  getSeriesStatus,
} from "@/utils/learningUtils";

const findSeriesStartTarget = (series: LearningSeries) => {
  const firstVideo = getSeriesVideos(series)[0];
  if (!firstVideo) return null;
  return { seriesId: series.id, videoId: firstVideo.videoId };
};

const LearningHome = () => {
    const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const navigate = useNavigate();
  const { progress } = useLearningProgress();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const latestAchievement = getLatestAchievement(progress.totalLearningPoints);
  const nextAchievement = getNextAchievement(progress.totalLearningPoints);
  const primarySeries = videoSeries.find((series) => series.id === "wealth-secret");
  const sampleSeries = videoSeries.find((series) => series.id === "sample-series");
  const seriesList = [primarySeries, sampleSeries].filter(Boolean) as LearningSeries[];

  const handleContinue = () => {
    const lastSeriesId = progress.lastStartedSeriesId;
    const lastVideoId = progress.lastStartedVideoId;

    if (lastSeriesId && lastVideoId) {
      navigate(`/dashboard/learning/series/${lastSeriesId}/video/${lastVideoId}`);
      return;
    }

    if (lastSeriesId) {
      navigate(`/dashboard/learning/series/${lastSeriesId}`);
      return;
    }

    const firstSeries = videoSeries[0];
    if (!firstSeries) return;

    const startTarget = findSeriesStartTarget(firstSeries);
    if (startTarget) {
      navigate(`/dashboard/learning/series/${startTarget.seriesId}/video/${startTarget.videoId}`);
    } else {
      navigate(`/dashboard/learning/series/${firstSeries.id}`);
    }
  };

  const renderSkeletonGrid = () => (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 2 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-28" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      <CanonicalPageHeader
        title="Concepts that leads to financial readiness"
      />

      {/* Collapsible Financial Maturity Dashboard */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <button
          type="button"
          className="w-full flex items-center justify-between px-6 py-2 md:py-4 md:text-lg text-left text-sm font-medium md:font-semibold md:text-center rounded-t-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
          aria-expanded={isDashboardOpen}
          onClick={() => setIsDashboardOpen((open) => !open)}
        >
          <span className="text-sm md:text-lg font-medium md:font-semibold text-foreground text-left md:text-center">Your Financial Maturity Dashboard</span>
          <svg
            className={`w-4 h-4 md:w-5 md:h-5 ml-2 transition-transform duration-200 ${isDashboardOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-label={isDashboardOpen ? 'Collapse dashboard' : 'Expand dashboard'}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div
          className={`overflow-hidden transition-all duration-300 ${isDashboardOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'} px-6`}
          aria-hidden={!isDashboardOpen}
        >
          <div className="py-4">
            <LearningMaturityMeter
              totalPoints={progress.totalLearningPoints}
              latestAchievementLabel={latestAchievement?.name ?? "None yet"}
              nextAchievementLabel={nextAchievement?.name ?? "All achieved"}
            />
          </div>
        </div>
      </div>

      {/* Sticky CTA for mobile only */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-sm border-t shadow-lg pb-safe z-20">
        <Button className="w-full rounded-none h-12 text-base font-semibold" onClick={handleContinue}>
          Continue Learning
        </Button>
      </div>

      {isHydrated ? (
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
                      `/dashboard/learning/series/${series.id}/video/${startTarget.videoId}`
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
      ) : (
        renderSkeletonGrid()
      )}
    </div>
  );
};

export default LearningHome;
