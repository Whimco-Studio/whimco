"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useAdmin } from "@/components/context/AdminContext";

interface Breadcrumb {
  name: string;
  href: string;
}

function getBreadcrumbs(pathname: string): Breadcrumb[] {
  const paths = pathname.split("/").filter(Boolean);
  const breadcrumbs: Breadcrumb[] = [];

  let currentPath = "";
  paths.forEach((path, index) => {
    currentPath += `/${path}`;

    // Format the path name
    let name = path.charAt(0).toUpperCase() + path.slice(1);
    if (path === "admin") name = "Pages";

    breadcrumbs.push({
      name,
      href: currentPath,
    });
  });

  return breadcrumbs;
}

function getPageTitle(pathname: string): string {
  const paths = pathname.split("/").filter(Boolean);
  const lastPath = paths[paths.length - 1];

  if (!lastPath || lastPath === "admin") return "Dashboard";

  // Handle special cases
  const titles: Record<string, string> = {
    roles: "Group Roles",
    members: "Members",
    wall: "Wall Posts",
    payouts: "Payouts",
    analytics: "Analytics Overview",
    engagement: "Engagement Metrics",
    reach: "Server Reach",
    export: "Export Data",
    settings: "Settings",
    roblox: "Roblox Management",
  };

  return titles[lastPath] || lastPath.charAt(0).toUpperCase() + lastPath.slice(1);
}

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const pathname = usePathname();
  const { user } = useAdmin();
  const breadcrumbs = getBreadcrumbs(pathname);
  const pageTitle = title || getPageTitle(pathname);

  return (
    <header className="mb-6">
      <nav className="flex flex-wrap items-center justify-between py-2">
        <div className="flex items-center">
          {/* Breadcrumb */}
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-1">
              {breadcrumbs.map((crumb, idx) => (
                <li key={crumb.href} className="flex items-center">
                  {idx > 0 && (
                    <span className="mx-2 text-white/50">/</span>
                  )}
                  <Link
                    href={crumb.href}
                    className={`text-sm ${
                      idx === breadcrumbs.length - 1
                        ? "text-white font-medium"
                        : "text-white/60 hover:text-white/80"
                    }`}
                  >
                    {crumb.name}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-9 pr-4 py-2 text-sm rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 w-48"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-white/80 hover:text-white transition-colors">
            <BellIcon className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User */}
          <Link
            href="/admin/settings"
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <span className="text-sm font-medium hidden sm:inline">
              {user?.name || "User"}
            </span>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
              {user?.name?.[0] || "U"}
            </div>
          </Link>
        </div>
      </nav>

      {/* Page title */}
      <div className="mt-2">
        <h1 className="text-2xl font-bold text-white">{pageTitle}</h1>
        {subtitle && <p className="text-white/60 text-sm mt-1">{subtitle}</p>}
      </div>
    </header>
  );
}
