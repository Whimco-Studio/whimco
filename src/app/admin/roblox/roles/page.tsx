"use client";

import { useState } from "react";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  UserGroupIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import AdminHeader from "../../../components/admin/AdminHeader";
import DataTable from "../../../components/admin/DataTable";
import StatusBadge from "../../../components/admin/StatusBadge";
import { useRoles } from "@/components/hooks/useRobloxData";
import { RobloxRole } from "@/types/admin";

const AVAILABLE_PERMISSIONS = [
  { id: "manage_members", label: "Manage Members" },
  { id: "manage_roles", label: "Manage Roles" },
  { id: "manage_wall", label: "Manage Wall" },
  { id: "post_wall", label: "Post to Wall" },
  { id: "manage_group", label: "Manage Group" },
  { id: "view_analytics", label: "View Analytics" },
  { id: "manage_payouts", label: "Manage Payouts" },
  { id: "manage_assets", label: "Manage Assets" },
];

const ROLE_COLORS = [
  "#3B82F6", // Blue
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#EF4444", // Red
  "#F97316", // Orange
  "#EAB308", // Yellow
  "#22C55E", // Green
  "#06B6D4", // Cyan
  "#6366F1", // Indigo
  "#A855F7", // Purple
];

export default function RolesPage() {
  const { roles, loading, saving, addRole, updateRole, deleteRole } = useRoles();
  const [selectedRole, setSelectedRole] = useState<RobloxRole | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRole, setEditingRole] = useState<RobloxRole | null>(null);

  const handleDeleteRole = async (role: RobloxRole) => {
    if (role.rank === 255) return; // Can't delete owner role
    if (confirm(`Are you sure you want to delete the "${role.name}" role?`)) {
      await deleteRole(role.id);
    }
  };

  const columns = [
    {
      key: "color",
      header: "",
      className: "w-4",
      render: (role: RobloxRole) => (
        <div
          className="w-4 h-4 rounded-full ring-2 ring-white/50 shadow-sm"
          style={{ backgroundColor: role.color }}
        />
      ),
    },
    {
      key: "name",
      header: "Role Name",
      sortable: true,
      render: (role: RobloxRole) => (
        <span className="font-semibold text-slate-700">{role.name}</span>
      ),
    },
    {
      key: "rank",
      header: "Rank",
      sortable: true,
      render: (role: RobloxRole) => (
        <span className="text-slate-600 font-mono">{role.rank}</span>
      ),
    },
    {
      key: "memberCount",
      header: "Members",
      sortable: true,
      render: (role: RobloxRole) => (
        <div className="flex items-center gap-2">
          <UserGroupIcon className="w-4 h-4 text-slate-400" />
          <span className="text-slate-600">{role.memberCount.toLocaleString()}</span>
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
            <span className="text-xs text-slate-400 px-2 py-0.5">
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
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setEditingRole(role);
            }}
            className="p-1.5 rounded-xl hover:bg-blue-100/50 text-slate-400 hover:text-blue-500 transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteRole(role);
            }}
            className="p-1.5 rounded-xl hover:bg-red-100/50 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={role.rank === 255}
            title={role.rank === 255 ? "Cannot delete owner role" : "Delete role"}
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
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl hover:opacity-90 transition-opacity shadow-lg"
        >
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

      {/* Role Details Modal */}
      {selectedRole && !editingRole && (
        <RoleDetailsModal
          role={selectedRole}
          onClose={() => setSelectedRole(null)}
          onEdit={() => {
            setEditingRole(selectedRole);
            setSelectedRole(null);
          }}
        />
      )}

      {/* Add Role Modal */}
      {showAddModal && (
        <RoleFormModal
          title="Add New Role"
          saving={saving}
          onClose={() => setShowAddModal(false)}
          onSubmit={async (role) => {
            await addRole(role);
            setShowAddModal(false);
          }}
        />
      )}

      {/* Edit Role Modal */}
      {editingRole && (
        <RoleFormModal
          title="Edit Role"
          role={editingRole}
          saving={saving}
          onClose={() => setEditingRole(null)}
          onSubmit={async (updates) => {
            await updateRole(editingRole.id, updates);
            setEditingRole(null);
          }}
        />
      )}
    </>
  );
}

function RoleDetailsModal({
  role,
  onClose,
  onEdit,
}: {
  role: RobloxRole;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="backdrop-blur-xl bg-white/90 border border-white/20 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-5 h-5 rounded-full ring-2 ring-white/50 shadow-sm"
            style={{ backgroundColor: role.color }}
          />
          <h2 className="text-xl font-bold text-slate-700">{role.name}</h2>
          {role.rank === 255 && (
            <StatusBadge status="success" label="Owner" size="sm" />
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gray-50/50">
              <label className="text-sm font-medium text-slate-500">Rank</label>
              <p className="text-2xl font-bold text-slate-700">{role.rank}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50/50">
              <label className="text-sm font-medium text-slate-500">Members</label>
              <p className="text-2xl font-bold text-slate-700">
                {role.memberCount.toLocaleString()}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-500 mb-2 block">
              Permissions
            </label>
            <div className="flex flex-wrap gap-2">
              {role.permissions.length > 0 ? (
                role.permissions.map((perm) => (
                  <StatusBadge
                    key={perm}
                    status="info"
                    label={perm.replace(/_/g, " ")}
                  />
                ))
              ) : (
                <span className="text-sm text-slate-400">No permissions assigned</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-gray-100/50 rounded-xl transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl hover:opacity-90 transition-opacity shadow-md"
          >
            Edit Role
          </button>
        </div>
      </div>
    </div>
  );
}

function RoleFormModal({
  title,
  role,
  saving,
  onClose,
  onSubmit,
}: {
  title: string;
  role?: RobloxRole;
  saving: boolean;
  onClose: () => void;
  onSubmit: (role: Omit<RobloxRole, "id">) => Promise<void>;
}) {
  const [name, setName] = useState(role?.name || "");
  const [rank, setRank] = useState(role?.rank?.toString() || "");
  const [color, setColor] = useState(role?.color || ROLE_COLORS[0]);
  const [permissions, setPermissions] = useState<string[]>(role?.permissions || []);
  const [success, setSuccess] = useState(false);

  const togglePermission = (permId: string) => {
    setPermissions((prev) =>
      prev.includes(permId)
        ? prev.filter((p) => p !== permId)
        : [...prev, permId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !rank) return;

    await onSubmit({
      name: name.trim(),
      rank: parseInt(rank),
      color,
      permissions,
      memberCount: role?.memberCount || 0,
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
            <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
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
            {/* Role Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Role Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter role name"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-700 bg-white"
              />
            </div>

            {/* Rank */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Rank (0-254) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                placeholder="0"
                min="0"
                max="254"
                required
                disabled={role?.rank === 255}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-700 bg-white disabled:opacity-50"
              />
              <p className="text-xs text-slate-400 mt-1">
                Higher rank = more authority. 255 is reserved for owner.
              </p>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Role Color
              </label>
              <div className="flex flex-wrap gap-2">
                {ROLE_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      color === c
                        ? "ring-2 ring-offset-2 ring-blue-500 scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Permissions */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Permissions
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {AVAILABLE_PERMISSIONS.map((perm) => (
                  <label
                    key={perm.id}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                      permissions.includes(perm.id)
                        ? "bg-blue-50/50"
                        : "hover:bg-gray-50/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={permissions.includes(perm.id)}
                      onChange={() => togglePermission(perm.id)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl text-green-700">
                <CheckCircleIcon className="w-5 h-5" />
                <span>Role {role ? "updated" : "created"} successfully!</span>
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
                disabled={saving || !name.trim() || !rank}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-medium hover:opacity-90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    {role ? "Update" : "Create"} Role
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
