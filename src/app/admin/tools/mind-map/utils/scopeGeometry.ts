import type { ScopeBounds } from "../types";

export function isPointInBounds(
  x: number,
  y: number,
  bounds: ScopeBounds
): boolean {
  return (
    x >= bounds.x &&
    x <= bounds.x + bounds.width &&
    y >= bounds.y &&
    y <= bounds.y + bounds.height
  );
}

export function isNodeInScope(
  nodeX: number,
  nodeY: number,
  nodeWidth: number,
  nodeHeight: number,
  bounds: ScopeBounds
): boolean {
  // Node center point
  const cx = nodeX + nodeWidth / 2;
  const cy = nodeY + nodeHeight / 2;
  return isPointInBounds(cx, cy, bounds);
}
