"use client";

import { useState, useEffect, useCallback } from "react";
import {
  RobloxAsset,
  AssetStats,
  AssetType,
  AssetStatus,
  AssetUploadPayload,
} from "@/types/roblox-assets";
import {
  mockRobloxAssets,
  mockAssetStats,
  filterMockAssets,
} from "@/lib/mock-data/roblox-assets";

// Set to true to use mock data, false to use real API
const USE_MOCK_DATA = false;

interface UseRobloxAssetsOptions {
  type?: AssetType;
  status?: AssetStatus;
  search?: string;
  tag?: string;
}

interface UseRobloxAssetsReturn {
  assets: RobloxAsset[];
  stats: AssetStats;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  uploadAsset: (payload: AssetUploadPayload) => Promise<RobloxAsset>;
  deleteAsset: (id: string) => Promise<void>;
  retryAsset: (id: string) => Promise<RobloxAsset>;
  uploading: boolean;
}

export function useRobloxAssets(
  options: UseRobloxAssetsOptions = {}
): UseRobloxAssetsReturn {
  const [assets, setAssets] = useState<RobloxAsset[]>([]);
  const [stats, setStats] = useState<AssetStats>(mockAssetStats);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const filtered = filterMockAssets({
          q: options.search,
          type: options.type,
          status: options.status,
          tag: options.tag,
        });

        setAssets(filtered);
        setStats(mockAssetStats);
      } else {
        // Real API calls would go here
        const { robloxAssetsApi } = await import("@/lib/api/roblox-assets");

        const [assetsResponse, statsResponse] = await Promise.all([
          robloxAssetsApi.list({
            q: options.search,
            type: options.type,
            status: options.status,
            tag: options.tag,
          }),
          robloxAssetsApi.stats(),
        ]);

        // API now returns direct array (no pagination)
        const assets = Array.isArray(assetsResponse)
          ? assetsResponse
          : assetsResponse.results || [];
        setAssets(assets);
        setStats(statsResponse);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load assets");
    } finally {
      setLoading(false);
    }
  }, [options.search, options.type, options.status, options.tag]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const uploadAsset = useCallback(
    async (payload: AssetUploadPayload): Promise<RobloxAsset> => {
      setUploading(true);
      setError(null);

      try {
        if (USE_MOCK_DATA) {
          // Simulate upload delay
          await new Promise((resolve) => setTimeout(resolve, 2000));

          // Create mock asset
          const isGroupUpload = payload.destination_type === "group";
          const newAsset: RobloxAsset = {
            id: `mock-${Date.now()}`,
            name: payload.name,
            description: payload.description || "",
            asset_type: payload.asset_type,
            original_file: URL.createObjectURL(payload.original_file),
            s3_url: URL.createObjectURL(payload.original_file),
            roblox_asset_id: `${Math.floor(Math.random() * 10000000000)}`,
            destination_type: payload.destination_type || "group",
            roblox_user_id: isGroupUpload ? "" : (payload.roblox_user_id || "123456789"),
            roblox_group_id: isGroupUpload ? (payload.roblox_group_id || "9876543") : "",
            destination_display: isGroupUpload ? "Whimco Studios" : "WhimcoOwner",
            status: "completed",
            error_message: "",
            tags: payload.tags || [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            uploaded_by: "user-123",
            uploaded_by_username: "MockUser",
          };

          setAssets((prev) => [newAsset, ...prev]);
          return newAsset;
        } else {
          const { robloxAssetsApi } = await import("@/lib/api/roblox-assets");
          const newAsset = await robloxAssetsApi.upload(payload);
          await fetchData(); // Refresh list
          return newAsset;
        }
      } finally {
        setUploading(false);
      }
    },
    [fetchData]
  );

  const deleteAsset = useCallback(
    async (id: string): Promise<void> => {
      setError(null);

      try {
        if (USE_MOCK_DATA) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          setAssets((prev) => prev.filter((a) => a.id !== id));
        } else {
          const { robloxAssetsApi } = await import("@/lib/api/roblox-assets");
          await robloxAssetsApi.delete(id);
          await fetchData();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete asset");
        throw err;
      }
    },
    [fetchData]
  );

  const retryAsset = useCallback(
    async (id: string): Promise<RobloxAsset> => {
      setError(null);

      try {
        if (USE_MOCK_DATA) {
          await new Promise((resolve) => setTimeout(resolve, 2000));

          // Update mock asset to completed
          setAssets((prev) =>
            prev.map((a) =>
              a.id === id
                ? {
                    ...a,
                    status: "completed" as AssetStatus,
                    roblox_asset_id: `${Math.floor(Math.random() * 10000000000)}`,
                    error_message: "",
                    updated_at: new Date().toISOString(),
                  }
                : a
            )
          );

          const asset = assets.find((a) => a.id === id);
          if (!asset) throw new Error("Asset not found");
          return { ...asset, status: "completed", roblox_asset_id: "12345678900" };
        } else {
          const { robloxAssetsApi } = await import("@/lib/api/roblox-assets");
          const updatedAsset = await robloxAssetsApi.retry(id);
          await fetchData();
          return updatedAsset;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to retry upload");
        throw err;
      }
    },
    [assets, fetchData]
  );

  return {
    assets,
    stats,
    loading,
    error,
    refetch: fetchData,
    uploadAsset,
    deleteAsset,
    retryAsset,
    uploading,
  };
}

// Individual hook for just stats
export function useAssetStats() {
  const [stats, setStats] = useState<AssetStats>(mockAssetStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setStats(mockAssetStats);
      } else {
        const { robloxAssetsApi } = await import("@/lib/api/roblox-assets");
        const data = await robloxAssetsApi.stats();
        setStats(data);
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  return { stats, loading };
}

export default useRobloxAssets;
