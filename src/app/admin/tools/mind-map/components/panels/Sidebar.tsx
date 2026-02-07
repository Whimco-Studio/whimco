"use client";

import { type ReactNode } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export type SidebarTab = "inspector" | "parking" | "progress";

interface SidebarProps {
  open: boolean;
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  onClose: () => void;
  children: ReactNode;
}

const tabs: { id: SidebarTab; label: string }[] = [
  { id: "inspector", label: "Inspector" },
  { id: "parking", label: "Parking Lot" },
  { id: "progress", label: "Progress" },
];

export default function Sidebar({
  open,
  activeTab,
  onTabChange,
  onClose,
  children,
}: SidebarProps) {
  return (
    <div
      className={`absolute top-0 right-0 h-full w-80 bg-[#1e1e3a]/95 backdrop-blur-xl border-l border-white/10 z-20 transition-transform duration-300 flex flex-col ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                activeTab === tab.id
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/60 hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="p-1 text-white/40 hover:text-white/70 hover:bg-white/5 rounded transition-colors"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
