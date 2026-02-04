"use client";

import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  EyeIcon,
  HeartIcon,
  GlobeAltIcon,
  ArrowTrendingUpIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";
import AdminHeader from "../components/admin/AdminHeader";
import StatCard from "../components/admin/StatCard";
import { useAdmin } from "@/components/context/AdminContext";
import { useRobloxData } from "@/components/hooks/useRobloxData";
import { useAnalytics } from "@/components/hooks/useAnalytics";
import Link from "next/link";

export default function AdminDashboard() {
  const { isAdmin } = useAdmin();
  const { summary: robloxSummary, loading: robloxLoading } = useRobloxData();
  const { summary: analyticsSummary, trends, loading: analyticsLoading } = useAnalytics();

  return (
    <>
      <AdminHeader
        title="Dashboard"
        subtitle="Welcome back! Here's an overview of your Whimco stats."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isAdmin && (
          <>
            <StatCard
              title="Total Members"
              value={robloxLoading ? "..." : robloxSummary.totalMembers}
              change={5.2}
              icon={<UserGroupIcon className="w-6 h-6" />}
              color="blue"
            />
            <StatCard
              title="Wall Posts"
              value={robloxLoading ? "..." : robloxSummary.wallPosts}
              change={12}
              icon={<ChatBubbleLeftRightIcon className="w-6 h-6" />}
              color="green"
            />
          </>
        )}
        <StatCard
          title="Total Views"
          value={analyticsLoading ? "..." : analyticsSummary.totalViews}
          change={trends.views}
          icon={<EyeIcon className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Engagement Rate"
          value={
            analyticsLoading ? "..." : `${analyticsSummary.averageEngagementRate}%`
          }
          change={analyticsSummary.weekOverWeekGrowth}
          icon={<HeartIcon className="w-6 h-6" />}
          color="orange"
        />
        {isAdmin && (
          <StatCard
            title="Paid This Month"
            value={
              robloxLoading
                ? "..."
                : `R$${robloxSummary.totalPaidThisMonth.toLocaleString()}`
            }
            subtitle={`${robloxSummary.pendingPayouts} pending`}
            icon={<CurrencyDollarIcon className="w-6 h-6" />}
            color="cyan"
          />
        )}
        <StatCard
          title="Servers Reached"
          value={analyticsLoading ? "..." : analyticsSummary.serversReached}
          change={15}
          icon={<GlobeAltIcon className="w-6 h-6" />}
          color="green"
        />
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-xl p-6">
          <h2 className="text-lg font-bold text-slate-700 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {isAdmin && (
              <>
                <Link
                  href="/admin/roblox/assets"
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/50 hover:bg-white/80 border border-white/30 transition-all hover:shadow-md"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <ArchiveBoxIcon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    Manage Assets
                  </span>
                </Link>
                <Link
                  href="/admin/roblox/roles"
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/50 hover:bg-white/80 border border-white/30 transition-all hover:shadow-md"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
                    <UserGroupIcon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    Manage Roles
                  </span>
                </Link>
                <Link
                  href="/admin/roblox/payouts"
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/50 hover:bg-white/80 border border-white/30 transition-all hover:shadow-md"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                    <CurrencyDollarIcon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    View Payouts
                  </span>
                </Link>
              </>
            )}
            <Link
              href="/admin/analytics"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/50 hover:bg-white/80 border border-white/30 transition-all hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700">
                View Analytics
              </span>
            </Link>
            <Link
              href="/admin/analytics/export"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/50 hover:bg-white/80 border border-white/30 transition-all hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                <GlobeAltIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700">
                Export Data
              </span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-xl p-6">
          <h2 className="text-lg font-bold text-slate-700 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <ActivityItem
              icon={<EyeIcon className="w-4 h-4" />}
              title="New views milestone"
              description="Your content reached 125K total views"
              time="2 hours ago"
              color="purple"
            />
            <ActivityItem
              icon={<HeartIcon className="w-4 h-4" />}
              title="Engagement spike"
              description="710 reactions on latest post"
              time="5 hours ago"
              color="red"
            />
            {isAdmin && (
              <>
                <ActivityItem
                  icon={<UserGroupIcon className="w-4 h-4" />}
                  title="New member joined"
                  description="NewPlayer2024 joined the group"
                  time="1 day ago"
                  color="blue"
                />
                <ActivityItem
                  icon={<CurrencyDollarIcon className="w-4 h-4" />}
                  title="Payout completed"
                  description="R$5,000 sent to DevMaster99"
                  time="3 days ago"
                  color="green"
                />
              </>
            )}
            <ActivityItem
              icon={<GlobeAltIcon className="w-4 h-4" />}
              title="New server added"
              description="Now broadcasting to 156 servers"
              time="1 week ago"
              color="cyan"
            />
          </div>
        </div>
      </div>
    </>
  );
}

function ActivityItem({
  icon,
  title,
  description,
  time,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
  color: string;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-600",
    green: "bg-emerald-500/10 text-emerald-600",
    purple: "bg-purple-500/10 text-purple-600",
    red: "bg-red-500/10 text-red-600",
    cyan: "bg-cyan-500/10 text-cyan-600",
    orange: "bg-orange-500/10 text-orange-600",
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/50 transition-colors">
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors[color]}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-700">{title}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <span className="text-xs text-slate-400 whitespace-nowrap">{time}</span>
    </div>
  );
}
