"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminProvider, useAdmin } from "@/components/context/AdminContext";
import AdminSidebar from "../components/admin/AdminSidebar";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAdmin();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render admin content if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

function AdminContent({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-slate-100">
        {/* Animated gradient blobs for depth */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-violet-400/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-20 w-60 h-60 bg-gradient-to-br from-cyan-400/15 to-blue-400/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 right-1/3 w-72 h-72 bg-gradient-to-br from-violet-400/15 to-pink-400/15 rounded-full blur-3xl" />
        </div>

        {/* Top gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-violet-600/10 to-blue-600/10" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        </div>

        {/* Sidebar */}
        <AdminSidebar />

        {/* Main content */}
        <main className="relative xl:ml-72 min-h-screen transition-all duration-200">
          <div className="px-4 pt-6 pb-8 xl:px-8">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <AdminContent>{children}</AdminContent>
    </AdminProvider>
  );
}
