export type LearningDifficulty = "Beginner" | "Intermediate" | "Advanced";

export interface LearningVideo {
  videoId: string;
  title: string;
  duration: number;
  transcriptUrl?: string;
  contentUrl: string;
  youtubeId?: string;
  embedUrl?: string;
  sample_video?: string;
  sample_thumbnail?: string;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  order: number;
  totalDuration: number;
  videos: LearningVideo[];
}

export interface LearningSeries {
  id: string;
  title: string;
  difficulty: LearningDifficulty;
  description: string;
  tags: string[];
  totalDuration: number;
  pointValue: number;
  pointsPerVideo: number;
  modules: LearningModule[];
  videos?: LearningVideo[];
}

export interface CompletedSeries {
  seriesId: string;
  difficulty: LearningDifficulty;
  pointsEarned: number;
  completedAt: string;
}

export interface LearningSeriesProgress {
  completedVideoIds: string[];
  lastWatchedVideoId?: string;
  lastWatchedAt?: string;
}

export interface LearningProgress {
  totalLearningPoints: number;
  completedSeries: CompletedSeries[];
  seriesProgress: Record<string, LearningSeriesProgress>;
  lastStartedSeriesId?: string;
  lastStartedVideoId?: string;
  achievementUnlocks: Record<string, string>;
}

export interface LearningAchievement {
  id: string;
  level: number;
  name: string;
  pointsRequired: number;
  description: string;
}
