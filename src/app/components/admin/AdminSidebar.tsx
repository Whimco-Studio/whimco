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
    title: "Roblox Management",
    adminOnly: true,
    items: [
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
  const { isAdmin, sidebarOpen, setSidebarOpen } = useAdmin();

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
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg xl:hidden"
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
          className="fixed inset-0 bg-black/50 z-40 xl:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex flex-col
          w-64 bg-white shadow-xl
          transition-transform duration-300 ease-in-out
          xl:translate-x-0 xl:ml-6 xl:my-4 xl:rounded-2xl xl:h-[calc(100vh-2rem)]
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 p-4 border-b border-gray-100">
          <Image
            src="/branding/Icon - White on Black BG.png"
            alt="Whimco"
            width={40}
            height={40}
            className="rounded-lg"
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
              <div className="relative mb-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-2 text-xs font-semibold uppercase text-gray-400 tracking-wider">
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
                        flex items-center gap-3 px-3 py-2.5 rounded-lg
                        text-sm font-medium transition-all duration-200
                        ${
                          isActive(item.href)
                            ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-md"
                            : "text-gray-600 hover:bg-gray-100"
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
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold">
              {isAdmin ? "A" : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {isAdmin ? "Admin" : "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {isAdmin ? "Full Access" : "Limited Access"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
