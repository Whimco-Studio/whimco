"use client";

import {
  BaseEdge,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";
import type { GameEdge } from "../../types";
import { GameEdgeType } from "../../types";

export default function GameEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<GameEdge>) {
  const edgeType = data?.edgeType ?? GameEdgeType.RelatesTo;

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  let strokeWidth = 1.5;
  let strokeDasharray: string | undefined;
  let stroke = "rgba(255,255,255,0.3)";

  switch (edgeType) {
    case GameEdgeType.RelatesTo:
      strokeDasharray = "6 4";
      stroke = "rgba(255,255,255,0.25)";
      break;
    case GameEdgeType.DependsOn:
      strokeWidth = 2;
      stroke = "rgba(255,255,255,0.4)";
      break;
    case GameEdgeType.PartOf:
      strokeWidth = 3;
      stroke = "rgba(255,255,255,0.35)";
      break;
  }

  if (selected) {
    stroke = "rgba(255,255,255,0.7)";
  }

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        strokeWidth,
        stroke,
        strokeDasharray,
      }}
      markerEnd={
        edgeType === GameEdgeType.DependsOn
          ? `url(#arrow-marker)`
          : undefined
      }
    />
  );
}
