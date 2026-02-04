"use client";

import { useState } from "react";
import Image from "next/image";
import {
  PlusIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  ArrowPathIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import AdminHeader from "../../../components/admin/AdminHeader";
import DataTable from "../../../components/admin/DataTable";
import StatCard from "../../../components/admin/StatCard";
import StatusBadge from "../../../components/admin/StatusBadge";
import { usePayouts, useMembers } from "@/components/hooks/useRobloxData";
import { Payout, RobloxMember } from "@/types/admin";

export default function PayoutsPage() {
  const { payouts, loading, saving, addPayout, refetch } = usePayouts();
  const { members } = useMembers();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showNewPayoutModal, setShowNewPayoutModal] = useState(false);

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

  const handleExport = () => {
    const csvContent = [
      "Recipient,Username,Amount,Percentage,Date,Status,Note",
      ...payouts.map((p) =>
        `"${p.recipient.displayName}","${p.recipient.username}",${p.amount},${p.percentage},"${p.date}","${p.status}","${p.note || ""}"`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payouts-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      key: "recipient",
      header: "Recipient",
      render: (payout: Payout) => (
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-violet-500 ring-2 ring-white/50">
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
      render: (payout: Payout) => <StatusBadge status={payout.status as "success" | "warning" | "error" | "info"} label={payout.status} />,
    },
    {
      key: "note",
      header: "Note",
      render: (payout: Payout) => (
        <span className="text-slate-500 text-sm truncate max-w-xs block">
          {payout.note || "-"}
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
              className="pl-9 pr-8 py-2.5 rounded-xl backdrop-blur-md bg-white/60 border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none text-sm text-slate-700"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 backdrop-blur-md bg-white/60 border border-white/20 rounded-xl hover:bg-white/80 transition-colors"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export
          </button>

          <button
            type="button"
            onClick={refetch}
            className="p-2.5 rounded-xl backdrop-blur-md bg-white/60 border border-white/20 hover:bg-white/80 transition-colors"
            title="Refresh"
          >
            <ArrowPathIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowNewPayoutModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl hover:opacity-90 transition-opacity shadow-lg"
        >
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

      {/* New Payout Modal */}
      {showNewPayoutModal && (
        <NewPayoutModal
          members={members}
          saving={saving}
          onClose={() => setShowNewPayoutModal(false)}
          onSubmit={async (payout) => {
            await addPayout(payout);
            setShowNewPayoutModal(false);
          }}
        />
      )}
    </>
  );
}

interface NewPayoutModalProps {
  members: RobloxMember[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (payout: Omit<Payout, "id">) => Promise<void>;
}

function NewPayoutModal({ members, saving, onClose, onSubmit }: NewPayoutModalProps) {
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [amount, setAmount] = useState("");
  const [percentage, setPercentage] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"pending" | "completed">("pending");
  const [success, setSuccess] = useState(false);

  const selectedMember = members.find((m) => String(m.id) === selectedMemberId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMember || !amount) return;

    await onSubmit({
      recipient: {
        id: selectedMember.id,
        displayName: selectedMember.displayName,
        username: selectedMember.username,
        avatarUrl: selectedMember.avatarUrl,
      },
      amount: parseInt(amount),
      percentage: percentage ? parseFloat(percentage) : 0,
      date: new Date().toISOString(),
      status,
      note: note || "",
    });

    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md backdrop-blur-xl bg-white/90 border border-white/20 rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100/50">
            <h2 className="text-xl font-semibold text-slate-800">New Payout</h2>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="p-2 hover:bg-gray-100/50 rounded-xl transition-colors disabled:opacity-50"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Recipient */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Recipient <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none bg-white text-slate-700"
              >
                <option value="">Select a member...</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.displayName} (@{member.username})
                  </option>
                ))}
              </select>

              {selectedMember && (
                <div className="mt-2 flex items-center gap-3 p-3 rounded-xl bg-blue-50/50">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/50">
                    <Image
                      src={selectedMember.avatarUrl}
                      alt={selectedMember.displayName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">{selectedMember.displayName}</p>
                    <p className="text-xs text-slate-400">{selectedMember.role.name}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Amount (Robux) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">R$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  min="1"
                  required
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-700 bg-white"
                />
              </div>
            </div>

            {/* Percentage */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Revenue Share (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full pr-8 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-700 bg-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">%</span>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStatus("pending")}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    status === "pending"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className={`text-sm font-medium ${status === "pending" ? "text-orange-700" : "text-gray-600"}`}>
                    Pending
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("completed")}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    status === "completed"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className={`text-sm font-medium ${status === "completed" ? "text-green-700" : "text-gray-600"}`}>
                    Completed
                  </p>
                </button>
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Note
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note..."
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none text-slate-700 bg-white"
              />
            </div>

            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl text-green-700">
                <CheckCircleIcon className="w-5 h-5" />
                <span>Payout created successfully!</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-slate-600 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !selectedMemberId || !amount}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-medium hover:opacity-90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-4 h-4" />
                    Create Payout
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
