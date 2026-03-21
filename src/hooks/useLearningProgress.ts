import { useEffect, useState } from "react";
import { LearningProgress } from "@/types/learning";
import {
  getDefaultLearningProgress,
  loadLearningProgress,
  saveLearningProgress,
} from "@/utils/learningUtils";

export const useLearningProgress = () => {
  const [progress, setProgress] = useState<LearningProgress>(() => {
    if (typeof window === "undefined") {
      return getDefaultLearningProgress();
    }
    return loadLearningProgress();
  });

  useEffect(() => {
    saveLearningProgress(progress);
  }, [progress]);

  return { progress, setProgress };
};
