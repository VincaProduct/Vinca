import { LearningDifficulty, LearningModule, LearningSeries, LearningVideo } from "@/types/learning";

const POINTS_BY_DIFFICULTY: Record<LearningDifficulty, number> = {
  Beginner: 10,
  Intermediate: 10,
  Advanced: 10,
};

const VIDEO_DURATIONS = [6, 7, 8];
const SAMPLE_VIDEO = "/sample_video.mp4";
const SAMPLE_THUMBNAIL = "/sample_thumbnail.jpg";

const buildVideos = (
  seriesId: string,
  moduleId: string,
  moduleTitle: string
): LearningVideo[] => {
  return VIDEO_DURATIONS.map((duration, index) => {
    const part = index + 1;
    const videoId = `${seriesId}-${moduleId}-v${part}`;

    return {
      videoId,
      title: `${moduleTitle} - Part ${part}`,
      duration,
      contentUrl: SAMPLE_VIDEO,
      sample_video: SAMPLE_VIDEO,
      sample_thumbnail: SAMPLE_THUMBNAIL,
    };
  });
};

const buildModule = (
  seriesId: string,
  moduleTitle: string,
  order: number
): LearningModule => {
  const moduleId = `m${order}`;
  const videos = buildVideos(seriesId, moduleId, moduleTitle);
  const totalDuration = videos.reduce((sum, video) => sum + video.duration, 0);

  return {
    id: moduleId,
    title: moduleTitle,
    description: `Module on ${moduleTitle}.`,
    order,
    totalDuration,
    videos,
  };
};

const buildSeries = (params: {
  id: string;
  title: string;
  difficulty: LearningDifficulty;
  description: string;
  tags: string[];
  moduleTitles: string[];
}): LearningSeries => {
  const modules = params.moduleTitles.map((title, index) =>
    buildModule(params.id, title, index + 1)
  );
  const totalDuration = modules.reduce((sum, module) => sum + module.totalDuration, 0);

  return {
    id: params.id,
    title: params.title,
    difficulty: params.difficulty,
    description: params.description,
    tags: params.tags,
    totalDuration,
    pointValue: POINTS_BY_DIFFICULTY[params.difficulty],
    pointsPerVideo: POINTS_BY_DIFFICULTY[params.difficulty],
    modules,
  };
};

const buildSeriesVideos = (seriesId: string, count: number): LearningVideo[] => {
  return Array.from({ length: count }).map((_, index) => {
    const part = index + 1;
    const youtubeId = part === 1 ? "r_NjOBQ8fCU" : undefined;
    const embedUrl = youtubeId
      ? `https://www.youtube.com/embed/${youtubeId}?autoplay=0`
      : undefined;
    const thumbnail = youtubeId
      ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
      : SAMPLE_THUMBNAIL;
    const videoId = youtubeId ?? `${seriesId}-v${part}`;

    return {
      videoId,
      title: `Wealth Secret ${part}`,
      duration: 7,
      contentUrl: embedUrl ?? SAMPLE_VIDEO,
      youtubeId,
      embedUrl,
      sample_video: youtubeId ? undefined : SAMPLE_VIDEO,
      sample_thumbnail: thumbnail,
    };
  });
};

export const videoSeries: LearningSeries[] = [
  {
    id: "wealth-secret",
    title: "Wealth Secret Series",
    difficulty: "Beginner",
    description: "Eleven focused wealth secrets in a single, sequential series.",
    tags: ["Wealth", "Secrets"],
    totalDuration: 77,
    pointValue: 10,
    pointsPerVideo: 10,
    modules: [],
    videos: buildSeriesVideos("wealth-secret", 11),
  },
  buildSeries({
    id: "sample-series",
    title: "Sample Series",
    difficulty: "Beginner",
    description: "Module-based demo series with minimal mock data.",
    tags: ["Sample", "Demo"],
    moduleTitles: ["Sample Module 1", "Sample Module 2"],
  }),
];
