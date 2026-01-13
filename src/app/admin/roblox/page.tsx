"use client";

import Link from "next/link";
import {
  ShieldCheckIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import AdminHeader from "../../components/admin/AdminHeader";
import StatCard from "../../components/admin/StatCard";
import { useRobloxData } from "@/components/hooks/useRobloxData";

export default function RobloxOverview() {
  const { summary, loading } = useRobloxData();

  const sections = [
    {
      title: "Group Roles",
      description: "Manage role permissions, ranks, and member assignments",
      href: "/admin/roblox/roles",
      icon: <ShieldCheckIcon className="w-6 h-6" />,
      stat: loading ? "..." : `${summary.totalRoles} roles`,
      color: "from-blue-500 to-violet-500",
    },
    {
      title: "Members",
      description: "View and manage group members, activity, and earnings",
      href: "/admin/roblox/members",
      icon: <UserGroupIcon className="w-6 h-6" />,
      stat: loading ? "..." : `${summary.totalMembers.toLocaleString()} members`,
      color: "from-emerald-500 to-teal-500",
    },
    {
      title: "Wall Posts",
      description: "Moderate group wall posts, pin important announcements",
      href: "/admin/roblox/wall",
      icon: <ChatBubbleLeftRightIcon className="w-6 h-6" />,
      stat: loading ? "..." : `${summary.wallPosts} posts`,
      color: "from-orange-500 to-yellow-500",
    },
    {
      title: "Payouts",
      description: "Track payout history and manage pending distributions",
      href: "/admin/roblox/payouts",
      icon: <CurrencyDollarIcon className="w-6 h-6" />,
      stat: loading ? "..." : `${summary.pendingPayouts} pending`,
      color: "from-purple-500 to-indigo-500",
    },
  ];

  return (
    <>
      <AdminHeader
        title="Roblox Management"
        subtitle="Manage your Whimco group content, members, and payouts"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Members"
          value={loading ? "..." : summary.totalMembers}
          change={5.2}
          icon={<UserGroupIcon className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Active Members"
          value={loading ? "..." : summary.activeMembers}
          subtitle="Last 7 days"
          icon={<UserGroupIcon className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Wall Posts"
          value={loading ? "..." : summary.wallPosts}
          change={12}
          icon={<ChatBubbleLeftRightIcon className="w-6 h-6" />}
          color="orange"
        />
        <StatCard
          title="Paid This Month"
          value={loading ? "..." : `R$${summary.totalPaidThisMonth.toLocaleString()}`}
          icon={<CurrencyDollarIcon className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-r ${section.color} flex items-center justify-center text-white`}
              >
                {section.icon}
              </div>
              <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-700">
              {section.title}
            </h3>
            <p className="mt-1 text-sm text-slate-500">{section.description}</p>
            <p className="mt-3 text-sm font-semibold text-slate-600">
              {section.stat}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}
