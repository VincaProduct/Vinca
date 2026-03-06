import React from "react";

interface SprintBCompletionProps {
  sipCompleted: boolean | null;
  comfortLevel: number | null;
  onSipChange: (value: boolean) => void;
  onComfortChange: (value: number) => void;
}

const SprintBCompletion: React.FC<SprintBCompletionProps> = ({
  sipCompleted,
  comfortLevel,
  onSipChange,
  onComfortChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate-900">SIP Completion</h3>
          <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold">Required</span>
        </div>
        <p className="text-sm text-slate-500 mb-4">Did you complete the planned SIP for this sprint window?</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onSipChange(true)}
            className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
              sipCompleted === true
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-slate-200 hover:border-emerald-200"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => onSipChange(false)}
            className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
              sipCompleted === false
                ? "border-rose-500 bg-rose-50 text-rose-700"
                : "border-slate-200 hover:border-rose-200"
            }`}
          >
            No
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate-900">Comfort Level</h3>
          <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">1 – 5</span>
        </div>
        <p className="text-sm text-slate-500 mb-4">How comfortable did you feel sustaining this sprint?</p>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => onComfortChange(level)}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                comfortLevel === level
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 hover:border-emerald-200"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SprintBCompletion;
