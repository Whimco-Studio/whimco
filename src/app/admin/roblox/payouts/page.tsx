"use client";

import { useState } from "react";
import Image from "next/image";
import {
  PlusIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import AdminHeader from "../../../components/admin/AdminHeader";
import DataTable from "../../../components/admin/DataTable";
import StatCard from "../../../components/admin/StatCard";
import StatusBadge from "../../../components/admin/StatusBadge";
import { usePayouts } from "@/components/hooks/useRobloxData";
import { Payout } from "@/types/admin";

export default function PayoutsPage() {
  const { payouts, loading } = usePayouts();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Calculate stats
  const totalPaid = payouts
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payouts
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingCount = payouts.filter((p) => p.status === "pending").length;

  // Filter payouts
  const filteredPayouts = payouts.filter((payout) => {
    if (statusFilter === "all") return true;
    return payout.status === statusFilter;
  });

  const columns = [
    {
      key: "recipient",
      header: "Recipient",
      render: (payout: Payout) => (
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100">
            <Image
              src={payout.recipient.avatarUrl}
              alt={payout.recipient.displayName}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div>
            <p className="font-medium text-slate-700">
              {payout.recipient.displayName}
            </p>
            <p className="text-xs text-slate-400">
              @{payout.recipient.username}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      render: (payout: Payout) => (
        <span className="font-semibold text-slate-700">
          R${payout.amount.toLocaleString()}
        </span>
      ),
    },
    {
      key: "percentage",
      header: "Share",
      sortable: true,
      render: (payout: Payout) => (
        <span className="text-slate-600">{payout.percentage}%</span>
      ),
    },
    {
      key: "date",
      header: "Date",
      sortable: true,
      render: (payout: Payout) => (
        <span className="text-slate-600">
          {new Date(payout.date).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (payout: Payout) => <StatusBadge status={payout.status} />,
    },
    {
      key: "note",
      header: "Note",
      render: (payout: Payout) => (
        <span className="text-slate-500 text-sm truncate max-w-xs block">
          {payout.note}
        </span>
      ),
    },
  ];

  return (
    <>
      <AdminHeader
        title="Payouts"
        subtitle="Track and manage group revenue distributions"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Total Paid (This Month)"
          value={`R$${totalPaid.toLocaleString()}`}
          color="green"
        />
        <StatCard
          title="Pending Payouts"
          value={`R$${pendingAmount.toLocaleString()}`}
          subtitle={`${pendingCount} transactions`}
          color="orange"
        />
        <StatCard
          title="Total Transactions"
          value={payouts.length}
          color="blue"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none bg-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <button className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export
          </button>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl hover:opacity-90 transition-opacity">
          <PlusIcon className="w-4 h-4" />
          New Payout
        </button>
      </div>

      {/* Payouts Table */}
      <DataTable
        data={filteredPayouts}
        columns={columns}
        loading={loading}
        emptyTitle="No payouts found"
        emptyDescription="Create your first payout to get started"
        keyExtractor={(payout) => payout.id}
        pageSize={8}
      />
    </>
  );
}
