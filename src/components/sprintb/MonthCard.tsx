import React from "react";

interface MonthCardProps {
  label: string;
  status: "Pending" | "Current" | "Upcoming" | "Completed" | "Skipped";
  range: string;
  amount: number;
  invested: number;
}

const statusStyles: Record<MonthCardProps["status"], string> = {
  Pending: "bg-white border-slate-200 text-slate-700",
  Current: "bg-emerald-50 border-emerald-200 text-emerald-800",
  Upcoming: "bg-slate-50 border-slate-200 text-slate-600",
  Completed: "bg-emerald-50 border-emerald-300 text-emerald-800",
  Skipped: "bg-amber-50 border-amber-300 text-amber-800",
};

const MonthCard: React.FC<MonthCardProps & { currentSIP?: number }> = ({ label, status, range, amount, invested, currentSIP }) => {
  return (
    <div className={`border rounded-lg p-4 flex flex-col gap-1 shadow-sm ${statusStyles[status]}`}>
      <div className="flex items-center justify-between text-sm font-semibold">
        <span>{label}</span>
        <span className="text-xs px-2 py-1 rounded-full bg-white/60">{status}</span>
      </div>
      <div className="text-xs text-slate-600">{range}</div>
    </div>
  );
};

export default MonthCard;
