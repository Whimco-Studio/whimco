"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { useReactFlow, useViewport } from "@xyflow/react";
import { useMindMap } from "../../hooks/useMindMapState";
import type { ScopeBounds } from "../../types";

const MIN_SIZE = 200;

export default function ScopeBoundary() {
  const { state, dispatch } = useMindMap();
  const bounds = state.scopeBounds;
  const viewport = useViewport();
  const { screenToFlowPosition, flowToScreenPosition } = useReactFlow();

  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState<string | null>(null);
  const dragStart = useRef({ mx: 0, my: 0, bx: 0, by: 0, bw: 0, bh: 0 });

  const handleCreateScope = useCallback(() => {
    dispatch({
      type: "SET_SCOPE_BOUNDS",
      payload: { x: -300, y: -200, width: 600, height: 400 },
    });
  }, [dispatch]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, mode: "drag" | string) => {
      e.stopPropagation();
      e.preventDefault();
      if (!bounds) return;

      dragStart.current = {
        mx: e.clientX,
        my: e.clientY,
        bx: bounds.x,
        by: bounds.y,
        bw: bounds.width,
        bh: bounds.height,
      };

      if (mode === "drag") {
        setDragging(true);
      } else {
        setResizing(mode);
      }
    },
    [bounds]
  );

  useEffect(() => {
    if (!dragging && !resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Convert screen delta to flow delta (account for zoom)
      const scale = viewport.zoom;
      const dx = (e.clientX - dragStart.current.mx) / scale;
      const dy = (e.clientY - dragStart.current.my) / scale;
      const { bx, by, bw, bh } = dragStart.current;

      if (dragging) {
        dispatch({
          type: "SET_SCOPE_BOUNDS",
          payload: { x: bx + dx, y: by + dy, width: bw, height: bh },
        });
        return;
      }

      if (resizing) {
        let newBounds: ScopeBounds = { x: bx, y: by, width: bw, height: bh };

        if (resizing.includes("e")) {
          newBounds.width = Math.max(MIN_SIZE, bw + dx);
        }
        if (resizing.includes("w")) {
          const newW = Math.max(MIN_SIZE, bw - dx);
          newBounds.x = bx + (bw - newW);
          newBounds.width = newW;
        }
        if (resizing.includes("s")) {
          newBounds.height = Math.max(MIN_SIZE, bh + dy);
        }
        if (resizing.includes("n")) {
          const newH = Math.max(MIN_SIZE, bh - dy);
          newBounds.y = by + (bh - newH);
          newBounds.height = newH;
        }

        dispatch({ type: "SET_SCOPE_BOUNDS", payload: newBounds });
      }
    };

    const handleMouseUp = () => {
      setDragging(false);
      setResizing(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, resizing, dispatch, viewport.zoom]);

  if (!state.scopeVisible) return null;

  if (!bounds) {
    return null;
  }

  // Convert flow-space bounds to screen-space
  const topLeft = flowToScreenPosition({ x: bounds.x, y: bounds.y });
  const bottomRight = flowToScreenPosition({
    x: bounds.x + bounds.width,
    y: bounds.y + bounds.height,
  });
  const screenW = bottomRight.x - topLeft.x;
  const screenH = bottomRight.y - topLeft.y;

  const inScopeCount = state.nodes.filter((n) => n.data.inScope).length;
  const totalNodes = state.nodes.length;

  const handles = ["n", "ne", "e", "se", "s", "sw", "w", "nw"];
  const handlePositions: Record<string, React.CSSProperties> = {
    n: { top: -4, left: "50%", transform: "translateX(-50%)", cursor: "ns-resize" },
    ne: { top: -4, right: -4, cursor: "nesw-resize" },
    e: { top: "50%", right: -4, transform: "translateY(-50%)", cursor: "ew-resize" },
    se: { bottom: -4, right: -4, cursor: "nwse-resize" },
    s: { bottom: -4, left: "50%", transform: "translateX(-50%)", cursor: "ns-resize" },
    sw: { bottom: -4, left: -4, cursor: "nesw-resize" },
    w: { top: "50%", left: -4, transform: "translateY(-50%)", cursor: "ew-resize" },
    nw: { top: -4, left: -4, cursor: "nwse-resize" },
  };

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: topLeft.x,
        top: topLeft.y,
        width: screenW,
        height: screenH,
        zIndex: 1,
      }}
    >
      {/* Border area — captures mouse for drag */}
      <div
        className="w-full h-full border-2 border-dashed border-emerald-500/30 rounded-xl pointer-events-auto cursor-move"
        style={{ background: "rgba(16, 185, 129, 0.02)" }}
        onMouseDown={(e) => handleMouseDown(e, "drag")}
      />

      {/* Label */}
      <div className="absolute -top-5 left-3 flex items-center gap-2 pointer-events-none">
        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/60">
          Current Scope
        </span>
        <span className="text-[10px] text-emerald-400/40">
          {inScopeCount}/{totalNodes}
        </span>
      </div>

      {/* Resize handles */}
      {handles.map((h) => (
        <div
          key={h}
          className="absolute w-3 h-3 bg-emerald-500/30 rounded-full hover:bg-emerald-500/60 transition-colors pointer-events-auto"
          style={handlePositions[h]}
          onMouseDown={(e) => handleMouseDown(e, h)}
        />
      ))}
    </div>
  );
}
