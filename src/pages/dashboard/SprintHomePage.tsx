import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSprintState } from "@/lib/sprint/sprintStore";
import {
  buildCompletedSprintsFromState,
  calculateAverageConfidence,
  calculateCoveredPercentage,
  calculateProjectionMetrics,
  getFinancialReadinessData,
} from "@/lib/sprint/sprintCalculations";
import { getSprintById } from "@/lib/sprint/sprintCatalog";

const SprintHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sprintState, setSprintState] = useState(getSprintState());

  useEffect(() => {
    setSprintState(getSprintState());
  }, []);

  const { userData, targetCorpus } = useMemo(() => getFinancialReadinessData(), []);

  const completedSprints = useMemo(() => buildCompletedSprintsFromState(sprintState), [sprintState]);

  const coveredPercentage = useMemo(() => {
    if (!userData) return 0;
    return calculateCoveredPercentage(userData.currentAge, userData.retirementAge, completedSprints);
  }, [userData, completedSprints]);

  const { builtPercentage } = useMemo(() => {
    if (!userData) return { projectedCorpus: 0, builtPercentage: 0 };
    return calculateProjectionMetrics({ userData, completedSprints, targetCorpus });
  }, [userData, completedSprints, targetCorpus]);

  const averageConfidence = useMemo(() => calculateAverageConfidence(completedSprints), [completedSprints]);
  const displayConfidence = completedSprints.length > 0 ? averageConfidence : null;

  const activeSprint = useMemo(() => {
    const explicitActiveId = sprintState.activeSprintId;
    const derivedActiveId = explicitActiveId
      ? explicitActiveId
      : Object.entries(sprintState.progress || {}).find(([, progress]) => progress.status === "active")?.[0];
    if (!derivedActiveId) return null;
    const progress = sprintState.progress?.[derivedActiveId];
    if (!progress || progress.status !== "active") return null;
    const meta = getSprintById(derivedActiveId);
    if (!meta) return null;
    const label = meta.type === "yearly" ? "Annual Sprint" : meta.type === "quarterly" ? "Quarterly Sprint" : "Monthly Sprint";
    return { label, startDate: progress.startDate, endDate: progress.endDate };
  }, [sprintState]);

  const formatDate = (value?: string) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  const activeSprintRange = activeSprint
    ? `${formatDate(activeSprint.startDate) ?? "—"} – ${formatDate(activeSprint.endDate) ?? "—"}`
    : "—";

  const mindsetCards = [
    {
      id: "monthly_sip_kickstart",
      title: "Monthly Sprint Mindset",
      description: "Kickstart your SIP for the first time. One-time activation to begin your retirement journey.",
    },
    {
      id: "quarterly_sip_discipline",
      title: "Quarterly Sprint Mindset",
      description: "Short-term sprint with visible progress. Review discipline every quarter and adjust.",
    },
    {
      id: "annual_retirement_consistency",
      title: "Annual Sprint Mindset",
      description: "Long-term discipline and compounding. Measure progress yearly and stay on track.",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-2 sm:px-6 pt-12 pb-16">
        <h1 className="mb-8 text-2xl sm:text-3xl font-semibold text-slate-800 max-w-3xl leading-relaxed">
          Break long-term retirement investing into focused sprints and track your real progress.
        </h1>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          <div className="flex-1 bg-white rounded-3xl shadow-[0_12px_30px_rgba(15,23,42,0.08)] border border-slate-100 flex flex-col items-center p-8 min-w-[220px]">
            <div className="text-xs uppercase tracking-[0.08em] text-slate-500 text-center mb-5 leading-snug">You have covered</div>
            <div className="text-5xl font-semibold text-emerald-600 mb-3">{userData ? `${coveredPercentage}%` : "—"}</div>
            <div className="text-sm text-slate-500 text-center leading-snug max-w-[220px]">In your path from starting to invest until your retirement age.</div>
          </div>
          <div className="flex-1 bg-white rounded-3xl shadow-[0_12px_30px_rgba(15,23,42,0.08)] border border-slate-100 flex flex-col items-center p-8 min-w-[220px]">
            <div className="text-xs uppercase tracking-[0.08em] text-slate-500 text-center mb-5 leading-snug">You have built</div>
            <div className="text-5xl font-semibold text-emerald-600 mb-3">{userData ? `${builtPercentage}%` : "—"}</div>
            <div className="text-sm text-slate-500 text-center leading-snug max-w-[220px]">Of the total money your retirement plan requires.</div>
          </div>
          <div className="flex-1 bg-white rounded-3xl shadow-[0_12px_30px_rgba(15,23,42,0.08)] border border-slate-100 flex flex-col items-center p-8 min-w-[220px]">
            <div className="text-xs uppercase tracking-[0.08em] text-slate-500 text-center mb-5 leading-snug">You are currently focused on</div>
            <div className="text-3xl font-semibold text-emerald-600 mb-2 text-center">{activeSprint?.label ?? "—"}</div>
            <div className="text-sm text-slate-500 text-center leading-snug">{activeSprintRange}</div>
          </div>
          <div className="flex-1 bg-white rounded-3xl shadow-[0_12px_30px_rgba(15,23,42,0.08)] border border-slate-100 flex flex-col items-center p-8 min-w-[220px]">
            <div className="text-xs uppercase tracking-[0.08em] text-slate-500 text-center mb-5 leading-snug">You feel</div>
            <div className="flex items-center justify-center mb-3">
              <div className="text-5xl font-semibold text-emerald-600">{displayConfidence !== null ? displayConfidence : "—"}</div>
              <div className="text-2xl text-slate-400 ml-2">/ 5</div>
            </div>
            <div className="text-sm text-slate-500 text-center leading-snug">confident across your completed sprint.</div>
          </div>
        </div>

        <div className="w-full bg-white rounded-2xl shadow-lg p-8 mt-10 mb-12">
          <div className="flex flex-col gap-2 mb-4">
            <div className="text-2xl font-bold text-slate-900">Financial Readiness Sprint</div>
            <div className="text-base text-slate-500">Follow this sprint to track your financial readiness.</div>
          </div>
          <button
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-base rounded transition-colors w-fit mb-4"
            onClick={() => setDrawerOpen((v) => !v)}
            type="button"
          >
            {drawerOpen ? "Hide Mindsets" : "Choose Mindset"}
          </button>
          {drawerOpen && (
            <div className="mt-4 flex flex-col gap-6">
              {mindsetCards.map((card) => {
                const isMonthlyCompleted =
                  card.id === "monthly_sip_kickstart" && sprintState.progress?.["monthly_sip_kickstart"]?.status === "completed_final";
                return (
                  <div
                    key={card.id}
                    className={`border px-8 py-7 flex flex-col gap-3 transition-all w-full ${
                      isMonthlyCompleted
                        ? "border-slate-100 bg-slate-50 cursor-not-allowed opacity-60"
                        : "border-slate-200 bg-white cursor-pointer hover:bg-emerald-50"
                    }`}
                    style={{ borderRadius: 18, boxShadow: isMonthlyCompleted ? "none" : "0 2px 10px 0 rgba(16, 185, 129, 0.04)" }}
                    onClick={() => !isMonthlyCompleted && navigate(`/dashboard/sprints/${card.id}`)}
                  >
                    <div className="font-semibold text-xl text-slate-900 leading-tight mb-2">{card.title}</div>
                    <div className="text-slate-500 text-base mb-3 font-normal">{card.description}</div>
                    {isMonthlyCompleted ? (
                      <div className="mt-2 px-5 py-2 bg-slate-200 text-slate-600 font-medium text-base rounded w-fit cursor-not-allowed">
                        Completed ✓
                      </div>
                    ) : (
                      <button
                        className="mt-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-base rounded transition-colors w-fit"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dashboard/sprints/${card.id}`);
                        }}
                      >
                        View Sprint
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SprintHomePage;
