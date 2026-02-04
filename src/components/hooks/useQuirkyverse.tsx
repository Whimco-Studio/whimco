"use client";

import { useState, useEffect, useCallback } from "react";
import { quirkyverseApi } from "@/lib/api/quirkyverse";
import type {
  QuirkyverseCharacter,
  QuirkyverseStats,
  QuirkyverseSearchParams,
  QuirkyverseCharacterCreatePayload,
  QuirkyverseCharacterBulkImportPayload,
} from "@/types/quirkyverse";

interface UseQuirkyverseReturn {
  characters: QuirkyverseCharacter[];
  stats: QuirkyverseStats | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  searchCharacters: (query: string) => Promise<QuirkyverseCharacter[]>;
  createCharacter: (
    data: QuirkyverseCharacterCreatePayload
  ) => Promise<QuirkyverseCharacter>;
  updateCharacter: (
    id: string,
    data: Partial<QuirkyverseCharacterCreatePayload>
  ) => Promise<QuirkyverseCharacter>;
  deleteCharacter: (id: string) => Promise<void>;
  bulkImport: (
    data: QuirkyverseCharacterBulkImportPayload
  ) => Promise<{ message: string; characters: QuirkyverseCharacter[] }>;
}

export function useQuirkyverse(
  params?: QuirkyverseSearchParams
): UseQuirkyverseReturn {
  const [characters, setCharacters] = useState<QuirkyverseCharacter[]>([]);
  const [stats, setStats] = useState<QuirkyverseStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [charactersRes, statsRes] = await Promise.all([
        quirkyverseApi.list(params),
        quirkyverseApi.stats(),
      ]);

      // API returns direct array (no pagination)
      setCharacters(charactersRes);
      setStats(statsRes);
    } catch (err) {
      console.error("Failed to fetch Quirkyverse data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch character data"
      );
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const searchCharacters = useCallback(async (query: string) => {
    try {
      const result = await quirkyverseApi.search(query);
      return result.results;
    } catch (err) {
      console.error("Search failed:", err);
      return [];
    }
  }, []);

  const createCharacter = useCallback(
    async (data: QuirkyverseCharacterCreatePayload) => {
      const newCharacter = await quirkyverseApi.create(data);
      await fetchData(); // Refresh the list
      return newCharacter;
    },
    [fetchData]
  );

  const updateCharacter = useCallback(
    async (id: string, data: Partial<QuirkyverseCharacterCreatePayload>) => {
      const updatedCharacter = await quirkyverseApi.update(id, data);
      setCharacters((prev) =>
        prev.map((c) => (c.id === id ? updatedCharacter : c))
      );
      return updatedCharacter;
    },
    []
  );

  const deleteCharacter = useCallback(
    async (id: string) => {
      await quirkyverseApi.delete(id);
      setCharacters((prev) => prev.filter((c) => c.id !== id));
      await fetchData(); // Refresh stats
    },
    [fetchData]
  );

  const bulkImport = useCallback(
    async (data: QuirkyverseCharacterBulkImportPayload) => {
      const result = await quirkyverseApi.bulkImport(data);
      await fetchData(); // Refresh the list
      return result;
    },
    [fetchData]
  );

  return {
    characters,
    stats,
    isLoading,
    error,
    refresh: fetchData,
    searchCharacters,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    bulkImport,
  };
}
