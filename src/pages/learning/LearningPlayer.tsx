import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  completeVideo,
  getNextAchievement,
  getSeriesVideos,
  markSeriesWatched,
} from "@/utils/learningUtils";
import { toast } from "@/components/ui/sonner";

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const getSeriesById = (seriesId?: string) =>
  videoSeries.find((series) => series.id === seriesId);

const getVideoById = (series: LearningSeries, videoId?: string) => {
  const videos = getSeriesVideos(series);
  return videos.find((video) => video.videoId === videoId) ?? videos[0] ?? null;
};

const getVideoOrder = (series: LearningSeries) =>
  getSeriesVideos(series).map((video) => video.videoId);

const getNextVideoId = (series: LearningSeries, currentId: string) => {
  const order = getVideoOrder(series);
  const index = order.indexOf(currentId);
  if (index === -1 || index === order.length - 1) return null;
  return order[index + 1];
};

const loadYouTubeAPI = () => {
  return new Promise<void>((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }

    const existingScript = document.getElementById("youtube-iframe-api");
    if (!existingScript) {
      const tag = document.createElement("script");
      tag.id = "youtube-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }

    window.onYouTubeIframeAPIReady = () => resolve();
  });
};

const getProgressKey = (videoId: string) => `video-${videoId}-progress`;


const LearningPlayer = () => {
  const { seriesId, videoId } = useParams();
  const navigate = useNavigate();
  const { progress, setProgress } = useLearningProgress();
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [completionMarked, setCompletionMarked] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const youTubePlayerRef = useRef<any>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const lastTrackedTimeRef = useRef(0);
  const seekedForwardRef = useRef(false);

  const series = getSeriesById(seriesId);

  const video = useMemo(() => {
    if (!series) return null;
    return getVideoById(series, videoId) ?? null;
  }, [series, videoId]);

  const isYouTubeVideo = useMemo(
    () => Boolean(video?.youtubeId || video?.embedUrl?.includes("youtube.com")),
    [video?.embedUrl, video?.youtubeId]
  );

  const youtubeVideoId = useMemo(() => {
    if (video?.youtubeId) return video.youtubeId;
    if (video?.embedUrl) {
      try {
        const url = new URL(video.embedUrl);
        const parts = url.pathname.split("/");
        return parts.pop() || null;
      } catch (err) {
        return null;
      }
    }
    return null;
  }, [video?.embedUrl, video?.youtubeId]);

  const completedVideoIds = series
    ? progress.seriesProgress[series.id]?.completedVideoIds ?? []
    : [];

  const isCompleted = useMemo(() => {
    if (!video) return false;
    return completedVideoIds.includes(video.videoId);
  }, [completedVideoIds, video]);

  useEffect(() => {
    if (!series || !video) return;
    setCurrentTime(0);
    setDuration(0);
    setCompletionMarked(false);
    if (youTubePlayerRef.current) {
      youTubePlayerRef.current.destroy?.();
      youTubePlayerRef.current = null;
    }
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    lastTrackedTimeRef.current = 0;
    seekedForwardRef.current = false;
    setProgress((prev) => markSeriesWatched(prev, series.id, video.videoId));
  }, [series?.id, video?.videoId, setProgress]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const loadSavedProgress = useCallback((id?: string) => {
    if (!id) return 0;
    const raw = sessionStorage.getItem(getProgressKey(id));
    const value = Number(raw);
    return Number.isFinite(value) ? value : 0;
  }, []);

  const persistProgress = useCallback((id: string, time: number) => {
    if (!id) return;
    sessionStorage.setItem(getProgressKey(id), String(time));
  }, []);

  const handleVideoComplete = useCallback(() => {
    if (!series || !video) return;
    if (completionMarked || isCompleted) return;

    const { nextProgress, seriesCompleted, newAchievement } = completeVideo({
      progress,
      series,
      videoId: video.videoId,
    });

    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    setCompletionMarked(true);
    setProgress(nextProgress);

    if (newAchievement) {
      toast(newAchievement.name, {
        description: "Achievement unlocked",
        duration: 4500,
      });
    }

    if (seriesCompleted) {
      setCompletionModalOpen(true);
    }
  }, [completionMarked, isCompleted, progress, series, setProgress, video]);

  const startProgressTracking = useCallback(
    (getTimes: () => { current: number; total: number }) => {
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }

      progressIntervalRef.current = window.setInterval(() => {
        const { current, total } = getTimes();
        if (!total) return;

        setCurrentTime(current);
        setDuration(total);
        persistProgress(video?.videoId ?? "", current);

        const delta = current - lastTrackedTimeRef.current;
        if (delta > 15) {
          seekedForwardRef.current = true;
        }
        lastTrackedTimeRef.current = current;

        const percent = (current / total) * 100;
        if (percent >= 95 && !completionMarked && !isCompleted && !seekedForwardRef.current) {
          handleVideoComplete();
        }
      }, 2000);
    },
    [completionMarked, handleVideoComplete, isCompleted, persistProgress, video?.videoId]
  );

  useEffect(() => {
    let isMounted = true;

    const setupYouTubePlayer = async () => {
      if (!isYouTubeVideo || !youtubeVideoId) return;

      await loadYouTubeAPI();
      if (!isMounted || !playerContainerRef.current) return;

      youTubePlayerRef.current = new window.YT.Player(playerContainerRef.current, {
        videoId: youtubeVideoId,
        playerVars: {
          controls: 1,
          disablekb: 0,
          fs: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: (event: any) => {
            const saved = loadSavedProgress(video?.videoId);
            const duration = event?.target?.getDuration?.() ?? 0;
            if (saved && duration && saved < duration * 0.95) {
              event.target.seekTo(saved, true);
              lastTrackedTimeRef.current = saved;
            } else {
              lastTrackedTimeRef.current = 0;
            }

            startProgressTracking(() => ({
              current: event?.target?.getCurrentTime?.() ?? 0,
              total: event?.target?.getDuration?.() ?? 0,
            }));
          },
          onStateChange: (event: any) => {
            const playerState = window.YT?.PlayerState;
            if (!playerState) return;

            if (event?.data === playerState.ENDED) {
              handleVideoComplete();
            }

            if (event?.data === playerState.PLAYING) {
              startProgressTracking(() => ({
                current: event?.target?.getCurrentTime?.() ?? 0,
                total: event?.target?.getDuration?.() ?? 0,
              }));
            }
          },
        },
      });
    };

    setupYouTubePlayer();

    return () => {
      isMounted = false;
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (youTubePlayerRef.current) {
        youTubePlayerRef.current.destroy?.();
        youTubePlayerRef.current = null;
      }
    };
  }, [handleVideoComplete, isYouTubeVideo, loadSavedProgress, startProgressTracking, video?.videoId, youtubeVideoId]);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (youTubePlayerRef.current) {
        youTubePlayerRef.current.destroy?.();
        youTubePlayerRef.current = null;
      }
    };
  }, []);

  if (!isHydrated) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-4 space-y-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-48 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
          <Card>
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!series || !video) {
    return (
      <Card>
        <CardContent className="py-10 text-center space-y-3">
          <p className="text-sm text-muted-foreground">Video not found.</p>
          <Button onClick={() => navigate("/dashboard/learning")}>Back to Learning</Button>
        </CardContent>
      </Card>
    );
  }

  const seriesOrder = getVideoOrder(series);
  const nextVideoId = getNextVideoId(series, video.videoId);
  const nextAchievement = getNextAchievement(progress.totalLearningPoints);

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
            <BreadcrumbLink asChild>
              <Link to={`/dashboard/learning/series/${series.id}`}>{series.title}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{video.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">


              <div className="overflow-hidden rounded-lg border">
                {isYouTubeVideo && youtubeVideoId ? (
                  <div className="relative w-full h-64 sm:h-72 md:h-80 lg:h-96 bg-black">
                    <div ref={playerContainerRef} className="absolute inset-0 h-full w-full" />
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    src={video.sample_video || video.contentUrl}
                    poster={video.sample_thumbnail}
                    className="w-full bg-black h-64 sm:h-72 md:h-80 lg:h-96"
                    controls
                    playsInline
                    onLoadedMetadata={(event) => {
                      const dur = event.currentTarget.duration;
                      setDuration(dur);
                      const saved = loadSavedProgress(video.videoId);
                      if (saved && dur && saved < dur * 0.95) {
                        event.currentTarget.currentTime = saved;
                        lastTrackedTimeRef.current = saved;
                      } else {
                        lastTrackedTimeRef.current = 0;
                      }
                    }}
                    onPlay={() =>
                      startProgressTracking(() => ({
                        current: videoRef.current?.currentTime ?? 0,
                        total: videoRef.current?.duration ?? 0,
                      }))
                    }
                    onTimeUpdate={(event) => {
                      const current = event.currentTarget.currentTime;
                      const total = event.currentTarget.duration;
                      setCurrentTime(current);
                      setDuration(total);
                      persistProgress(video.videoId, current);
                      const delta = current - lastTrackedTimeRef.current;
                      if (delta > 15) {
                        seekedForwardRef.current = true;
                      }
                      lastTrackedTimeRef.current = current;
                      const percent = total ? (current / total) * 100 : 0;
                      if (percent >= 95 && !completionMarked && !isCompleted && !seekedForwardRef.current) {
                        handleVideoComplete();
                      }
                    }}
                    onEnded={handleVideoComplete}
                  />
                )}
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Next up</p>
              {nextVideoId ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    {getVideoById(series, nextVideoId)?.title}
                  </p>
                  <Button
                    onClick={() =>
                      navigate(`/dashboard/learning/series/${series.id}/video/${nextVideoId}`)
                    }
                    disabled={!isCompleted}
                  >
                    Next up
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                  {!isCompleted && (
                    <p className="text-xs text-muted-foreground">Finish this video to unlock next.</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">This is the final video.</p>
              )}
            </CardContent>
          </Card>



          <div className="w-full">
            <Button
              variant="outline"
              onClick={() => navigate(`/dashboard/learning/series/${series.id}`)}
              className="w-full"
            >
              Back to series
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={completionModalOpen} onOpenChange={setCompletionModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Series completed</AlertDialogTitle>
            <AlertDialogDescription>
              You have finished {series.title}. {series.pointValue} points added.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCompletionModalOpen(false)}>
              Back to series
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate("/dashboard/learning/achievements")}>
              View achievements
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LearningPlayer;
