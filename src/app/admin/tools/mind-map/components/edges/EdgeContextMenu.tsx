"use client";

import { GameEdgeType } from "../../types";
import { EDGE_TYPE_CONFIG } from "../../constants";

interface EdgeContextMenuProps {
  x: number;
  y: number;
  edgeId: string;
  currentType: GameEdgeType;
  onUpdateType: (type: GameEdgeType) => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function EdgeContextMenu({
  x,
  y,
  edgeId,
  currentType,
  onUpdateType,
  onDelete,
  onClose,
}: EdgeContextMenuProps) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 bg-[#252547] border border-white/10 rounded-lg shadow-2xl overflow-hidden min-w-[160px]"
        style={{ left: x, top: y }}
      >
        <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40 border-b border-white/10">
          Edge Type
        </div>
        {Object.values(GameEdgeType).map((type) => (
          <button
            key={type}
            onClick={() => {
              onUpdateType(type);
              onClose();
            }}
            className={`w-full px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 transition-colors text-left ${
              type === currentType ? "bg-white/5" : ""
            }`}
          >
            {EDGE_TYPE_CONFIG[type].label}
          </button>
        ))}
        <div className="border-t border-white/10" />
        <button
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="w-full px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
        >
          Delete Edge
        </button>
      </div>
    </>
  );
}
