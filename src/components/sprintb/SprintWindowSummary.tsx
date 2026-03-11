import React, { useMemo, useEffect } from "react";
import { getSprintState } from "@/lib/sprint/sprintStore";
import { SprintPlan, SprintProgress } from "@/lib/sprint/sprint.types";
import MonthCard from "./MonthCard";

export type SprintWindowType = "monthly" | "quarterly" | "annual";

interface SprintWindowSummaryProps {
  sprintType: SprintWindowType;
  overrideSipCompleted?: boolean | null;
  overrideComfortLevel?: number | null;
  overrideWindows?: { status: WindowStatus; invested?: number; amount?: number }[];
  overrideStartISO?: string;
  currentSIP?: number;
}

const sprintIdByType: Record<SprintWindowType, string> = {
  monthly: "monthly_sip_kickstart",
  quarterly: "quarterly_sip_discipline",
  annual: "annual_retirement_consistency",
};

function formatRange(start: Date, end: Date) {
  return `${start.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })} → ${end.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}`;
}

function getMonthRange(startISO: string, monthOffset: number) {
  const base = new Date(startISO);
  const monthStart = new Date(base.getFullYear(), base.getMonth() + monthOffset, base.getDate());
  const monthEnd = new Date(monthStart);
  monthEnd.setMonth(monthEnd.getMonth() + 1);
  return {
    label: monthStart.toLocaleString("default", { month: "long", year: "numeric" }),
    range: formatRange(monthStart, monthEnd),
  };
}

function getQuarterRange(startISO: string, quarterIdx: number) {
  const base = new Date(startISO);
  const qStart = new Date(base.getFullYear(), base.getMonth() + quarterIdx * 3, base.getDate());
  const qEnd = new Date(qStart);
  qEnd.setMonth(qEnd.getMonth() + 3);
  return {
    label: `Q${quarterIdx + 1} ${qStart.getFullYear()}`,
    range: formatRange(qStart, qEnd),
  };
}

type WindowStatus = "Completed" | "Skipped" | "Current" | "Upcoming" | "Pending";

function deriveProgress(
  plan: SprintPlan | undefined,
  progress: SprintProgress | undefined,
  sprintType: SprintWindowType,
  baseStartISO: string,
  overrideSipCompleted?: boolean | null,
  overrideComfortLevel?: number | null,
  overrideWindows?: { status: WindowStatus; invested?: number; amount?: number }[],
) {
  // Fallback: allow rendering from override windows even when plan/progress is missing
  if ((!plan || !progress) && overrideWindows?.length) {
    const labeler = (idx: number) => {
      if (sprintType === "annual") return getQuarterRange(baseStartISO, idx);
      return getMonthRange(baseStartISO, idx);
    };
    const windows = overrideWindows.map((ow, idx) => {
      const range = labeler(idx);
      return {
        label: range.label,
        range: range.range,
        amount: ow.amount ?? 0,
        invested: ow.invested ?? 0,
        status: ow.status,
      };
    });
    const invested = windows.reduce((sum, w) => sum + w.invested, 0);
    const total = windows.reduce((sum, w) => sum + (w.amount ?? 0), 0);
    const completedCount = windows.filter((w) => w.status === "Completed").length;
    return { windows, invested, total, completedCount };
  }

  if (!plan || !progress) return { windows: [], invested: 0, total: 0, completedCount: 0 };

  if (sprintType === "monthly") {
    const amount = (plan as any)?.suggestedSIP || 0;
    const unit = progress.units?.[0];
    const completedYes = (unit?.isCompleted && unit?.form?.completed === "yes") || overrideSipCompleted === true;
    const completedNo = (unit?.isCompleted && unit?.form?.completed === "no") || overrideSipCompleted === false;
    const hasComfort = (unit?.form?.comfortLevel != null) || overrideComfortLevel != null;
    const invested = completedYes ? amount : 0;
    const override = overrideWindows?.[0];
    const status: WindowStatus = override?.status
      ? override.status
      : completedYes
        ? hasComfort
          ? "Completed"
          : "Current"
        : completedNo
          ? "Skipped"
          : "Current";
    return {
      windows: [
        {
          label: getMonthRange(baseStartISO, 0).label,
          range: getMonthRange(baseStartISO, 0).range,
          amount,
          invested: override?.invested ?? invested,
          status,
        },
      ],
      invested: override?.invested ?? invested,
      total: amount,
      completedCount: status === "Completed" ? 1 : 0,
    };
  }

  if (sprintType === "quarterly") {
      // Use the required monthly SIP for the goal's required corpus
      let monthlySIP = 0;
      if (plan && (plan as any).goal && (plan as any).goal.requiredMonthlySIP) {
        monthlySIP = (plan as any).goal.requiredMonthlySIP;
      } else if ((plan as any).requiredMonthlySIP) {
        monthlySIP = (plan as any).requiredMonthlySIP;
      } else if ((plan as any)?.monthlySIPs && Array.isArray((plan as any).monthlySIPs)) {
        monthlySIP = (plan as any).monthlySIPs[0] || 0;
      } else if ((plan as any)?.suggestedSIP) {
        monthlySIP = (plan as any).suggestedSIP;
      }
    const base = baseStartISO;
    let allPrevCompleted = true;
    let completedCount = 0;
    const windows = Array(3).fill(0).map((_, idx) => {
      const override = overrideWindows?.[idx];
      const range = getMonthRange(base, idx);
      const unit = progress?.units?.[idx];
      const completedYes = unit?.isCompleted && unit?.form?.completed === "yes";
      const completedNo = unit?.isCompleted && unit?.form?.completed === "no";
      const invested = override?.invested ?? (completedYes ? monthlySIP : 0);
      let status: WindowStatus = "Pending";
      if (override?.status) {
        status = override.status;
      } else if (completedYes) {
        status = "Completed";
      } else if (completedNo) {
        status = "Skipped";
        allPrevCompleted = false;
      } else if (allPrevCompleted) {
        status = "Current";
      } else {
        status = "Upcoming";
      }
      if (status === "Completed") {
        completedCount += 1;
      }
      if (!completedYes && !completedNo && !override?.status) {
        allPrevCompleted = false;
      }
      return {
        label: range.label,
        range: range.range,
        amount: monthlySIP,
        invested,
        status,
      };
    });
    const invested = windows.reduce((sum, w) => sum + w.invested, 0);
    const total = windows.reduce((sum, w) => sum + w.amount, 0);
    return { windows, invested, total, completedCount };
  }

  const quarterlySIPs = (plan as any)?.quarterlySIPs as number[] | undefined;
  if (!quarterlySIPs) return { windows: [], invested: 0, total: 0, completedCount: 0 };
  const base = baseStartISO;
  let allPrevCompleted = true;
  let completedCount = 0;
  const windows = quarterlySIPs.map((amt, idx) => {
    const override = overrideWindows?.[idx];
    const range = getQuarterRange(base, idx);
    const unit = progress.units?.[idx];
    const completedYes = unit?.isCompleted && unit?.form?.completed === "yes";
    const completedNo = unit?.isCompleted && unit?.form?.completed === "no";
    const invested = override?.invested ?? (completedYes ? amt : 0);
    let status: WindowStatus = "Pending";
    if (override?.status) {
      status = override.status;
    } else if (completedYes) {
      status = "Completed";
    } else if (completedNo) {
      status = "Skipped";
      allPrevCompleted = false;
    } else if (allPrevCompleted) {
      status = "Current";
    } else {
      status = "Upcoming";
    }
    if (status === "Completed") {
      completedCount += 1;
    }
    if (!completedYes && !completedNo && !override?.status) {
      allPrevCompleted = false;
    }
    return {
      label: range.label,
      range: range.range,
      amount: amt,
      invested,
      status,
    };
  });
  const invested = windows.reduce((sum, w) => sum + w.invested, 0);
  const total = windows.reduce((sum, w) => sum + w.amount, 0);
  return { windows, invested, total, completedCount };
}

function computeBaseStart(
  sprintType: SprintWindowType,
  progress: SprintProgress | undefined,
  monthlyProgress: SprintProgress | undefined,
  overrideStartISO?: string,
): string {
  if (overrideStartISO) return overrideStartISO;
  const fallback = progress?.startDate || progress?.startedAt || new Date().toISOString();

  if (sprintType === "monthly") return fallback;

  const monthlyEnd = monthlyProgress?.endDate;
  if (monthlyEnd) return monthlyEnd;

  if (monthlyProgress?.startDate || monthlyProgress?.startedAt) {
    const start = new Date(monthlyProgress.startDate || monthlyProgress.startedAt || new Date().toISOString());
    const next = new Date(start);
    next.setMonth(start.getMonth() + 1);
    return next.toISOString();
  }

  return fallback;
}

const SprintWindowSummary: React.FC<SprintWindowSummaryProps> = ({ sprintType, overrideSipCompleted, overrideComfortLevel, overrideWindows, overrideStartISO, currentSIP }) => {
  const state = getSprintState();
  const sprintId = sprintIdByType[sprintType];
  const progress = state.progress?.[sprintId];
  const plan = progress?.plan;
  const monthlyProgress = state.progress?.[sprintIdByType.monthly];
  const baseStart = computeBaseStart(sprintType, progress, monthlyProgress, overrideStartISO);

  const { windows, invested, total, completedCount } = useMemo(
    () => deriveProgress(plan, progress, sprintType, baseStart, overrideSipCompleted, overrideComfortLevel, overrideWindows),
    [plan, progress, sprintType, baseStart, overrideSipCompleted, overrideComfortLevel, overrideWindows]
  );

  // Compute total SIP for this quarter (for summary bar)
  let totalSIPForQuarter = total;
  if (sprintType === "monthly") {
    // Use currentSIP prop if provided for consistency with blue card
    if (typeof currentSIP === "number") {
      totalSIPForQuarter = currentSIP;
    } else {
      let monthlySIP = 0;
      if (plan && (plan as any).goal && (plan as any).goal.requiredMonthlySIP) {
        monthlySIP = (plan as any).goal.requiredMonthlySIP;
      } else if ((plan as any).requiredMonthlySIP) {
        monthlySIP = (plan as any).requiredMonthlySIP;
      } else if ((plan as any)?.monthlySIPs && Array.isArray((plan as any).monthlySIPs)) {
        monthlySIP = (plan as any).monthlySIPs[0] || 0;
      } else if ((plan as any)?.suggestedSIP) {
        monthlySIP = (plan as any).suggestedSIP;
      }
      totalSIPForQuarter = monthlySIP;
    }
  } else if (sprintType === "quarterly") {
    // Use currentSIP prop if provided for consistency with blue card
    if (typeof currentSIP === "number") {
      totalSIPForQuarter = currentSIP * 3;
    } else {
      let monthlySIP = 0;
      if (plan && (plan as any).goal && (plan as any).goal.requiredMonthlySIP) {
        monthlySIP = (plan as any).goal.requiredMonthlySIP;
      } else if ((plan as any).requiredMonthlySIP) {
        monthlySIP = (plan as any).requiredMonthlySIP;
      } else if ((plan as any)?.monthlySIPs && Array.isArray((plan as any).monthlySIPs)) {
        monthlySIP = (plan as any).monthlySIPs[0] || 0;
      } else if ((plan as any)?.suggestedSIP) {
        monthlySIP = (plan as any).suggestedSIP;
      }
      totalSIPForQuarter = monthlySIP * 3;
    }
  }

  if ((!progress || !plan) && (!overrideWindows || overrideWindows.length === 0)) return null;
  if (windows.length === 0) return null;

  const start = baseStart;
  const computedEnd = () => {
    const startDate = new Date(baseStart);
    const monthsPerWindow = sprintType === "annual" ? 3 : 1;
    const windowCount = overrideWindows?.length
      ? overrideWindows.length
      : sprintType === "quarterly"
        ? ((plan as any)?.monthlySIPs?.length ?? 3)
        : sprintType === "annual"
          ? ((plan as any)?.quarterlySIPs?.length ?? 4)
          : 1;
    const months = overrideWindows?.length ? monthsPerWindow * Math.max(windowCount - 1, 0) : windowCount * monthsPerWindow;
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + months);
    return endDate.toISOString();
  };
  const shouldOverrideEnd = Boolean(overrideStartISO || (overrideWindows && overrideWindows.length > 0));
  const end = shouldOverrideEnd ? computedEnd() : progress?.endDate || computedEnd();

  const totalUnits = windows.length;
  const percent = totalUnits > 0 ? Math.min(100, (completedCount / totalUnits) * 100) : 0;

  let statusLabel = "Not Started";
  if (windows.some((w) => w.status === "Skipped")) {
    statusLabel = "Incomplete";
  } else if (completedCount === totalUnits && totalUnits > 0) {
    statusLabel = "Completed";
  } else if (windows.some((w) => w.status === "Current" || w.status === "Completed")) {
    statusLabel = "In Progress";
  }

  // Responsive: filter windows for mobile
  const [filteredWindows, setFilteredWindows] = React.useState(windows);
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const filterForMobile = () => {
      if (mq.matches) {
        // Show only current and first upcoming
        const currentIdx = windows.findIndex(w => w.status === 'Current');
        let filtered = [];
        if (currentIdx !== -1) {
          filtered.push(windows[currentIdx]);
          const nextUpcoming = windows.find((w, i) => w.status === 'Upcoming' && i > currentIdx);
          if (nextUpcoming) filtered.push(nextUpcoming);
        } else {
          // fallback: just first two
          filtered = windows.slice(0, 2);
        }
        setFilteredWindows(filtered);
      } else {
        setFilteredWindows(windows);
      }
    };
    filterForMobile();
    mq.addEventListener('change', filterForMobile);
    return () => mq.removeEventListener('change', filterForMobile);
  }, [windows]);

  return (
    <div className="border border-slate-200 rounded-xl bg-slate-50 p-4 sm:p-6 mt-6">


      {/* Progress Bar */}
      <div className="mt-4">
        <div className="w-full bg-slate-200 rounded-full h-2.5 sm:h-3">
          <div
            className="bg-emerald-600 h-2.5 sm:h-3 rounded-full transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between text-xs text-slate-600 mt-2 gap-1">
          <span className="font-medium">
            Invested: ₹{Math.round(invested).toLocaleString("en-IN")} / ₹{Math.round(totalSIPForQuarter).toLocaleString("en-IN")}
          </span>
          <span className="text-emerald-600 font-medium">
            {completedCount}/{totalUnits} windows complete
          </span>
        </div>
      </div>

      {/* Month Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mt-6">
        {filteredWindows.map((w, idx) => (
          <MonthCard
            key={idx}
            label={w.label}
            range={w.range}
            amount={w.amount}
            invested={w.invested}
            status={w.status as any}
            currentSIP={w.amount}
          />
        ))}
      </div>
    </div>
  );
};

export default SprintWindowSummary;