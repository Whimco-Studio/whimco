"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authApi, LoginError } from "@/lib/api/auth";

interface AuthUser {
  username: string;
  isAdmin: boolean;
}

interface AdminContextType {
  user: AuthUser | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  currentSection: string;
  setCurrentSection: (section: string) => void;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentSection, setCurrentSection] = useState("dashboard");

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = authApi.getToken();
      if (token) {
        // Token exists, user is authenticated
        // We could fetch user info here, but for now just mark as authenticated
        setUser({
          username: "Admin",
          isAdmin: true,
        });
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.login(username, password);
      authApi.setToken(response.token);

      setUser({
        username,
        isAdmin: true,
      });

      setIsLoading(false);
      return true;
    } catch (err) {
      const loginError = err as LoginError;
      if (loginError.non_field_errors) {
        setError(loginError.non_field_errors[0]);
      } else if (loginError.detail) {
        setError(loginError.detail);
      } else {
        setError("Login failed. Please check your credentials.");
      }
      setIsLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    authApi.clearToken();
    setUser(null);
    router.push("/login");
  }, [router]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = user?.isAdmin ?? false;

  return (
    <AdminContext.Provider
      value={{
        user,
        isAdmin,
        isAuthenticated,
        isLoading,
        error,
        sidebarOpen,
        setSidebarOpen,
        currentSection,
        setCurrentSection,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return context;
}
