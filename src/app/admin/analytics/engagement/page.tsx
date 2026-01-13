"use client";

import {
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import AdminHeader from "../../../components/admin/AdminHeader";
import StatCard from "../../../components/admin/StatCard";
import { useEngagement, useSpotlightPosts } from "@/components/hooks/useAnalytics";

export default function EngagementPage() {
  const { metrics, trends, loading } = useEngagement();
  const { posts, loading: postsLoading } = useSpotlightPosts();

  // Calculate totals from metrics
  const totals = metrics.reduce(
    (acc, m) => ({
      views: acc.views + m.views,
      reactions: acc.reactions + m.reactions,
      comments: acc.comments + m.comments,
      shares: acc.shares + m.shares,
    }),
    { views: 0, reactions: 0, comments: 0, shares: 0 }
  );

  // Get max value for chart scaling
  const maxValue = Math.max(...metrics.map((m) => m.views));

  return (
    <>
      <AdminHeader
        title="Engagement Metrics"
        subtitle="Track how your content performs across all servers"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Views"
          value={loading ? "..." : totals.views}
          change={trends.views}
          icon={<EyeIcon className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Total Reactions"
          value={loading ? "..." : totals.reactions}
          change={trends.reactions}
          icon={<HeartIcon className="w-6 h-6" />}
          color="red"
        />
        <StatCard
          title="Total Comments"
          value={loading ? "..." : totals.comments}
          change={trends.comments}
          icon={<ChatBubbleLeftIcon className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Total Shares"
          value={loading ? "..." : totals.shares}
          change={trends.shares}
          icon={<ShareIcon className="w-6 h-6" />}
          color="green"
        />
      </div>

      {/* Chart Area */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <h2 className="text-lg font-bold text-slate-700 mb-6">
          Engagement Over Time (Last 7 Days)
        </h2>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Simple bar chart visualization */}
            <div className="flex items-end justify-between gap-2 h-48">
              {metrics.map((metric, idx) => {
                const height = (metric.views / maxValue) * 100;
                const date = new Date(metric.date);
                const dayName = date.toLocaleDateString("en-US", {
                  weekday: "short",
                });

                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div className="w-full flex flex-col items-center gap-1">
                      <span className="text-xs text-slate-500">
                        {metric.views.toLocaleString()}
                      </span>
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-violet-500 rounded-t-lg transition-all duration-500"
                        style={{ height: `${height}%`, minHeight: "8px" }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{dayName}</span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-violet-500" />
                <span className="text-sm text-slate-500">Views</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Metrics Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-slate-700">Daily Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Reactions
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Comments
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Shares
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Engagement Rate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : (
                metrics.map((metric, idx) => {
                  const engagementRate =
                    metric.views > 0
                      ? (
                          ((metric.reactions + metric.comments + metric.shares) /
                            metric.views) *
                          100
                        ).toFixed(1)
                      : "0";

                  return (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {new Date(metric.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">
                        {metric.views.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {metric.reactions.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {metric.comments.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {metric.shares.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {engagementRate}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
