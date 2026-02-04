/**
 * API client for Quirkyverse character management.
 */

import { authApi } from "./auth";
import type {
  QuirkyverseCharacter,
  QuirkyverseCharacterCreatePayload,
  QuirkyverseCharacterBulkImportPayload,
  QuirkyverseStats,
  QuirkyverseSearchParams,
  QuirkyverseAnimations,
  QuirkyverseIcons,
} from "@/types/quirkyverse";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.whimco.com/api/v1";

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface BulkImportResponse {
  message: string;
  characters: QuirkyverseCharacter[];
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = authApi.getToken();
  const headers: HeadersInit = {
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Token ${token}`;
  }

  // Only set Content-Type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: `Request failed with status ${response.status}`,
    }));
    throw error;
  }

  return response.json();
}

export const quirkyverseApi = {
  /**
   * List all characters with optional filters.
   */
  async list(
    params?: QuirkyverseSearchParams
  ): Promise<PaginatedResponse<QuirkyverseCharacter>> {
    const searchParams = new URLSearchParams();
    if (params?.isPublished !== undefined) {
      searchParams.set("isPublished", String(params.isPublished));
    }
    if (params?.isFeatured !== undefined) {
      searchParams.set("isFeatured", String(params.isFeatured));
    }
    if (params?.rarity) {
      searchParams.set("rarity", params.rarity);
    }
    if (params?.speciesType) {
      searchParams.set("speciesType", params.speciesType);
    }

    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/quirkyverse-characters/${queryString ? `?${queryString}` : ""}`;
    return fetchWithAuth(url);
  },

  /**
   * Get a single character by ID.
   */
  async get(id: string): Promise<QuirkyverseCharacter> {
    return fetchWithAuth(`${API_BASE_URL}/quirkyverse-characters/${id}/`);
  },

  /**
   * Create a new character.
   */
  async create(
    data: QuirkyverseCharacterCreatePayload
  ): Promise<QuirkyverseCharacter> {
    return fetchWithAuth(`${API_BASE_URL}/quirkyverse-characters/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing character.
   */
  async update(
    id: string,
    data: Partial<QuirkyverseCharacterCreatePayload>
  ): Promise<QuirkyverseCharacter> {
    return fetchWithAuth(`${API_BASE_URL}/quirkyverse-characters/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a character.
   */
  async delete(id: string): Promise<void> {
    const token = authApi.getToken();
    const response = await fetch(
      `${API_BASE_URL}/quirkyverse-characters/${id}/`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: `Delete failed with status ${response.status}`,
      }));
      throw error;
    }
  },

  /**
   * Get character statistics.
   */
  async stats(): Promise<QuirkyverseStats> {
    return fetchWithAuth(`${API_BASE_URL}/quirkyverse-characters/stats/`);
  },

  /**
   * Search characters by name or description.
   */
  async search(query: string): Promise<{ results: QuirkyverseCharacter[] }> {
    return fetchWithAuth(
      `${API_BASE_URL}/quirkyverse-characters/search/?q=${encodeURIComponent(query)}`
    );
  },

  /**
   * Bulk import characters.
   */
  async bulkImport(
    data: QuirkyverseCharacterBulkImportPayload
  ): Promise<BulkImportResponse> {
    return fetchWithAuth(`${API_BASE_URL}/quirkyverse-characters/bulk_import/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update animations for a character.
   */
  async updateAnimations(
    id: string,
    animations: QuirkyverseAnimations
  ): Promise<QuirkyverseCharacter> {
    return fetchWithAuth(
      `${API_BASE_URL}/quirkyverse-characters/${id}/update_animations/`,
      {
        method: "POST",
        body: JSON.stringify({ animations }),
      }
    );
  },

  /**
   * Update icons for a character.
   */
  async updateIcons(
    id: string,
    icons: QuirkyverseIcons
  ): Promise<QuirkyverseCharacter> {
    return fetchWithAuth(
      `${API_BASE_URL}/quirkyverse-characters/${id}/update_icons/`,
      {
        method: "POST",
        body: JSON.stringify({ icons }),
      }
    );
  },
};
