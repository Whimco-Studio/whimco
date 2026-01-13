"use client";

import { AdminProvider } from "@/components/context/AdminContext";
import AdminSidebar from "../components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Background gradient */}
        <div className="absolute w-full bg-gradient-to-bl from-black to-gray-700 min-h-72" />

        {/* Sidebar */}
        <AdminSidebar />

        {/* Main content */}
        <main className="relative xl:ml-72 min-h-screen transition-all duration-200">
          <div className="px-4 pt-6 pb-8 xl:px-8">{children}</div>
        </main>
      </div>
    </AdminProvider>
  );
}
