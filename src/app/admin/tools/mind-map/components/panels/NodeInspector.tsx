"use client";

import { useState, useEffect } from "react";
import { useMindMap } from "../../hooks/useMindMapState";
import {
  GameNodeType,
  NodeStatus,
  Priority,
  Effort,
  GameEdgeType,
} from "../../types";
import {
  NODE_TYPE_CONFIG,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  EFFORT_CONFIG,
  EDGE_TYPE_CONFIG,
} from "../../constants";

interface NodeInspectorProps {
  nodeId: string;
}

export default function NodeInspector({ nodeId }: NodeInspectorProps) {
  const { state, updateNode } = useMindMap();
  const node = state.nodes.find((n) => n.id === nodeId);

  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  useEffect(() => {
    if (node) {
      setEditTitle(node.data.label);
      setEditDesc(node.data.description);
    }
  }, [node]);

  if (!node) {
    return (
      <div className="p-4 text-white/40 text-sm text-center">
        Node not found
      </div>
    );
  }

  const { data } = node;
  const typeConfig = NODE_TYPE_CONFIG[data.gameType];

  // Find edges connected to this node
  const connectedEdges = state.edges.filter(
    (e) => e.source === nodeId || e.target === nodeId
  );
  const dependencies = connectedEdges.filter(
    (e) => e.data?.edgeType === GameEdgeType.DependsOn
  );

  return (
    <div className="p-4 space-y-4">
      {/* Type badge */}
      <div className="flex items-center gap-2">
        <span
          className="px-2 py-0.5 text-xs font-semibold rounded"
          style={{
            backgroundColor: `${typeConfig.color}30`,
            color: typeConfig.color,
          }}
        >
          {typeConfig.icon} {typeConfig.label}
        </span>
        {data.inScope && (
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-500/20 text-emerald-400">
            In Scope
          </span>
        )}
      </div>

      {/* Title */}
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-wider text-white/40 block mb-1">
          Title
        </label>
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={() => updateNode(nodeId, { label: editTitle })}
          onKeyDown={(e) => {
            if (e.key === "Enter") updateNode(nodeId, { label: editTitle });
          }}
          className="w-full px-2 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-wider text-white/40 block mb-1">
          Description
        </label>
        <textarea
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
          onBlur={() => updateNode(nodeId, { description: editDesc })}
          rows={4}
          placeholder="Add a description..."
          className="w-full px-2 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 resize-none"
        />
      </div>

      {/* Type selector */}
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-wider text-white/40 block mb-1">
          Type
        </label>
        <div className="grid grid-cols-2 gap-1">
          {Object.values(GameNodeType).map((type) => (
            <button
              key={type}
              onClick={() => updateNode(nodeId, { gameType: type })}
              className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded transition-colors ${
                type === data.gameType
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:bg-white/5 hover:text-white/70"
              }`}
            >
              <span
                className="w-2 h-2 rounded-sm flex-shrink-0"
                style={{ backgroundColor: NODE_TYPE_CONFIG[type].color }}
              />
              {NODE_TYPE_CONFIG[type].label}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-wider text-white/40 block mb-1">
          Status
        </label>
        <div className="flex flex-wrap gap-1">
          {Object.values(NodeStatus).map((status) => (
            <button
              key={status}
              onClick={() => updateNode(nodeId, { status })}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                status === data.status
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:bg-white/5 hover:text-white/70"
              }`}
            >
              {STATUS_CONFIG[status].icon} {STATUS_CONFIG[status].label}
            </button>
          ))}
        </div>
      </div>

      {/* Priority */}
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-wider text-white/40 block mb-1">
          Priority
        </label>
        <div className="flex gap-1">
          {Object.values(Priority).map((p) => (
            <button
              key={p}
              onClick={() => updateNode(nodeId, { priority: p })}
              className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
                p === data.priority
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:bg-white/5 hover:text-white/70"
              }`}
            >
              {PRIORITY_CONFIG[p].label}
            </button>
          ))}
        </div>
      </div>

      {/* Effort */}
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-wider text-white/40 block mb-1">
          Effort
        </label>
        <div className="flex gap-1">
          {Object.values(Effort).map((e) => (
            <button
              key={e}
              onClick={() => updateNode(nodeId, { effort: e })}
              className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
                e === data.effort
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:bg-white/5 hover:text-white/70"
              }`}
            >
              {EFFORT_CONFIG[e].label}
            </button>
          ))}
        </div>
      </div>

      {/* Dependencies */}
      {dependencies.length > 0 && (
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-white/40 block mb-1">
            Dependencies ({dependencies.length})
          </label>
          <div className="space-y-1">
            {dependencies.map((edge) => {
              const otherNodeId =
                edge.source === nodeId ? edge.target : edge.source;
              const otherNode = state.nodes.find((n) => n.id === otherNodeId);
              if (!otherNode) return null;
              const direction =
                edge.source === nodeId ? "depends on" : "depended by";
              return (
                <div
                  key={edge.id}
                  className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded text-xs text-white/60"
                >
                  <span
                    className="w-2 h-2 rounded-sm flex-shrink-0"
                    style={{
                      backgroundColor:
                        NODE_TYPE_CONFIG[otherNode.data.gameType].color,
                    }}
                  />
                  <span className="truncate">{otherNode.data.label}</span>
                  <span className="text-white/30 text-[10px] ml-auto flex-shrink-0">
                    {direction}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Created date */}
      <div className="text-[10px] text-white/30 pt-2 border-t border-white/5">
        Created {new Date(data.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}
