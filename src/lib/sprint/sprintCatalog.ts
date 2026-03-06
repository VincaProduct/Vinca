import { Sprint, SprintPlan } from "./sprint.types";

function defaultMonthlyPlan(readings: Record<string, number | string | boolean | unknown>): SprintPlan {
  const suggestedSIP = Number(readings.suggestedMonthlySIP ?? readings.sipMonth1 ?? 5000) || 5000;
  const salaryCycle = (readings.salaryCycle as string) || "Monthly";
  const monthLabel = new Date().toLocaleString("default", { month: "long" });
  return {
    suggestedSIP,
    salaryCycle,
    monthLabel,
  };
}

function defaultQuarterlyPlan(readings: Record<string, number | string | boolean | unknown>): SprintPlan {
  const m1 = Number(readings.sipMonth1 ?? readings.suggestedMonthlySIP ?? 5000) || 5000;
  const m2 = Number(readings.sipMonth2 ?? m1) || m1;
  const m3 = Number(readings.sipMonth3 ?? m2) || m2;
  const monthlySIPs = [m1, m2, m3];
  const totalQuarterlySIP = monthlySIPs.reduce((sum, amt) => sum + amt, 0);
  return {
    monthlySIPs,
    totalQuarterlySIP,
    durationLabel: "3 months",
  };
}

function defaultAnnualPlan(readings: Record<string, number | string | boolean | unknown>): SprintPlan {
  const q1 = Number(readings.sipQ1 ?? 15000) || 15000;
  const q2 = Number(readings.sipQ2 ?? 16000) || 16000;
  const q3 = Number(readings.sipQ3 ?? 17000) || 17000;
  const q4 = Number(readings.sipQ4 ?? 18000) || 18000;
  const quarterlySIPs = [q1, q2, q3, q4];
  const totalAnnualSIP = quarterlySIPs.reduce((sum, amt) => sum + amt, 0);
  return {
    quarterlySIPs,
    totalAnnualSIP,
    durationLabel: "12 months",
    stepUps: Array.isArray(readings.stepUps)
      ? (readings.stepUps as number[])
      : [1000, 1000, 1000, 1000],
  };
}

export const SPRINTS: Sprint[] = [
  {
    id: "monthly_sip_kickstart",
    title: "Monthly Sprint Mindset",
    description: "Kickstart your SIP for the first time. One-time activation to begin your retirement journey.",
    cadence: "monthly",
    type: "monthly",
    durationLabel: "1 month",
    timelineType: "single",
    getPlan: defaultMonthlyPlan,
  },
  {
    id: "quarterly_sip_discipline",
    title: "Quarterly Sprint Mindset",
    description: "Short-term sprint with visible progress. Review discipline every quarter and adjust.",
    cadence: "quarterly",
    type: "quarterly",
    durationLabel: "3 months",
    timelineType: "monthly_checkpoints",
    getPlan: defaultQuarterlyPlan,
  },
  {
    id: "annual_retirement_consistency",
    title: "Annual Sprint Mindset",
    description: "Long-term discipline and compounding. Measure progress yearly and stay on track.",
    cadence: "yearly",
    type: "yearly",
    durationLabel: "12 months",
    timelineType: "quarterly_checkpoints",
    getPlan: defaultAnnualPlan,
  },
];

export function getSprintById(id: string | undefined | null): Sprint | undefined {
  if (!id) return undefined;
  return SPRINTS.find((sprint) => sprint.id === id);
}
