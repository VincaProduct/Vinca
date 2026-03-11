import { CalculatorInputs, CalculationResults } from "@/types/calculator";
import { calculateFinancialFreedom } from "@/utils/calculatorUtils";
import { getSprintById } from "./sprintCatalog";
import { SprintProgress, SprintState, SprintType, SprintUnitState } from "./sprint.types";

export type NormalizedSprintType = "monthly" | "quarterly" | "annual";

export interface UserFinancialData {
  currentAge: number;
  retirementAge: number;
  currentCorpus: number;
  monthlySIP: number;
  annualSIPIncrease: number;
  expectedReturnRate: number;
  startYear?: number;
}

export interface SprintInputDrivenFields {
  requiredCorpus: number;
  moneySavedSoFar: number;
  requiredMonthlySIP: number;
  yearlyInvestmentIncreasePct: number;
  investmentDurationYears: number;
  investmentStartDate: string;
}

export interface CompletedSprintCalc {
  id: string;
  type: NormalizedSprintType;
  startDate?: string;
  endDate?: string;
  monthsCount: number;
  instanceId?: string;
  confidenceRating?: number;
}

export interface SprintProjectionSnapshot {
  coveredPercentage: number;
  projectedCorpus: number;
}

export interface SprintSIPParams {
  baseAmount: number;
  yearlyIncrease: number;
  startYear: number;
  targetDate: Date;
}

export interface CompletionDelta {
  timeProgressDelta: number;
  corpusGrowthPercent: number;
}

interface FinancialDataResult {
  userData: UserFinancialData | null;
  targetCorpus: number;
  sipConfig: {
    baseAmount: number;
    yearlyIncreasePercent: number;
    startYear: number;
  } | null;
  sprintInputs: SprintInputDrivenFields | null;
}

const COMPLETED_STATUSES = new Set(["completed", "completed_final", "archived"]);
const STORAGE_INPUT_KEY = "financial_calculator_inputs";
const STORAGE_RESULT_KEY = "financial_calculator_results";

function normalizeSprintType(type: SprintType | NormalizedSprintType | undefined): NormalizedSprintType | null {
  if (type === "yearly") return "annual";
  if (type === "monthly" || type === "quarterly") return type;
  if (type === "annual") return "annual";
  return null;
}

function getMonthsForType(type: NormalizedSprintType): number {
  if (type === "monthly") return 1;
  if (type === "quarterly") return 3;
  return 12;
}

function parseDate(value?: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function earliestDate(dates: Array<string | undefined>): Date | null {
  const parsed = dates.map(parseDate).filter((d): d is Date => Boolean(d));
  if (parsed.length === 0) return null;
  return new Date(Math.min(...parsed.map((d) => d.getTime())));
}

function deriveConfidenceRating(units?: Record<number, SprintUnitState>): number | undefined {
  if (!units) return undefined;
  const levels: number[] = [];
  Object.values(units).forEach((unit) => {
    const level = unit?.form?.comfortLevel;
    if (unit?.form?.sipCompleted && typeof level === "number" && Number.isFinite(level)) {
      levels.push(level);
    }
  });
  if (levels.length === 0) return undefined;
  const avg = levels.reduce((sum, level) => sum + level, 0) / levels.length;
  return Math.round(Math.min(5, Math.max(0, avg)));
}

export function buildCompletedSprintsFromState(state: SprintState | null | undefined): CompletedSprintCalc[] {
  if (!state?.progress) return [];
  const completed: CompletedSprintCalc[] = [];
  const seen = new Set<string>();

  const pushSprint = (id: string, progress: SprintProgress) => {
    const meta = getSprintById(id);
    const normalizedType = normalizeSprintType(meta?.type);
    if (!normalizedType) return;
    const key = progress.instanceId || `${id}-${progress.startDate || progress.endDate || Math.random()}`;
    if (seen.has(key)) return;
    seen.add(key);
    completed.push({
      id,
      type: normalizedType,
      startDate: progress.startDate,
      endDate: progress.endDate,
      monthsCount: getMonthsForType(normalizedType),
      instanceId: progress.instanceId,
      confidenceRating: deriveConfidenceRating(progress.units),
    });
  };

  Object.entries(state.progress).forEach(([id, progress]) => {
    if (progress.status && COMPLETED_STATUSES.has(progress.status)) {
      pushSprint(id, progress);
    }
    if (progress.history) {
      progress.history.forEach((entry) => {
        if (entry.status && COMPLETED_STATUSES.has(entry.status)) {
          pushSprint(id, entry);
        }
      });
    }
  });

  return completed.sort((a, b) => {
    const aDate = parseDate(a.startDate) || parseDate(a.endDate);
    const bDate = parseDate(b.startDate) || parseDate(b.endDate);
    if (!aDate && !bDate) return 0;
    if (!aDate) return -1;
    if (!bDate) return 1;
    return aDate.getTime() - bDate.getTime();
  });
}

export function calculateCoveredPercentage(
  sprintStartAge: number,
  retirementAge: number,
  completedSprints: CompletedSprintCalc[],
): number {
  const totalJourneyYears = retirementAge - sprintStartAge;
  if (totalJourneyYears <= 0) return 100;

  const progressedYears = completedSprints.reduce((total, sprint) => {
    const sprintYears = sprint.monthsCount / 12;
    return total + sprintYears;
  }, 0);

  const percentage = (progressedYears / totalJourneyYears) * 100;
  const clamped = Math.min(100, Math.max(0, percentage));
  return Number.isFinite(clamped) ? Number(clamped.toFixed(1)) : 0;
}

export function getCurrentSIPAmount(
  baseSIP: number,
  annualIncreasePercent: number,
  currentDate: Date,
  sprintStartDate: Date,
): number {
  if (!Number.isFinite(baseSIP) || baseSIP <= 0) return 0;
  const yearsElapsed = currentDate.getFullYear() - sprintStartDate.getFullYear();
  if (yearsElapsed <= 0) return Number(baseSIP.toFixed(2));

  let sipAmount = baseSIP;
  for (let year = 1; year <= yearsElapsed; year += 1) {
    sipAmount *= 1 + annualIncreasePercent / 100;
  }

  return Number(sipAmount.toFixed(2));
}

export function calculateAverageConfidence(completedSprints: CompletedSprintCalc[]): number {
  const ratings = completedSprints
    .map((sprint) => sprint.confidenceRating)
    .filter((rating): rating is number => typeof rating === "number" && Number.isFinite(rating));

  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  const avg = sum / ratings.length;
  return Math.min(5, Math.round(avg));
}

function getProjectionBaseDate(completedSprints: CompletedSprintCalc[]): Date {
  const firstDate = earliestDate(completedSprints.map((s) => s.startDate ?? s.endDate));
  return firstDate ?? new Date();
}

export function calculateProjectionMetrics(params: {
  userData: UserFinancialData;
  completedSprints: CompletedSprintCalc[];
  targetCorpus: number;
}): { projectedCorpus: number; builtPercentage: number } {
  const { userData, completedSprints, targetCorpus } = params;
  const rateFactor = 1 + userData.expectedReturnRate / 100;
  const totalJourneyYears = userData.retirementAge - userData.currentAge;
  if (!Number.isFinite(totalJourneyYears) || totalJourneyYears <= 0) {
    return { projectedCorpus: userData.currentCorpus || 0, builtPercentage: 100 };
  }

  const sorted = [...completedSprints].sort((a, b) => {
    const aDate = parseDate(a.startDate) || parseDate(a.endDate);
    const bDate = parseDate(b.startDate) || parseDate(b.endDate);
    if (!aDate && !bDate) return 0;
    if (!aDate) return -1;
    if (!bDate) return 1;
    return aDate.getTime() - bDate.getTime();
  });

  const baseDate = getProjectionBaseDate(sorted);
  let currentCorpus = Number.isFinite(userData.currentCorpus) ? userData.currentCorpus : 0;
  let elapsedYears = 0;

  sorted.forEach((sprint) => {
    const sprintYears = sprint.monthsCount / 12;
    const sprintDate = parseDate(sprint.startDate) || parseDate(sprint.endDate) || baseDate;
    const sipAmount = getCurrentSIPAmount(userData.monthlySIP, userData.annualSIPIncrease, sprintDate, baseDate);
    const sprintContributions = sipAmount * sprint.monthsCount;
    currentCorpus += sprintContributions;
    currentCorpus *= Math.pow(rateFactor, sprintYears);
    elapsedYears += sprintYears;
  });

  const remainingYears = Math.max(0, totalJourneyYears - elapsedYears);
  currentCorpus *= Math.pow(rateFactor, remainingYears);

  const builtPercentage = targetCorpus > 0 ? Math.min(100, (currentCorpus / targetCorpus) * 100) : 0;

  return {
    projectedCorpus: Number.isFinite(currentCorpus) ? currentCorpus : 0,
    builtPercentage: Number.isFinite(builtPercentage) ? Number(builtPercentage.toFixed(1)) : 0,
  };
}

export function calculateBuiltPercentage(
  initialCorpus: number,
  sipAmount: number,
  returnRate: number,
  completedSprints: CompletedSprintCalc[],
  retirementAge: number,
  sprintStartAge: number,
  annualIncreasePercent: number,
  targetCorpus: number,
): number {
  const userData: UserFinancialData = {
    currentAge: sprintStartAge,
    retirementAge,
    currentCorpus: initialCorpus,
    monthlySIP: sipAmount,
    annualSIPIncrease: annualIncreasePercent,
    expectedReturnRate: returnRate,
  };

  const { builtPercentage } = calculateProjectionMetrics({ userData, completedSprints, targetCorpus });
  return builtPercentage;
}

export function calculateCompletionDeltas(
  beforeSprint: SprintProjectionSnapshot,
  afterSprint: SprintProjectionSnapshot,
): CompletionDelta {
  const timeProgressDelta = afterSprint.coveredPercentage - beforeSprint.coveredPercentage;
  const corpusGrowthPercent = beforeSprint.projectedCorpus > 0
    ? ((afterSprint.projectedCorpus - beforeSprint.projectedCorpus) / beforeSprint.projectedCorpus) * 100
    : 0;

  return {
    timeProgressDelta: Number.isFinite(timeProgressDelta) ? Number(timeProgressDelta.toFixed(1)) : 0,
    corpusGrowthPercent: Number.isFinite(corpusGrowthPercent) ? Number(corpusGrowthPercent.toFixed(1)) : 0,
  };
}

export function calculateSprintSIP({ baseAmount, yearlyIncrease, startYear, targetDate }: SprintSIPParams): number {
  if (!Number.isFinite(baseAmount) || baseAmount <= 0) return 0;
  const safeStartYear = Number.isFinite(startYear) ? startYear : new Date().getFullYear();
  const yearsElapsed = targetDate.getFullYear() - safeStartYear;
  const factor = Math.pow(1 + yearlyIncrease / 100, yearsElapsed);
  const sip = baseAmount * factor;
  return Math.round(Number.isFinite(sip) ? sip : 0);
}

export function validateSIPConsistency(readinessSIP: number, sprintSIP: number, tolerance = 1): boolean {
  if (!Number.isFinite(readinessSIP) || !Number.isFinite(sprintSIP)) return false;
  return Math.abs(readinessSIP - sprintSIP) <= tolerance;
}

export function getFinancialReadinessData(): FinancialDataResult {
  const win = typeof window === "undefined" ? null : window;
  if (!win) return { userData: null, targetCorpus: 0, sipConfig: null, sprintInputs: null };

  let inputs: CalculatorInputs | null = null;
  let targetCorpus = 0;
  let startYear: number | null = null;
  let calculatorResults: CalculationResults | null = null;

  try {
    const rawInputs = win.localStorage.getItem(STORAGE_INPUT_KEY);
    if (rawInputs) {
      const parsed = JSON.parse(rawInputs) as CalculatorInputs;
      inputs = parsed;
      startYear = new Date().getFullYear();
    }
  } catch (error) {
    console.error("Failed to read financial inputs", error);
  }

  try {
    const rawResults = win.localStorage.getItem(STORAGE_RESULT_KEY);
    if (rawResults) {
      const parsed = JSON.parse(rawResults) as CalculationResults;
      calculatorResults = parsed;
      targetCorpus = Number(parsed.requiredCorpus) || 0;
    }
  } catch (error) {
    console.error("Failed to read financial results", error);
  }

  if (!targetCorpus && inputs) {
    const recalculated = calculateFinancialFreedom(inputs);
    targetCorpus = recalculated.requiredCorpus || 0;
  }

  const userData: UserFinancialData | null = inputs
    ? {
        currentAge: inputs.age,
        retirementAge: inputs.age + inputs.yearsForSIP + inputs.waitingYearsBeforeSWP,
        currentCorpus: inputs.initialPortfolioValue,
        monthlySIP: inputs.sipAmount,
        annualSIPIncrease: inputs.growthInSIP,
        expectedReturnRate: inputs.returnDuringSIPAndWaiting,
        startYear: startYear ?? new Date().getFullYear(),
      }
    : null;

  const sipConfig = userData
    ? {
        baseAmount: userData.monthlySIP,
        yearlyIncreasePercent: userData.annualSIPIncrease,
        startYear: userData.startYear ?? new Date().getFullYear(),
      }
    : null;

  const sprintInputs: SprintInputDrivenFields | null = inputs && calculatorResults
    ? {
        requiredCorpus: calculatorResults.requiredCorpus,
        moneySavedSoFar: inputs.initialPortfolioValue,
        requiredMonthlySIP: calculatorResults.requiredMonthlySIP,
        yearlyInvestmentIncreasePct: inputs.growthInSIP,
        investmentDurationYears: inputs.yearsForSIP,
        investmentStartDate: new Date((startYear ?? new Date().getFullYear()), 0, 1).toISOString(),
      }
    : null;

  return { userData, targetCorpus, sipConfig, sprintInputs };
}
