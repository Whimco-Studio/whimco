"use client";

import { useReducer, useRef, useCallback } from "react";
import type { MindMapState, MindMapAction } from "../types";
import { mindMapReducer, initialState } from "./useMindMapState";

const MAX_HISTORY = 50;

// Actions that should create undo snapshots
const SNAPSHOT_ACTIONS = new Set([
  "ADD_NODE",
  "UPDATE_NODE",
  "DELETE_NODE",
  "ADD_EDGE",
  "UPDATE_EDGE",
  "DELETE_EDGE",
  "SET_PITCH",
  "SET_SCOPE_BOUNDS",
]);

export function useUndoRedo(initial?: MindMapState) {
  const pastRef = useRef<MindMapState[]>([]);
  const futureRef = useRef<MindMapState[]>([]);

  const [state, baseDispatch] = useReducer(
    mindMapReducer,
    initial ?? initialState
  );

  const stateRef = useRef(state);
  stateRef.current = state;

  const dispatch = useCallback((action: MindMapAction) => {
    if (SNAPSHOT_ACTIONS.has(action.type)) {
      pastRef.current = [
        ...pastRef.current.slice(-(MAX_HISTORY - 1)),
        stateRef.current,
      ];
      futureRef.current = [];
    }
    baseDispatch(action);
  }, []);

  const undo = useCallback(() => {
    if (pastRef.current.length === 0) return;
    const prev = pastRef.current[pastRef.current.length - 1];
    pastRef.current = pastRef.current.slice(0, -1);
    futureRef.current = [...futureRef.current, stateRef.current];
    baseDispatch({ type: "LOAD_STATE", payload: prev });
  }, []);

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    const next = futureRef.current[futureRef.current.length - 1];
    futureRef.current = futureRef.current.slice(0, -1);
    pastRef.current = [...pastRef.current, stateRef.current];
    baseDispatch({ type: "LOAD_STATE", payload: next });
  }, []);

  return {
    state,
    dispatch,
    undo,
    redo,
    canUndo: pastRef.current.length > 0,
    canRedo: futureRef.current.length > 0,
  };
}
