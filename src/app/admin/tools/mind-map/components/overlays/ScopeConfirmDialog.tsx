"use client";

interface ScopeConfirmDialogProps {
  nodeName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ScopeConfirmDialog({
  nodeName,
  onConfirm,
  onCancel,
}: ScopeConfirmDialogProps) {
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#252547] border border-white/10 rounded-lg shadow-2xl p-4 w-80">
        <h3 className="text-sm font-semibold text-white/90 mb-2">
          Add to active scope?
        </h3>
        <p className="text-xs text-white/60 mb-4">
          Moving <span className="text-white/80 font-medium">&quot;{nodeName}&quot;</span> into the
          scope boundary expands your plan.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs text-white/50 hover:text-white/80 rounded hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 text-xs bg-emerald-500/20 text-emerald-300 rounded hover:bg-emerald-500/30 transition-colors"
          >
            Add to Scope
          </button>
        </div>
      </div>
    </>
  );
}
