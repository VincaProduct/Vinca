import {
  LearningAchievement,
  LearningDifficulty,
  LearningProgress,
  LearningSeries,
  LearningSeriesProgress,
  LearningVideo,
} from "@/types/learning";

export const LEARNING_STORAGE_KEY = "financialMaturity";
export const LEARNING_FILTERS_KEY = "learningFilters";
export const LEARNING_LIBRARY_SORT_KEY = "learningLibrarySort";

export const DIFFICULTY_ORDER: LearningDifficulty[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

export const POINTS_BY_DIFFICULTY: Record<LearningDifficulty, number> = {
  Beginner: 10,
  Intermediate: 20,
  Advanced: 30,
};

export const ACHIEVEMENTS: LearningAchievement[] = [
  {
    id: "level-1",
    level: 1,
    name: "First Step",
    pointsRequired: 10,
    description: "Begin your learning journey",
  },
  {
    id: "level-2",
    level: 2,
    name: "Learning Starter",
    pointsRequired: 25,
    description: "Build initial momentum",
  },
  {
    id: "level-3",
    level: 3,
    name: "Consistent Learner",
    pointsRequired: 50,
    description: "Demonstrate learning consistency",
  },
  {
    id: "level-4",
    level: 4,
    name: "Knowledge Builder",
    pointsRequired: 75,
    description: "Expand your financial knowledge",
  },
  {
    id: "level-5",
    level: 5,
    name: "Awareness Strong",
    pointsRequired: 100,
    description: "Develop strong financial awareness",
  },
  {
    id: "level-6",
    level: 6,
    name: "Discipline Formed",
    pointsRequired: 150,
    description: "Apply disciplined learning approach",
  },
  {
    id: "level-7",
    level: 7,
    name: "Strategy Mindset",
    pointsRequired: 200,
    description: "Think strategically about finances",
  },
  {
    id: "level-8",
    level: 8,
    name: "Financial Explorer",
    pointsRequired: 275,
    description: "Explore advanced financial topics",
  },
  {
    id: "level-9",
    level: 9,
    name: "Advanced Learner",
    pointsRequired: 350,
    description: "Master advanced concepts",
  },
  {
    id: "level-10",
    level: 10,
    name: "Financially Mature",
    pointsRequired: 450,
    description: "Achieve comprehensive financial maturity",
  },
];

const safeJsonParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const getDefaultLearningProgress = (): LearningProgress => ({
  totalLearningPoints: 0,
  completedSeries: [],
  seriesProgress: {},
  achievementUnlocks: {},
});

export const loadLearningProgress = (): LearningProgress => {
  const stored = safeJsonParse<Partial<LearningProgress>>(
    localStorage.getItem(LEARNING_STORAGE_KEY),
    {}
  );

  return {
    ...getDefaultLearningProgress(),
    ...stored,
    completedSeries: stored.completedSeries ?? [],
    seriesProgress: stored.seriesProgress ?? {},
    achievementUnlocks: stored.achievementUnlocks ?? {},
  };
};

export const saveLearningProgress = (progress: LearningProgress) => {
  localStorage.setItem(LEARNING_STORAGE_KEY, JSON.stringify(progress));
};

export const loadLearningFilters = (): {
  difficulties: LearningDifficulty[];
  query: string;
} => {
  return safeJsonParse(
    localStorage.getItem(LEARNING_FILTERS_KEY),
    { difficulties: [], query: "" }
  );
};

export const saveLearningFilters = (filters: {
  difficulties: LearningDifficulty[];
  query: string;
}) => {
  localStorage.setItem(LEARNING_FILTERS_KEY, JSON.stringify(filters));
};

export const loadLearningLibrarySort = () => {
  return safeJsonParse<string | null>(localStorage.getItem(LEARNING_LIBRARY_SORT_KEY), null);
};

export const saveLearningLibrarySort = (value: string) => {
  localStorage.setItem(LEARNING_LIBRARY_SORT_KEY, JSON.stringify(value));
};

export const getSeriesProgress = (
  series: LearningSeries,
  progress: LearningProgress
) => {
  const totalVideos = getSeriesVideos(series).length;
  const seriesProgress = progress.seriesProgress[series.id];
  const completedVideoIds = seriesProgress?.completedVideoIds ?? [];
  const completedVideos = completedVideoIds.length;

  return {
    totalVideos,
    completedVideos,
    percent: totalVideos === 0 ? 0 : Math.round((completedVideos / totalVideos) * 100),
  };
};

export const getSeriesStatus = (
  series: LearningSeries,
  progress: LearningProgress
) => {
  const completion = getSeriesProgress(series, progress);
  if (completion.percent === 100) return "Completed" as const;
  if (completion.completedVideos > 0) return "In Progress" as const;
  return "Not Started" as const;
};

export const getLatestAchievement = (totalPoints: number) => {
  let latest: LearningAchievement | null = null;
  ACHIEVEMENTS.forEach((achievement) => {
    if (totalPoints >= achievement.pointsRequired) {
      latest = achievement;
    }
  });
  return latest;
};

export const getNextAchievement = (totalPoints: number) => {
  return ACHIEVEMENTS.find((achievement) => totalPoints < achievement.pointsRequired) ?? null;
};

export const getProgressToNextAchievement = (totalPoints: number) => {
  const latest = getLatestAchievement(totalPoints);
  const next = getNextAchievement(totalPoints);

  if (!next) {
    return { percent: 100, label: "All achieved!" };
  }

  if (!latest) {
    const percent = Math.round((totalPoints / next.pointsRequired) * 100);
    return { percent, label: `0 / ${next.pointsRequired} points` };
  }

  const previousLevelRequired = latest.pointsRequired;
  const percentRaw =
    (totalPoints - previousLevelRequired) /
    (next.pointsRequired - previousLevelRequired);
  const percent = Math.round(Math.min(1, Math.max(0, percentRaw)) * 100);

  return { percent, label: `${percent}% to ${next.name}` };
};

export const getSeriesLastWatched = (
  progress: LearningProgress,
  seriesId: string
) => {
  return progress.seriesProgress[seriesId]?.lastWatchedVideoId;
};

export const getSeriesVideos = (series: LearningSeries): LearningVideo[] => {
  if (series.videos && series.videos.length > 0) {
    return series.videos;
  }

  return series.modules.flatMap((module) => module.videos);
};

export const markSeriesWatched = (
  progress: LearningProgress,
  seriesId: string,
  videoId: string
) => {
  const existing: LearningSeriesProgress = progress.seriesProgress[seriesId] ?? {
    completedVideoIds: [],
  };

  return {
    ...progress,
    lastStartedSeriesId: seriesId,
    lastStartedVideoId: videoId,
    seriesProgress: {
      ...progress.seriesProgress,
      [seriesId]: {
        ...existing,
        lastWatchedVideoId: videoId,
        lastWatchedAt: new Date().toISOString(),
      },
    },
  };
};

export const getFlattenedVideoIds = (series: LearningSeries) => {
  return getSeriesVideos(series).map((video) => video.videoId);
};

export const isSeriesCompleted = (
  series: LearningSeries,
  progress: LearningProgress
) => {
  const seriesProgress = progress.seriesProgress[series.id];
  const completedVideoIds = seriesProgress?.completedVideoIds ?? [];
  const totalVideos = getFlattenedVideoIds(series).length;
  return totalVideos > 0 && completedVideoIds.length === totalVideos;
};

export const getSeriesTotalPoints = (series: LearningSeries) => {
  const totalVideos = getSeriesVideos(series).length;
  return totalVideos * series.pointsPerVideo;
};

export const completeVideo = (params: {
  progress: LearningProgress;
  series: LearningSeries;
  videoId: string;
}) => {
  const { progress, series, videoId } = params;
  const seriesProgress = progress.seriesProgress[series.id] ?? {
    completedVideoIds: [],
  };
  const alreadyCompleted = seriesProgress.completedVideoIds.includes(videoId);

  if (alreadyCompleted) {
    return { nextProgress: progress, seriesCompleted: false, newAchievement: null };
  }

  const updatedSeriesProgress: LearningSeriesProgress = {
    ...seriesProgress,
    completedVideoIds: [...seriesProgress.completedVideoIds, videoId],
  };

  const pointsEarned = series.pointsPerVideo;
  const previousPoints = progress.totalLearningPoints;
  const totalLearningPoints = previousPoints + pointsEarned;
  const previousAchievement = getLatestAchievement(previousPoints);
  const newAchievement = getLatestAchievement(totalLearningPoints);

  let nextProgress: LearningProgress = {
    ...progress,
    totalLearningPoints,
    seriesProgress: {
      ...progress.seriesProgress,
      [series.id]: updatedSeriesProgress,
    },
  };

  const wasSeriesCompleted = progress.completedSeries.some(
    (entry) => entry.seriesId === series.id
  );
  const isNowCompleted = isSeriesCompleted(series, nextProgress);

  if (isNowCompleted && !wasSeriesCompleted) {
    nextProgress = {
      ...nextProgress,
      completedSeries: [
        ...progress.completedSeries,
        {
          seriesId: series.id,
          difficulty: series.difficulty,
          pointsEarned: getSeriesTotalPoints(series),
          completedAt: new Date().toISOString(),
        },
      ],
      achievementUnlocks: {
        ...progress.achievementUnlocks,
        ...(newAchievement &&
        (!previousAchievement || newAchievement.level > previousAchievement.level)
          ? { [newAchievement.id]: new Date().toISOString() }
          : {}),
      },
    };

    return {
      nextProgress,
      seriesCompleted: true,
      newAchievement:
        newAchievement &&
        (!previousAchievement || newAchievement.level > previousAchievement.level)
          ? newAchievement
          : null,
    };
  }

  return {
    nextProgress: {
      ...nextProgress,
      achievementUnlocks: {
        ...progress.achievementUnlocks,
        ...(newAchievement &&
        (!previousAchievement || newAchievement.level > previousAchievement.level)
          ? { [newAchievement.id]: new Date().toISOString() }
          : {}),
      },
    },
    seriesCompleted: false,
    newAchievement:
      newAchievement &&
      (!previousAchievement || newAchievement.level > previousAchievement.level)
        ? newAchievement
        : null,
  };
};

export const formatMinutes = (value: number) => {
  if (value <= 0) return "0 min";
  if (value < 60) return `${value} min`;

  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  if (minutes === 0) return `${hours} hr`;
  return `${hours} hr ${minutes} min`;
};
