"use client";

import { useEffect } from "react";
import { useMindMap } from "./useMindMapState";
import { isPointInBounds } from "../utils/scopeGeometry";
import { GameEdgeType } from "../types";

/**
 * Tracks which nodes are inside the scope boundary (updates inScope flag)
 * and computes depth warnings for nodes with >3 levels of part-of children.
 */
export function useScopeTracker() {
  const { state, updateNode } = useMindMap();

  useEffect(() => {
    // ── Scope tracking ──────────────────────────────────────
    if (state.scopeBounds) {
      const bounds = state.scopeBounds;
      for (const node of state.nodes) {
        const inScope = isPointInBounds(
          node.position.x + 80,
          node.position.y + 30,
          bounds
        );
        if (inScope !== node.data.inScope) {
          updateNode(node.id, { inScope });
        }
      }
    }

    // ── Depth warning computation ───────────────────────────
    // Build adjacency from "part-of" edges: child → parent
    const partOfEdges = state.edges.filter(
      (e) => e.data?.edgeType === GameEdgeType.PartOf
    );
    // For part-of: source is child, target is parent
    const childrenOf: Record<string, string[]> = {};
    for (const edge of partOfEdges) {
      if (!childrenOf[edge.target]) childrenOf[edge.target] = [];
      childrenOf[edge.target].push(edge.source);
    }

    // BFS to compute max depth below each node
    function getMaxDepth(nodeId: string, visited: Set<string>): number {
      if (visited.has(nodeId)) return 0;
      visited.add(nodeId);
      const children = childrenOf[nodeId] ?? [];
      if (children.length === 0) return 0;
      let max = 0;
      for (const child of children) {
        max = Math.max(max, 1 + getMaxDepth(child, visited));
      }
      return max;
    }

    for (const node of state.nodes) {
      const depth = getMaxDepth(node.id, new Set());
      const shouldWarn = depth > 3;
      if (shouldWarn !== !!node.data.depthWarning) {
        updateNode(node.id, { depthWarning: shouldWarn });
      }
    }
  }, [state.nodes, state.edges, state.scopeBounds]);
}
