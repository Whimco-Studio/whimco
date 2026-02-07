# Mind Map Tool — Claude Code Instructions

## Context

I'm building a mind map tool for my game development company Whimco (whimco.com). This will be integrated into my internal admin dashboard and used primarily for planning game projects like Woodlands. I'm a solo indie dev.

## What This Tool Is

A spatial, node-based mind map designed specifically for game development planning. It lives inside my dashboard and helps me go from initial concept to a scoped, executable plan. It is NOT a generic mind map — it has game-dev-specific features and guardrails built in to keep me focused.

## Tech Requirements

- React component (functional, hooks-based)
- Use React Flow (`@xyflow/react`) as the node/edge foundation
- Tailwind CSS for styling
- All state managed locally (useState/useReducer) with JSON export/import for persistence
- Dark theme — clean, minimal UI. No clutter.
- Must be responsive but optimized for desktop (dual monitor setup)

## Core Features

### 1. Canvas & Nodes

- Infinite pannable/zoomable canvas
- Nodes are draggable and connectable
- Edges can connect ANY two nodes (not just parent-child) — this is a web, not a tree
- Minimap in corner for orientation
- Snap-to-grid optional toggle

### 2. Node Types (Color-Coded)

Each node has a `type` property that determines its color and icon:

| Type | Color | Description |
|------|-------|-------------|
| **Mechanic** | Blue | Core gameplay systems (combat, movement, crafting) |
| **Narrative** | Purple | Story, lore, characters, dialogue |
| **Art** | Orange | Visual assets, style guides, environments |
| **Audio** | Green | Music, SFX, ambient |
| **UI/UX** | Yellow | Menus, HUD, player feedback |
| **Tech** | Red | Engine, networking, performance, tools |
| **Meta** | Gray | Business, marketing, monetization, scope notes |

Node creation: right-click canvas → select type → enter title. Nodes should show their type as a small colored badge/tag.

### 3. Node Properties

Each node contains:
- **Title** (required, shown on node face)
- **Description** (expandable, markdown supported)
- **Status**: `idea` → `scoped` → `in-progress` → `done` (shown as a subtle indicator on the node, like a progress ring or border style)
- **Priority**: `core` / `nice-to-have` / `stretch` (affects visual weight — core nodes are slightly larger or bolder)
- **Estimated effort**: `small` / `medium` / `large` (shown as a size indicator)
- **Dependencies**: auto-tracked via edges. If node A connects to node B with a "depends-on" edge, show that relationship

### 4. Edge Types

- **relates-to** (default, dashed line) — loose association
- **depends-on** (solid arrow) — hard dependency, shows direction
- **part-of** (thick line) — sub-component relationship

Edge type selectable when creating connection or via right-click on edge.

### 5. Scope Boundary (Critical Feature)

This is the most important feature. It's a visual boundary on the canvas:

- A draggable, resizable rounded rectangle labeled "CURRENT SCOPE"
- Nodes inside the boundary are "in scope" — they are the active plan
- Nodes outside are the "parking lot" — ideas captured but not committed to
- When dragging a node INTO the scope boundary, show a confirmation prompt: "Add to active scope? This expands your plan."
- Track and display a scope health indicator somewhere on screen: number of in-scope nodes, breakdown by type, total estimated effort
- The boundary itself should be visually distinct — maybe a subtle glow or dashed border

### 6. Pitch Anchor (Always Visible)

- A pinned, non-dismissable element at the top of the screen (or as a floating panel)
- Contains the project's core pitch: one paragraph describing what the player does, why it's fun, and what makes it different
- Editable but requires confirmation to change ("Changing your pitch is a big deal. Are you sure?")
- Semi-transparent so it doesn't block the canvas but is always readable
- Purpose: prevents scope drift by keeping the vision statement in constant view

### 7. Depth Warning

- If a node has more than 3 levels of "part-of" children beneath it, show a subtle warning indicator (like a yellow border)
- Tooltip: "This branch is getting deep. Consider breaking it into its own focused map or simplifying."
- This is a guardrail, not a hard limit

### 8. Parking Lot View

- A sidebar or panel view that shows all nodes currently outside the scope boundary
- Sortable by type, date added, priority
- Quick action: "Move to scope" button on each parking lot item
- Weekly review prompt: if enabled, show a notification suggesting you review parking lot items at a set interval

### 9. Progress Dashboard

- A collapsible panel showing:
  - Overall completion (% of in-scope nodes marked "done")
  - Completion by type (are you 80% done on mechanics but 0% on audio?)
  - Scope creep tracker (how many nodes have been added to scope since project start)
  - Effort distribution (visual breakdown of small/medium/large tasks)

### 10. Export/Import

- Export entire map as JSON (for backup/versioning)
- Import from JSON
- Export a "scope summary" as markdown — a clean document listing all in-scope items organized by type, with their status and descriptions. This becomes the living design doc.

## UI Layout

```
┌─────────────────────────────────────────────────────┐
│ [Pitch Anchor - always visible]                     │
├──────────────────────────────────┬──────────────────┤
│                                  │ Sidebar (toggle) │
│                                  │                  │
│         Canvas Area              │ - Parking Lot    │
│    (React Flow mind map)         │ - Progress       │
│                                  │ - Node Inspector │
│                                  │                  │
│                                  │                  │
├──────────────────────────────────┴──────────────────┤
│ [Toolbar: node types, edge types, scope toggle,     │
│  export, zoom controls]                             │
└─────────────────────────────────────────────────────┘
```

## Interaction Patterns

- **Right-click canvas**: Create new node (type selector)
- **Right-click node**: Edit, delete, change type/status/priority, connect
- **Drag from node handle**: Create edge to another node
- **Double-click node**: Open expanded editor in sidebar
- **Ctrl+S**: Export/save state
- **Ctrl+Z/Y**: Undo/redo (keep a state history stack)

## Design Principles

- **Dark theme**: Dark gray background (#1a1a2e or similar), slightly lighter panels, colored nodes that pop
- **Minimal chrome**: No unnecessary borders, shadows only where they help depth perception
- **Information density**: Show enough at a glance but don't overwhelm — details live in the sidebar inspector
- **Game dev vocabulary**: Use terms like "mechanic," "asset," "milestone" not generic project management language

## What NOT to Build

- No real-time collaboration (solo dev tool)
- No authentication/accounts (dashboard handles that)
- No database backend yet — JSON file persistence is fine for v1
- No AI features in v1 — just the core mind map
- No mobile optimization — this is a desktop tool for working at my dual monitor setup

## File Structure Suggestion

```
src/
  components/
    MindMap/
      MindMap.tsx          — main canvas component
      nodes/
        GameNode.tsx       — custom node component
        NodeInspector.tsx  — sidebar detail editor
      edges/
        CustomEdge.tsx     — styled edge component
      panels/
        PitchAnchor.tsx    — floating pitch display
        ScopeOverlay.tsx   — scope boundary component
        ParkingLot.tsx     — parking lot sidebar
        ProgressDash.tsx   — progress dashboard panel
        Toolbar.tsx        — bottom toolbar
      hooks/
        useMapState.ts     — central state management
        useScopeTracker.ts — scope boundary logic
        useUndoRedo.ts     — undo/redo stack
      utils/
        exporters.ts       — JSON and markdown export
        types.ts           — TypeScript type definitions
```

## Priority Order for Building

Build in this order so you have something usable at each stage:

1. **Canvas + basic nodes + edges** (get React Flow working with custom game nodes)
2. **Node types with color coding** (visual differentiation)
3. **Node status system** (idea → scoped → in-progress → done)
4. **Pitch anchor** (floating pitch panel)
5. **Scope boundary** (the big feature — draggable boundary with in/out tracking)
6. **Sidebar inspector** (detail editing)
7. **Parking lot view**
8. **Progress dashboard**
9. **Export/import**
10. **Depth warnings and polish**