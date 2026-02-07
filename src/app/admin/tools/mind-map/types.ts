import type { Node, Edge } from "@xyflow/react";

// ── Node Types ──────────────────────────────────────────────
export enum GameNodeType {
  Mechanic = "mechanic",
  Narrative = "narrative",
  Art = "art",
  Audio = "audio",
  UIUX = "ui-ux",
  Tech = "tech",
  Meta = "meta",
}

export enum NodeStatus {
  Idea = "idea",
  Scoped = "scoped",
  InProgress = "in-progress",
  Done = "done",
}

export enum Priority {
  Core = "core",
  NiceToHave = "nice-to-have",
  Stretch = "stretch",
}

export enum Effort {
  Small = "small",
  Medium = "medium",
  Large = "large",
}

// ── Edge Types ──────────────────────────────────────────────
export enum GameEdgeType {
  RelatesTo = "relates-to",
  DependsOn = "depends-on",
  PartOf = "part-of",
}

// ── Data Shapes ─────────────────────────────────────────────
export interface GameNodeData extends Record<string, unknown> {
  label: string;
  description: string;
  gameType: GameNodeType;
  status: NodeStatus;
  priority: Priority;
  effort: Effort;
  createdAt: string;
  inScope: boolean;
  depthWarning?: boolean;
}

export interface GameEdgeData extends Record<string, unknown> {
  edgeType: GameEdgeType;
}

export type GameNode = Node<GameNodeData, "gameNode">;
export type GameEdge = Edge<GameEdgeData>;

// ── Scope ───────────────────────────────────────────────────
export interface ScopeBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ── Full State ──────────────────────────────────────────────
export interface MindMapState {
  nodes: GameNode[];
  edges: GameEdge[];
  pitch: string;
  scopeBounds: ScopeBounds | null;
  snapToGrid: boolean;
  defaultEdgeType: GameEdgeType;
  scopeVisible: boolean;
}

// ── Reducer Actions ─────────────────────────────────────────
export type MindMapAction =
  | { type: "ADD_NODE"; payload: GameNode }
  | { type: "UPDATE_NODE"; payload: { id: string; data: Partial<GameNodeData> } }
  | { type: "DELETE_NODE"; payload: string }
  | { type: "SET_NODES"; payload: GameNode[] }
  | { type: "ADD_EDGE"; payload: GameEdge }
  | { type: "UPDATE_EDGE"; payload: { id: string; data: Partial<GameEdgeData> } }
  | { type: "DELETE_EDGE"; payload: string }
  | { type: "SET_EDGES"; payload: GameEdge[] }
  | { type: "SET_PITCH"; payload: string }
  | { type: "SET_SCOPE_BOUNDS"; payload: ScopeBounds | null }
  | { type: "TOGGLE_SNAP_TO_GRID" }
  | { type: "TOGGLE_SCOPE_VISIBLE" }
  | { type: "SET_DEFAULT_EDGE_TYPE"; payload: GameEdgeType }
  | { type: "LOAD_STATE"; payload: MindMapState };
