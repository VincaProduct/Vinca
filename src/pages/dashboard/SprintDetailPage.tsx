import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import SprintSummaryCardRow from "@/components/sprint/SprintSummaryCardRow";
import ComfortLevelScale from "@/components/sprint/ComfortLevelScale";
import { getSprintById } from "@/lib/sprint/sprintCatalog";
import { getSprintState, saveSprintState } from "@/lib/sprint/sprintStore";
import { addJournalEntry } from "@/lib/sprint/sprintJournalStore";
import { SprintPlan, SprintUnitState } from "@/lib/sprint/sprint.types";
import {
  buildCompletedSprintsFromState,
  calculateCompletionDeltas,
  calculateCoveredPercentage,
  calculateProjectionMetrics,
  calculateSprintSIP,
  getFinancialReadinessData,
  validateSIPConsistency,
} from "@/lib/sprint/sprintCalculations";

const SprintDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { sprintId } = useParams();
  const sprint = getSprintById(sprintId ?? "");

  const [reflections, setReflections] = useState(() => Array(12).fill({}));
  function saveReflection(monthIdx: number, patch: Record<string, unknown>) {
    setReflections((prev) => {
      const next = [...prev];
      next[monthIdx] = { ...next[monthIdx], ...patch };
      return next;
    });
  }

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [plan, setPlan] = useState<SprintPlan>(null);
  const [status, setStatus] = useState<"not_started" | "active" | "completed" | "completed_final" | "stopped" | "archived">("not_started");
  const [phaseStatus, setPhaseStatus] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [units, setUnits] = useState<Record<number, SprintUnitState>>({});
  const [instanceId, setInstanceId] = useState<string | undefined>(undefined);

  const { userData, targetCorpus, sipConfig } = useMemo(() => getFinancialReadinessData(), []);

  const sprintSipConfig = useMemo(() => {
    if (!sipConfig) return null;
    return sipConfig;
  }, [sipConfig]);

  const computeSprintSIP = useCallback(
    (anchorDate?: string | Date | null) => {
      if (!sprintSipConfig) return 0;
      const date = anchorDate instanceof Date ? anchorDate : anchorDate ? new Date(anchorDate) : new Date();
      if (Number.isNaN(date.getTime())) return 0;
      const sip = calculateSprintSIP({
        baseAmount: sprintSipConfig.baseAmount,
        yearlyIncrease: sprintSipConfig.yearlyIncreasePercent,
        startYear: sprintSipConfig.startYear,
        targetDate: date,
      });

      if (process.env.NODE_ENV !== "production") {
        const consistent = validateSIPConsistency(sprintSipConfig.baseAmount * Math.pow(1 + sprintSipConfig.yearlyIncreasePercent / 100, date.getFullYear() - sprintSipConfig.startYear), sip);
        if (!consistent) {
          console.warn("Sprint SIP mismatch detected", { base: sprintSipConfig.baseAmount, sip, date });
        }
      }

      return sip;
    },
    [sprintSipConfig]
  );

  const buildPlanForSprint = useCallback(
    (anchorDate?: string | null, targetSprint?: ReturnType<typeof getSprintById>): SprintPlan => {
      const date = anchorDate ? new Date(anchorDate) : new Date();
      const sprintSIP = computeSprintSIP(date);
      const target = targetSprint ?? sprint;
      if (target.type === "monthly") {
        return {
          suggestedSIP: sprintSIP,
          salaryCycle: "Monthly",
          monthLabel: date.toLocaleString("default", { month: "long" }),
        };
      }
      if (target.type === "quarterly") {
        const monthlySIPs = [sprintSIP, sprintSIP, sprintSIP];
        return {
          monthlySIPs,
          totalQuarterlySIP: sprintSIP * 3,
          durationLabel: "3 months",
        };
      }
      const quarterlySIPs = [sprintSIP, sprintSIP, sprintSIP, sprintSIP];
      return {
        quarterlySIPs,
        totalAnnualSIP: sprintSIP * 4,
        durationLabel: "12 months",
        stepUps: [0, 0, 0, 0],
      };
    },
    [computeSprintSIP, sprint]
  );

  useEffect(() => {
    if (!sprint || !sprintId) return;
    const state = getSprintState();
    const progress = state.progress?.[sprintId] || {};
    setStatus((progress.status as typeof status) || "not_started");
    setStartDate(progress.startDate || "");
    setEndDate(progress.endDate || "");
    setPhaseStatus(progress.phaseStatus || []);
    setSelectedStatus(progress.phaseStatus?.[0] || null);
    setInstanceId(progress.instanceId);
    if (progress.units) {
      setUnits(progress.units);
    }
    const anchor = progress.startDate || new Date().toISOString().slice(0, 10);
    setPlan(buildPlanForSprint(anchor));
  }, [buildPlanForSprint, sprint, sprintId]);

  if (!sprint) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20">
        <div className="text-lg text-slate-500 font-semibold mb-4">Challenge not found</div>
        <button
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold"
          onClick={() => navigate("/dashboard/sprints")}
          type="button"
        >
          Back to Challenges
        </button>
      </div>
    );
  }

  function handleStart() {
    const state = getSprintState();
    if (sprint.id === "monthly_sip_kickstart" && state.progress?.[sprint.id]?.status === "completed_final") {
      alert("Monthly Sprint has been completed and can only be started once. Please choose Quarterly or Annual Sprint.");
      return;
    }

    if (state.activeSprintId && state.activeSprintId !== sprint.id) {
      alert("You already have an active sprint in progress. Complete it before switching your sprint mindset.");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const newPlan = buildPlanForSprint(today);
    let calculatedEnd = today;
    let phaseLen = 1;
    if (sprint.type === "monthly") {
      calculatedEnd = new Date(new Date(today).setMonth(new Date(today).getMonth() + 1)).toISOString().slice(0, 10);
      phaseLen = 1;
    } else if (sprint.type === "quarterly") {
      calculatedEnd = new Date(new Date(today).setMonth(new Date(today).getMonth() + 3)).toISOString().slice(0, 10);
      phaseLen = 3;
    } else if (sprint.type === "yearly") {
      calculatedEnd = new Date(new Date(today).setMonth(new Date(today).getMonth() + 12)).toISOString().slice(0, 10);
      phaseLen = 4;
    }
    state.activeSprintId = sprint.id;
    state.progress = state.progress || {};
    const instanceId = `${sprint.id}-${Date.now()}`;
    state.progress[sprint.id] = {
      startedAt: today,
      startDate: today,
      endDate: calculatedEnd,
      status: "active",
      plan: newPlan,
      phaseStatus: Array(phaseLen).fill("pending"),
      units: {},
      instanceId,
    };
    saveSprintState(state);
    setStatus("active");
    setInstanceId(instanceId);
    setPlan(newPlan);
    setStartDate(today);
    setEndDate(calculatedEnd);
    setPhaseStatus(state.progress[sprint.id].phaseStatus || []);
  }

  function handleSelectNextSprint(sprintType: "quarterly" | "annual") {
    const today = new Date().toISOString().slice(0, 10);
    const state = getSprintState();
    state.progress = state.progress || {};

    state.progress["monthly_sip_kickstart"] = {
      ...state.progress["monthly_sip_kickstart"],
      status: "completed_final",
      locked: true,
    };

    if (sprintType === "quarterly") {
      state.activeSprintId = "quarterly_sip_discipline";
      const quarterly = getSprintById("quarterly_sip_discipline");
      const qPlan = buildPlanForSprint(today, quarterly);
      state.progress["quarterly_sip_discipline"] = {
        startedAt: today,
        startDate: today,
        endDate: new Date(new Date(today).setMonth(new Date(today).getMonth() + 3)).toISOString().slice(0, 10),
        status: "active",
        plan: qPlan,
        phaseStatus: ["pending", "pending", "pending"],
        units: {},
      };
      saveSprintState(state);
      navigate("/dashboard/sprints/quarterly_sip_discipline");
    } else if (sprintType === "annual") {
      state.activeSprintId = "annual_retirement_consistency";
      const annual = getSprintById("annual_retirement_consistency");
      const aPlan = buildPlanForSprint(today, annual);
      state.progress["annual_retirement_consistency"] = {
        startedAt: today,
        startDate: today,
        endDate: new Date(new Date(today).setMonth(new Date(today).getMonth() + 12)).toISOString().slice(0, 10),
        status: "active",
        plan: aPlan,
        phaseStatus: ["pending", "pending", "pending", "pending"],
        units: {},
      };
      saveSprintState(state);
      navigate("/dashboard/sprints/annual_retirement_consistency");
    }
  }

  function getMonthRange(start: string, monthOffset: number) {
    const base = new Date(start);
    const monthStart = new Date(base.getFullYear(), base.getMonth() + monthOffset, base.getDate());
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    return {
      label: monthStart.toLocaleString("default", { month: "long", year: "numeric" }),
      range: `${monthStart.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })} → ${monthEnd.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}`,
      start: monthStart,
      end: monthEnd,
    };
  }

  function getQuarterRange(start: string, quarterIdx: number) {
    const base = new Date(start);
    const qStart = new Date(base.getFullYear(), base.getMonth() + quarterIdx * 3, base.getDate());
    const qEnd = new Date(qStart);
    qEnd.setMonth(qEnd.getMonth() + 3);
    return {
      label: `Q${quarterIdx + 1} ${qStart.getFullYear()}`,
      range: `${qStart.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })} → ${qEnd.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}`,
      start: qStart,
      end: qEnd,
    };
  }

  useEffect(() => {
    if (status === "active" || status === "completed") {
      const state = getSprintState();
      const saved = state.progress?.[sprintId ?? ""]?.units || {};
      setUnits(saved);
    }
  }, [sprintId, status]);

  function updateUnit(unitIdx: number, patch: Partial<SprintUnitState>) {
    setUnits((prev) => {
      const next = {
        ...prev,
        [unitIdx]: { ...prev[unitIdx], ...patch, isDirty: true, isOpen: prev[unitIdx]?.isOpen ?? true },
      };
      return next;
    });
  }

  function saveUnit(unitIdx: number) {
    setUnits((prev) => {
      const unit = prev[unitIdx] || {};
      const isNoSIP = unit.form?.completed === "no";
      const savedForm: SprintUnitState["form"] = {
        sipCompleted: unit.form?.completed === "yes",
      };
      if (unit.form?.completed === "yes") {
        savedForm.comfortLevel = unit.form?.comfortLevel ?? null;
      }
      const next = { ...prev, [unitIdx]: { ...unit, form: savedForm, isSaved: true, isCompleted: true, isDirty: false } };
      const state = getSprintState();
      state.progress = state.progress || {};
      if (!state.progress[sprint.id]) {
        state.progress[sprint.id] = { startDate, endDate, status, plan: plan ?? undefined, phaseStatus: [], units: {} };
      }
      state.progress[sprint.id].units = next;
      if (isNoSIP) {
        state.progress[sprint.id].status = "stopped";
        setStatus("stopped");
      }
      saveSprintState(state);
      // Mark completed when all required units are finished
      if (sprint.id === "quarterly_sip_discipline" && (plan as any)?.monthlySIPs) {
        const allDone = (plan as any).monthlySIPs.every((_: unknown, idx: number) => next[idx]?.isCompleted);
        if (allDone) {
          state.progress[sprint.id].status = "completed";
          saveSprintState(state);
          setStatus("completed");
        }
      }
      if (sprint.id === "annual_retirement_consistency" && (plan as any)?.quarterlySIPs) {
        const allDone = (plan as any).quarterlySIPs.every((_: unknown, qIdx: number) => [0, 1, 2].every((m) => next[qIdx * 3 + m]?.isCompleted));
        if (allDone) {
          state.progress[sprint.id].status = "completed";
          saveSprintState(state);
          setStatus("completed");
        }
      }
      return next;
    });
  }

  function logToJournal(unitIdx: number, meta: { label: string; range: string; quarter?: string }) {
    const unit = units[unitIdx];
    addJournalEntry({
      sprintId: sprint.id,
      sprintTitle: sprint.title,
      period: meta.label,
      range: meta.range,
      quarter: meta.quarter,
      answers: unit?.form,
      type: "log",
    });
    navigate("/dashboard/journal");
  }

  function toggleUnitOpen(unitIdx: number) {
    setUnits((prev) => ({ ...prev, [unitIdx]: { ...prev[unitIdx], isOpen: !prev[unitIdx]?.isOpen } }));
  }

  const completedSprints = useMemo(() => buildCompletedSprintsFromState(getSprintState()), [status, sprintId]);

  const currentCompletion = useMemo(() => {
    if (!sprint) return null;
    const reversed = [...completedSprints].reverse();
    const match = reversed.find((entry) => {
      if (instanceId && entry.instanceId) return entry.instanceId === instanceId;
      return entry.id === sprint.id;
    });
    return match || null;
  }, [completedSprints, instanceId, sprint]);

  const completedBeforeCurrent = useMemo(() => {
    if (!currentCompletion) return completedSprints;
    return completedSprints.filter((entry) => entry !== currentCompletion);
  }, [completedSprints, currentCompletion]);

  const coverageBefore = useMemo(() => {
    if (!userData) return 0;
    return calculateCoveredPercentage(userData.currentAge, userData.retirementAge, completedBeforeCurrent);
  }, [userData, completedBeforeCurrent]);

  const coverageAfter = useMemo(() => {
    if (!userData) return 0;
    return calculateCoveredPercentage(userData.currentAge, userData.retirementAge, completedSprints);
  }, [userData, completedSprints]);

  const beforeProjection = useMemo(() => {
    if (!userData) return { projectedCorpus: 0, builtPercentage: 0 };
    return calculateProjectionMetrics({ userData, completedSprints: completedBeforeCurrent, targetCorpus });
  }, [userData, completedBeforeCurrent, targetCorpus]);

  const afterProjection = useMemo(() => {
    if (!userData) return { projectedCorpus: 0, builtPercentage: 0 };
    return calculateProjectionMetrics({ userData, completedSprints, targetCorpus });
  }, [userData, completedSprints, targetCorpus]);

  const { timeProgressDelta: retirementProgressPercent, corpusGrowthPercent: corpusIncreasePercent } = useMemo(() => {
    if (!userData || !currentCompletion) {
      return { timeProgressDelta: 0, corpusGrowthPercent: 0 };
    }
    return calculateCompletionDeltas(
      { coveredPercentage: coverageBefore, projectedCorpus: beforeProjection.projectedCorpus },
      { coveredPercentage: coverageAfter, projectedCorpus: afterProjection.projectedCorpus },
    );
  }, [userData, currentCompletion, coverageBefore, coverageAfter, beforeProjection.projectedCorpus, afterProjection.projectedCorpus]);

  const addMonths = (dateStr: string | undefined, months: number) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return null;
    d.setMonth(d.getMonth() + months);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 10);
  };

  const archiveAndSeedNext = (
    state: ReturnType<typeof getSprintState>,
    sprintKey: string,
    nextProgress: Omit<NonNullable<ReturnType<typeof getSprintState>["progress"]>[string], "history">,
  ) => {
    const prev = state.progress?.[sprintKey];
    const history = prev?.history ? [...prev.history] : [];
    if (prev) {
      history.push({ ...prev, status: "archived" });
    }
    state.progress = state.progress || {};
    state.progress[sprintKey] = { ...nextProgress, history };
  };

  function handleContinueNextQuarter() {
    const state = getSprintState();
    const prev = state.progress?.[sprint.id];
    if (!prev) return;
    const start = prev.endDate || prev.startDate || new Date().toISOString().slice(0, 10);
    const nextStartDate = addMonths(start, 0) || start;
    const nextEndDate = addMonths(nextStartDate, 3) || nextStartDate;
    const newPlan = buildPlanForSprint(nextStartDate, sprint);
    const instanceId = `${sprint.id}-${Date.now()}`;
    archiveAndSeedNext(state, sprint.id, {
      startedAt: nextStartDate,
      startDate: nextStartDate,
      endDate: nextEndDate,
      status: "active",
      plan: newPlan,
      phaseStatus: ["pending", "pending", "pending"],
      units: {},
      instanceId,
    });
    state.activeSprintId = sprint.id;
    saveSprintState(state);
    setStatus("active");
    setInstanceId(instanceId);
    setStartDate(nextStartDate);
    setEndDate(nextEndDate);
    setPhaseStatus(["pending", "pending", "pending"]);
    setUnits({});
    setPlan(newPlan);
  }

  function handleSwitchToAnnualFromQuarter() {
    const state = getSprintState();
    const prev = state.progress?.[sprint.id];
    if (!prev) return;
    const start = prev.endDate || prev.startDate || new Date().toISOString().slice(0, 10);
    const nextStartDate = addMonths(start, 0) || start;
    const nextEndDate = addMonths(nextStartDate, 12) || nextStartDate;
    const annual = getSprintById("annual_retirement_consistency");
    const annualPlan = buildPlanForSprint(nextStartDate, annual);
    const instanceId = `annual_retirement_consistency-${Date.now()}`;
    archiveAndSeedNext(state, sprint.id, { ...prev, status: "archived", instanceId: prev.instanceId });
    const annualHistory = state.progress?.["annual_retirement_consistency"]?.history || [];
    state.progress = state.progress || {};
    state.progress["annual_retirement_consistency"] = {
      startedAt: nextStartDate,
      startDate: nextStartDate,
      endDate: nextEndDate,
      status: "active",
      plan: annualPlan,
      phaseStatus: ["pending", "pending", "pending", "pending"],
      units: {},
      instanceId,
      history: annualHistory,
    };
    state.activeSprintId = "annual_retirement_consistency";
    saveSprintState(state);
    setStatus("active");
    setInstanceId(instanceId);
    setStartDate(nextStartDate);
    setEndDate(nextEndDate);
    setPhaseStatus(["pending", "pending", "pending", "pending"]);
    setUnits({});
    setPlan(annualPlan);
    navigate("/dashboard/sprints/annual_retirement_consistency");
  }

  function handleContinueNextYear() {
    const state = getSprintState();
    const prev = state.progress?.[sprint.id];
    if (!prev) return;
    const start = prev.endDate || prev.startDate || new Date().toISOString().slice(0, 10);
    const nextStartDate = addMonths(start, 0) || start;
    const nextEndDate = addMonths(nextStartDate, 12) || nextStartDate;
    const newPlan = buildPlanForSprint(nextStartDate, sprint);
    const instanceId = `${sprint.id}-${Date.now()}`;
    archiveAndSeedNext(state, sprint.id, {
      startedAt: nextStartDate,
      startDate: nextStartDate,
      endDate: nextEndDate,
      status: "active",
      plan: newPlan,
      phaseStatus: ["pending", "pending", "pending", "pending"],
      units: {},
      instanceId,
    });
    state.activeSprintId = sprint.id;
    saveSprintState(state);
    setStatus("active");
    setInstanceId(instanceId);
    setStartDate(nextStartDate);
    setEndDate(nextEndDate);
    setPhaseStatus(["pending", "pending", "pending", "pending"]);
    setUnits({});
    setPlan(newPlan);
  }

  function handleSwitchToQuarterFromAnnual() {
    const state = getSprintState();
    const prev = state.progress?.[sprint.id];
    if (!prev) return;
    const start = prev.endDate || prev.startDate || new Date().toISOString().slice(0, 10);
    const nextStartDate = addMonths(start, 0) || start;
    const nextEndDate = addMonths(nextStartDate, 3) || nextStartDate;
    const quarterly = getSprintById("quarterly_sip_discipline");
    const qPlan = buildPlanForSprint(nextStartDate, quarterly);
    const instanceId = `quarterly_sip_discipline-${Date.now()}`;
    archiveAndSeedNext(state, sprint.id, { ...prev, status: "archived", instanceId: prev.instanceId });
    const quarterlyHistory = state.progress?.["quarterly_sip_discipline"]?.history || [];
    state.progress = state.progress || {};
    state.progress["quarterly_sip_discipline"] = {
      startedAt: nextStartDate,
      startDate: nextStartDate,
      endDate: nextEndDate,
      status: "active",
      plan: qPlan,
      phaseStatus: ["pending", "pending", "pending"],
      units: {},
      instanceId,
      history: quarterlyHistory,
    };
    state.activeSprintId = "quarterly_sip_discipline";
    saveSprintState(state);
    setStatus("active");
    setInstanceId(instanceId);
    setStartDate(nextStartDate);
    setEndDate(nextEndDate);
    setPhaseStatus(["pending", "pending", "pending"]);
    setUnits({});
    setPlan(qPlan);
    navigate("/dashboard/sprints/quarterly_sip_discipline");
  }

  return (
    <div className="w-full max-w-3xl mx-auto pl-4 pr-4 sm:pl-8 sm:pr-8 py-10 flex flex-col gap-10">
      <div className="w-full bg-white rounded-2xl shadow p-6 flex flex-col gap-2 items-start">
        <div className="text-lg font-bold text-slate-900 mb-2">Objective</div>
        <div className="flex flex-row gap-8 text-base text-slate-700">
          <div><span className="font-semibold">Why:</span> Reduce execution friction by focusing on a single, time-bound SIP commitment.</div>
          <div><span className="font-semibold">Who:</span> Investors starting or restarting retirement investing.</div>
          <div><span className="font-semibold">Discipline:</span> Salary-aligned SIP execution with clear completion criteria.</div>
        </div>
      </div>

      <div className="w-full bg-white rounded-2xl shadow p-6 flex flex-col gap-2 items-start">
        <div className="text-lg font-bold text-slate-900 mb-2">How to complete</div>
        {sprint.id === "annual_retirement_consistency" ? (
          <ul className="list-disc text-base text-slate-700 pl-6 text-left w-full max-w-2xl">
            <li>Your annual SIP commitment is divided into quarterly and monthly execution sprints</li>
            <li>Each month requires:
              <ul className="list-disc pl-6">
                <li>SIP execution</li>
                <li>Reflection & notes to track comfort, challenges, and discipline</li>
              </ul>
            </li>
            <li>These reflections help you understand sustainability over time</li>
            <li>Completion depends on consistent execution + tracking, not just investing once</li>
          </ul>
        ) : (
          <ul className="list-disc text-base text-slate-700 pl-6 text-left w-full max-w-2xl">
            <li>SIP amount is pre-calculated from your saved retirement plan</li>
            <li>You must execute the SIP within the defined time window</li>
            <li>Each execution confirms progress for this sprint</li>
            <li>Completion is based on confirmed execution, not intent</li>
          </ul>
        )}
      </div>

      {(status === "active" || status === "completed") && (
        <>
          <SprintSummaryCardRow
            startDate={startDate}
            endDate={endDate}
            sipAmount={
              sprint.id === "monthly_sip_kickstart"
                ? (plan as any)?.suggestedSIP || "-"
                : sprint.id === "quarterly_sip_discipline"
                  ? (plan as any)?.totalQuarterlySIP || "-"
                  : (plan as any)?.totalAnnualSIP || "-"
            }
            status={status === "completed" ? "Completed" : status === "active" ? "In Progress" : "Current"}
            className="mb-2 mt-1"
          />

          {sprint.id === "monthly_sip_kickstart" && (
            <div className="w-full mt-8">
              {(() => {
                const { label, range } = getMonthRange(startDate, 0);
                const unit = units[0] || { form: {}, isOpen: true, isDirty: false, isSaved: false, isCompleted: false };
                const { form = {}, isOpen, isSaved, isCompleted } = unit;
                const canSave = form?.completed && (form?.completed === "no" || form?.comfortLevel);
                const isCompletedYes = form?.completed === "yes";
                return (
                  <div className="border border-slate-200 rounded-xl p-6 bg-white flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-slate-900 text-lg">{label}</div>
                        <button
                          className="ml-auto p-1 text-emerald-700 hover:text-emerald-800 transition"
                          onClick={() => toggleUnitOpen(0)}
                          type="button"
                          aria-label={isOpen ? "Collapse" : "Expand"}
                        >
                          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                    </div>
                    <div className="text-slate-500 text-sm">{range}</div>
                    <div className="text-slate-600 text-sm">Status: {isCompleted ? "Completed" : "Current"}</div>
                    {isOpen && (
                      <>
                        {!isCompleted ? (
                          <div className="flex flex-col gap-6 mt-4">
                            <div className="text-sm font-semibold text-slate-700">Monthly SIP Reflection</div>
                            <div className="grid grid-cols-1 gap-6">
                              <div className="flex flex-col gap-3">
                                <label className="text-slate-700 text-sm font-medium">Did I do my SIP?</label>
                                <div className="flex gap-2">
                                  {["yes", "no"].map((val) => (
                                    <button
                                      key={val}
                                      type="button"
                                      className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                                        form.completed === val
                                          ? "bg-emerald-600 text-white border-emerald-600"
                                          : "bg-white text-emerald-700 border-emerald-200 hover:border-emerald-300"
                                      }`}
                                      onClick={() =>
                                        updateUnit(0, { form: { ...form, completed: val as "yes" | "no", comfortLevel: val === "no" ? null : form.comfortLevel } })
                                      }
                                    >
                                      {val === "yes" ? "Yes" : "No"}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {isCompletedYes && (
                                <div className="flex flex-col gap-3">
                                  <label className="text-slate-700 text-sm font-medium">How comfortable did it feel?</label>
                                  <ComfortLevelScale
                                    value={(form as any).comfortLevel || null}
                                    onChange={(val) => updateUnit(0, { form: { ...form, comfortLevel: val } })}
                                    disabled={false}
                                  />
                                </div>
                              )}
                            </div>

                            <button
                              className="mt-4 px-4 py-2 rounded-full bg-emerald-600 text-white font-semibold disabled:opacity-50"
                              disabled={!canSave}
                              onClick={() => saveUnit(0)}
                              type="button"
                            >
                              Save Progress
                            </button>
                            {isSaved && (
                              <div className="flex flex-col gap-3 mt-2 p-4 bg-emerald-50 rounded-lg">
                                <div className="text-emerald-700 font-semibold">Saved. This period is complete.</div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-4">
                            {sprint.id === "monthly_sip_kickstart" && (
                              <div className="w-full bg-emerald-50 border border-emerald-100 rounded-xl p-5 flex flex-col gap-3">
                                <div className="flex flex-col gap-1">
                                  <div className="text-sm font-semibold text-slate-900">Your journey has begun</div>
                                  <div className="text-xs text-slate-600">You've completed your first SIP. Choose how you want to continue.</div>
                                </div>
                                <div className="flex gap-2 pt-1">
                                  <button
                                    className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition flex flex-col items-start gap-0.5"
                                    onClick={() => handleSelectNextSprint("quarterly")}
                                    type="button"
                                  >
                                    <div>Quarterly Sprint</div>
                                    <div className="text-xs font-normal opacity-90">Review progress every 3 months</div>
                                  </button>
                                  <button
                                    className="flex-1 px-4 py-2 rounded-lg border border-emerald-600 text-emerald-700 text-sm font-medium hover:bg-emerald-50 transition flex flex-col items-start gap-0.5"
                                    onClick={() => handleSelectNextSprint("annual")}
                                    type="button"
                                  >
                                    <div>Annual Sprint</div>
                                    <div className="text-xs font-normal opacity-90">Build long-term investing discipline</div>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {sprint.id === "quarterly_sip_discipline" && (
            <div className="w-full mt-8">
              {(() => {
                if (!(plan as any)?.monthlySIPs) return null;
                const monthlySIPs = (plan as any).monthlySIPs as number[];
                const monthObjs = monthlySIPs.map((_, idx) => {
                  const { label, range } = getMonthRange(startDate, idx);
                  const unit = units[idx] || { form: {}, isOpen: idx === 0, isDirty: false, isSaved: false, isCompleted: false };
                  const { form = {}, isOpen, isSaved, isCompleted } = unit;
                  const prevCompleted = idx === 0 || (units[idx - 1] && units[idx - 1].isCompleted);
                  const isCurrent = !isCompleted && prevCompleted;
                  const isCompletedUnit = isCompleted;
                  return {
                    idx,
                    label,
                    range,
                    form,
                    isOpen,
                    isSaved,
                    isCompleted,
                    isCurrent,
                    isCompletedUnit,
                    canSave: form?.completed && (form?.completed === "no" || form?.comfortLevel),
                  };
                });
                const sorted = [...monthObjs].sort((a, b) => b.idx - a.idx);
                const current = sorted.find((m) => m.isCurrent);
                const completed = sorted.filter((m) => m.isCompletedUnit);
                return [
                  current && (
                    <div key={current.idx} className="border border-slate-200 rounded-xl p-6 bg-white flex flex-col gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-slate-900 text-lg">{current.label}</div>
                        <button
                          className="ml-auto p-1 text-emerald-700 hover:text-emerald-800 transition"
                          onClick={() => toggleUnitOpen(current.idx)}
                          type="button"
                          aria-label={current.isOpen ? "Collapse" : "Expand"}
                        >
                          {current.isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="text-slate-500 text-sm">{current.range}</div>
                      <div className="text-slate-600 text-sm">Status: Current</div>
                      {current.isOpen && (
                        <>
                          <div className="flex flex-col gap-6 mt-4">
                            <div className="text-sm font-semibold text-slate-700">Monthly SIP Reflection</div>
                            <div className="grid grid-cols-1 gap-6">
                              <div className="flex flex-col gap-3">
                                <label className="text-slate-700 text-sm font-medium">Did I do my SIP?</label>
                                <div className="flex gap-2">
                                  {["yes", "no"].map((val) => (
                                    <button
                                      key={val}
                                      type="button"
                                      className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                                        current.form.completed === val
                                          ? "bg-emerald-600 text-white border-emerald-600"
                                          : "bg-white text-emerald-700 border-emerald-200 hover:border-emerald-300"
                                      }`}
                                      onClick={() =>
                                        updateUnit(current.idx, {
                                          form: {
                                            ...current.form,
                                            completed: val as "yes" | "no",
                                            comfortLevel: val === "no" ? null : current.form.comfortLevel,
                                          },
                                        })
                                      }
                                    >
                                      {val === "yes" ? "Yes" : "No"}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {current.form.completed === "yes" && (
                                <div className="flex flex-col gap-3">
                                  <label className="text-slate-700 text-sm font-medium">How comfortable did it feel?</label>
                                  <ComfortLevelScale
                                    value={(current.form as any).comfortLevel || null}
                                    onChange={(val) => updateUnit(current.idx, { form: { ...current.form, comfortLevel: val } })}
                                    disabled={false}
                                  />
                                </div>
                              )}
                            </div>

                            <button
                              className="mt-4 px-4 py-2 rounded-full bg-emerald-600 text-white font-semibold disabled:opacity-50"
                              disabled={!current.canSave}
                              onClick={() => saveUnit(current.idx)}
                              type="button"
                            >
                              Save Progress
                            </button>
                            {current.isSaved && (
                              <div className="flex flex-col gap-3 mt-2 p-4 bg-emerald-50 rounded-lg">
                                <div className="text-emerald-700 font-semibold">Saved. This period is complete.</div>
                                <button
                                  className="px-4 py-2 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                                  onClick={() => logToJournal(current.idx, { label: current.label, range: current.range })}
                                  type="button"
                                >
                                  Log this into Journal
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ),
                  ...completed.map(({ idx, label, range }) => (
                    <div key={idx} className="border border-slate-200 rounded-xl p-6 bg-white flex flex-col gap-2 mb-4 opacity-80">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-slate-900 text-lg">{label}</div>
                        <span className="ml-auto text-xs text-slate-400">Completed</span>
                      </div>
                      <div className="text-slate-500 text-sm">{range}</div>
                      <div className="text-slate-600 text-sm">Status: Completed</div>
                    </div>
                  )),
                ];
              })()}
            </div>
          )}

          {sprint.id === "annual_retirement_consistency" && (
            <div className="w-full mt-8">
              {(() => {
                const quarterObjs = [0, 1, 2, 3].map((qIdx) => {
                  const quarterStartMonth = qIdx * 3;
                  const { start } = getQuarterRange(startDate, qIdx);
                  const quarterCompleted = [0, 1, 2].every((m) => units[quarterStartMonth + m] && units[quarterStartMonth + m].isCompleted);
                  const prevQuarterCompleted = qIdx === 0 || [0, 1, 2].every((m) => units[quarterStartMonth - 3 + m] && units[quarterStartMonth - 3 + m].isCompleted);
                  const isCurrentQuarter = !quarterCompleted && prevQuarterCompleted;
                  return { qIdx, quarterStartMonth, start, quarterCompleted, isCurrentQuarter };
                });
                const sortedQuarters = [...quarterObjs].sort((a, b) => b.qIdx - a.qIdx);
                const currentQuarter = sortedQuarters.find((q) => q.isCurrentQuarter);
                const completedQuarters = sortedQuarters.filter((q) => q.quarterCompleted);
                return [
                  currentQuarter && (() => {
                    const { qIdx, quarterStartMonth } = currentQuarter;
                    const { label: qLabel, range: qRange } = getQuarterRange(startDate, qIdx);
                    const monthObjs = [0, 1, 2].map((mIdx) => {
                      const monthIdx = quarterStartMonth + mIdx;
                      const { label, range } = getMonthRange(startDate, monthIdx);
                      const unit = units[monthIdx] || { form: {}, isOpen: mIdx === 0, isDirty: false, isSaved: false, isCompleted: false };
                      const { form = {}, isOpen, isSaved, isCompleted } = unit;
                      const prevCompleted = mIdx === 0 || (units[quarterStartMonth + mIdx - 1] && units[quarterStartMonth + mIdx - 1].isCompleted);
                      const isCurrent = !isCompleted && prevCompleted;
                      const isCompletedUnit = isCompleted;
                      return {
                        mIdx,
                        monthIdx,
                        label,
                        range,
                        form,
                        isOpen,
                        isSaved,
                        isCompleted,
                        isCurrent,
                        isCompletedUnit,
                        canSave: form?.completed && (form?.completed === "no" || form?.comfortLevel),
                      };
                    });
                    const sortedMonths = [...monthObjs].sort((a, b) => b.mIdx - a.mIdx);
                    const currentMonth = sortedMonths.find((m) => m.isCurrent);
                    const completedMonths = sortedMonths.filter((m) => m.isCompletedUnit);
                    return (
                      <div key={qIdx} className="border border-slate-200 rounded-xl p-6 bg-white flex flex-col gap-2 mb-4">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="font-semibold text-slate-900 text-lg">{qLabel}</div>
                        </div>
                        {currentMonth && (
                          <div key={currentMonth.mIdx} className="border border-slate-100 rounded-lg p-4 bg-slate-50 mb-2">
                            <div className="flex items-center gap-2">
                              <div className="font-semibold text-slate-900 text-base mb-1">{currentMonth.label}</div>
                              <button
                                className="ml-auto p-1 text-emerald-700 hover:text-emerald-800 transition"
                                onClick={() => toggleUnitOpen(currentMonth.monthIdx)}
                                type="button"
                                aria-label={currentMonth.isOpen ? "Collapse" : "Expand"}
                              >
                                {currentMonth.isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </div>
                            <div className="text-slate-500 text-xs mb-1">{currentMonth.range}</div>
                            <div className="text-slate-600 text-xs mb-2">Status: Current</div>
                            {currentMonth.isOpen && (
                              <>
                                <div className="flex flex-col gap-6 mt-4">
                                  <div className="text-sm font-semibold text-slate-700">Monthly SIP Reflection</div>
                                  <div className="grid grid-cols-1 gap-6">
                                    <div className="flex flex-col gap-3">
                                      <label className="text-slate-700 text-sm font-medium">Did I do my SIP?</label>
                                      <div className="flex gap-2">
                                        {["yes", "no"].map((val) => (
                                          <button
                                            key={val}
                                            type="button"
                                            className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                                              currentMonth.form.completed === val
                                                ? "bg-emerald-600 text-white border-emerald-600"
                                                : "bg-white text-emerald-700 border-emerald-200 hover:border-emerald-300"
                                            }`}
                                            onClick={() =>
                                              updateUnit(currentMonth.monthIdx, {
                                                form: {
                                                  ...currentMonth.form,
                                                  completed: val as "yes" | "no",
                                                  comfortLevel: val === "no" ? null : currentMonth.form.comfortLevel,
                                                },
                                              })
                                            }
                                          >
                                            {val === "yes" ? "Yes" : "No"}
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {currentMonth.form.completed === "yes" && (
                                      <div className="flex flex-col gap-3">
                                        <label className="text-slate-700 text-sm font-medium">How comfortable did it feel?</label>
                                        <ComfortLevelScale
                                          value={(currentMonth.form as any).comfortLevel || null}
                                          onChange={(val) => updateUnit(currentMonth.monthIdx, { form: { ...currentMonth.form, comfortLevel: val } })}
                                          disabled={false}
                                        />
                                      </div>
                                    )}
                                  </div>

                                  <button
                                    className="mt-4 px-4 py-2 rounded-full bg-emerald-600 text-white font-semibold disabled:opacity-50"
                                    disabled={!currentMonth.canSave}
                                    onClick={() => saveUnit(currentMonth.monthIdx)}
                                    type="button"
                                  >
                                    Save Progress
                                  </button>
                                  {currentMonth.isSaved && (
                                    <div className="flex flex-col gap-3 mt-2 p-4 bg-emerald-50 rounded-lg">
                                      <div className="text-emerald-700 font-semibold">Saved. This period is complete.</div>
                                      <button
                                        className="px-4 py-2 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                                        onClick={() =>
                                          logToJournal(currentMonth.monthIdx, {
                                            label: currentMonth.label,
                                            range: currentMonth.range,
                                            quarter: qLabel,
                                          })
                                        }
                                        type="button"
                                      >
                                        Log this into Journal
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                        {completedMonths.map(({ mIdx, label, range }) => (
                          <div key={mIdx} className="border border-slate-100 rounded-lg p-4 bg-slate-50 mb-2 opacity-80">
                            <div className="flex items-center gap-2">
                              <div className="font-semibold text-slate-900 text-base mb-1">{label}</div>
                              <span className="ml-auto text-xs text-slate-400">Completed</span>
                            </div>
                            <div className="text-slate-500 text-xs mb-1">{range}</div>
                            <div className="text-slate-600 text-xs mb-2">Status: Completed</div>
                          </div>
                        ))}
                      </div>
                    );
                  })(),
                  ...completedQuarters.map(({ qIdx }) => {
                    const { label: qLabel, range: qRange } = getQuarterRange(startDate, qIdx);
                    return (
                      <div key={qIdx} className="border border-slate-200 rounded-xl p-6 bg-white flex flex-col gap-2 mb-4 opacity-80">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="font-semibold text-slate-900 text-lg">{qLabel}</div>
                          <div className="text-slate-500 text-sm">{qRange}</div>
                          <span className="ml-auto text-xs text-slate-400">Completed</span>
                        </div>
                        <div className="text-slate-600 text-sm">Status: Completed</div>
                      </div>
                    );
                  }),
                ];
              })()}
            </div>
          )}
        </>
      )}

      {status === "not_started" &&
        !(sprint.id === "monthly_sip_kickstart" && getSprintState().progress?.["monthly_sip_kickstart"]?.status === "completed_final") && (
          <button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl px-6 py-4 text-xl transition"
            onClick={handleStart}
            type="button"
          >
            Start Challenge
          </button>
        )}

      {sprint.id === "monthly_sip_kickstart" && getSprintState().progress?.["monthly_sip_kickstart"]?.status === "completed_final" && (
        <div className="w-full bg-slate-50 border border-slate-200 rounded-3xl shadow p-8 flex flex-col gap-4 items-center text-center">
          <div className="text-base text-slate-700">
            Monthly Sprint has been completed. You've successfully kickstarted your retirement journey.
          </div>
          <div className="text-sm text-slate-600">
            To continue, please start the Quarterly or Annual Sprint from the Sprints page.
          </div>
          <button
            className="px-6 py-2 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
            onClick={() => navigate("/dashboard/sprints")}
            type="button"
          >
            Go to Sprints
          </button>
        </div>
      )}

      {(() => {
        const monthlyCompleted =
          status === "completed" && sprint.id === "monthly_sip_kickstart";
        const quarterlyCompleted =
          status === "completed" &&
          sprint.id === "quarterly_sip_discipline" &&
          (plan as any)?.monthlySIPs &&
          (plan as any).monthlySIPs.filter((_: unknown, idx: number) => units[idx]?.isCompleted).length === 3;
        const annualCompleted =
          status === "completed" &&
          sprint.id === "annual_retirement_consistency" &&
          (plan as any)?.quarterlySIPs &&
          (plan as any).quarterlySIPs.filter((_: unknown, qIdx: number) => [0, 1, 2].every((m) => units[qIdx * 3 + m]?.isCompleted)).length === 4;

        if (!monthlyCompleted && !quarterlyCompleted && !annualCompleted) return null;

        if (monthlyCompleted) {
          return (
            <div className="w-full bg-emerald-50 border border-emerald-200 rounded-3xl shadow p-8 flex flex-col gap-4 items-center">
              <div className="text-3xl mb-2">🎉</div>
              <div className="text-2xl font-bold text-emerald-700 mb-2">First step completed!</div>
              <div className="text-base text-slate-700 text-center max-w-xl mb-4">
                You've successfully kickstarted your retirement journey. Monthly Sprint is designed only to help you begin.
              </div>
              <div className="text-lg text-slate-900 mb-2">
                <span className="font-bold">₹{(plan as any)?.suggestedSIP || "-"}</span> executed in {(plan as any)?.monthLabel || "this month"}
              </div>
              <div className="text-base text-slate-600 mb-6">Now, choose your sprint mindset:</div>
              <div className="flex gap-4 mt-2">
                <button
                  className="px-6 py-3 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                  onClick={() => {
                    const today = new Date().toISOString().slice(0, 10);
                    const readings = {
                      suggestedMonthlySIP: (plan as any)?.suggestedSIP || 5000,
                      salaryCycle: (plan as any)?.salaryCycle || "Monthly",
                      sipMonth1: (plan as any)?.suggestedSIP || 5000,
                      sipMonth2: ((plan as any)?.suggestedSIP || 5000) * 1.1,
                      sipMonth3: ((plan as any)?.suggestedSIP || 5000) * 1.2,
                      stepUpEnabled: true,
                    };

                    const state = getSprintState();
                    state.progress = state.progress || {};
                    state.progress["monthly_sip_kickstart"] = {
                      ...state.progress["monthly_sip_kickstart"],
                      status: "completed_final",
                    };
                    state.activeSprintId = "quarterly_sip_discipline";
                    const quarterly = getSprintById("quarterly_sip_discipline");
                    const qPlan = quarterly?.getPlan ? quarterly.getPlan(readings) : null;
                    state.progress["quarterly_sip_discipline"] = {
                      startedAt: today,
                      startDate: today,
                      endDate: new Date(new Date(today).setMonth(new Date(today).getMonth() + 3)).toISOString().slice(0, 10),
                      status: "active",
                      plan: qPlan,
                      phaseStatus: ["pending", "pending", "pending"],
                      units: {},
                    };
                    saveSprintState(state);
                    navigate("/dashboard/sprints");
                  }}
                  type="button"
                >
                  Start Quarterly Sprint
                </button>
                <button
                  className="px-6 py-3 rounded-full border border-emerald-600 text-emerald-700 font-semibold hover:bg-emerald-50"
                  onClick={() => {
                    const today = new Date().toISOString().slice(0, 10);
                    const readings = {
                      suggestedMonthlySIP: (plan as any)?.suggestedSIP || 5000,
                      salaryCycle: (plan as any)?.salaryCycle || "Monthly",
                      stepUps: [1000, 1000, 1000, 1000],
                    };

                    const state = getSprintState();
                    state.progress = state.progress || {};
                    state.progress["monthly_sip_kickstart"] = {
                      ...state.progress["monthly_sip_kickstart"],
                      status: "completed_final",
                    };
                    state.activeSprintId = "annual_retirement_consistency";
                    const annual = getSprintById("annual_retirement_consistency");
                    const aPlan = annual?.getPlan ? annual.getPlan(readings) : null;
                    state.progress["annual_retirement_consistency"] = {
                      startedAt: today,
                      startDate: today,
                      endDate: new Date(new Date(today).setMonth(new Date(today).getMonth() + 12)).toISOString().slice(0, 10),
                      status: "active",
                      plan: aPlan,
                      phaseStatus: ["pending", "pending", "pending", "pending"],
                      units: {},
                    };
                    saveSprintState(state);
                    navigate("/dashboard/sprints");
                  }}
                  type="button"
                >
                  Start Annual Sprint
                </button>
              </div>
            </div>
          );
        }

        if (quarterlyCompleted) {
          return (
            <div className="w-full max-w-3xl bg-white border border-slate-100 rounded-3xl shadow-[0_12px_30px_rgba(15,23,42,0.08)] p-8 sm:p-10 flex flex-col gap-5 items-center text-center mx-auto">
              <div className="text-2xl sm:text-3xl font-semibold text-emerald-700">Congratulations 🎉</div>
              <div className="text-base text-slate-700 max-w-2xl flex flex-wrap items-center gap-2 justify-center leading-relaxed">
                <span>You have completed this sprint.</span>
                <button
                  className="text-emerald-700 font-semibold hover:underline"
                  onClick={() => navigate("/dashboard/sprints")}
                  type="button"
                >
                  View Progress
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2 w-full justify-center">
                <button
                  className="px-6 py-3.5 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow-sm"
                  onClick={handleContinueNextQuarter}
                  type="button"
                >
                  Continue with next quarter
                </button>
                <button
                  className="px-6 py-3.5 rounded-full border border-emerald-600 text-emerald-700 font-semibold hover:bg-emerald-50 bg-white"
                  onClick={handleSwitchToAnnualFromQuarter}
                  type="button"
                >
                  Switch to annual sprint
                </button>
              </div>
            </div>
          );
        }

        if (annualCompleted) {
          return (
            <div className="w-full max-w-3xl bg-white border border-slate-100 rounded-3xl shadow-[0_12px_30px_rgba(15,23,42,0.08)] p-8 sm:p-10 flex flex-col gap-5 items-center text-center mx-auto">
              <div className="text-2xl sm:text-3xl font-semibold text-emerald-700">Congratulations 🎉</div>
              <div className="text-base text-slate-700 max-w-2xl flex flex-wrap items-center gap-2 justify-center leading-relaxed">
                <span>You have completed this sprint.</span>
                <button
                  className="text-emerald-700 font-semibold hover:underline"
                  onClick={() => navigate("/dashboard/sprints")}
                  type="button"
                >
                  View Progress
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2 w-full justify-center">
                <button
                  className="px-6 py-3.5 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow-sm"
                  onClick={handleContinueNextYear}
                  type="button"
                >
                  Continue with next year
                </button>
                <button
                  className="px-6 py-3.5 rounded-full border border-emerald-600 text-emerald-700 font-semibold hover:bg-emerald-50 bg-white"
                  onClick={handleSwitchToQuarterFromAnnual}
                  type="button"
                >
                  Switch to quarterly sprint
                </button>
              </div>
            </div>
          );
        }
        return null;
      })()}

      {status === "stopped" && (
        <div className="w-full bg-red-50 border border-red-200 rounded-3xl shadow p-8 flex flex-col gap-4 items-center">
          <div className="text-2xl font-bold text-red-700 mb-2">Oops, your sprint got stopped</div>
          <div className="text-base text-slate-900 mb-2">You can continue from the next period or choose a new date to start your sprint.</div>
          <div className="flex gap-4 mt-2">
            <button
              className="px-6 py-3 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
              onClick={() => {
                const base = new Date(startDate);
                base.setMonth(base.getMonth() + 1);
                const newStartDate = base.toISOString().slice(0, 10);

                let newEndDate = newStartDate;
                let phaseLen = 1;
                let newPlan: SprintPlan = null;
                if (sprint.type === "monthly") {
                  newEndDate = new Date(new Date(newStartDate).setMonth(new Date(newStartDate).getMonth() + 1)).toISOString().slice(0, 10);
                  phaseLen = 1;
                } else if (sprint.type === "quarterly") {
                  newEndDate = new Date(new Date(newStartDate).setMonth(new Date(newStartDate).getMonth() + 3)).toISOString().slice(0, 10);
                  phaseLen = 3;
                } else if (sprint.type === "yearly") {
                  newEndDate = new Date(new Date(newStartDate).setMonth(new Date(newStartDate).getMonth() + 12)).toISOString().slice(0, 10);
                  phaseLen = 4;
                }
                if (sprint.getPlan) {
                  newPlan = sprint.getPlan({ ...plan, startDate: newStartDate, endDate: newEndDate });
                }
                const state = getSprintState();
                state.activeSprintId = sprint.id;
                state.progress = state.progress || {};
                state.progress[sprint.id] = {
                  startedAt: newStartDate,
                  startDate: newStartDate,
                  endDate: newEndDate,
                  status: "active",
                  plan: newPlan,
                  phaseStatus: Array(phaseLen).fill("pending"),
                  units: {},
                };
                saveSprintState(state);
                setStatus("active");
                setStartDate(newStartDate);
                setEndDate(newEndDate);
                setPhaseStatus(Array(phaseLen).fill("pending"));
                setUnits({});
                setPlan(newPlan);
              }}
              type="button"
            >
              Continue from next month
            </button>
            <button
              className="px-6 py-3 rounded-full border border-emerald-600 text-emerald-700 font-semibold hover:bg-emerald-50"
              onClick={() => {
                const dateInput = prompt("Enter start date (YYYY-MM-DD):");
                if (dateInput) {
                  let newEndDate = dateInput;
                  let phaseLen = 1;
                  let newPlan: SprintPlan = null;
                  if (sprint.type === "monthly") {
                    newEndDate = new Date(new Date(dateInput).setMonth(new Date(dateInput).getMonth() + 1)).toISOString().slice(0, 10);
                    phaseLen = 1;
                  } else if (sprint.type === "quarterly") {
                    newEndDate = new Date(new Date(dateInput).setMonth(new Date(dateInput).getMonth() + 3)).toISOString().slice(0, 10);
                    phaseLen = 3;
                  } else if (sprint.type === "yearly") {
                    newEndDate = new Date(new Date(dateInput).setMonth(new Date(dateInput).getMonth() + 12)).toISOString().slice(0, 10);
                    phaseLen = 4;
                  }
                  if (sprint.getPlan) {
                    newPlan = sprint.getPlan({ ...plan, startDate: dateInput, endDate: newEndDate });
                  }
                  const state = getSprintState();
                  state.activeSprintId = sprint.id;
                  state.progress = state.progress || {};
                  state.progress[sprint.id] = {
                    startedAt: dateInput,
                    startDate: dateInput,
                    endDate: newEndDate,
                    status: "active",
                    plan: newPlan,
                    phaseStatus: Array(phaseLen).fill("pending"),
                    units: {},
                  };
                  saveSprintState(state);
                  setStatus("active");
                  setStartDate(dateInput);
                  setEndDate(newEndDate);
                  setPhaseStatus(Array(phaseLen).fill("pending"));
                  setUnits({});
                  setPlan(newPlan);
                }
              }}
              type="button"
            >
              Pick a start date
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintDetailPage;
