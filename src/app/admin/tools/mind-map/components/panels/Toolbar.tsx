"use client";

import { useReactFlow } from "@xyflow/react";
import { useMindMap } from "../../hooks/useMindMapState";
import {
  GameNodeType,
  GameEdgeType,
  NodeStatus,
  Priority,
  Effort,
  type GameNode,
} from "../../types";
import { NODE_TYPE_CONFIG, EDGE_TYPE_CONFIG } from "../../constants";

interface ToolbarProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  onExportJSON: () => void;
  onImportJSON: () => void;
  onExportMarkdown: () => void;
}

export default function Toolbar({
  onToggleSidebar,
  sidebarOpen,
  onExportJSON,
  onImportJSON,
  onExportMarkdown,
}: ToolbarProps) {
  const { state, dispatch, addNode, undo, redo, canUndo, canRedo } = useMindMap();
  const { getViewport, screenToFlowPosition } = useReactFlow();

  const handleQuickAdd = (type: GameNodeType) => {
    // Place near center of current viewport
    const center = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    // Offset randomly so nodes don't stack
    const offset = { x: (Math.random() - 0.5) * 100, y: (Math.random() - 0.5) * 100 };

    const node: GameNode = {
      id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: "gameNode",
      position: { x: center.x + offset.x, y: center.y + offset.y },
      data: {
        label: `New ${NODE_TYPE_CONFIG[type].label}`,
        description: "",
        gameType: type,
        status: NodeStatus.Idea,
        priority: Priority.NiceToHave,
        effort: Effort.Medium,
        createdAt: new Date().toISOString(),
        inScope: false,
      },
    };
    addNode(node);
  };

  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3 py-2 bg-[#1e1e3a]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg">
      {/* Quick-add type buttons */}
      {Object.values(GameNodeType).map((type) => {
        const config = NODE_TYPE_CONFIG[type];
        return (
          <button
            key={type}
            onClick={() => handleQuickAdd(type)}
            title={`Add ${config.label} node`}
            className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 transition-colors"
            style={{ color: config.color }}
          >
            <span className="text-xs">{config.icon}</span>
          </button>
        );
      })}

      <div className="w-px h-5 bg-white/10 mx-1" />

      {/* Default edge type */}
      <div className="flex items-center gap-0.5">
        {Object.values(GameEdgeType).map((type) => (
          <button
            key={type}
            onClick={() => dispatch({ type: "SET_DEFAULT_EDGE_TYPE", payload: type })}
            title={EDGE_TYPE_CONFIG[type].label}
            className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${
              state.defaultEdgeType === type
                ? "bg-white/10 text-white/80"
                : "text-white/30 hover:text-white/50 hover:bg-white/5"
            }`}
          >
            {type === GameEdgeType.RelatesTo ? "- -" : type === GameEdgeType.DependsOn ? "→" : "━"}
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-white/10 mx-1" />

      {/* Toggles */}
      <button
        onClick={() => dispatch({ type: "TOGGLE_SNAP_TO_GRID" })}
        title="Snap to grid"
        className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${
          state.snapToGrid
            ? "bg-white/10 text-white/80"
            : "text-white/30 hover:text-white/50 hover:bg-white/5"
        }`}
      >
        Grid
      </button>

      <button
        onClick={() => dispatch({ type: "TOGGLE_SCOPE_VISIBLE" })}
        title="Toggle scope boundary"
        className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${
          state.scopeVisible
            ? "bg-emerald-500/20 text-emerald-400"
            : "text-white/30 hover:text-white/50 hover:bg-white/5"
        }`}
      >
        Scope
      </button>

      {!state.scopeBounds && state.scopeVisible && (
        <button
          onClick={() =>
            dispatch({
              type: "SET_SCOPE_BOUNDS",
              payload: { x: -300, y: -200, width: 600, height: 400 },
            })
          }
          title="Create scope boundary"
          className="px-1.5 py-0.5 text-[10px] rounded text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
        >
          + Scope
        </button>
      )}

      <div className="w-px h-5 bg-white/10 mx-1" />

      {/* Undo/Redo */}
      <button
        onClick={undo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
        className="px-1.5 py-0.5 text-[10px] text-white/40 hover:text-white/70 hover:bg-white/5 rounded transition-colors disabled:opacity-20 disabled:hover:bg-transparent"
      >
        Undo
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        title="Redo (Ctrl+Y)"
        className="px-1.5 py-0.5 text-[10px] text-white/40 hover:text-white/70 hover:bg-white/5 rounded transition-colors disabled:opacity-20 disabled:hover:bg-transparent"
      >
        Redo
      </button>

      <div className="w-px h-5 bg-white/10 mx-1" />

      {/* Sidebar toggle */}
      <button
        onClick={onToggleSidebar}
        title="Toggle sidebar"
        className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${
          sidebarOpen
            ? "bg-white/10 text-white/80"
            : "text-white/30 hover:text-white/50 hover:bg-white/5"
        }`}
      >
        Panel
      </button>

      <div className="w-px h-5 bg-white/10 mx-1" />

      {/* Export/Import */}
      <button
        onClick={onExportJSON}
        title="Export JSON (Ctrl+S)"
        className="px-1.5 py-0.5 text-[10px] text-white/40 hover:text-white/70 hover:bg-white/5 rounded transition-colors"
      >
        Save
      </button>
      <button
        onClick={onImportJSON}
        title="Import JSON"
        className="px-1.5 py-0.5 text-[10px] text-white/40 hover:text-white/70 hover:bg-white/5 rounded transition-colors"
      >
        Load
      </button>
      <button
        onClick={onExportMarkdown}
        title="Export scope as Markdown"
        className="px-1.5 py-0.5 text-[10px] text-white/40 hover:text-white/70 hover:bg-white/5 rounded transition-colors"
      >
        MD
      </button>
    </div>
  );
}
