import { GameNodeType, GameEdgeType, NodeStatus, Priority, Effort } from "./types";

// ── Node Type Config ────────────────────────────────────────
export const NODE_TYPE_CONFIG: Record<
  GameNodeType,
  { label: string; color: string; bg: string; border: string; icon: string }
> = {
  [GameNodeType.Mechanic]: {
    label: "Mechanic",
    color: "#3b82f6",
    bg: "bg-blue-500/20",
    border: "border-blue-500/60",
    icon: "⚙️",
  },
  [GameNodeType.Narrative]: {
    label: "Narrative",
    color: "#a855f7",
    bg: "bg-purple-500/20",
    border: "border-purple-500/60",
    icon: "📖",
  },
  [GameNodeType.Art]: {
    label: "Art",
    color: "#f97316",
    bg: "bg-orange-500/20",
    border: "border-orange-500/60",
    icon: "🎨",
  },
  [GameNodeType.Audio]: {
    label: "Audio",
    color: "#22c55e",
    bg: "bg-green-500/20",
    border: "border-green-500/60",
    icon: "🔊",
  },
  [GameNodeType.UIUX]: {
    label: "UI/UX",
    color: "#eab308",
    bg: "bg-yellow-500/20",
    border: "border-yellow-500/60",
    icon: "🖥️",
  },
  [GameNodeType.Tech]: {
    label: "Tech",
    color: "#ef4444",
    bg: "bg-red-500/20",
    border: "border-red-500/60",
    icon: "🔧",
  },
  [GameNodeType.Meta]: {
    label: "Meta",
    color: "#6b7280",
    bg: "bg-gray-500/20",
    border: "border-gray-500/60",
    icon: "📋",
  },
};

// ── Edge Type Config ────────────────────────────────────────
export const EDGE_TYPE_CONFIG: Record<
  GameEdgeType,
  { label: string; style: string; animated: boolean; markerEnd: boolean }
> = {
  [GameEdgeType.RelatesTo]: {
    label: "Relates to",
    style: "dashed",
    animated: false,
    markerEnd: false,
  },
  [GameEdgeType.DependsOn]: {
    label: "Depends on",
    style: "solid",
    animated: false,
    markerEnd: true,
  },
  [GameEdgeType.PartOf]: {
    label: "Part of",
    style: "thick",
    animated: false,
    markerEnd: false,
  },
};

// ── Status Config ───────────────────────────────────────────
export const STATUS_CONFIG: Record<
  NodeStatus,
  { label: string; borderStyle: string; icon: string }
> = {
  [NodeStatus.Idea]: { label: "Idea", borderStyle: "dashed", icon: "💡" },
  [NodeStatus.Scoped]: { label: "Scoped", borderStyle: "solid", icon: "📌" },
  [NodeStatus.InProgress]: { label: "In Progress", borderStyle: "solid", icon: "🔨" },
  [NodeStatus.Done]: { label: "Done", borderStyle: "solid", icon: "✅" },
};

// ── Priority Config ─────────────────────────────────────────
export const PRIORITY_CONFIG: Record<Priority, { label: string; weight: string }> = {
  [Priority.Core]: { label: "Core", weight: "font-bold" },
  [Priority.NiceToHave]: { label: "Nice to Have", weight: "font-medium" },
  [Priority.Stretch]: { label: "Stretch", weight: "font-normal" },
};

// ── Effort Config ───────────────────────────────────────────
export const EFFORT_CONFIG: Record<Effort, { label: string; badge: string }> = {
  [Effort.Small]: { label: "Small", badge: "S" },
  [Effort.Medium]: { label: "Medium", badge: "M" },
  [Effort.Large]: { label: "Large", badge: "L" },
};

// ── Default State ───────────────────────────────────────────
export const DEFAULT_PITCH =
  "Define your game's core pitch here. What does the player do? Why is it fun? What makes it different?";

export const STORAGE_KEY = "whimco-mind-map-state";
