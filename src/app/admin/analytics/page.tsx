"use client";

import Link from "next/link";
import {
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  GlobeAltIcon,
  ArrowTrendingUpIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import AdminHeader from "../../components/admin/AdminHeader";
import StatCard from "../../components/admin/StatCard";
import { useAnalytics } from "@/components/hooks/useAnalytics";

export default function AnalyticsOverview() {
  const { summary, trends, posts, loading } = useAnalytics();

  return (
    <>
      <AdminHeader
        title="Analytics Overview"
        subtitle="Track your Spotlight content performance across servers"
      />

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Views"
          value={loading ? "..." : summary.totalViews}
          change={trends.views}
          icon={<EyeIcon className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Total Reactions"
          value={loading ? "..." : summary.totalReactions}
          change={trends.reactions}
          icon={<HeartIcon className="w-6 h-6" />}
          color="red"
        />
        <StatCard
          title="Total Comments"
          value={loading ? "..." : summary.totalComments}
          change={trends.comments}
          icon={<ChatBubbleLeftIcon className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Total Shares"
          value={loading ? "..." : summary.totalShares}
          change={trends.shares}
          icon={<ShareIcon className="w-6 h-6" />}
          color="green"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Servers Reached"
          value={loading ? "..." : summary.serversReached}
          change={15}
          icon={<GlobeAltIcon className="w-6 h-6" />}
          color="cyan"
        />
        <StatCard
          title="Avg. Engagement Rate"
          value={loading ? "..." : `${summary.averageEngagementRate}%`}
          change={summary.weekOverWeekGrowth}
          icon={<ArrowTrendingUpIcon className="w-6 h-6" />}
          color="orange"
        />
        <StatCard
          title="Top Server"
          value={loading ? "..." : summary.topPerformingServer}
          subtitle="Highest engagement"
          icon={<GlobeAltIcon className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/admin/analytics/engagement"
          className="group bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
              <HeartIcon className="w-6 h-6 text-white" />
            </div>
            <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="mt-4 font-bold text-slate-700">Engagement Metrics</h3>
          <p className="mt-1 text-sm text-slate-500">
            Views, reactions, comments, and shares over time
          </p>
        </Link>

        <Link
          href="/admin/analytics/reach"
          className="group bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
              <GlobeAltIcon className="w-6 h-6 text-white" />
            </div>
            <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="mt-4 font-bold text-slate-700">Server Reach</h3>
          <p className="mt-1 text-sm text-slate-500">
            Breakdown by server and growth trends
          </p>
        </Link>

        <Link
          href="/admin/analytics/export"
          className="group bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
              <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
            </div>
            <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="mt-4 font-bold text-slate-700">Export Data</h3>
          <p className="mt-1 text-sm text-slate-500">
            Download your analytics in CSV or JSON
          </p>
        </Link>
      </div>

      {/* Recent Posts Performance */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-lg font-bold text-slate-700 mb-4">
          Recent Posts Performance
        </h2>
        <div className="space-y-4">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg" />
              ))}
            </div>
          ) : (
            posts.slice(0, 5).map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-700 truncate">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {new Date(post.createdAt).toLocaleDateString()} · {post.servers}{" "}
                    servers
                  </p>
                </div>
                <div className="flex items-center gap-6 ml-4">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-700">
                      {post.totalViews.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400">Views</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-700">
                      {post.totalReactions.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400">Reactions</p>
                  </div>
                  <div className="text-center hidden sm:block">
                    <p className="text-sm font-semibold text-slate-700">
                      {post.totalComments.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400">Comments</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
