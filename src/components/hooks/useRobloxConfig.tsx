"use client";

import { useState, useEffect, useCallback } from "react";
import {
  RobloxConfig,
  RobloxConfigUpdatePayload,
  RobloxGroup,
} from "@/types/roblox-assets";
import { mockRobloxConfig, mockRobloxGroups } from "@/lib/mock-data/roblox-assets";

// Set to true to use mock data, false to use real API
const USE_MOCK_DATA = false;

interface FetchedGroup {
  id: string;
  name: string;
  role: string;
  rank: number;
  memberCount: number;
}

interface UseRobloxConfigReturn {
  config: RobloxConfig | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
  refetch: () => void;
  updateConfig: (payload: RobloxConfigUpdatePayload) => Promise<void>;
  testApiKey: (apiKey?: string) => Promise<{ valid: boolean; message?: string; error?: string }>;
  testGroup: (groupId: string) => Promise<{ accessible: boolean; name?: string; error?: string }>;
  testUser: (userId: string) => Promise<{ accessible: boolean; name?: string; error?: string }>;
  addGroup: (groupId: string, groupName?: string) => Promise<void>;
  removeGroup: (groupId: string) => Promise<void>;
  fetchMyGroups: () => Promise<FetchedGroup[]>;
}

export function useRobloxConfig(): UseRobloxConfigReturn {
  const [config, setConfig] = useState<RobloxConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setConfig(mockRobloxConfig);
      } else {
        const { robloxConfigApi } = await import("@/lib/api/roblox-assets");
        const data = await robloxConfigApi.get();
        setConfig(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load configuration");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const updateConfig = useCallback(async (payload: RobloxConfigUpdatePayload) => {
    setSaving(true);
    setError(null);

    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setConfig((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            ...payload,
            api_key_preview: payload.api_key
              ? `${payload.api_key.slice(0, 4)}${"*".repeat(28)}${payload.api_key.slice(-4)}`
              : prev.api_key_preview,
            is_configured: payload.api_key ? true : prev.is_configured,
            updated_at: new Date().toISOString(),
          };
        });
      } else {
        const { robloxConfigApi } = await import("@/lib/api/roblox-assets");
        const updated = await robloxConfigApi.update(payload);
        setConfig(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update configuration");
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const testApiKey = useCallback(async (apiKey?: string) => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Simulate validation
      if (apiKey && apiKey.length < 10) {
        return { valid: false, error: "Invalid API key format" };
      }
      return { valid: true, message: "API key is valid" };
    } else {
      const { robloxConfigApi } = await import("@/lib/api/roblox-assets");
      return robloxConfigApi.testApiKey(apiKey);
    }
  }, []);

  const testGroup = useCallback(async (groupId: string) => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const mockGroup = mockRobloxGroups.find((g) => g.id === groupId);
      if (mockGroup) {
        return { accessible: true, name: mockGroup.name };
      }
      return { accessible: true, name: `Group ${groupId}` };
    } else {
      const { robloxConfigApi } = await import("@/lib/api/roblox-assets");
      return robloxConfigApi.testGroup(groupId);
    }
  }, []);

  const testUser = useCallback(async (userId: string) => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return { accessible: true, name: `User ${userId}` };
    } else {
      const { robloxConfigApi } = await import("@/lib/api/roblox-assets");
      return robloxConfigApi.testUser(userId);
    }
  }, []);

  const addGroup = useCallback(async (groupId: string, groupName?: string) => {
    setSaving(true);
    setError(null);

    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const newGroup: RobloxGroup = {
          id: groupId,
          name: groupName || `Group ${groupId}`,
          accessible: true,
        };
        setConfig((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            groups: [...prev.groups, newGroup],
            groups_last_fetched: new Date().toISOString(),
          };
        });
      } else {
        const { robloxConfigApi } = await import("@/lib/api/roblox-assets");
        const result = await robloxConfigApi.addGroup(groupId, groupName);
        setConfig((prev) => {
          if (!prev) return prev;
          return { ...prev, groups: result.groups };
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add group");
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const removeGroup = useCallback(async (groupId: string) => {
    setSaving(true);
    setError(null);

    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setConfig((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            groups: prev.groups.filter((g) => g.id !== groupId),
          };
        });
      } else {
        const { robloxConfigApi } = await import("@/lib/api/roblox-assets");
        const result = await robloxConfigApi.removeGroup(groupId);
        setConfig((prev) => {
          if (!prev) return prev;
          return { ...prev, groups: result.groups };
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove group");
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const fetchMyGroups = useCallback(async (): Promise<FetchedGroup[]> => {
    setError(null);

    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        return mockRobloxGroups.map((g) => ({
          id: g.id,
          name: g.name,
          role: "Owner",
          rank: 255,
          memberCount: 100,
        }));
      } else {
        const { robloxConfigApi } = await import("@/lib/api/roblox-assets");
        const result = await robloxConfigApi.fetchUserGroups();
        return result.groups;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch groups");
      throw err;
    }
  }, []);

  return {
    config,
    loading,
    error,
    saving,
    refetch: fetchConfig,
    updateConfig,
    testApiKey,
    testGroup,
    testUser,
    addGroup,
    removeGroup,
    fetchMyGroups,
  };
}

export default useRobloxConfig;
