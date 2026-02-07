"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { GameNode } from "../../types";
import { NodeStatus, Priority } from "../../types";
import { NODE_TYPE_CONFIG, EFFORT_CONFIG } from "../../constants";

function GameNodeComponent({ data, selected }: NodeProps<GameNode>) {
  const typeConfig = NODE_TYPE_CONFIG[data.gameType];
  const effortConfig = EFFORT_CONFIG[data.effort];

  const isCore = data.priority === Priority.Core;
  const isDone = data.status === NodeStatus.Done;
  const isInProgress = data.status === NodeStatus.InProgress;
  const isIdea = data.status === NodeStatus.Idea;
  const hasDepthWarning = !!data.depthWarning;

  return (
    <div
      className={`
        relative rounded-lg border-2 min-w-[160px] max-w-[240px]
        transition-all duration-200 group
        hover:shadow-lg hover:shadow-white/5 hover:-translate-y-0.5
        ${selected ? "ring-2 ring-white/40 shadow-lg shadow-white/10 -translate-y-0.5" : ""}
        ${isDone ? "opacity-70" : ""}
        ${!data.inScope && data.inScope !== undefined ? "opacity-50 grayscale-[30%]" : ""}
        ${hasDepthWarning ? "ring-2 ring-yellow-500/40" : ""}
      `}
      style={{
        backgroundColor: `${typeConfig.color}15`,
        borderColor: hasDepthWarning
          ? "#eab30880"
          : `${typeConfig.color}99`,
        borderStyle: isIdea ? "dashed" : "solid",
      }}
    >
      {/* In-progress animated bar at top */}
      {isInProgress && (
        <div className="absolute top-0 left-0 right-0 h-0.5 overflow-hidden rounded-t-md">
          <div
            className="h-full w-1/3 animate-slide-right"
            style={{ backgroundColor: typeConfig.color }}
          />
        </div>
      )}

      {/* Depth warning tooltip */}
      {hasDepthWarning && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          <div className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded text-[10px] text-yellow-300 whitespace-nowrap">
            Deep branch — consider simplifying
          </div>
        </div>
      )}

      {/* Top handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-white/40 !border-0 hover:!bg-white/80 !transition-colors"
      />

      {/* Header with type badge */}
      <div className="flex items-center justify-between px-3 pt-2 pb-1">
        <span
          className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
          style={{
            backgroundColor: `${typeConfig.color}30`,
            color: typeConfig.color,
          }}
        >
          {typeConfig.icon} {typeConfig.label}
        </span>
        <div className="flex items-center gap-1">
          {hasDepthWarning && (
            <span className="text-yellow-500 text-xs" title="Deep branch warning">
              ⚠
            </span>
          )}
          <span className="text-[10px] text-white/40">
            {effortConfig.badge}
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="px-3 pb-2">
        <p
          className={`text-sm text-white/90 leading-tight transition-all duration-200 ${
            isCore ? "font-bold" : "font-medium"
          } ${isDone ? "line-through text-white/50" : ""}`}
        >
          {data.label}
        </p>
      </div>

      {/* Status bar */}
      <div
        className="h-1 rounded-b-md transition-all duration-500"
        style={{
          backgroundColor:
            data.status === NodeStatus.Done
              ? "#22c55e"
              : data.status === NodeStatus.InProgress
              ? typeConfig.color
              : data.status === NodeStatus.Scoped
              ? `${typeConfig.color}40`
              : "transparent",
        }}
      />

      {/* Bottom handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-white/40 !border-0 hover:!bg-white/80 !transition-colors"
      />

      {/* Left handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-2 !h-2 !bg-white/40 !border-0 hover:!bg-white/80 !transition-colors"
      />

      {/* Right handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-2 !h-2 !bg-white/40 !border-0 hover:!bg-white/80 !transition-colors"
      />
    </div>
  );
}

export default memo(GameNodeComponent);
