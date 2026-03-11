import {
  Footprint,
  FootprintEntry,
  FootprintJourneyContext,
  FootprintRetirementStage,
  FootprintCategory,
  FootprintMetrics,
} from '@/types/footprints';

const FOOTPRINTS_DATA_KEY = 'footprintsData';
const FOOTPRINTS_STATE_KEY = 'footprintsState';

const DEFAULT_PROMPTS = [
  "A moment of clarity I didn't expect",
  "What changed my approach to money",
  "A risk I took that paid off",
];

const DEFAULT_FOOTPRINT_TITLES = [
  "My biggest win wasn't higher returns — it was peace of mind.",
  "I stopped waiting for motivation and focused on consistency instead.",
  "I thought saving was enough — until I realised I had no direction.",
];

const DAY_MS = 24 * 60 * 60 * 1000;

const safeJsonParse = <T>(value: string | null, fallback: T): T => {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const getDayTimestamp = () => Math.floor(Date.now() / DAY_MS);

export const getFootprintsDataKey = () => FOOTPRINTS_DATA_KEY;

export const getFootprintsStateKey = () => FOOTPRINTS_STATE_KEY;

export const getFootprintPrompts = () => DEFAULT_PROMPTS;

export const formatFootprintDate = (dayTimestamp: number) => {
  const date = new Date(dayTimestamp * DAY_MS);
  return date.toLocaleDateString();
};

export const getReadTimeMinutes = (text: string) => {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
};

export const loadFootprints = () => {
  return safeJsonParse<Footprint[]>(localStorage.getItem(FOOTPRINTS_DATA_KEY), []);
};

export const saveFootprints = (footprints: Footprint[]) => {
  localStorage.setItem(FOOTPRINTS_DATA_KEY, JSON.stringify(footprints));
};

export const loadFootprintsState = <T>(fallback: T) => {
  return safeJsonParse<T>(localStorage.getItem(FOOTPRINTS_STATE_KEY), fallback);
};

export const saveFootprintsState = (state: unknown) => {
  localStorage.setItem(FOOTPRINTS_STATE_KEY, JSON.stringify(state));
};

export const createFootprintId = () => {
  const now = new Date();
  const date = now.toISOString().replace(/[-:]/g, '').replace('T', '_').slice(0, 15);
  return `footprint_${date}`;
};

export const getDefaultFootprints = (): Footprint[] => {
  return DEFAULT_FOOTPRINT_TITLES.map((title, index) => {
    const createdAt = getDayTimestamp() - (DEFAULT_FOOTPRINT_TITLES.length - index + 2);
    return {
      id: `footprint_default_${index + 1}`,
      title,
      story: title,
      challenges: '',
      howTheyHandled: '',
      lesson: '',
      tags: [],
      photos: [],
      journey: undefined,
      retirementStage: 'accumulation',
      category: 'other',
      challengeTitle: title,
      challengeDescription: title,
      personalJourneyCounterpart: '',
      attachedMetrics: undefined,
      createdAt,
      isDefault: true,
      isPublished: true,
      likeCount: 0,
    };
  });
};

export const getJourneyContextDefaults = () => {
  const userProfile = safeJsonParse<Record<string, string | number> | null>(
    localStorage.getItem('userProfile'),
    null
  );
  const calculatorReading = safeJsonParse<Record<string, string | number> | null>(
    localStorage.getItem('calculatorReading'),
    null
  );
  const lifestylePlannerReading = safeJsonParse<Record<string, string | number> | null>(
    localStorage.getItem('lifestylePlannerReading'),
    null
  );

  const name = typeof userProfile?.name === 'string' ? userProfile?.name : undefined;
  const monthlySipValue = calculatorReading?.monthlySip ?? calculatorReading?.monthlySIP;
  const monthlySip = typeof monthlySipValue === 'string' || typeof monthlySipValue === 'number'
    ? String(monthlySipValue)
    : undefined;
  const retirementGoalValue =
    lifestylePlannerReading?.retirementAge ??
    calculatorReading?.retirementAge ??
    lifestylePlannerReading?.retirementGoal;
  const retirementGoal =
    typeof retirementGoalValue === 'string' || typeof retirementGoalValue === 'number'
      ? String(retirementGoalValue)
      : undefined;

  return {
    name,
    monthlySip,
    retirementGoal,
  };
};

export const buildJourneyContext = (visibleFields: FootprintJourneyContext['visibleFields']) => {
  const defaults = getJourneyContextDefaults();
  return {
    visibleFields,
    name: defaults.name,
    monthlySip: defaults.monthlySip,
    retirementGoal: defaults.retirementGoal,
  };
};

export const buildFootprintEntry = (
  entry: FootprintEntry,
  ownerId?: string
): Footprint => {
  return {
    id: createFootprintId(),
    title: entry.title.trim(),
    story: entry.story.trim(),
    challenges: entry.challenges?.trim() || '',
    howTheyHandled: entry.howTheyHandled?.trim() || '',
    lesson: entry.lesson?.trim() || '',
    tags: entry.tags ?? [],
    photos: entry.photos ?? [],
    journey: entry.journey,
    retirementStage: entry.retirementStage,
    category: entry.category,
    challengeTitle: entry.title.trim(),
    challengeDescription: entry.story.trim(),
    personalJourneyCounterpart: entry.personalJourneyCounterpart?.trim() || '',
    attachedMetrics: entry.attachedMetrics,
    createdAt: getDayTimestamp(),
    isDefault: false,
    isPublished: entry.isPublished,
    ownerId,
    likeCount: 0,
  };
};

export const normalizeRetirementStage = (value: string): FootprintRetirementStage => {
  if (value === 'pre-retirement' || value === 'retirement') {
    return value;
  }
  return 'accumulation';
};

export const normalizeCategory = (value: string): FootprintCategory => {
  if (
    value === 'sip-discipline' ||
    value === 'healthcare' ||
    value === 'lifestyle' ||
    value === 'inflation'
  ) {
    return value;
  }
  return 'other';
};

export const buildAttachedMetrics = () => {
  const calculatorReading = safeJsonParse<Record<string, number | string> | null>(
    localStorage.getItem('calculatorReading'),
    null
  );
  if (!calculatorReading) {
    return undefined;
  }

  const metrics: FootprintMetrics = {};
  if (typeof calculatorReading.currentCorpus === 'number') {
    metrics.currentCorpus = calculatorReading.currentCorpus;
  }
  if (typeof calculatorReading.monthlySip === 'number') {
    metrics.monthlySip = calculatorReading.monthlySip;
  }
  if (typeof calculatorReading.currentAge === 'number') {
    metrics.currentAge = calculatorReading.currentAge;
  }
  if (typeof calculatorReading.retirementAge === 'number') {
    metrics.retirementAge = calculatorReading.retirementAge;
  }
  if (typeof calculatorReading.additionalNotes === 'string') {
    metrics.additionalNotes = calculatorReading.additionalNotes;
  }

  return Object.keys(metrics).length ? metrics : undefined;
};

export const readFileAsDataUrl = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Unable to read file.'));
    reader.readAsDataURL(file);
  });
};
