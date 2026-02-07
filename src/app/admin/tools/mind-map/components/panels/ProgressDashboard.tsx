"use client";

import { useMemo } from "react";
import { useMindMap } from "../../hooks/useMindMapState";
import { GameNodeType, NodeStatus, Effort } from "../../types";
import { NODE_TYPE_CONFIG, EFFORT_CONFIG } from "../../constants";

export default function ProgressDashboard() {
  const { state } = useMindMap();

  const stats = useMemo(() => {
    const inScope = state.nodes.filter((n) => n.data.inScope);
    const total = inScope.length;
    const done = inScope.filter((n) => n.data.status === NodeStatus.Done).length;
    const overallPercent = total > 0 ? Math.round((done / total) * 100) : 0;

    // Per-type stats
    const byType: Record<string, { total: number; done: number }> = {};
    for (const type of Object.values(GameNodeType)) {
      const typeNodes = inScope.filter((n) => n.data.gameType === type);
      byType[type] = {
        total: typeNodes.length,
        done: typeNodes.filter((n) => n.data.status === NodeStatus.Done).length,
      };
    }

    // Effort distribution
    const effort = { small: 0, medium: 0, large: 0 };
    for (const node of inScope) {
      effort[node.data.effort] += 1;
    }

    // Scope creep (total nodes ever created vs original scope size)
    const totalNodes = state.nodes.length;

    return { total, done, overallPercent, byType, effort, totalNodes };
  }, [state.nodes]);

  if (stats.total === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-white/40 text-sm">No in-scope nodes</p>
        <p className="text-white/30 text-xs mt-1">
          Add nodes to the scope boundary to track progress
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-5">
      {/* Overall completion ring */}
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
            <path
              className="text-white/5"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="text-emerald-500"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${stats.overallPercent}, 100`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-white/80">
              {stats.overallPercent}%
            </span>
          </div>
        </div>
        <div>
          <p className="text-sm text-white/80 font-medium">Overall Progress</p>
          <p className="text-xs text-white/40">
            {stats.done}/{stats.total} in-scope nodes done
          </p>
        </div>
      </div>

      {/* Per-type progress */}
      <div>
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-2">
          By Type
        </h4>
        <div className="space-y-1.5">
          {Object.entries(stats.byType)
            .filter(([, v]) => v.total > 0)
            .map(([type, v]) => {
              const config = NODE_TYPE_CONFIG[type as GameNodeType];
              const pct = v.total > 0 ? Math.round((v.done / v.total) * 100) : 0;
              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs text-white/60">
                      {config.icon} {config.label}
                    </span>
                    <span className="text-[10px] text-white/40">
                      {v.done}/{v.total}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: config.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Effort distribution */}
      <div>
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-2">
          Effort Distribution
        </h4>
        <div className="flex h-4 rounded-full overflow-hidden bg-white/5">
          {stats.effort.small > 0 && (
            <div
              className="bg-emerald-500/60 transition-all duration-500"
              style={{
                width: `${(stats.effort.small / stats.total) * 100}%`,
              }}
              title={`Small: ${stats.effort.small}`}
            />
          )}
          {stats.effort.medium > 0 && (
            <div
              className="bg-yellow-500/60 transition-all duration-500"
              style={{
                width: `${(stats.effort.medium / stats.total) * 100}%`,
              }}
              title={`Medium: ${stats.effort.medium}`}
            />
          )}
          {stats.effort.large > 0 && (
            <div
              className="bg-red-500/60 transition-all duration-500"
              style={{
                width: `${(stats.effort.large / stats.total) * 100}%`,
              }}
              title={`Large: ${stats.effort.large}`}
            />
          )}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-emerald-400/60">
            S: {stats.effort.small}
          </span>
          <span className="text-[10px] text-yellow-400/60">
            M: {stats.effort.medium}
          </span>
          <span className="text-[10px] text-red-400/60">
            L: {stats.effort.large}
          </span>
        </div>
      </div>

      {/* Scope stats */}
      <div className="pt-2 border-t border-white/5">
        <div className="flex justify-between text-xs">
          <span className="text-white/40">Total nodes</span>
          <span className="text-white/60">{stats.totalNodes}</span>
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-white/40">In scope</span>
          <span className="text-emerald-400/60">{stats.total}</span>
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-white/40">Out of scope</span>
          <span className="text-white/60">{stats.totalNodes - stats.total}</span>
        </div>
      </div>
    </div>
  );
}
