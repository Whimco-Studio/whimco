"use client";

import { useState } from "react";
import { GameNodeType } from "../../types";
import { NODE_TYPE_CONFIG } from "../../constants";

interface CanvasContextMenuProps {
  x: number;
  y: number;
  onCreateNode: (type: GameNodeType, title: string) => void;
  onClose: () => void;
}

export default function CanvasContextMenu({
  x,
  y,
  onCreateNode,
  onClose,
}: CanvasContextMenuProps) {
  const [selectedType, setSelectedType] = useState<GameNodeType | null>(null);
  const [title, setTitle] = useState("");

  const handleCreate = () => {
    if (selectedType && title.trim()) {
      onCreateNode(selectedType, title.trim());
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Menu */}
      <div
        className="fixed z-50 bg-[#252547] border border-white/10 rounded-lg shadow-2xl overflow-hidden min-w-[220px]"
        style={{ left: x, top: y }}
      >
        {!selectedType ? (
          <>
            <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-white/40 border-b border-white/10">
              Create Node
            </div>
            {Object.values(GameNodeType).map((type) => {
              const config = NODE_TYPE_CONFIG[type];
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors"
                >
                  <span
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: config.color }}
                  />
                  <span>{config.icon}</span>
                  <span>{config.label}</span>
                </button>
              );
            })}
          </>
        ) : (
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: NODE_TYPE_CONFIG[selectedType].color }}
              />
              <span className="text-xs text-white/60">
                {NODE_TYPE_CONFIG[selectedType].label}
              </span>
            </div>
            <input
              autoFocus
              type="text"
              placeholder="Node title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") onClose();
              }}
              className="w-full px-2 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setSelectedType(null)}
                className="flex-1 px-2 py-1 text-xs text-white/50 hover:text-white/80 rounded hover:bg-white/5 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={!title.trim()}
                className="flex-1 px-2 py-1 text-xs bg-white/10 text-white/80 rounded hover:bg-white/20 transition-colors disabled:opacity-30"
              >
                Create
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
