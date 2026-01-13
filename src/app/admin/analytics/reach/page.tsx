"use client";

import { GlobeAltIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";
import AdminHeader from "../../../components/admin/AdminHeader";
import StatCard from "../../../components/admin/StatCard";
import DataTable from "../../../components/admin/DataTable";
import StatusBadge from "../../../components/admin/StatusBadge";
import { useServerReach, useGrowth } from "@/components/hooks/useAnalytics";
import { ServerReach, GrowthMetric } from "@/types/admin";

export default function ReachPage() {
  const { servers, loading: serversLoading } = useServerReach();
  const { metrics: growthMetrics, loading: growthLoading } = useGrowth();

  // Calculate totals
  const totalMembers = servers.reduce((sum, s) => sum + s.members, 0);
  const totalViews = servers.reduce((sum, s) => sum + s.views, 0);
  const totalReactions = servers.reduce((sum, s) => sum + s.reactions, 0);

  const serverColumns = [
    {
      key: "serverName",
      header: "Server",
      sortable: true,
      render: (server: ServerReach) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
            {server.serverName[0]}
          </div>
          <span className="font-medium text-slate-700">{server.serverName}</span>
        </div>
      ),
    },
    {
      key: "members",
      header: "Members",
      sortable: true,
      render: (server: ServerReach) => (
        <span className="text-slate-600">{server.members.toLocaleString()}</span>
      ),
    },
    {
      key: "views",
      header: "Views",
      sortable: true,
      render: (server: ServerReach) => (
        <span className="font-medium text-slate-700">
          {server.views.toLocaleString()}
        </span>
      ),
    },
    {
      key: "reactions",
      header: "Reactions",
      sortable: true,
      render: (server: ServerReach) => (
        <span className="text-slate-600">{server.reactions.toLocaleString()}</span>
      ),
    },
    {
      key: "engagementRate",
      header: "Engagement",
      render: (server: ServerReach) => {
        const rate =
          server.views > 0
            ? ((server.reactions / server.views) * 100).toFixed(1)
            : "0";
        return <span className="text-slate-600">{rate}%</span>;
      },
    },
    {
      key: "lastBroadcast",
      header: "Last Broadcast",
      sortable: true,
      render: (server: ServerReach) => {
        const date = new Date(server.lastBroadcast);
        const now = new Date();
        const diffHours = Math.floor(
          (now.getTime() - date.getTime()) / 3600000
        );

        let status: "success" | "warning" | "error" = "success";
        if (diffHours > 24) status = "warning";
        if (diffHours > 72) status = "error";

        return (
          <StatusBadge
            status={status}
            label={
              diffHours < 24
                ? `${diffHours}h ago`
                : `${Math.floor(diffHours / 24)}d ago`
            }
          />
        );
      },
    },
  ];

  return (
    <>
      <AdminHeader
        title="Server Reach"
        subtitle="Analyze your content distribution across Discord servers"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Servers"
          value={serversLoading ? "..." : servers.length}
          change={15}
          icon={<GlobeAltIcon className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Combined Members"
          value={serversLoading ? "..." : totalMembers}
          subtitle="Potential reach"
          icon={<GlobeAltIcon className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Total Server Views"
          value={serversLoading ? "..." : totalViews}
          icon={<GlobeAltIcon className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Avg. Engagement"
          value={
            serversLoading
              ? "..."
              : `${((totalReactions / totalViews) * 100).toFixed(1)}%`
          }
          icon={<ArrowTrendingUpIcon className="w-6 h-6" />}
          color="orange"
        />
      </div>

      {/* Growth Chart */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <h2 className="text-lg font-bold text-slate-700 mb-6">Growth Trend</h2>

        {growthLoading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {growthMetrics.map((metric, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl ${
                  metric.trending
                    ? "bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200"
                    : "bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">
                    {metric.period}
                  </span>
                  {metric.trending && (
                    <StatusBadge status="success" label="Trending" size="sm" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-400">New Servers</span>
                    <span className="text-sm font-semibold text-slate-700">
                      +{metric.newServers}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-400">Total Reach</span>
                    <span className="text-sm font-semibold text-slate-700">
                      {metric.totalReach.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-400">Engagement</span>
                    <span className="text-sm font-semibold text-slate-700">
                      {metric.engagementRate}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Server List */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-700">Server Breakdown</h2>
        <p className="text-sm text-slate-500">
          Performance metrics for each connected server
        </p>
      </div>

      <DataTable
        data={servers}
        columns={serverColumns}
        loading={serversLoading}
        emptyTitle="No servers connected"
        emptyDescription="Your Spotlight content will appear here once broadcast"
        keyExtractor={(server) => server.serverId}
        pageSize={8}
      />
    </>
  );
}
