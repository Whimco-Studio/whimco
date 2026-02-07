"use client";

import { createContext, useContext, useReducer, useCallback, type Dispatch } from "react";
import {
  type MindMapState,
  type MindMapAction,
  type GameNode,
  type GameEdge,
  type GameNodeData,
  type GameEdgeData,
  GameEdgeType,
} from "../types";
import { DEFAULT_PITCH } from "../constants";

// ── Initial State ───────────────────────────────────────────
export const initialState: MindMapState = {
  nodes: [],
  edges: [],
  pitch: DEFAULT_PITCH,
  scopeBounds: null,
  snapToGrid: false,
  defaultEdgeType: GameEdgeType.RelatesTo,
  scopeVisible: true,
};

// ── Reducer ─────────────────────────────────────────────────
export function mindMapReducer(
  state: MindMapState,
  action: MindMapAction
): MindMapState {
  switch (action.type) {
    case "ADD_NODE":
      return { ...state, nodes: [...state.nodes, action.payload] };

    case "UPDATE_NODE":
      return {
        ...state,
        nodes: state.nodes.map((n) =>
          n.id === action.payload.id
            ? { ...n, data: { ...n.data, ...action.payload.data } }
            : n
        ),
      };

    case "DELETE_NODE":
      return {
        ...state,
        nodes: state.nodes.filter((n) => n.id !== action.payload),
        edges: state.edges.filter(
          (e) => e.source !== action.payload && e.target !== action.payload
        ),
      };

    case "SET_NODES":
      return { ...state, nodes: action.payload };

    case "ADD_EDGE":
      return { ...state, edges: [...state.edges, action.payload] };

    case "UPDATE_EDGE":
      return {
        ...state,
        edges: state.edges.map((e) =>
          e.id === action.payload.id
            ? ({ ...e, data: { ...e.data, ...action.payload.data } } as GameEdge)
            : e
        ),
      };

    case "DELETE_EDGE":
      return {
        ...state,
        edges: state.edges.filter((e) => e.id !== action.payload),
      };

    case "SET_EDGES":
      return { ...state, edges: action.payload };

    case "SET_PITCH":
      return { ...state, pitch: action.payload };

    case "SET_SCOPE_BOUNDS":
      return { ...state, scopeBounds: action.payload };

    case "TOGGLE_SNAP_TO_GRID":
      return { ...state, snapToGrid: !state.snapToGrid };

    case "TOGGLE_SCOPE_VISIBLE":
      return { ...state, scopeVisible: !state.scopeVisible };

    case "SET_DEFAULT_EDGE_TYPE":
      return { ...state, defaultEdgeType: action.payload };

    case "LOAD_STATE":
      return action.payload;

    default:
      return state;
  }
}

// ── Context ─────────────────────────────────────────────────
export interface MindMapContextValue {
  state: MindMapState;
  dispatch: Dispatch<MindMapAction>;
  addNode: (node: GameNode) => void;
  updateNode: (id: string, data: Partial<GameNodeData>) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: GameEdge) => void;
  updateEdge: (id: string, data: Partial<GameEdgeData>) => void;
  deleteEdge: (id: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const MindMapContext = createContext<MindMapContextValue | null>(null);

export function useMindMap() {
  const ctx = useContext(MindMapContext);
  if (!ctx) throw new Error("useMindMap must be used inside MindMapProvider");
  return ctx;
}
