import type { MindMapState, GameNodeType } from "../types";
import { NODE_TYPE_CONFIG } from "../constants";

export function exportJSON(state: MindMapState): string {
  return JSON.stringify(state, null, 2);
}

export function downloadJSON(state: MindMapState) {
  const data = exportJSON(state);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mindmap-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importJSON(json: string): MindMapState | null {
  try {
    const parsed = JSON.parse(json);
    if (parsed.nodes && parsed.edges && typeof parsed.pitch === "string") {
      return parsed as MindMapState;
    }
    return null;
  } catch {
    return null;
  }
}

export function exportScopeMarkdown(state: MindMapState): string {
  const inScope = state.nodes.filter((n) => n.data.inScope);
  const grouped: Record<string, typeof inScope> = {};

  for (const node of inScope) {
    const key = node.data.gameType;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(node);
  }

  let md = `# Scope Summary\n\n> ${state.pitch}\n\n`;
  md += `**${inScope.length} items in scope**\n\n---\n\n`;

  for (const [type, nodes] of Object.entries(grouped)) {
    const config = NODE_TYPE_CONFIG[type as GameNodeType];
    md += `## ${config?.icon ?? ""} ${config?.label ?? type}\n\n`;
    for (const n of nodes) {
      const statusIcon =
        n.data.status === "done"
          ? "[x]"
          : n.data.status === "in-progress"
          ? "[-]"
          : "[ ]";
      md += `- ${statusIcon} **${n.data.label}** _(${n.data.priority}, ${n.data.effort})_\n`;
      if (n.data.description) {
        md += `  > ${n.data.description}\n`;
      }
    }
    md += "\n";
  }

  return md;
}

export function downloadMarkdown(state: MindMapState) {
  const md = exportScopeMarkdown(state);
  const blob = new Blob([md], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `scope-summary-${new Date().toISOString().slice(0, 10)}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
