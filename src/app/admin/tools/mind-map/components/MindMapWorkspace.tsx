"use client";

import { useCallback, useState, useMemo, type MouseEvent } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  type Connection,
  type OnNodesChange,
  type OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import GameNodeComponent from "./nodes/GameNode";
import GameEdgeComponent from "./edges/GameEdge";
import CanvasContextMenu from "./overlays/CanvasContextMenu";
import NodeContextMenu from "./nodes/NodeContextMenu";
import EdgeContextMenu from "./edges/EdgeContextMenu";
import PitchAnchor from "./panels/PitchAnchor";
import Sidebar, { type SidebarTab } from "./panels/Sidebar";
import NodeInspector from "./panels/NodeInspector";
import ScopeBoundary from "./overlays/ScopeBoundary";
import ParkingLot from "./panels/ParkingLot";
import ProgressDashboard from "./panels/ProgressDashboard";
import Toolbar from "./panels/Toolbar";
import { useMindMap } from "../hooks/useMindMapState";
import { useScopeTracker } from "../hooks/useScopeTracker";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import {
  type GameNode,
  type GameEdge,
  type GameNodeData,
  type GameEdgeData,
  GameNodeType,
  GameEdgeType,
  NodeStatus,
  Priority,
  Effort,
} from "../types";
import { NODE_TYPE_CONFIG } from "../constants";

const nodeTypes = { gameNode: GameNodeComponent };
const edgeTypes = { gameEdge: GameEdgeComponent };

export default function MindMapWorkspace() {
  const { state, dispatch, addNode, updateNode, deleteNode, addEdge, updateEdge, deleteEdge, undo, redo } =
    useMindMap();
  const { screenToFlowPosition } = useReactFlow();

  // Track scope membership
  useScopeTracker();

  // ── Context menu states ───────────────────────────────────
  const [canvasMenu, setCanvasMenu] = useState<{
    screenX: number;
    screenY: number;
    flowX: number;
    flowY: number;
  } | null>(null);

  const [nodeMenu, setNodeMenu] = useState<{
    x: number;
    y: number;
    nodeId: string;
  } | null>(null);

  const [edgeMenu, setEdgeMenu] = useState<{
    x: number;
    y: number;
    edgeId: string;
  } | null>(null);

  // ── Sidebar state ──────────────────────────────────────────
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("inspector");

  // ── Node/Edge change handlers ─────────────────────────────
  const onNodesChange: OnNodesChange<GameNode> = useCallback(
    (changes) => {
      dispatch({
        type: "SET_NODES",
        payload: applyNodeChanges(changes, state.nodes) as GameNode[],
      });
    },
    [dispatch, state.nodes]
  );

  const onEdgesChange: OnEdgesChange<GameEdge> = useCallback(
    (changes) => {
      dispatch({
        type: "SET_EDGES",
        payload: applyEdgeChanges(changes, state.edges) as GameEdge[],
      });
    },
    [dispatch, state.edges]
  );

  // ── Connect handler ───────────────────────────────────────
  const onConnect = useCallback(
    (connection: Connection) => {
      const edge: GameEdge = {
        id: `e-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        type: "gameEdge",
        data: { edgeType: state.defaultEdgeType },
      };
      addEdge(edge);
    },
    [addEdge, state.defaultEdgeType]
  );

  // ── Canvas context menu ───────────────────────────────────
  const onPaneContextMenu = useCallback(
    (event: MouseEvent | globalThis.MouseEvent) => {
      event.preventDefault();
      setNodeMenu(null);
      setEdgeMenu(null);
      const flowPosition = screenToFlowPosition({
        x: (event as globalThis.MouseEvent).clientX,
        y: (event as globalThis.MouseEvent).clientY,
      });
      setCanvasMenu({
        screenX: (event as globalThis.MouseEvent).clientX,
        screenY: (event as globalThis.MouseEvent).clientY,
        flowX: flowPosition.x,
        flowY: flowPosition.y,
      });
    },
    [screenToFlowPosition]
  );

  // ── Node context menu ─────────────────────────────────────
  const onNodeContextMenu = useCallback(
    (event: MouseEvent | globalThis.MouseEvent, node: GameNode) => {
      event.preventDefault();
      setCanvasMenu(null);
      setEdgeMenu(null);
      setNodeMenu({
        x: (event as globalThis.MouseEvent).clientX,
        y: (event as globalThis.MouseEvent).clientY,
        nodeId: node.id,
      });
    },
    []
  );

  // ── Edge context menu ─────────────────────────────────────
  const onEdgeContextMenu = useCallback(
    (event: MouseEvent | globalThis.MouseEvent, edge: GameEdge) => {
      event.preventDefault();
      setCanvasMenu(null);
      setNodeMenu(null);
      setEdgeMenu({
        x: (event as globalThis.MouseEvent).clientX,
        y: (event as globalThis.MouseEvent).clientY,
        edgeId: edge.id,
      });
    },
    []
  );

  // ── Node double-click → open inspector ─────────────────────
  const onNodeDoubleClick = useCallback(
    (_event: MouseEvent | globalThis.MouseEvent, node: GameNode) => {
      setSelectedNodeId(node.id);
      setSidebarOpen(true);
      setSidebarTab("inspector");
    },
    []
  );

  // ── Create node from canvas menu ──────────────────────────
  const handleCreateNode = useCallback(
    (type: GameNodeType, title: string) => {
      if (!canvasMenu) return;
      const node: GameNode = {
        id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: "gameNode",
        position: { x: canvasMenu.flowX, y: canvasMenu.flowY },
        data: {
          label: title,
          description: "",
          gameType: type,
          status: NodeStatus.Idea,
          priority: Priority.NiceToHave,
          effort: Effort.Medium,
          createdAt: new Date().toISOString(),
          inScope: false,
        },
      };
      addNode(node);
    },
    [addNode, canvasMenu]
  );

  // Close all menus on pane click
  const onPaneClick = useCallback(() => {
    setCanvasMenu(null);
    setNodeMenu(null);
    setEdgeMenu(null);
  }, []);

  // ── Lookup helpers for context menus ──────────────────────
  const menuNode = nodeMenu
    ? state.nodes.find((n) => n.id === nodeMenu.nodeId)
    : null;

  const menuEdge = edgeMenu
    ? state.edges.find((e) => e.id === edgeMenu.edgeId)
    : null;

  // ── Custom SVG defs for arrow markers ─────────────────────
  const svgDefs = useMemo(
    () => (
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <marker
            id="arrow-marker"
            viewBox="0 0 20 20"
            markerWidth="8"
            markerHeight="8"
            refX="16"
            refY="10"
            orient="auto-start-reverse"
          >
            <path
              d="M 0 0 L 20 10 L 0 20 z"
              fill="rgba(255,255,255,0.4)"
            />
          </marker>
        </defs>
      </svg>
    ),
    []
  );

  // ── Export/Import handlers (stubs for Phase 7) ─────────────
  const handleExportJSON = useCallback(() => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mindmap-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  const handleImportJSON = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const loaded = JSON.parse(ev.target?.result as string);
          dispatch({ type: "LOAD_STATE", payload: loaded });
        } catch {
          alert("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [dispatch]);

  const handleExportMarkdown = useCallback(() => {
    const inScope = state.nodes.filter((n) => n.data.inScope);
    const grouped: Record<string, typeof inScope> = {};
    for (const node of inScope) {
      const key = node.data.gameType;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(node);
    }

    let md = `# Scope Summary\n\n> ${state.pitch}\n\n`;
    for (const [type, nodes] of Object.entries(grouped)) {
      const config = NODE_TYPE_CONFIG[type as GameNodeType];
      md += `## ${config?.icon ?? ""} ${config?.label ?? type}\n\n`;
      for (const n of nodes) {
        md += `- **${n.data.label}** [${n.data.status}] (${n.data.effort})\n`;
        if (n.data.description) md += `  ${n.data.description}\n`;
      }
      md += "\n";
    }

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scope-summary-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  // ── Keyboard shortcuts ────────────────────────────────────
  useKeyboardShortcuts(
    useMemo(
      () => ({
        onSave: () => handleExportJSON(),
        onUndo: () => undo(),
        onRedo: () => redo(),
        onDelete: () => {
          const selected = state.nodes.filter((n) => n.selected);
          for (const node of selected) {
            deleteNode(node.id);
          }
          const selectedEdges = state.edges.filter((e) => e.selected);
          for (const edge of selectedEdges) {
            deleteEdge(edge.id);
          }
        },
        onEscape: () => {
          setCanvasMenu(null);
          setNodeMenu(null);
          setEdgeMenu(null);
          setSidebarOpen(false);
        },
      }),
      [handleExportJSON, state.nodes, state.edges, deleteNode, deleteEdge, undo, redo]
    )
  );

  // Sidebar content based on active tab
  const sidebarContent = (() => {
    switch (sidebarTab) {
      case "inspector":
        return selectedNodeId ? (
          <NodeInspector nodeId={selectedNodeId} />
        ) : (
          <div className="p-4 text-white/40 text-sm text-center">
            Double-click a node to inspect it
          </div>
        );
      case "parking":
        return <ParkingLot />;
      case "progress":
        return <ProgressDashboard />;
    }
  })();

  // Welcome state overlay
  const showWelcome = state.nodes.length === 0;

  return (
    <div className="w-full h-full relative">
      {svgDefs}
      <PitchAnchor />
      <ScopeBoundary />

      {showWelcome && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="text-center pointer-events-auto">
            <div className="text-4xl mb-3 opacity-30">🗺️</div>
            <h2 className="text-lg font-semibold text-white/40 mb-1">
              Start Your Mind Map
            </h2>
            <p className="text-sm text-white/25 max-w-xs">
              Right-click the canvas to create your first node, or use the toolbar below to quick-add.
            </p>
          </div>
        </div>
      )}

      <ReactFlow
        nodes={state.nodes}
        edges={state.edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneContextMenu={onPaneContextMenu}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        onNodeDoubleClick={onNodeDoubleClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        snapToGrid={state.snapToGrid}
        snapGrid={[20, 20]}
        colorMode="dark"
        fitView
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: "gameEdge" }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(255,255,255,0.05)"
        />
        <Controls
          position="bottom-left"
          className="!bg-[#252547] !border-white/10 !rounded-lg !shadow-lg [&>button]:!bg-transparent [&>button]:!border-white/10 [&>button]:!text-white/60 [&>button:hover]:!bg-white/10"
        />
        <MiniMap
          position="bottom-right"
          pannable
          zoomable
          className="!bg-[#151530] !border-white/10 !rounded-lg"
          nodeColor={(node) => {
            const data = node.data as GameNode["data"];
            return NODE_TYPE_CONFIG[data.gameType]?.color ?? "#6b7280";
          }}
          maskColor="rgba(0,0,0,0.6)"
        />
      </ReactFlow>

      {/* Canvas context menu */}
      {canvasMenu && (
        <CanvasContextMenu
          x={canvasMenu.screenX}
          y={canvasMenu.screenY}
          onCreateNode={handleCreateNode}
          onClose={() => setCanvasMenu(null)}
        />
      )}

      {/* Node context menu */}
      {nodeMenu && menuNode && (
        <NodeContextMenu
          x={nodeMenu.x}
          y={nodeMenu.y}
          nodeId={nodeMenu.nodeId}
          currentType={menuNode.data.gameType}
          currentStatus={menuNode.data.status}
          currentPriority={menuNode.data.priority}
          currentEffort={menuNode.data.effort}
          onUpdateType={(type) =>
            updateNode(nodeMenu.nodeId, { gameType: type })
          }
          onUpdateStatus={(status) =>
            updateNode(nodeMenu.nodeId, { status })
          }
          onUpdatePriority={(priority) =>
            updateNode(nodeMenu.nodeId, { priority })
          }
          onUpdateEffort={(effort) =>
            updateNode(nodeMenu.nodeId, { effort })
          }
          onDelete={() => deleteNode(nodeMenu.nodeId)}
          onClose={() => setNodeMenu(null)}
        />
      )}

      {/* Edge context menu */}
      {edgeMenu && menuEdge && (
        <EdgeContextMenu
          x={edgeMenu.x}
          y={edgeMenu.y}
          edgeId={edgeMenu.edgeId}
          currentType={menuEdge.data?.edgeType ?? GameEdgeType.RelatesTo}
          onUpdateType={(type) =>
            updateEdge(edgeMenu.edgeId, { edgeType: type })
          }
          onDelete={() => deleteEdge(edgeMenu.edgeId)}
          onClose={() => setEdgeMenu(null)}
        />
      )}

      {/* Bottom toolbar */}
      <Toolbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onExportMarkdown={handleExportMarkdown}
      />

      {/* Right sidebar */}
      <Sidebar
        open={sidebarOpen}
        activeTab={sidebarTab}
        onTabChange={setSidebarTab}
        onClose={() => setSidebarOpen(false)}
      >
        {sidebarContent}
      </Sidebar>
    </div>
  );
}
