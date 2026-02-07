"use client";

import { useEffect } from "react";

interface ShortcutHandlers {
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onEscape: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmd = e.metaKey || e.ctrlKey;

      if (isCmd && e.key === "s") {
        e.preventDefault();
        handlers.onSave();
        return;
      }

      if (isCmd && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handlers.onUndo();
        return;
      }

      if (isCmd && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        handlers.onRedo();
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        // Only handle if not focused on an input
        const active = document.activeElement;
        if (
          active instanceof HTMLInputElement ||
          active instanceof HTMLTextAreaElement
        ) {
          return;
        }
        e.preventDefault();
        handlers.onDelete();
        return;
      }

      if (e.key === "Escape") {
        handlers.onEscape();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlers]);
}
