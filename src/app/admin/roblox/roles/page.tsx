"use client";

import { useState } from "react";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import AdminHeader from "../../../components/admin/AdminHeader";
import DataTable from "../../../components/admin/DataTable";
import StatusBadge from "../../../components/admin/StatusBadge";
import { useRoles } from "@/components/hooks/useRobloxData";
import { RobloxRole } from "@/types/admin";

export default function RolesPage() {
  const { roles, loading } = useRoles();
  const [selectedRole, setSelectedRole] = useState<RobloxRole | null>(null);

  const columns = [
    {
      key: "color",
      header: "",
      className: "w-4",
      render: (role: RobloxRole) => (
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: role.color }}
        />
      ),
    },
    {
      key: "name",
      header: "Role Name",
      sortable: true,
      render: (role: RobloxRole) => (
        <span className="font-medium text-slate-700">{role.name}</span>
      ),
    },
    {
      key: "rank",
      header: "Rank",
      sortable: true,
      render: (role: RobloxRole) => (
        <span className="text-slate-600">{role.rank}</span>
      ),
    },
    {
      key: "memberCount",
      header: "Members",
      sortable: true,
      render: (role: RobloxRole) => (
        <div className="flex items-center gap-2">
          <UserGroupIcon className="w-4 h-4 text-slate-400" />
          <span>{role.memberCount.toLocaleString()}</span>
        </div>
      ),
    },
    {
      key: "permissions",
      header: "Permissions",
      render: (role: RobloxRole) => (
        <div className="flex flex-wrap gap-1">
          {role.permissions.slice(0, 2).map((perm) => (
            <StatusBadge
              key={perm}
              status="info"
              label={perm.replace(/_/g, " ")}
              size="sm"
            />
          ))}
          {role.permissions.length > 2 && (
            <span className="text-xs text-slate-400">
              +{role.permissions.length - 2} more
            </span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-24",
      render: (role: RobloxRole) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedRole(role);
            }}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-slate-400 hover:text-blue-500 transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle delete
            }}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-slate-400 hover:text-red-500 transition-colors"
            disabled={role.rank === 255}
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <AdminHeader
        title="Group Roles"
        subtitle="Manage role permissions and member assignments"
      />

      {/* Actions bar */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-slate-500">
          {loading ? "Loading..." : `${roles.length} roles configured`}
        </p>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-violet-500 rounded-lg hover:opacity-90 transition-opacity">
          <PlusIcon className="w-4 h-4" />
          Add Role
        </button>
      </div>

      {/* Roles Table */}
      <DataTable
        data={roles}
        columns={columns}
        loading={loading}
        onRowClick={(role) => setSelectedRole(role)}
        emptyTitle="No roles found"
        emptyDescription="Create your first role to get started"
        keyExtractor={(role) => role.id}
      />

      {/* Role Details Modal (placeholder) */}
      {selectedRole && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedRole(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: selectedRole.color }}
              />
              <h2 className="text-xl font-bold text-slate-700">
                {selectedRole.name}
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Rank</label>
                <p className="text-slate-700">{selectedRole.rank}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Members
                </label>
                <p className="text-slate-700">
                  {selectedRole.memberCount.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Permissions
                </label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedRole.permissions.map((perm) => (
                    <StatusBadge
                      key={perm}
                      status="info"
                      label={perm.replace(/_/g, " ")}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setSelectedRole(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Close
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-violet-500 rounded-lg hover:opacity-90 transition-opacity">
                Edit Role
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
