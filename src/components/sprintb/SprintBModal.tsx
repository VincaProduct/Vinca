import React from "react";
import { X } from "lucide-react";

interface SprintBModalProps {
  open: boolean;
  title: string;
  description: string;
  overview: string[];
  onClose: () => void;
  onConfirm: () => void;
}

const SprintBModal: React.FC<SprintBModalProps> = ({
  open,
  title,
  description,
  overview,
  onClose,
  onConfirm,
}) => {
  if (!open) return null;

  // Animation: fade + scale-in
  // Focus trap and ESC close handled by parent/modal infra
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4 transition-opacity duration-200">
      <div className="w-full max-w-lg md:max-w-xl rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden animate-modal-fade-scale">
        {/* Header */}
        <div className="flex items-start justify-between px-7 py-5 border-b border-slate-100">
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-emerald-600 font-semibold mb-1">SPRINT PREVIEW</p>
            <h3 className="text-2xl font-semibold text-slate-900 leading-tight">{title}</h3>
            <p className="text-sm text-slate-500 mt-1">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Cards */}
        <div className="px-7 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {overview.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700 font-medium shadow-sm flex items-start"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Footer/CTA */}
        <div className="px-7 py-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-slate-600">Confirm to activate this sprint. Closing will keep you on the selection screen.</p>
          <div className="flex items-center gap-3 sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 rounded-lg border border-transparent bg-transparent"
            >
              Close
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Confirm start
            </button>
          </div>
        </div>
      </div>
      {/* Animation styles */}
      <style>{`
        .animate-modal-fade-scale {
          animation: modal-fade-scale-in 0.22s cubic-bezier(.32,.72,.52,1.1);
        }
        @keyframes modal-fade-scale-in {
          0% { opacity: 0; transform: scale(0.96); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default SprintBModal;
