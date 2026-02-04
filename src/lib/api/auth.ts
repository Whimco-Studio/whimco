/**
 * Authentication API client
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.whimco.com";

export interface LoginResponse {
  token: string;
}

export interface LoginError {
  non_field_errors?: string[];
  username?: string[];
  password?: string[];
  detail?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
}

export const authApi = {
  /**
   * Login with username and password
   * Returns auth token on success
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api-token-auth/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error: LoginError = await response.json().catch(() => ({
        detail: "Login failed. Please check your credentials.",
      }));
      throw error;
    }

    return response.json();
  },

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      throw new Error("No auth token");
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/users/me/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get user info");
    }

    return response.json();
  },

  /**
   * Store auth token
   */
  setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
    }
  },

  /**
   * Get stored auth token
   */
  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token");
    }
    return null;
  },

  /**
   * Remove auth token (logout)
   */
  clearToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
