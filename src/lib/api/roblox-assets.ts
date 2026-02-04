/**
 * API client for Roblox Assets endpoints.
 *
 * Handles communication with the Django backend at api.whimco.com
 */

import {
  RobloxAsset,
  AssetUploadPayload,
  AssetSearchParams,
  AssetStats,
  PaginatedResponse,
  RobloxConfig,
  RobloxConfigUpdatePayload,
  RobloxGroup,
} from "@/types/roblox-assets";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.whimco.com/api/v1";

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: BodyInit;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    ...options.headers,
  };

  // Add auth token if available
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      headers["Authorization"] = `Token ${token}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.error || `API error: ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const robloxAssetsApi = {
  /**
   * List all assets with optional filtering
   */
  async list(params?: AssetSearchParams): Promise<PaginatedResponse<RobloxAsset>> {
    const searchParams = new URLSearchParams();

    if (params?.q) searchParams.set("q", params.q);
    if (params?.type) searchParams.set("type", params.type);
    if (params?.status) searchParams.set("status", params.status);
    if (params?.tag) searchParams.set("tag", params.tag);
    if (params?.page) searchParams.set("page", params.page.toString());

    const query = searchParams.toString();
    const endpoint = `/roblox-assets/${query ? `?${query}` : ""}`;

    return apiRequest<PaginatedResponse<RobloxAsset>>(endpoint);
  },

  /**
   * Get a single asset by ID
   */
  async get(id: string): Promise<RobloxAsset> {
    return apiRequest<RobloxAsset>(`/roblox-assets/${id}/`);
  },

  /**
   * Upload a new asset
   */
  async upload(payload: AssetUploadPayload): Promise<RobloxAsset> {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("asset_type", payload.asset_type);
    formData.append("original_file", payload.original_file);

    if (payload.description) {
      formData.append("description", payload.description);
    }

    if (payload.tags && payload.tags.length > 0) {
      formData.append("tags", JSON.stringify(payload.tags));
    }

    // Destination fields
    if (payload.destination_type) {
      formData.append("destination_type", payload.destination_type);
    }
    if (payload.roblox_user_id) {
      formData.append("roblox_user_id", payload.roblox_user_id);
    }
    if (payload.roblox_group_id) {
      formData.append("roblox_group_id", payload.roblox_group_id);
    }

    return apiRequest<RobloxAsset>("/roblox-assets/", {
      method: "POST",
      body: formData,
    });
  },

  /**
   * Delete an asset
   */
  async delete(id: string): Promise<void> {
    await apiRequest<void>(`/roblox-assets/${id}/`, {
      method: "DELETE",
    });
  },

  /**
   * Retry a failed upload
   */
  async retry(id: string): Promise<RobloxAsset> {
    return apiRequest<RobloxAsset>(`/roblox-assets/${id}/retry_upload/`, {
      method: "POST",
    });
  },

  /**
   * Get asset statistics
   */
  async stats(): Promise<AssetStats> {
    return apiRequest<AssetStats>("/roblox-assets/stats/");
  },

  /**
   * Advanced search for assets
   */
  async search(params: AssetSearchParams): Promise<PaginatedResponse<RobloxAsset>> {
    const searchParams = new URLSearchParams();

    if (params.q) searchParams.set("q", params.q);
    if (params.type) searchParams.set("type", params.type);
    if (params.status) searchParams.set("status", params.status);
    if (params.tags) searchParams.set("tags", params.tags);
    if (params.page) searchParams.set("page", params.page.toString());

    const query = searchParams.toString();
    return apiRequest<PaginatedResponse<RobloxAsset>>(`/roblox-assets/search/?${query}`);
  },
};

/**
 * API client for Roblox Configuration
 */
export const robloxConfigApi = {
  /**
   * Get current configuration
   */
  async get(): Promise<RobloxConfig> {
    return apiRequest<RobloxConfig>("/roblox-config/");
  },

  /**
   * Update configuration
   */
  async update(payload: RobloxConfigUpdatePayload): Promise<RobloxConfig> {
    return apiRequest<RobloxConfig>("/roblox-config/", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  /**
   * Test API key validity
   */
  async testApiKey(apiKey?: string): Promise<{ valid: boolean; message?: string; error?: string }> {
    return apiRequest("/roblox-config/test/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(apiKey ? { api_key: apiKey } : {}),
    });
  },

  /**
   * Test group access
   */
  async testGroup(groupId: string): Promise<{ accessible: boolean; id?: string; name?: string; error?: string }> {
    return apiRequest(`/roblox-config/test-group/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ group_id: groupId }),
    });
  },

  /**
   * Test user access
   */
  async testUser(userId: string): Promise<{ accessible: boolean; id?: string; name?: string; error?: string }> {
    return apiRequest(`/roblox-config/test-user/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });
  },

  /**
   * Get saved groups
   */
  async getGroups(): Promise<{ groups: RobloxGroup[]; last_fetched: string | null }> {
    return apiRequest("/roblox-config/groups/");
  },

  /**
   * Add a group
   */
  async addGroup(groupId: string, groupName?: string): Promise<{ group: RobloxGroup; groups: RobloxGroup[] }> {
    return apiRequest("/roblox-config/groups/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ group_id: groupId, group_name: groupName }),
    });
  },

  /**
   * Remove a group
   */
  async removeGroup(groupId: string): Promise<{ groups: RobloxGroup[] }> {
    return apiRequest("/roblox-config/groups/", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ group_id: groupId }),
    });
  },

  /**
   * Fetch all groups the user is a member of
   */
  async fetchUserGroups(userId?: string): Promise<{
    groups: Array<{ id: string; name: string; role: string; rank: number; memberCount: number }>;
    user_id: string;
    count: number;
  }> {
    return apiRequest("/roblox-config/fetch-groups/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userId ? { user_id: userId } : {}),
    });
  },
};

export default robloxAssetsApi;
