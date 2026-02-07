"use client";

import { useState, useMemo } from "react";
import { useMindMap } from "../../hooks/useMindMapState";
import { NODE_TYPE_CONFIG, STATUS_CONFIG, PRIORITY_CONFIG } from "../../constants";
import type { GameNodeType, Priority } from "../../types";

type SortBy = "type" | "date" | "priority";

const PRIORITY_ORDER = { core: 0, "nice-to-have": 1, stretch: 2 };

export default function ParkingLot() {
  const { state, updateNode } = useMindMap();
  const [sortBy, setSortBy] = useState<SortBy>("date");

  const outOfScopeNodes = useMemo(() => {
    const nodes = state.nodes.filter((n) => !n.data.inScope);

    switch (sortBy) {
      case "type":
        return [...nodes].sort((a, b) =>
          a.data.gameType.localeCompare(b.data.gameType)
        );
      case "priority":
        return [...nodes].sort(
          (a, b) =>
            PRIORITY_ORDER[a.data.priority] - PRIORITY_ORDER[b.data.priority]
        );
      case "date":
      default:
        return [...nodes].sort(
          (a, b) =>
            new Date(b.data.createdAt).getTime() -
            new Date(a.data.createdAt).getTime()
        );
    }
  }, [state.nodes, sortBy]);

  if (outOfScopeNodes.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-white/40 text-sm">No parked ideas</p>
        <p className="text-white/30 text-xs mt-1">
          Nodes outside the scope boundary appear here
        </p>
      </div>
    );
  }

  return (
    <div className="p-3">
      {/* Sort controls */}
      <div className="flex items-center gap-1 mb-3">
        <span className="text-[10px] text-white/30 mr-1">Sort:</span>
        {(["date", "type", "priority"] as SortBy[]).map((s) => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            className={`px-2 py-0.5 text-[10px] rounded transition-colors ${
              sortBy === s
                ? "bg-white/10 text-white/70"
                : "text-white/40 hover:text-white/60 hover:bg-white/5"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Node list */}
      <div className="space-y-1.5">
        {outOfScopeNodes.map((node) => {
          const typeConfig = NODE_TYPE_CONFIG[node.data.gameType];
          return (
            <div
              key={node.id}
              className="flex items-center gap-2 px-2 py-1.5 bg-white/5 rounded hover:bg-white/8 transition-colors group"
            >
              <span
                className="w-2 h-2 rounded-sm flex-shrink-0"
                style={{ backgroundColor: typeConfig.color }}
              />
              <span className="text-xs text-white/70 truncate flex-1">
                {node.data.label}
              </span>
              <span className="text-[10px] text-white/30 flex-shrink-0">
                {PRIORITY_CONFIG[node.data.priority].label}
              </span>
              {state.scopeBounds && (
                <button
                  onClick={() => updateNode(node.id, { inScope: true })}
                  className="opacity-0 group-hover:opacity-100 px-1.5 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30 transition-all flex-shrink-0"
                >
                  Scope
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-[10px] text-white/20 mt-3 text-center">
        {outOfScopeNodes.length} parked idea{outOfScopeNodes.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
