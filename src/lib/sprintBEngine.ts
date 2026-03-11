/**
 * Sprint-B Calculation Engine
 *
 * Pure functions — no UI imports, no side effects, deterministic.
 * Accepts Financial Readiness inputs + sprint state and returns
 * progress metrics for the Sprint-B execution layer.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type SprintBType = "monthly" | "quarterly" | "annual";

/** Anchored goal derived from the Financial Readiness calculator. */
export interface SprintBGoal {
  financialReadinessAge: number;
  currentAge: number;
  requiredCorpus: number;
  requiredMonthlySIP: number;
  yearlyInvestmentIncreasePct: number;
  /** Full journey: goalAge − currentAge (includes waiting years). */
  durationYears: number;
  moneySavedSoFar: number;
}

export type WindowStatus = "upcoming" | "current" | "completed" | "skipped";

export interface SprintBWindow {
  id: string;
  index: number;
  status: WindowStatus;
  sipAmount: number;
  invested: number;
  sipCompleted: boolean | null;
  comfortLevel: number | null;
  startDate: string;
  endDate: string;
}

export interface SprintBCycle {
  id: string;
  type: SprintBType;
  cycleNumber: number;
  startDate: string;
  windows: SprintBWindow[];
  isComplete: boolean;
}

export interface SprintBProgress {
  completedMonths: number;
  totalContributions: number;
  comfortScores: number[];
}

export interface SprintBKPIs {
  pathCoveredPct: number;
  corpusBuiltPct: number;
  /** Un-capped value for internal reference when corpus > 100 %. */
  corpusBuiltPctRaw: number;
  comfortScore: number;
}

// ─── Sprint Geometry ──────────────────────────────────────────────────────────

export function getMonthsPerCycle(type: SprintBType): number {
  switch (type) {
    case "monthly":
      return 1;
    case "quarterly":
      return 3;
    case "annual":
      return 12;
  }
}

export function getWindowsPerCycle(type: SprintBType): number {
  switch (type) {
    case "monthly":
      return 1;
    case "quarterly":
      return 3; // monthly windows inside quarter
    case "annual":
      return 4; // quarterly windows inside year
  }
}

export function getMonthsPerWindow(type: SprintBType): number {
  return getMonthsPerCycle(type) / getWindowsPerCycle(type);
}

export function getSprintLabel(type: SprintBType): string {
  switch (type) {
    case "monthly":
      return "Monthly";
    case "quarterly":
      return "Quarterly";
    case "annual":
      return "Annual";
  }
}

// ─── SIP Calculations ────────────────────────────────────────────────────────

/**
 * Current monthly SIP with yearly step-ups.
 * Escalation triggers once per 12 completed months.
 *
 *   • Quarterly → after 4 quarters (12 months)
 *   • Annual   → after 1 year   (12 months)
 *   • Monthly  → one-time only, no escalation
 */
export function computeCurrentSIP(
  baseSIP: number,
  yearlyIncreasePct: number,
  completedMonths: number,
): number {
  if (!Number.isFinite(baseSIP) || baseSIP <= 0) return 0;
  const completedYears = Math.floor(completedMonths / 12);
  const sip = baseSIP * Math.pow(1 + yearlyIncreasePct / 100, completedYears);
  return Number.isFinite(sip) ? Number(sip.toFixed(2)) : 0;
}

/**
 * SIP amount required for a single window.
 *   = currentMonthlySIP × monthsPerWindow
 */
export function computeWindowSIP(
  type: SprintBType,
  baseSIP: number,
  yearlyIncreasePct: number,
  completedMonths: number,
): number {
  const currentSIP = computeCurrentSIP(baseSIP, yearlyIncreasePct, completedMonths);
  const months = getMonthsPerWindow(type);
  return Number((currentSIP * months).toFixed(2));
}

// ─── KPI Formulas ─────────────────────────────────────────────────────────────

/**
 * KPI 1 — Path Covered %
 *   Total Months = durationYears × 12
 *   Path %       = (completedMonths / Total Months) × 100
 */
export function computePathCoveredPct(
  completedMonths: number,
  durationYears: number,
): number {
  const totalMonths = durationYears * 12;
  if (totalMonths <= 0) return 100;
  const pct = (completedMonths / totalMonths) * 100;
  const clamped = Math.min(100, Math.max(0, pct));
  return Number.isFinite(clamped) ? Number(clamped.toFixed(1)) : 0;
}

/**
 * KPI 2 — Corpus Built %
 *   Corpus %  = ((moneySavedSoFar + totalContributions) / requiredCorpus) × 100
 *   Capped at 100 for display; raw value preserved separately.
 */
export function computeCorpusBuiltPct(
  moneySavedSoFar: number,
  totalContributions: number,
  requiredCorpus: number,
): number {
  if (requiredCorpus <= 0) return 0;
  const total = moneySavedSoFar + totalContributions;
  const pct = (total / requiredCorpus) * 100;
  return Number.isFinite(pct) ? Number(Math.max(0, pct).toFixed(1)) : 0;
}

/**
 * KPI 3 — Comfort Score
 *   Average of all comfort ratings (1-5) where SIP was completed.
 *   Presented as X / 5.
 */
export function computeComfortScore(comfortScores: number[]): number {
  const valid = comfortScores.filter(
    (n) => Number.isFinite(n) && n >= 1 && n <= 5,
  );
  if (valid.length === 0) return 0;
  const avg = valid.reduce((s, c) => s + c, 0) / valid.length;
  return Number.isFinite(avg) ? Number(avg.toFixed(1)) : 0;
}

/** Compute all three KPIs from progress + goal. */
export function computeKPIs(
  progress: SprintBProgress,
  goal: SprintBGoal,
): SprintBKPIs {
  const pathCoveredPct = computePathCoveredPct(
    progress.completedMonths,
    goal.durationYears,
  );
  const corpusBuiltPctRaw = computeCorpusBuiltPct(
    goal.moneySavedSoFar,
    progress.totalContributions,
    goal.requiredCorpus,
  );
  return {
    pathCoveredPct,
    corpusBuiltPct: Math.min(100, corpusBuiltPctRaw),
    corpusBuiltPctRaw,
    comfortScore: computeComfortScore(progress.comfortScores),
  };
}

// ─── Cycle Building ───────────────────────────────────────────────────────────

function addMonthsSafe(date: Date, months: number): Date {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + months);
  return copy;
}

export function buildCycleWindows(
  type: SprintBType,
  startDate: Date,
  sipPerWindow: number,
): SprintBWindow[] {
  const count = getWindowsPerCycle(type);
  const monthsPer = getMonthsPerWindow(type);
  return Array.from({ length: count }, (_, idx) => {
    const winStart = addMonthsSafe(startDate, idx * monthsPer);
    const winEnd = addMonthsSafe(startDate, (idx + 1) * monthsPer);
    return {
      id: `${type}-${idx}-${startDate.getTime()}`,
      index: idx,
      status: (idx === 0 ? "current" : "upcoming") as WindowStatus,
      sipAmount: sipPerWindow,
      invested: 0,
      sipCompleted: null,
      comfortLevel: null,
      startDate: winStart.toISOString(),
      endDate: winEnd.toISOString(),
    };
  });
}

/** Create a fresh sprint cycle with properly-escalated SIP. */
export function buildCycle(
  type: SprintBType,
  startDate: Date,
  cycleNumber: number,
  goal: SprintBGoal,
  completedMonths: number,
): SprintBCycle {
  const sipPerWindow = computeWindowSIP(
    type,
    goal.requiredMonthlySIP,
    goal.yearlyInvestmentIncreasePct,
    completedMonths,
  );
  let windows = [];
  let monthlySIPs: number[] | undefined = undefined;
  if (type === "quarterly") {
    const monthlySIP = goal.requiredMonthlySIP;
    windows = [];
    for (let i = 0; i < 3; i++) {
      const winStart = new Date(startDate);
      winStart.setMonth(winStart.getMonth() + i);
      const winEnd = new Date(winStart);
      winEnd.setMonth(winEnd.getMonth() + 1);
      windows.push({
        id: `${cycleNumber}-Q-${i + 1}`,
        index: i,
        status: i === 0 ? "current" : "upcoming",
        sipAmount: monthlySIP,
        invested: 0,
        sipCompleted: null,
        comfortLevel: null,
        startDate: winStart.toISOString(),
        endDate: winEnd.toISOString(),
      });
    }
    monthlySIPs = [monthlySIP, monthlySIP, monthlySIP];
  } else {
    windows = buildCycleWindows(type, startDate, sipPerWindow);
  }
  return {
    id: `${type}-cycle-${cycleNumber}-${startDate.getTime()}`,
    type,
    cycleNumber,
    startDate: startDate.toISOString(),
    windows,
    isComplete: false,
    ...(monthlySIPs ? { monthlySIPs } : {}),
  };
}

// ─── Window Resolution ────────────────────────────────────────────────────────

export interface WindowResolution {
  windows: SprintBWindow[];
  isComplete: boolean;
  monthsAdded: number;
  contributionAdded: number;
  comfort: number | null;
}

/**
 * Resolve the current window based on user input.
 * Returns updated windows array + computed deltas.
 */
export function resolveWindow(
  windows: SprintBWindow[],
  windowIndex: number,
  sipCompleted: boolean,
  comfortLevel: number | null,
  type: SprintBType,
): WindowResolution {
  const updated = windows.map((w) => ({ ...w }));
  const target = updated[windowIndex];
  if (!target) {
    return {
      windows: updated,
      isComplete: false,
      monthsAdded: 0,
      contributionAdded: 0,
      comfort: null,
    };
  }

  let monthsAdded = 0;
  let contributionAdded = 0;
  let comfort: number | null = null;
  const monthsPerWin = getMonthsPerWindow(type);

  if (sipCompleted) {
    target.status = "completed";
    target.invested = target.sipAmount;
    target.sipCompleted = true;
    target.comfortLevel = comfortLevel;
    monthsAdded = monthsPerWin;
    contributionAdded = target.sipAmount;
    comfort = comfortLevel;
  } else {
    target.status = "skipped";
    target.invested = 0;
    target.sipCompleted = false;
    target.comfortLevel = null;
  }

  // Advance next window to current
  if (windowIndex + 1 < updated.length) {
    const next = updated[windowIndex + 1];
    if (next.status === "upcoming") {
      next.status = "current";
    }
  }

  const resolvedCount = updated.filter(
    (w) => w.status === "completed" || w.status === "skipped",
  ).length;
  const isComplete = resolvedCount === updated.length;

  return { windows: updated, isComplete, monthsAdded, contributionAdded, comfort };
}

// ─── Completion Actions ───────────────────────────────────────────────────────

export interface CompletionAction {
  label: string;
  type: SprintBType;
  primary?: boolean;
}

/**
 * After a sprint completes, determine available next actions.
 *   Monthly  → one-time only, offers Quarterly / Annual
 *   Quarterly → continue or switch to Annual
 *   Annual   → continue or switch to Quarterly
 */
export function getCompletionActions(
  currentType: SprintBType,
): CompletionAction[] {
  switch (currentType) {
    case "monthly":
      return [
        { label: "Start Quarterly", type: "quarterly", primary: true },
        { label: "Start Annual", type: "annual" },
      ];
    case "quarterly":
      return [
        { label: "Continue Next Quarter", type: "quarterly", primary: true },
        { label: "Switch to Annual", type: "annual" },
      ];
    case "annual":
      return [
        { label: "Continue Next Year", type: "annual", primary: true },
        { label: "Switch to Quarterly", type: "quarterly" },
      ];
  }
}

// ─── Persistence ──────────────────────────────────────────────────────────────

export interface SprintBPersistedState {
  version: 2;
  goal: SprintBGoal | null;
  goalSet: boolean;
  activeSprint: SprintBType | null;
  currentCycle: SprintBCycle | null;
  progress: SprintBProgress;
  /** Monthly sprint is one-time only. */
  monthlyCompleted: boolean;
  /** Number of fully-completed cycles (used for cycle numbering). */
  completedCycles: number;
  /** The end date of the last completed window, or initial sprint start date. */
  lastCompletedDate?: string;
}

const STORAGE_KEY = "sprintb_v2";

export function createEmptyState(): SprintBPersistedState {
  const now = new Date().toISOString();
  return {
    version: 2,
    goal: null,
    goalSet: false,
    activeSprint: null,
    currentCycle: null,
    progress: { completedMonths: 0, totalContributions: 0, comfortScores: [] },
    monthlyCompleted: false,
    completedCycles: 0,
    lastCompletedDate: now,
  };
}

export function loadSprintBState(): SprintBPersistedState {
  if (typeof window === "undefined") return createEmptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyState();
    const parsed = JSON.parse(raw);
    if (parsed.version !== 2) return createEmptyState();
    return {
      version: 2,
      goal: parsed.goal || null,
      goalSet: Boolean(parsed.goalSet),
      activeSprint: parsed.activeSprint || null,
      currentCycle: parsed.currentCycle || null,
      progress: {
        completedMonths: Number(parsed.progress?.completedMonths) || 0,
        totalContributions: Number(parsed.progress?.totalContributions) || 0,
        comfortScores: Array.isArray(parsed.progress?.comfortScores)
          ? parsed.progress.comfortScores.filter((n: number) => Number.isFinite(n))
          : [],
      },
      monthlyCompleted: Boolean(parsed.monthlyCompleted),
      completedCycles: Number(parsed.completedCycles) || 0,
      lastCompletedDate: parsed.lastCompletedDate || parsed.currentCycle?.startDate || new Date().toISOString(),
    };
  } catch {
    return createEmptyState();
  }
}

export function saveSprintBState(state: SprintBPersistedState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Failed to persist SprintB state", err);
  }
}
