/**
 * API client for Roblox group data (members, roles, wall posts, payouts)
 */

import { RobloxRole, RobloxMember, WallPost, Payout } from "@/types/admin";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.whimco.com/api/v1";

interface ApiResponse<T> {
  results?: T[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

async function getHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      headers["Authorization"] = `Token ${token}`;
    }
  }

  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }
  return response.json();
}

// ============================================================================
// Members API
// ============================================================================

export const robloxMembersApi = {
  async list(params?: { q?: string; role?: string }): Promise<RobloxMember[]> {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.set("q", params.q);
    if (params?.role) searchParams.set("role", params.role);

    const url = `${API_BASE_URL}/roblox-members/${searchParams.toString() ? `?${searchParams}` : ""}`;
    const response = await fetch(url, { headers: await getHeaders() });
    const data = await handleResponse<ApiResponse<RobloxMember> | RobloxMember[]>(response);

    // Handle both paginated and non-paginated responses
    if (Array.isArray(data)) return data;
    return data.results || [];
  },

  async get(id: string): Promise<RobloxMember> {
    const response = await fetch(`${API_BASE_URL}/roblox-members/${id}/`, {
      headers: await getHeaders(),
    });
    return handleResponse<RobloxMember>(response);
  },

  async sync(): Promise<{ message: string; total: number }> {
    const response = await fetch(`${API_BASE_URL}/roblox-members/sync/`, {
      method: "POST",
      headers: await getHeaders(),
    });
    return handleResponse(response);
  },
};

// ============================================================================
// Roles API
// ============================================================================

export const robloxRolesApi = {
  async list(): Promise<RobloxRole[]> {
    const response = await fetch(`${API_BASE_URL}/roblox-roles/`, {
      headers: await getHeaders(),
    });
    const data = await handleResponse<ApiResponse<RobloxRole> | RobloxRole[]>(response);

    if (Array.isArray(data)) return data;
    return data.results || [];
  },

  async get(id: string): Promise<RobloxRole> {
    const response = await fetch(`${API_BASE_URL}/roblox-roles/${id}/`, {
      headers: await getHeaders(),
    });
    return handleResponse<RobloxRole>(response);
  },

  async create(role: Omit<RobloxRole, "id" | "memberCount">): Promise<RobloxRole> {
    const response = await fetch(`${API_BASE_URL}/roblox-roles/`, {
      method: "POST",
      headers: await getHeaders(),
      body: JSON.stringify(role),
    });
    return handleResponse<RobloxRole>(response);
  },

  async update(id: string, updates: Partial<RobloxRole>): Promise<RobloxRole> {
    const response = await fetch(`${API_BASE_URL}/roblox-roles/${id}/`, {
      method: "PATCH",
      headers: await getHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse<RobloxRole>(response);
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/roblox-roles/${id}/`, {
      method: "DELETE",
      headers: await getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to delete role: ${response.status}`);
    }
  },

  async sync(): Promise<{ message: string; total: number }> {
    const response = await fetch(`${API_BASE_URL}/roblox-roles/sync/`, {
      method: "POST",
      headers: await getHeaders(),
    });
    return handleResponse(response);
  },
};

// ============================================================================
// Wall Posts API
// ============================================================================

export const robloxWallPostsApi = {
  async list(params?: { pinned?: boolean; hidden?: boolean }): Promise<WallPost[]> {
    const searchParams = new URLSearchParams();
    if (params?.pinned !== undefined) searchParams.set("pinned", String(params.pinned));
    if (params?.hidden !== undefined) searchParams.set("hidden", String(params.hidden));

    const url = `${API_BASE_URL}/roblox-wall-posts/${searchParams.toString() ? `?${searchParams}` : ""}`;
    const response = await fetch(url, { headers: await getHeaders() });
    const data = await handleResponse<ApiResponse<WallPost> | WallPost[]>(response);

    if (Array.isArray(data)) return data;
    return data.results || [];
  },

  async pin(id: string): Promise<WallPost> {
    const response = await fetch(`${API_BASE_URL}/roblox-wall-posts/${id}/pin/`, {
      method: "POST",
      headers: await getHeaders(),
    });
    return handleResponse<WallPost>(response);
  },

  async hide(id: string): Promise<WallPost> {
    const response = await fetch(`${API_BASE_URL}/roblox-wall-posts/${id}/hide/`, {
      method: "POST",
      headers: await getHeaders(),
    });
    return handleResponse<WallPost>(response);
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/roblox-wall-posts/${id}/`, {
      method: "DELETE",
      headers: await getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to delete post: ${response.status}`);
    }
  },

  async sync(): Promise<{ message: string; total: number }> {
    const response = await fetch(`${API_BASE_URL}/roblox-wall-posts/sync/`, {
      method: "POST",
      headers: await getHeaders(),
    });
    return handleResponse(response);
  },
};

// ============================================================================
// Payouts API
// ============================================================================

export interface PayoutCreatePayload {
  recipient_id: string;
  recipient_username: string;
  recipient_display_name: string;
  recipient_avatar_url?: string;
  amount: number;
  percentage?: number;
  status?: "pending" | "completed" | "failed";
  note?: string;
  payout_date?: string;
}

export interface PayoutStats {
  totalPaidThisMonth: number;
  pendingAmount: number;
  pendingCount: number;
  totalTransactions: number;
}

export const robloxPayoutsApi = {
  async list(params?: { status?: string; recipient?: string }): Promise<Payout[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.recipient) searchParams.set("recipient", params.recipient);

    const url = `${API_BASE_URL}/roblox-payouts/${searchParams.toString() ? `?${searchParams}` : ""}`;
    const response = await fetch(url, { headers: await getHeaders() });
    const data = await handleResponse<ApiResponse<Payout> | Payout[]>(response);

    if (Array.isArray(data)) return data;
    return data.results || [];
  },

  async get(id: string): Promise<Payout> {
    const response = await fetch(`${API_BASE_URL}/roblox-payouts/${id}/`, {
      headers: await getHeaders(),
    });
    return handleResponse<Payout>(response);
  },

  async create(payload: PayoutCreatePayload): Promise<Payout> {
    const response = await fetch(`${API_BASE_URL}/roblox-payouts/`, {
      method: "POST",
      headers: await getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<Payout>(response);
  },

  async update(id: string, updates: Partial<Payout>): Promise<Payout> {
    const response = await fetch(`${API_BASE_URL}/roblox-payouts/${id}/`, {
      method: "PATCH",
      headers: await getHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse<Payout>(response);
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/roblox-payouts/${id}/`, {
      method: "DELETE",
      headers: await getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to delete payout: ${response.status}`);
    }
  },

  async stats(): Promise<PayoutStats> {
    const response = await fetch(`${API_BASE_URL}/roblox-payouts/stats/`, {
      headers: await getHeaders(),
    });
    return handleResponse<PayoutStats>(response);
  },
};

// ============================================================================
// Summary API (for dashboard)
// ============================================================================

export interface RobloxSummary {
  totalMembers: number;
  activeMembers: number;
  totalRoles: number;
  wallPosts: number;
  totalPaidThisMonth: number;
  pendingPayouts: number;
}

export const robloxSummaryApi = {
  async get(): Promise<RobloxSummary> {
    const response = await fetch(`${API_BASE_URL}/roblox-summary/`, {
      headers: await getHeaders(),
    });
    return handleResponse<RobloxSummary>(response);
  },
};
