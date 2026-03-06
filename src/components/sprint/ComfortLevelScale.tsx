import React from "react";

interface ComfortLevelScaleProps {
  value: number | null;
  onChange: (val: number) => void;
  disabled?: boolean;
}

const ComfortLevelScale: React.FC<ComfortLevelScaleProps> = ({ value, onChange, disabled }) => {
  const levels = [1, 2, 3, 4, 5];
  return (
    <div className="flex gap-2 items-center">
      {levels.map((level) => {
        const isSelected = value === level;
        return (
          <button
            key={level}
            type="button"
            className={`w-10 h-10 rounded-full border text-sm font-semibold transition ${
              isSelected
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white text-emerald-700 border-emerald-200 hover:border-emerald-300"
            }`}
            onClick={() => !disabled && onChange(level)}
            disabled={disabled}
          >
            {level}
          </button>
        );
      })}
    </div>
  );
};

export default ComfortLevelScale;
