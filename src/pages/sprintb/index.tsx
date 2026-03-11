import CanonicalPageHeader from '@/components/ui/CanonicalPageHeader';
import React, { useCallback, useMemo, useState, useEffect } from "react";
import { Calendar, Clock3, CalendarClock, Target, ChevronDown } from "lucide-react";
import SprintBCard from "@/components/sprintb/SprintBCard";
import SprintBModal from "@/components/sprintb/SprintBModal";
import SprintBCompletion from "@/components/sprintb/SprintBCompletion";
import SprintBResult from "@/components/sprintb/SprintBResult";
import Congratulations from "@/components/sprintb/Congratulations";
import SprintWindowSummary from "@/components/sprintb/SprintWindowSummary";
import { getFinancialReadinessData } from "@/lib/sprint/sprintCalculations";
import { calculateFinancialFreedom } from "@/utils/calculatorUtils";
import { CalculatorInputs } from "@/types/calculator";
import {
  SprintBType,
  SprintBGoal,
  SprintBPersistedState,
  loadSprintBState,
  saveSprintBState,
  createEmptyState,
  buildCycle,
  resolveWindow,
  computeKPIs,
  computeCurrentSIP,
  getSprintLabel,
} from "@/lib/sprintBEngine";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatINR = (n: number): string => Math.round(n).toLocaleString("en-IN");

const formatDateShort = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ─── Sprint Option Definitions ───────────────────────────────────────────────

interface SprintOption {
  type: SprintBType;
  title: string;
  description: string;
  icon: typeof Calendar;
  duration: string;
  overview: string[];
}

const sprintOptions: SprintOption[] = [
  {
    type: "monthly",
    title: "Monthly Sprint",
    description:
      "Kickstart your SIP for the first time. One month to build the habit.",
    icon: Calendar,
    duration: "1 Month",
    overview: [
      "Focus for 30 days on executing your SIP.",
      "Track a single cycle to build consistency.",
      "Complete the planned SIP to mark done.",
      "Establish momentum and capture the first win.",
    ],
  },
  {
    type: "quarterly",
    title: "Quarterly Sprint",
    description:
      "Three months of disciplined SIP execution with monthly checkpoints.",
    icon: Clock3,
    duration: "3 Months",
    overview: [
      "Stay consistent for 3 months with monthly checkpoints.",
      "Evaluate discipline and adjust if needed.",
      "Completion needs SIP done across the quarter.",
      "Prove you can sustain quarterly discipline.",
    ],
  },
  {
    type: "annual",
    title: "Annual Sprint",
    description:
      "Long-term discipline with quarterly reviews. Full year of consistent execution.",
    icon: CalendarClock,
    duration: "12 Months",
    overview: [
      "Maintain SIP for 12 months with quarterly reviews.",
      "Lean on step-ups to stay invested.",
      "Complete the year without missing SIPs.",
      "Confidence that you can run the long race.",
    ],
  },
];

// ─── Page Component ──────────────────────────────────────────────────────────

const SprintBPage: React.FC = () => {
  // ── Persisted state ───────────────────────────────────────────────
  const [state, setState] = useState<SprintBPersistedState>(loadSprintBState);

  const persist = useCallback((next: SprintBPersistedState) => {
    setState(next);
    saveSprintBState(next);
  }, []);

  // ── Financial Readiness data ──────────────────────────────────────
  const readinessData = useMemo(() => getFinancialReadinessData(), []);
  const { userData, sprintInputs } = readinessData;

  // ── Goal age input ────────────────────────────────────────────────
  const [goalAgeInput, setGoalAgeInput] = useState<number>(() => {
    if (state.goal) return state.goal.financialReadinessAge;
    if (userData) return userData.retirementAge;
    return 55;
  });

  // ── Pending form inputs (only committed on explicit Save) ─────────
  const [pendingSipCompleted, setPendingSipCompleted] = useState<boolean | null>(null);
  const [pendingComfort, setPendingComfort] = useState<number | null>(null);

  // ── Modal state ───────────────────────────────────────────────────
  const [pendingSprintOption, setPendingSprintOption] = useState<SprintOption | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showChangeConfirm, setShowChangeConfirm] = useState(false);
  
  // ── Collapsible Goal Dashboard state ───────────────────────────────
  const [isGoalDashboardOpen, setIsGoalDashboardOpen] = useState(!state.goalSet);

  // ── Derived: KPIs ─────────────────────────────────────────────────
  const kpis = useMemo(() => {
    if (!state.goal) return null;
    return computeKPIs(state.progress, state.goal);
  }, [state.progress, state.goal]);

  // ── Derived: current window index ─────────────────────────────────
  const currentWindowIndex = useMemo(() => {
    if (!state.currentCycle) return -1;
    return state.currentCycle.windows.findIndex((w) => w.status === "current");
  }, [state.currentCycle]);

  // ── Derived: current SIP (with escalation) ────────────────────────
  const currentSIP = useMemo(() => {
    if (!state.goal) return 0;
    return computeCurrentSIP(
      state.goal.requiredMonthlySIP,
      state.goal.yearlyInvestmentIncreasePct,
      state.progress.completedMonths,
    );
  }, [state.goal, state.progress.completedMonths]);

  // ── Derived: goal preview when user adjusts the age input ─────────
  const goalPreview = useMemo(() => {
    if (!userData || !sprintInputs) return null;
    const duration = goalAgeInput - userData.currentAge;
    if (duration <= 0) return null;

    if (goalAgeInput === userData.retirementAge) {
      return {
        corpus: sprintInputs.requiredCorpus,
        sip: sprintInputs.requiredMonthlySIP,
        duration,
        valid: true,
      };
    }

    try {
      const rawStr = localStorage.getItem("financial_calculator_inputs");
      if (!rawStr) return null;
      const rawInputs = JSON.parse(rawStr) as CalculatorInputs;
      const newYearsForSIP =
        goalAgeInput - rawInputs.age - rawInputs.waitingYearsBeforeSWP;
      if (newYearsForSIP <= 0) {
        return { corpus: 0, sip: 0, duration, valid: false };
      }
      const results = calculateFinancialFreedom({
        ...rawInputs,
        yearsForSIP: newYearsForSIP,
      });
      return {
        corpus: results.requiredCorpus,
        sip: results.requiredMonthlySIP,
        duration,
        valid: true,
      };
    } catch {
      return null;
    }
  }, [goalAgeInput, userData, sprintInputs]);

  // ── Derived: save button enabled ──────────────────────────────────
  const saveEnabled =
    pendingSipCompleted === true
      ? pendingComfort !== null
      : pendingSipCompleted === false;

  // ── Derived: window overrides for SprintWindowSummary ─────────────
  const windowOverrides = useMemo(() => {
    if (!state.currentCycle) return [];
    return state.currentCycle.windows.map((w) => ({
      status: capitalize(w.status) as
        | "Completed"
        | "Skipped"
        | "Current"
        | "Upcoming",
      invested: w.invested,
      amount: w.sipAmount,
    }));
  }, [state.currentCycle]);

  const hasProgress =
    state.progress.completedMonths > 0 ||
    state.progress.totalContributions > 0;

  // ═══════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════

  // ── Set Goal ──────────────────────────────────────────────────────
  const handleSetGoal = () => {
    if (!userData || !sprintInputs) return;
    const duration = goalAgeInput - userData.currentAge;
    if (duration <= 0) return;

    let goal: SprintBGoal;

    if (goalAgeInput === userData.retirementAge) {
      goal = {
        financialReadinessAge: goalAgeInput,
        currentAge: userData.currentAge,
        requiredCorpus: sprintInputs.requiredCorpus,
        requiredMonthlySIP: sprintInputs.requiredMonthlySIP,
        yearlyInvestmentIncreasePct: sprintInputs.yearlyInvestmentIncreasePct,
        durationYears: duration,
        moneySavedSoFar: sprintInputs.moneySavedSoFar,
      };
    } else {
      try {
        const rawStr = localStorage.getItem("financial_calculator_inputs");
        if (!rawStr) return;
        const rawInputs = JSON.parse(rawStr) as CalculatorInputs;
        const newYearsForSIP =
          goalAgeInput - rawInputs.age - rawInputs.waitingYearsBeforeSWP;
        if (newYearsForSIP <= 0) return;
        const results = calculateFinancialFreedom({
          ...rawInputs,
          yearsForSIP: newYearsForSIP,
        });
        goal = {
          financialReadinessAge: goalAgeInput,
          currentAge: rawInputs.age,
          requiredCorpus: results.requiredCorpus,
          requiredMonthlySIP: results.requiredMonthlySIP,
          yearlyInvestmentIncreasePct: rawInputs.growthInSIP,
          durationYears: duration,
          moneySavedSoFar: rawInputs.initialPortfolioValue,
        };
      } catch {
        return;
      }
    }

    persist({ ...state, goal, goalSet: true });
    setIsGoalDashboardOpen(false);
  };

  // ── Change Goal ───────────────────────────────────────────────────
  const handleChangeGoal = () => {
    if (state.progress.completedMonths > 0 || state.activeSprint) {
      setShowChangeConfirm(true);
    } else {
      const empty = createEmptyState();
      persist(empty);
      if (userData) setGoalAgeInput(userData.retirementAge);
      setIsGoalDashboardOpen(true);
    }
  };

  const confirmChangeGoal = () => {
    persist(createEmptyState());
    setShowChangeConfirm(false);
    setPendingSipCompleted(null);
    setPendingComfort(null);
    if (userData) setGoalAgeInput(userData.retirementAge);
    setIsGoalDashboardOpen(true);
  };

  // ── Start Sprint ──────────────────────────────────────────────────
  const handleStartRequest = (option: SprintOption) => {
    setPendingSprintOption(option);
    setModalOpen(true);
  };

  const handleConfirmStart = () => {
    if (!pendingSprintOption || !state.goal) return;
    const type = pendingSprintOption.type;
    // Use lastCompletedDate as the base for new cycle
    const baseDate = state.lastCompletedDate ? new Date(state.lastCompletedDate) : new Date();
    const cycle = buildCycle(
      type,
      baseDate,
      state.completedCycles + 1,
      state.goal,
      state.progress.completedMonths,
    );
    persist({ ...state, activeSprint: type, currentCycle: cycle });
    setPendingSprintOption(null);
    setModalOpen(false);
    setPendingSipCompleted(null);
    setPendingComfort(null);
  };

  // ── Save Progress ─────────────────────────────────────────────────
  const handleSaveProgress = () => {
    if (
      !saveEnabled ||
      !state.currentCycle ||
      !state.goal ||
      currentWindowIndex < 0
    )
      return;

    const {
      windows,
      isComplete,
      monthsAdded,
      contributionAdded,
      comfort,
    } = resolveWindow(
      state.currentCycle.windows,
      currentWindowIndex,
      pendingSipCompleted!,
      pendingComfort,
      state.currentCycle.type,
    );

    const newProgress = { ...state.progress };
    if (pendingSipCompleted) {
      newProgress.completedMonths =
        state.progress.completedMonths + monthsAdded;
      newProgress.totalContributions =
        state.progress.totalContributions + contributionAdded;
      if (comfort !== null) {
        newProgress.comfortScores = [
          ...state.progress.comfortScores,
          comfort,
        ];
      }
    }

    // Find the end date of the last completed or skipped window
    let lastCompletedDate = state.lastCompletedDate;
    if (pendingSipCompleted !== null && state.currentCycle) {
      const completedWindow = windows
        .slice()
        .reverse()
        .find((w) => w.status === "completed" || w.status === "skipped");
      if (completedWindow) {
        lastCompletedDate = completedWindow.endDate;
      }
    }
    persist({
      ...state,
      currentCycle: { ...state.currentCycle, windows, isComplete },
      progress: newProgress,
      monthlyCompleted:
        state.monthlyCompleted ||
        (isComplete && state.activeSprint === "monthly"),
      lastCompletedDate,
    });

    setPendingSipCompleted(null);
    setPendingComfort(null);
  };

  // ── Completion Action (Continue / Switch) ─────────────────────────
  const handleCompletionAction = (type: SprintBType) => {
    if (!state.goal) return;
    const newCompletedCycles = state.completedCycles + 1;
    // Use lastCompletedDate as the base for new cycle
    const baseDate = state.lastCompletedDate ? new Date(state.lastCompletedDate) : new Date();
    const cycle = buildCycle(
      type,
      baseDate,
      newCompletedCycles + 1,
      state.goal,
      state.progress.completedMonths,
    );
    persist({
      ...state,
      activeSprint: type,
      currentCycle: cycle,
      completedCycles: newCompletedCycles,
      monthlyCompleted:
        state.monthlyCompleted || state.activeSprint === "monthly",
    });
    setPendingSipCompleted(null);
    setPendingComfort(null);
  };


  // ═══════════════════════════════════════════════════════════════════
  // GUARD: No calculator data
  // ═══════════════════════════════════════════════════════════════════
  if (!sprintInputs || !userData) {
    return (
      <>
        <CanonicalPageHeader
          title="Break long-term SIP commitment into focused sprints and track your real progress."
        />
        <div className="max-w-3xl mx-auto w-full py-12">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">Sprint-B</h2>
            <p className="text-slate-600 max-w-md mx-auto">
              Enter Financial Readiness inputs first to activate Sprint-B calculations.
            </p>
          </div>
        </div>
      </>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  const cycleNotComplete =
    state.currentCycle && !state.currentCycle.isComplete;
  const cycleComplete = state.currentCycle?.isComplete;

  return (
    <>
      <CanonicalPageHeader
        title="Break long-term SIP commitment into focused sprints and track your real progress."
      />

        {/* ────────────────────────────────────────────────────────────────
          SECTION 1: SET GOAL - COLLAPSIBLE DASHBOARD
        ──────────────────────────────────────────────────────────────── */}
        {/* Collapsible Financial Goal Dashboard - Enhanced spacing */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm mb-10 overflow-hidden">
        <button
          type="button"
          className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-50/50 transition-colors"
          aria-expanded={isGoalDashboardOpen}
          onClick={() => setIsGoalDashboardOpen((open) => !open)}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {state.goalSet ? "Your Financial Goal" : "Set Your Financial Goal"}
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                {state.goalSet ? (
                  <>
                    {/* Mobile: stacked, Desktop: inline */}
                    <span className="block sm:hidden">
                      Target Age: {state.goal.financialReadinessAge}<br />
                      <span className="mt-1 block">Corpus: ₹{formatINR(state.goal.requiredCorpus)}</span>
                    </span>
                    <span className="hidden sm:inline">
                      Target Age: {state.goal.financialReadinessAge} &#183; Corpus: ₹{formatINR(state.goal.requiredCorpus)}
                    </span>
                  </>
                ) : "Anchor all Sprint calculations to your Financial Readiness Age"}
              </p>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 transition-transform duration-200 text-slate-400 flex-shrink-0 ${isGoalDashboardOpen ? 'rotate-180' : ''}`}
            aria-label={isGoalDashboardOpen ? 'Collapse goal dashboard' : 'Expand goal dashboard'}
          />
        </button>
        
        <div
          className={`transition-all duration-300 ease-in-out ${
            isGoalDashboardOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}
          aria-hidden={!isGoalDashboardOpen}
        >
          <div className="px-6 pb-6 pt-2 border-t border-slate-100">
            {!state.goalSet ? (
              /* Goal Setting Form - Improved spacing */
              <div className="space-y-8">
                {/* Input Row */}
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Financial Readiness Age
                    </label>
                    <input
                      type="number"
                      value={goalAgeInput}
                      onChange={(e) => setGoalAgeInput(Number(e.target.value))}
                      min={userData.currentAge + 1}
                      max={100}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-shadow"
                      placeholder="Enter target age"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSetGoal}
                    disabled={!goalPreview?.valid}
                    className={`px-8 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                      goalPreview?.valid
                        ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow active:scale-[0.98]"
                        : "bg-slate-200 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    Set Goal
                  </button>
                </div>

                {/* Goal Summary Metrics - Improved grid spacing */}
                {goalPreview?.valid && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-5">
                      <span className="text-xs text-slate-500 block mb-1">Current Age</span>
                      <span className="text-xl font-semibold text-slate-900">{userData.currentAge}</span>
                    </div>
                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-5">
                      <span className="text-xs text-slate-500 block mb-1">Required Corpus</span>
                      <span className="text-xl font-semibold text-slate-900 break-words">₹{formatINR(goalPreview.corpus)}</span>
                    </div>
                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-5">
                      <span className="text-xs text-slate-500 block mb-1">Monthly SIP</span>
                      <span className="text-xl font-semibold text-slate-900 break-words">₹{formatINR(goalPreview.sip)}</span>
                    </div>
                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-5">
                      <span className="text-xs text-slate-500 block mb-1">Duration</span>
                      <span className="text-xl font-semibold text-slate-900">{goalPreview.duration} years</span>
                    </div>
                  </div>
                )}

                {goalPreview && !goalPreview.valid && (
                  <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
                    <p className="text-sm text-rose-600">
                      Invalid age — must allow at least 1 year of SIP investment.
                    </p>
                  </div>
                )}
              </div>
            ) : state.goal ? (
              /* Goal Summary (when goal is set) - Improved layout */
              <div className="relative pt-12">
                {/* Desktop: absolute button, Mobile: hidden */}
                <button
                  type="button"
                  onClick={handleChangeGoal}
                  className="hidden sm:block absolute right-0 top-0 border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium rounded-lg px-5 py-2 text-sm transition-colors"
                >
                  Change Goal
                </button>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-lg border border-slate-100 bg-white p-5">
                    <span className="text-xs text-slate-500 block mb-1">Target Age</span>
                    <span className="text-xl font-semibold text-slate-900">{state.goal.financialReadinessAge}</span>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-white p-5">
                    <span className="text-xs text-slate-500 block mb-1">Required Corpus</span>
                    <span className="text-xl font-semibold text-slate-900 break-words">₹{formatINR(state.goal.requiredCorpus)}</span>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-white p-5">
                    <span className="text-xs text-slate-500 block mb-1">Monthly SIP</span>
                    <span className="text-xl font-semibold text-slate-900 break-words">₹{formatINR(currentSIP)}</span>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-white p-5">
                    <span className="text-xs text-slate-500 block mb-1">Duration</span>
                    <span className="text-xl font-semibold text-slate-900">{state.goal.durationYears} years</span>
                  </div>
                </div>
                {/* Mobile: full-width button below cards */}
                <button
                  type="button"
                  onClick={handleChangeGoal}
                  className="block sm:hidden mt-5 w-full border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium rounded-lg px-5 py-3 text-base transition-colors"
                >
                  Change Goal
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────
          Everything below requires a confirmed goal
      ──────────────────────────────────────────────────────────────── */}

      {state.goalSet && state.goal && (
        <>
          {/* ──────────────────────────────────────────────────────────
              SECTION 2: CHOOSE SPRINT MINDSET - Improved cards
          ────────────────────────────────────────────────────────── */}
          <div id="sprint-cards" className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {(() => {
              // Responsive: filter sprint cards for mobile
              const [isMobile, setIsMobile] = useState(false);
              useEffect(() => {
                const mq = window.matchMedia('(max-width: 767px)');
                setIsMobile(mq.matches);
                const handler = () => setIsMobile(mq.matches);
                mq.addEventListener('change', handler);
                return () => mq.removeEventListener('change', handler);
              }, []);
              const hasActiveSprint = Boolean(state.activeSprint);
              // If first-time on mobile, show all cards
              if (isMobile && !hasActiveSprint) {
                return sprintOptions.map((option) => {
                  const isActive = state.activeSprint === option.type;
                  const isMonthlyDone = option.type === "monthly" && state.monthlyCompleted;
                  const isDisabled = Boolean(state.activeSprint && !isActive) || isMonthlyDone;
                  return (
                    <div
                      key={option.type}
                      className="block transition-all duration-200"
                    >
                      <SprintBCard
                        title={option.title}
                        description={option.description}
                        icon={option.icon}
                        badge={option.duration}
                        active={isActive}
                        disabled={isDisabled}
                        onStart={() => handleStartRequest(option)}
                        ctaLabel={
                          isMonthlyDone ? "Completed" : "Start Sprint"
                        }
                      />
                    </div>
                  );
                });
              }
              // Otherwise, keep existing mobile/desktop behavior
              return sprintOptions.map((option) => {
                const isActive = state.activeSprint === option.type;
                const isMonthlyDone = option.type === "monthly" && state.monthlyCompleted;
                const isDisabled = Boolean(state.activeSprint && !isActive) || isMonthlyDone;
                return (
                  <div
                    key={option.type}
                    className={`transition-all duration-200 ${
                      isActive ? "block scale-[1.02]" : "hidden sm:block"
                    }`}
                  >
                    <SprintBCard
                      title={option.title}
                      description={option.description}
                      icon={option.icon}
                      badge={option.duration}
                      active={isActive}
                      disabled={isDisabled}
                      onStart={() => handleStartRequest(option)}
                      ctaLabel={
                        isMonthlyDone ? "Completed" : "Start Sprint"
                      }
                    />
                  </div>
                );
              });
            })()}
          </div>

          {/* ──────────────────────────────────────────────────────────
              SECTION 3: ACTIVE SPRINT DETAILS - Improved spacing
          ────────────────────────────────────────────────────────── */}
          {state.activeSprint && state.currentCycle && (
            <>
              {/* Premium Mobile UI: Sprint Period & Total SIP Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Sprint Period Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <span className="text-xs text-slate-500 block mb-2">Sprint Period</span>
                  <span className="text-sm font-medium text-slate-900 leading-relaxed">
                    {formatDateShort(state.currentCycle.startDate)} – {formatDateShort(state.currentCycle.windows[state.currentCycle.windows.length - 1]?.endDate ?? state.currentCycle.startDate)}
                  </span>
                </div>
                {/* Total SIP Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <span className="text-xs text-slate-500 block mb-2">Total SIP</span>
                  <span className="text-xl font-semibold text-slate-900">
                    ₹{formatINR(
                      state.activeSprint === "monthly"
                        ? currentSIP
                        : state.activeSprint === "annual"
                          ? currentSIP * 12
                          : currentSIP * 3
                    )}
                  </span>
                </div>
              </div>

              {/* ── Sprint Windows ────────────────────────────────── */}
              <div className="mb-8">
                <SprintWindowSummary
                  sprintType={state.activeSprint}
                  overrideWindows={windowOverrides}
                  overrideStartISO={state.currentCycle.startDate}
                  currentSIP={currentSIP}
                />
              </div>

              {/* ──────────────────────────────────────────────────────
                  SECTION 4: SIP EXECUTION + COMFORT - Improved card
              ────────────────────────────────────────────────────── */}
              {cycleNotComplete && currentWindowIndex >= 0 && (
                <div className="mt-8 mb-10">
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 md:p-8">
                    {/* Header */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-slate-900">Record Your Progress</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Track your SIP completion and comfort level for this window.
                      </p>
                    </div>

                    {/* Input Row */}
                    <div className="mb-8">
                      <SprintBCompletion
                        sipCompleted={pendingSipCompleted}
                        comfortLevel={pendingComfort}
                        onSipChange={(val) => {
                          setPendingSipCompleted(val);
                          if (!val) setPendingComfort(null);
                        }}
                        onComfortChange={setPendingComfort}
                      />
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                      <p className="text-xs text-slate-400">
                        Progress is recorded only after saving. No optimistic updates.
                      </p>
                      <button
                        type="button"
                        onClick={handleSaveProgress}
                        disabled={!saveEnabled}
                        className={`w-full md:w-auto px-8 py-3 rounded-xl text-sm font-semibold transition-all ${
                          saveEnabled
                            ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow active:scale-[0.98]"
                            : "bg-slate-200 text-slate-500 cursor-not-allowed"
                        }`}
                      >
                        Save Progress
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── No sprint selected ────────────────────────────────── */}
          {!state.activeSprint && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 mb-8">
              <p className="text-slate-600 text-center">
                Choose a sprint mindset above and confirm to start tracking your progress.
              </p>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────
              SECTION 5: PROGRESS DASHBOARD - With spacing
          ────────────────────────────────────────────────────────── */}
          {kpis && (
            <div className="mb-10">
              <SprintBResult kpis={kpis} show={hasProgress} />
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────
              SECTION 6: COMPLETION & LOOPING - With spacing
          ────────────────────────────────────────────────────────── */}
          {cycleComplete && state.activeSprint && kpis && (
            <div className="mt-8">
              <Congratulations
                currentSprintType={state.activeSprint}
                pathCoveredPct={kpis.pathCoveredPct}
                corpusBuiltPct={kpis.corpusBuiltPct}
                onAction={handleCompletionAction}
                visible
              />
            </div>
          )}
        </>
      )}

      {/* ────────────────────────────────────────────────────────────────
          Modal: Sprint confirmation (keep as is - external component)
      ──────────────────────────────────────────────────────────────── */}
      <SprintBModal
        open={modalOpen}
        title={pendingSprintOption?.title ?? "Sprint"}
        description={
          pendingSprintOption?.description ??
          "Start this sprint to unlock completion tracking."
        }
        overview={pendingSprintOption?.overview ?? []}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmStart}
      />

      {/* ────────────────────────────────────────────────────────────────
          Dialog: Change Goal confirmation - Improved dialog
      ──────────────────────────────────────────────────────────────── */}
      {showChangeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4M12 16h.01"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900">Before You Change Your Goal</h3>
            </div>
            
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Changing your financial goal frequently is usually not a healthy long-term investing habit. Consistency matters more than perfection. Small course corrections over time often lead to better outcomes than frequent resets.
            </p>
            
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-slate-600 mb-3">
                If you're feeling unsure or stuck, you don't have to figure it out alone. Talk to a Vinca Wealth manager for personalised guidance.
              </p>
              <button
                type="button"
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium hover:underline transition-colors"
                onClick={() => { window.location.href = '/dashboard/investor-hub/elevate'; }}
              >
                Talk to a Vinca Wealth Manager →
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowChangeConfirm(false)}
                className="px-5 py-2.5 w-full sm:w-auto text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmChangeGoal}
                className="px-5 py-2.5 w-full sm:w-auto rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Reset Goal Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SprintBPage;