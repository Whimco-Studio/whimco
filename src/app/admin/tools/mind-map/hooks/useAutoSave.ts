"use client";

import { useEffect, useRef } from "react";
import type { MindMapState } from "../types";
import { STORAGE_KEY } from "../constants";

const DEBOUNCE_MS = 2000;

export function useAutoSave(state: MindMapState) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // localStorage might be full or unavailable
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [state]);
}

export function loadSavedState(): MindMapState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (parsed.nodes && parsed.edges && typeof parsed.pitch === "string") {
      return parsed as MindMapState;
    }
    return null;
  } catch {
    return null;
  }
}
