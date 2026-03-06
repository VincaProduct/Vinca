import React from "react";
import { SprintBKPIs } from "@/lib/sprintBEngine";

interface SprintBResultProps {
  kpis: SprintBKPIs;
  show: boolean;
}

const SprintBResult: React.FC<SprintBResultProps> = ({ kpis, show }) => {
  if (!show) return null;

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.08em] text-emerald-600 font-semibold">Progress Dashboard</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1 — Path Covered */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="text-xs text-slate-500 mb-1">Path Covered</div>
          <div className="text-2xl font-semibold text-slate-900">{kpis.pathCoveredPct.toFixed(1)}%</div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
            <div
              className="bg-emerald-600 h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(100, kpis.pathCoveredPct)}%` }}
            />
          </div>
        </div>

        {/* KPI 2 — Corpus Built */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="text-xs text-slate-500 mb-1">Corpus Built</div>
          <div className="text-2xl font-semibold text-slate-900">{kpis.corpusBuiltPct.toFixed(1)}%</div>
          {kpis.corpusBuiltPctRaw > 100 && (
            <div className="text-xs text-emerald-600 font-semibold mt-0.5">
              Actual: {kpis.corpusBuiltPctRaw.toFixed(1)}%
            </div>
          )}
          <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
            <div
              className="bg-emerald-600 h-1.5 rounded-full transition-all"
              style={{ width: `${kpis.corpusBuiltPct}%` }}
            />
          </div>
        </div>

        {/* KPI 3 — Comfort Score */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="text-xs text-slate-500 mb-1">Comfort Score</div>
          <div className="text-2xl font-semibold text-slate-900">
            {kpis.comfortScore > 0 ? `${kpis.comfortScore.toFixed(1)} / 5` : "—"}
          </div>
          {kpis.comfortScore > 0 && (
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
              <div
                className="bg-emerald-600 h-1.5 rounded-full transition-all"
                style={{ width: `${(kpis.comfortScore / 5) * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SprintBResult;
