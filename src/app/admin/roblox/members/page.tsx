"use client";

import { useState } from "react";
import Image from "next/image";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import AdminHeader from "../../../components/admin/AdminHeader";
import DataTable from "../../../components/admin/DataTable";
import StatusBadge from "../../../components/admin/StatusBadge";
import { useMembers } from "@/components/hooks/useRobloxData";
import { RobloxMember } from "@/types/admin";

export default function MembersPage() {
  const { members, loading } = useMembers();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Filter members
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.username.toLowerCase().includes(search.toLowerCase()) ||
      member.displayName.toLowerCase().includes(search.toLowerCase());
    const matchesRole =
      roleFilter === "all" || member.role.name === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Get unique roles for filter
  const uniqueRoles = Array.from(new Set(members.map((m) => m.role.name)));

  const columns = [
    {
      key: "user",
      header: "Member",
      render: (member: RobloxMember) => (
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100">
            <Image
              src={member.avatarUrl}
              alt={member.displayName}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div>
            <p className="font-medium text-slate-700">{member.displayName}</p>
            <p className="text-xs text-slate-400">@{member.username}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      render: (member: RobloxMember) => (
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: member.role.color }}
          />
          <span className="text-slate-600">{member.role.name}</span>
        </div>
      ),
    },
    {
      key: "joinDate",
      header: "Joined",
      sortable: true,
      render: (member: RobloxMember) => (
        <span className="text-slate-600">
          {new Date(member.joinDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "lastActive",
      header: "Last Active",
      sortable: true,
      render: (member: RobloxMember) => {
        const lastActive = new Date(member.lastActive);
        const today = new Date();
        const diffDays = Math.floor(
          (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
        );

        let status: "success" | "warning" | "error" = "success";
        if (diffDays > 7) status = "warning";
        if (diffDays > 30) status = "error";

        return (
          <StatusBadge
            status={status}
            label={
              diffDays === 0
                ? "Today"
                : diffDays === 1
                ? "Yesterday"
                : `${diffDays} days ago`
            }
          />
        );
      },
    },
    {
      key: "totalEarnings",
      header: "Total Earnings",
      sortable: true,
      render: (member: RobloxMember) => (
        <span className="font-medium text-slate-700">
          {member.totalEarnings > 0
            ? `R$${member.totalEarnings.toLocaleString()}`
            : "-"}
        </span>
      ),
    },
  ];

  return (
    <>
      <AdminHeader
        title="Group Members"
        subtitle="View and manage your group members"
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none bg-white"
            >
              <option value="all">All Roles</option>
              {uniqueRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <button className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
            <ArrowPathIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-slate-500 mb-4">
        {loading
          ? "Loading..."
          : `Showing ${filteredMembers.length} of ${members.length} members`}
      </p>

      {/* Members Table */}
      <DataTable
        data={filteredMembers}
        columns={columns}
        loading={loading}
        emptyTitle="No members found"
        emptyDescription="Try adjusting your search or filters"
        keyExtractor={(member) => member.id}
        pageSize={8}
      />
    </>
  );
}
