import React from "react";
import { LucideIcon } from "lucide-react";


interface SprintBCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onStart: () => void;
  active?: boolean;
  disabled?: boolean;
  ctaLabel?: string;
  badge?: string;
  compact?: boolean;
}

const SprintBCard: React.FC<SprintBCardProps> = ({
  title,
  description,
  icon: Icon,
  onStart,
  active = false,
  disabled = false,
  ctaLabel = "Start Sprint",
  badge,
  compact = false,
}) => {
  if (compact) {
    return (
      <div
        className={`flex flex-col justify-between rounded-xl border p-4 shadow-sm transition-all duration-200 min-h-[120px] w-[280px] ${
          active
            ? "border-emerald-500 bg-emerald-50/70 shadow-[0_6px_18px_rgba(16,185,129,0.10)]"
            : "border-slate-200 bg-white hover:border-emerald-200 hover:shadow-[0_8px_18px_rgba(15,23,42,0.06)]"
        } ${disabled && !active ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <div className="flex items-start gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
              {badge ? (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{badge}</span>
              ) : null}
            </div>
            <p className="text-xs text-slate-500 leading-snug line-clamp-2">{description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => !disabled && onStart()}
          disabled={disabled}
          className={`mt-2 inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
            active
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-slate-900 text-white hover:bg-slate-800"
          } ${disabled ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {active ? "Active" : ctaLabel}
        </button>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col justify-between rounded-2xl border px-6 py-5 shadow-sm transition-all duration-200 h-full min-h-[220px] ${
        active
          ? "border-emerald-500 bg-emerald-50/70 shadow-[0_10px_30px_rgba(16,185,129,0.15)]"
          : "border-slate-200 bg-white hover:border-emerald-200 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
      } ${disabled && !active ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            {badge ? (
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">{badge}</span>
            ) : null}
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => !disabled && onStart()}
        disabled={disabled}
        className={`mt-2 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
          active
            ? "bg-emerald-600 text-white hover:bg-emerald-700"
            : "bg-slate-900 text-white hover:bg-slate-800"
        } ${disabled ? "opacity-70 cursor-not-allowed" : ""}`}
      >
        {active ? "Active" : ctaLabel}
      </button>
    </div>
  );
};

export default SprintBCard;
