"use client";

import { useMemo, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { ReactFlowProvider } from "@xyflow/react";
import AdminHeader from "@/app/components/admin/AdminHeader";
import MindMapWorkspace from "./components/MindMapWorkspace";
import { useUndoRedo } from "./hooks/useUndoRedo";
import { useAutoSave, loadSavedState } from "./hooks/useAutoSave";
import {
  MindMapContext,
  type MindMapContextValue,
} from "./hooks/useMindMapState";
import type { GameNode, GameEdge, GameNodeData, GameEdgeData } from "./types";

export default function MindMapPage() {
  const [loaded, setLoaded] = useState(false);
  const { state, dispatch, undo, redo, canUndo, canRedo } = useUndoRedo();

  // Load saved state on mount
  useEffect(() => {
    if (loaded) return;
    const saved = loadSavedState();
    if (saved) {
      dispatch({ type: "LOAD_STATE", payload: saved });
    }
    setLoaded(true);
  }, [loaded, dispatch]);

  // Auto-save
  useAutoSave(state);

  const addNode = useCallback(
    (node: GameNode) => dispatch({ type: "ADD_NODE", payload: node }),
    [dispatch]
  );

  const updateNode = useCallback(
    (id: string, data: Partial<GameNodeData>) =>
      dispatch({ type: "UPDATE_NODE", payload: { id, data } }),
    [dispatch]
  );

  const deleteNode = useCallback(
    (id: string) => dispatch({ type: "DELETE_NODE", payload: id }),
    [dispatch]
  );

  const addEdge = useCallback(
    (edge: GameEdge) => dispatch({ type: "ADD_EDGE", payload: edge }),
    [dispatch]
  );

  const updateEdge = useCallback(
    (id: string, data: Partial<GameEdgeData>) =>
      dispatch({ type: "UPDATE_EDGE", payload: { id, data } }),
    [dispatch]
  );

  const deleteEdge = useCallback(
    (id: string) => dispatch({ type: "DELETE_EDGE", payload: id }),
    [dispatch]
  );

  const ctxValue: MindMapContextValue = useMemo(
    () => ({
      state,
      dispatch,
      addNode,
      updateNode,
      deleteNode,
      addEdge,
      updateEdge,
      deleteEdge,
      undo,
      redo,
      canUndo,
      canRedo,
    }),
    [
      state,
      dispatch,
      addNode,
      updateNode,
      deleteNode,
      addEdge,
      updateEdge,
      deleteEdge,
      undo,
      redo,
      canUndo,
      canRedo,
    ]
  );

  return (
    <MindMapContext.Provider value={ctxValue}>
      <div className="flex flex-col h-full">
        {/* Header area — normal admin styling */}
        <div className="flex-shrink-0">
          <AdminHeader title="Mind Map" subtitle="Game development planning" />
          <div className="mb-4">
            <Link
              href="/admin/tools/3d-viewer"
              className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white/80 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Tools
            </Link>
          </div>
        </div>

        {/* Dark canvas area — fills remaining space */}
        <div className="flex-1 -mx-4 xl:-mx-8 -mb-8 bg-[#1a1a2e] rounded-t-2xl overflow-hidden relative">
          <ReactFlowProvider>
            <MindMapWorkspace />
          </ReactFlowProvider>
        </div>
      </div>
    </MindMapContext.Provider>
  );
}
