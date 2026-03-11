import CanonicalPageHeader from '@/components/ui/CanonicalPageHeader';
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Play } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { videoSeries } from "@/data/investorHub/resourcesData";
import { useLearningProgress } from "@/hooks/useLearningProgress";
import { LearningSeries } from "@/types/learning";
import {
  getSeriesLastWatched,
  getSeriesProgress,
  getSeriesStatus,
  getSeriesTotalPoints,
  getSeriesVideos,
} from "@/utils/learningUtils";

const getSeriesById = (seriesId?: string) =>
  videoSeries.find((series) => series.id === seriesId);

const getResumeVideoId = (series: LearningSeries, lastWatchedVideoId?: string) => {
  if (lastWatchedVideoId) return lastWatchedVideoId;
  return getSeriesVideos(series)[0]?.videoId;
};

const LearningSeriesDetail = () => {
  const { seriesId } = useParams();
  const navigate = useNavigate();
  const { progress } = useLearningProgress();
  const [isHydrated, setIsHydrated] = useState(false);

  const series = getSeriesById(seriesId);
  const seriesProgress = series ? getSeriesProgress(series, progress) : null;
  const lastWatchedVideoId = series ? getSeriesLastWatched(progress, series.id) : undefined;

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-5 space-y-3">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-40" />
          </CardContent>
        </Card>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Card>
            <CardContent className="p-5 space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </CardContent>
          </Card>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <Card>
        <CardContent className="py-10 text-center space-y-3">
          <p className="text-sm text-muted-foreground">Series not found.</p>
          <Button onClick={() => navigate("/dashboard/learning")}>Back to Learning</Button>
        </CardContent>
      </Card>
    );
  }

  const status = getSeriesStatus(series, progress);
  const resumeVideoId = getResumeVideoId(series, lastWatchedVideoId);
  const seriesVideos = getSeriesVideos(series);
  const totalPoints = getSeriesTotalPoints(series);
  const hasModules = series.modules.length > 0 && (!series.videos || series.videos.length === 0);
  const videoIndexMap = new Map(seriesVideos.map((video, index) => [video.videoId, index]));

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dashboard/learning">Learning</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{series.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="md:flex md:flex-col md:gap-4 flex flex-col gap-4">


        <CanonicalPageHeader
          title={series.title}
          children={
            <div className="flex flex-col md:flex-row md:items-center md:gap-4 gap-2">
              <div className="flex flex-row gap-2">
                <span className="px-3 py-1 text-xs bg-gray-100 rounded-full">{series.difficulty}</span>
                {series.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 text-xs bg-gray-100 rounded-full">{tag}</span>
                ))}
              </div>
              <span className="text-sm text-primary font-medium">{seriesVideos.length} videos · {totalPoints} total points</span>
            </div>
          }
        />

        {/* Status + CTA Row for desktop only */}
        <div className="hidden md:flex items-center gap-2">
          <span className="flex items-center justify-center w-24 h-9 text-xs bg-gray-100 rounded-full font-medium border border-gray-200">
            {status}
          </span>
          {resumeVideoId && (
            <Button
              size="sm"
              className="w-24 h-9 px-0"
              onClick={() =>
                navigate(`/dashboard/learning/series/${series.id}/video/${resumeVideoId}`)
              }
            >
              Resume
            </Button>
          )}
        </div>

        {/* Series Details for mobile (dropdown/accordion) */}
        <div className="block md:hidden">
          <Accordion type="single" collapsible defaultValue="series-details">
            <AccordionItem
              value="series-details"
              className="rounded-lg border bg-card"
            >
              <AccordionTrigger className="px-4 py-3 text-left no-underline hover:no-underline !no-underline">
                <span className="text-sm font-semibold text-foreground">
                  What you'll learn
                </span>
              </AccordionTrigger>

              <AccordionContent className="px-4 pb-4 pt-1">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {series.description}
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Status + CTA Row for mobile only */}
          <div className="flex items-center gap-2 mt-3">
            <span className="flex items-center justify-center w-24 h-9 text-xs bg-gray-100 rounded-full font-medium border border-gray-200">
              {status}
            </span>
            {resumeVideoId && (
              <Button
                size="sm"
                className="w-24 h-9 px-0"
                onClick={() =>
                  navigate(`/dashboard/learning/series/${series.id}/video/${resumeVideoId}`)
                }
              >
                Resume &rarr;
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card>
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              {hasModules ? "Modules" : "Videos"}
            </h2>
            {hasModules ? (
              <Accordion type="multiple" className="space-y-3">
                {series.modules.map((module) => (
                  <AccordionItem key={module.id} value={module.id} className="border-b-0">
                    <AccordionTrigger className="rounded-lg border px-4 py-3 text-left">
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded-full border border-muted-foreground/40" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{module.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {module.videos.length} videos
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-2">
                      <div className="space-y-2">
                        {module.videos.map((video) => {
                          const index = videoIndexMap.get(video.videoId) ?? 0;
                          const isCompleted =
                            progress.seriesProgress[series.id]?.completedVideoIds?.includes(
                              video.videoId
                            ) ?? false;
                          const achievementUnlocked =
                            progress.totalLearningPoints >= (index + 1) * series.pointsPerVideo;
                          const thumbnail = video.sample_thumbnail || "/sample_thumbnail.jpg";

                          return (
                            <button
                              key={video.videoId}
                              onClick={() =>
                                navigate(
                                  `/dashboard/learning/series/${series.id}/video/${video.videoId}`
                                )
                              }
                              className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg border px-3 py-2 text-left hover:bg-accent transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-12 w-20 overflow-hidden rounded-md bg-muted">
                                  <img
                                    src={thumbnail}
                                    alt={`${video.title} thumbnail`}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                  />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-foreground">
                                    {video.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {series.pointsPerVideo} points available
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                {isCompleted ? (
                                  <span className="flex items-center gap-1 text-emerald-600">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Completed
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <Play className="h-3.5 w-3.5 text-primary" />
                                    Play
                                  </span>
                                )}
                                <span>
                                  {achievementUnlocked
                                    ? "Achievement unlocked"
                                    : "Achievement locked"}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="space-y-3">
                {seriesVideos.map((video, index) => {
                  const isCompleted =
                    progress.seriesProgress[series.id]?.completedVideoIds?.includes(video.videoId) ??
                    false;
                  const achievementUnlocked =
                    progress.totalLearningPoints >= (index + 1) * series.pointsPerVideo;
                  const thumbnail = video.sample_thumbnail || "/sample_thumbnail.jpg";

                  return (
                    <button
                      key={video.videoId}
                      onClick={() =>
                        navigate(`/dashboard/learning/series/${series.id}/video/${video.videoId}`)
                      }
                      className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg border p-3 text-left hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-24 overflow-hidden rounded-md bg-muted">
                          <img
                            src={thumbnail}
                            alt={`${video.title} thumbnail`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{video.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {series.pointsPerVideo} points available
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {isCompleted ? (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <CheckCircle2 className="h-4 w-4" />
                            Completed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Play className="h-3.5 w-3.5 text-primary" />
                            Play
                          </span>
                        )}
                        <span>
                          {achievementUnlocked ? "Achievement unlocked" : "Achievement locked"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {/* Series Details for desktop (sidebar) */}
          <div className="hidden md:block">
            <Card>
              <CardContent className="p-4 space-y-3">
                <p className="text-sm font-semibold text-foreground">Series Details</p>
                <p className="text-sm text-muted-foreground">{series.description}</p>
                {/* Progress and total points removed as requested */}
              </CardContent>
            </Card>
          </div>

          {/* Next achievement card removed as requested */}
        </div>
      </div>
    </div>
  );
};

export default LearningSeriesDetail;
