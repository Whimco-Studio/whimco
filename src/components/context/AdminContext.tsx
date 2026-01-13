"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { User } from "@/types/admin";
import { mockCurrentUser } from "@/lib/mock-data/users";

interface AdminContextType {
  user: User | null;
  isAdmin: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  currentSection: string;
  setCurrentSection: (section: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [user] = useState<User | null>(mockCurrentUser);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentSection, setCurrentSection] = useState("dashboard");

  const isAdmin = user?.role === "admin";

  return (
    <AdminContext.Provider
      value={{
        user,
        isAdmin,
        sidebarOpen,
        setSidebarOpen,
        currentSection,
        setCurrentSection,
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
