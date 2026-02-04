"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdmin } from "@/components/context/AdminContext";
import {
  HomeIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  HeartIcon,
  GlobeAltIcon,
  ArrowDownTrayIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  RocketLaunchIcon,
  SparklesIcon,
  CubeIcon,
  ArchiveBoxIcon,
  ArrowRightOnRectangleIcon,
  WrenchScrewdriverIcon,
  CubeTransparentIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
  adminOnly?: boolean;
}

const navigation: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        name: "Dashboard",
        href: "/admin",
        icon: <HomeIcon className="w-5 h-5" />,
      },
    ],
  },
  {
    title: "Projects",
    adminOnly: true,
    items: [
      {
        name: "All Projects",
        href: "/admin/projects",
        icon: <RocketLaunchIcon className="w-5 h-5" />,
        adminOnly: true,
      },
      {
        name: "Quirkyverse",
        href: "/admin/projects/quirkyverse",
        icon: <SparklesIcon className="w-5 h-5" />,
        adminOnly: true,
      },
      {
        name: "Standalone",
        href: "/admin/projects/standalone",
        icon: <CubeIcon className="w-5 h-5" />,
        adminOnly: true,
      },
    ],
  },
  {
    title: "Roblox Management",
    adminOnly: true,
    items: [
      {
        name: "Assets",
        href: "/admin/roblox/assets",
        icon: <ArchiveBoxIcon className="w-5 h-5" />,
        adminOnly: true,
      },
      {
        name: "Group Roles",
        href: "/admin/roblox/roles",
        icon: <ShieldCheckIcon className="w-5 h-5" />,
        adminOnly: true,
      },
      {
        name: "Members",
        href: "/admin/roblox/members",
        icon: <UserGroupIcon className="w-5 h-5" />,
        adminOnly: true,
      },
      {
        name: "Wall Posts",
        href: "/admin/roblox/wall",
        icon: <ChatBubbleLeftRightIcon className="w-5 h-5" />,
        adminOnly: true,
      },
      {
        name: "Payouts",
        href: "/admin/roblox/payouts",
        icon: <CurrencyDollarIcon className="w-5 h-5" />,
        adminOnly: true,
      },
    ],
  },
  {
    title: "Tools",
    adminOnly: true,
    items: [
      {
        name: "3D Viewer",
        href: "/admin/tools/3d-viewer",
        icon: <CubeTransparentIcon className="w-5 h-5" />,
        adminOnly: true,
      },
      {
        name: "Icon Generator",
        href: "/admin/tools/icon-generator",
        icon: <CameraIcon className="w-5 h-5" />,
        adminOnly: true,
      },
    ],
  },
  {
    title: "Analytics",
    items: [
      {
        name: "Overview",
        href: "/admin/analytics",
        icon: <ChartBarIcon className="w-5 h-5" />,
      },
      {
        name: "Engagement",
        href: "/admin/analytics/engagement",
        icon: <HeartIcon className="w-5 h-5" />,
      },
      {
        name: "Reach",
        href: "/admin/analytics/reach",
        icon: <GlobeAltIcon className="w-5 h-5" />,
      },
      {
        name: "Export",
        href: "/admin/analytics/export",
        icon: <ArrowDownTrayIcon className="w-5 h-5" />,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        name: "Settings",
        href: "/admin/settings",
        icon: <Cog6ToothIcon className="w-5 h-5" />,
      },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { isAdmin, sidebarOpen, setSidebarOpen, logout, user } = useAdmin();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  const filteredNavigation = navigation
    .filter((section) => !section.adminOnly || isAdmin)
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.adminOnly || isAdmin),
    }));

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2.5 rounded-xl backdrop-blur-xl bg-white/80 border border-white/20 shadow-lg xl:hidden"
      >
        {sidebarOpen ? (
          <XMarkIcon className="w-6 h-6 text-gray-600" />
        ) : (
          <Bars3Icon className="w-6 h-6 text-gray-600" />
        )}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 xl:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex flex-col
          w-64 backdrop-blur-xl bg-white/80 border-r border-white/20 shadow-2xl
          transition-transform duration-300 ease-in-out
          xl:translate-x-0 xl:ml-4 xl:my-4 xl:rounded-2xl xl:h-[calc(100vh-2rem)] xl:border xl:border-white/30
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 p-5 border-b border-white/20">
          <Image
            src="/branding/Icon - White on Black BG.png"
            alt="Whimco"
            width={40}
            height={40}
            className="rounded-xl shadow-lg"
          />
          <Image
            src="/branding/Whimco Black Rectangle.png"
            alt="Whimco"
            width={100}
            height={30}
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          {filteredNavigation.map((section, sectionIdx) => (
            <div key={section.title} className={sectionIdx > 0 ? "mt-6" : ""}>
              <div className="relative mb-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200/50" />
                </div>
                <div className="relative flex justify-center">
                  <span className="backdrop-blur-sm bg-white/50 px-3 py-0.5 rounded-full text-[10px] font-semibold uppercase text-gray-400 tracking-wider">
                    {section.title}
                  </span>
                </div>
              </div>

              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => {
                        if (window.innerWidth < 1280) {
                          setSidebarOpen(false);
                        }
                      }}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-xl
                        text-sm font-medium transition-all duration-200
                        ${
                          isActive(item.href)
                            ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg shadow-blue-500/25"
                            : "text-gray-600 hover:bg-white/60 hover:shadow-sm"
                        }
                      `}
                    >
                      <span
                        className={
                          isActive(item.href) ? "text-white" : "text-gray-400"
                        }
                      >
                        {item.icon}
                      </span>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-white/20">
          <div className="flex items-center gap-3 p-3 rounded-xl backdrop-blur-sm bg-gradient-to-r from-gray-50/80 to-white/50 border border-white/30">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/25">
              {user?.username?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {user?.username || "Admin"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {isAdmin ? "Full Access" : "Limited Access"}
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="p-2 rounded-lg hover:bg-red-100/50 text-gray-400 hover:text-red-500 transition-colors"
              title="Sign out"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
