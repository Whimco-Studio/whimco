"use client";

import { GameNodeType, NodeStatus, Priority, Effort } from "../../types";
import {
  NODE_TYPE_CONFIG,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  EFFORT_CONFIG,
} from "../../constants";

interface NodeContextMenuProps {
  x: number;
  y: number;
  nodeId: string;
  currentType: GameNodeType;
  currentStatus: NodeStatus;
  currentPriority: Priority;
  currentEffort: Effort;
  onUpdateType: (type: GameNodeType) => void;
  onUpdateStatus: (status: NodeStatus) => void;
  onUpdatePriority: (priority: Priority) => void;
  onUpdateEffort: (effort: Effort) => void;
  onDelete: () => void;
  onClose: () => void;
}

type SubMenu = "type" | "status" | "priority" | "effort" | null;

import { useState } from "react";

export default function NodeContextMenu({
  x,
  y,
  nodeId,
  currentType,
  currentStatus,
  currentPriority,
  currentEffort,
  onUpdateType,
  onUpdateStatus,
  onUpdatePriority,
  onUpdateEffort,
  onDelete,
  onClose,
}: NodeContextMenuProps) {
  const [subMenu, setSubMenu] = useState<SubMenu>(null);

  const menuItems = [
    {
      label: `Type: ${NODE_TYPE_CONFIG[currentType].label}`,
      action: () => setSubMenu("type"),
    },
    {
      label: `Status: ${STATUS_CONFIG[currentStatus].label}`,
      action: () => setSubMenu("status"),
    },
    {
      label: `Priority: ${PRIORITY_CONFIG[currentPriority].label}`,
      action: () => setSubMenu("priority"),
    },
    {
      label: `Effort: ${EFFORT_CONFIG[currentEffort].label}`,
      action: () => setSubMenu("effort"),
    },
  ];

  const renderSubMenu = () => {
    switch (subMenu) {
      case "type":
        return Object.values(GameNodeType).map((type) => (
          <button
            key={type}
            onClick={() => {
              onUpdateType(type);
              onClose();
            }}
            className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 transition-colors ${
              type === currentType ? "bg-white/5" : ""
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ backgroundColor: NODE_TYPE_CONFIG[type].color }}
            />
            {NODE_TYPE_CONFIG[type].label}
          </button>
        ));
      case "status":
        return Object.values(NodeStatus).map((status) => (
          <button
            key={status}
            onClick={() => {
              onUpdateStatus(status);
              onClose();
            }}
            className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 transition-colors ${
              status === currentStatus ? "bg-white/5" : ""
            }`}
          >
            <span>{STATUS_CONFIG[status].icon}</span>
            {STATUS_CONFIG[status].label}
          </button>
        ));
      case "priority":
        return Object.values(Priority).map((p) => (
          <button
            key={p}
            onClick={() => {
              onUpdatePriority(p);
              onClose();
            }}
            className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 transition-colors ${
              p === currentPriority ? "bg-white/5" : ""
            }`}
          >
            {PRIORITY_CONFIG[p].label}
          </button>
        ));
      case "effort":
        return Object.values(Effort).map((e) => (
          <button
            key={e}
            onClick={() => {
              onUpdateEffort(e);
              onClose();
            }}
            className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 transition-colors ${
              e === currentEffort ? "bg-white/5" : ""
            }`}
          >
            {EFFORT_CONFIG[e].label}
          </button>
        ));
      default:
        return null;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 bg-[#252547] border border-white/10 rounded-lg shadow-2xl overflow-hidden min-w-[180px]"
        style={{ left: x, top: y }}
      >
        {subMenu ? (
          <>
            <button
              onClick={() => setSubMenu(null)}
              className="w-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40 border-b border-white/10 hover:bg-white/5 text-left"
            >
              ← Back
            </button>
            {renderSubMenu()}
          </>
        ) : (
          <>
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 transition-colors text-left flex items-center justify-between"
              >
                {item.label}
                <span className="text-white/30 text-xs">→</span>
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
              Delete Node
            </button>
          </>
        )}
      </div>
    </>
  );
}
