import React from "react";

interface SprintSummaryCardRowProps {
  startDate?: string;
  endDate?: string;
  sipAmount?: number | string | null;
  status?: string;
  className?: string;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};

const SprintSummaryCardRow: React.FC<SprintSummaryCardRowProps> = ({ startDate, endDate, sipAmount, status, className }) => {
  return (
    <div
      className={`w-full border border-slate-200 rounded-2xl bg-white p-4 flex flex-col sm:flex-row sm:items-center gap-3 shadow-sm ${
        className || ""
      }`}
    >
      <div className="flex-1">
        <div className="text-xs uppercase tracking-wide text-slate-500">Start</div>
        <div className="text-base font-semibold text-slate-900">{formatDate(startDate)}</div>
      </div>
      <div className="flex-1">
        <div className="text-xs uppercase tracking-wide text-slate-500">End</div>
        <div className="text-base font-semibold text-slate-900">{formatDate(endDate)}</div>
      </div>
      <div className="flex-1">
        <div className="text-xs uppercase tracking-wide text-slate-500">SIP Amount</div>
        <div className="text-base font-semibold text-slate-900">{typeof sipAmount === "number" ? `₹${sipAmount}` : sipAmount ?? "-"}</div>
      </div>
      <div className="flex-1">
        <div className="text-xs uppercase tracking-wide text-slate-500">Status</div>
        <div className="text-base font-semibold text-slate-900">{status || "Current"}</div>
      </div>
    </div>
  );
};

export default SprintSummaryCardRow;
