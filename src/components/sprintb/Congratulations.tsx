import React from "react";
import {
  SprintBType,
  getCompletionActions,
  getSprintLabel,
} from "@/lib/sprintBEngine";

interface CongratulationsProps {
  currentSprintType: SprintBType;
  pathCoveredPct: number;
  corpusBuiltPct: number;
  onAction: (type: SprintBType) => void;
  visible: boolean;
}

const completionMessages: Record<SprintBType, string> = {
  monthly:
    "You've completed your Monthly Sprint — your first step toward long-term financial readiness.",
  quarterly:
    "Excellent work completing your Quarterly Sprint. Discipline is becoming a habit.",
  annual:
    "Incredible achievement! A full year of consistent financial discipline.",
};

const Congratulations: React.FC<CongratulationsProps> = ({
  currentSprintType,
  pathCoveredPct,
  corpusBuiltPct,
  onAction,
  visible,
}) => {
  if (!visible) return null;

  const ctas = getCompletionActions(currentSprintType);
  const message = completionMessages[currentSprintType];

  return (
    <div className="mt-8 w-full">
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl" role="img" aria-label="celebration">🎉</span>
          <h3 className="text-xl font-semibold text-slate-900">Sprint completed</h3>
        </div>

        <p className="text-slate-700 mb-4 text-sm sm:text-base">{message}</p>

        {/* Removed metrics cards for Closer to Financial Readiness and Required Corpus Built */}

        <div className="flex flex-wrap gap-3">
          {ctas.map((cta) => (
            <button
              key={cta.type}
              type="button"
              onClick={() => onAction(cta.type)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                cta.primary
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-white text-emerald-700 border border-emerald-200 hover:border-emerald-300"
              }`}
            >
              {cta.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Congratulations;
