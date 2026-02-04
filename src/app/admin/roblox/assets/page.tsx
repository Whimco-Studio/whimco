"use client";

import { useState } from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  PhotoIcon,
  MusicalNoteIcon,
  CubeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClipboardDocumentIcon,
  TrashIcon,
  ArrowPathRoundedSquareIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import {
  PhotoIcon as PhotoIconSolid,
  MusicalNoteIcon as MusicalNoteIconSolid,
  CubeIcon as CubeIconSolid,
  ArchiveBoxIcon,
} from "@heroicons/react/24/solid";
import AdminHeader from "../../../components/admin/AdminHeader";
import DataTable from "../../../components/admin/DataTable";
import StatCard from "../../../components/admin/StatCard";
import StatusBadge from "../../../components/admin/StatusBadge";
import { useRobloxAssets } from "@/components/hooks/useRobloxAssets";
import { RobloxAsset, AssetType, AssetStatus } from "@/types/roblox-assets";
import AssetUploadModal from "./components/AssetUploadModal";

export default function AssetsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<AssetType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<AssetStatus | "all">("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const {
    assets,
    stats,
    loading,
    error,
    refetch,
    deleteAsset,
    retryAsset,
    uploadAsset,
    uploading,
  } = useRobloxAssets({
    search: search || undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  // Filter assets based on local filters (for mock data that doesn't filter server-side)
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      !search ||
      asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.description.toLowerCase().includes(search.toLowerCase()) ||
      asset.roblox_asset_id.includes(search);
    const matchesType = typeFilter === "all" || asset.asset_type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || asset.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const copyToClipboard = async (assetId: string, robloxId: string) => {
    try {
      await navigator.clipboard.writeText(robloxId);
      setCopiedId(assetId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDelete = async (asset: RobloxAsset) => {
    if (confirm(`Are you sure you want to delete "${asset.name}"?`)) {
      try {
        await deleteAsset(asset.id);
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  const handleRetry = async (asset: RobloxAsset) => {
    try {
      await retryAsset(asset.id);
    } catch (err) {
      console.error("Retry failed:", err);
    }
  };

  const getAssetTypeIcon = (type: AssetType) => {
    switch (type) {
      case "image":
        return <PhotoIcon className="w-5 h-5 text-blue-500" />;
      case "audio":
        return <MusicalNoteIcon className="w-5 h-5 text-purple-500" />;
      case "model":
        return <CubeIcon className="w-5 h-5 text-orange-500" />;
    }
  };

  const getStatusBadge = (status: AssetStatus) => {
    switch (status) {
      case "completed":
        return <StatusBadge status="success" label="Completed" />;
      case "failed":
        return <StatusBadge status="error" label="Failed" />;
      case "processing":
      case "uploading":
        return <StatusBadge status="warning" label={status} />;
      case "pending":
        return <StatusBadge status="info" label="Pending" />;
      default:
        return <StatusBadge status="info" label={status} />;
    }
  };

  const columns = [
    {
      key: "asset",
      header: "Asset",
      render: (asset: RobloxAsset) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gray-100">
            {getAssetTypeIcon(asset.asset_type)}
          </div>
          <div>
            <p className="font-medium text-slate-700">{asset.name}</p>
            <p className="text-xs text-slate-400 truncate max-w-[200px]">
              {asset.description || "No description"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "asset_type",
      header: "Type",
      sortable: true,
      render: (asset: RobloxAsset) => (
        <span className="capitalize text-slate-600">{asset.asset_type}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (asset: RobloxAsset) => getStatusBadge(asset.status),
    },
    {
      key: "roblox_asset_id",
      header: "Roblox ID",
      render: (asset: RobloxAsset) => (
        <div className="flex items-center gap-2">
          {asset.roblox_asset_id ? (
            <>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                {asset.roblox_asset_id}
              </code>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(asset.id, asset.roblox_asset_id);
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Copy to clipboard"
              >
                {copiedId === asset.id ? (
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                ) : (
                  <ClipboardDocumentIcon className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </>
          ) : (
            <span className="text-slate-400 text-sm">-</span>
          )}
        </div>
      ),
    },
    {
      key: "tags",
      header: "Tags",
      render: (asset: RobloxAsset) => (
        <div className="flex flex-wrap gap-1 max-w-[150px]">
          {asset.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
          {asset.tags.length > 3 && (
            <span className="text-xs text-slate-400">
              +{asset.tags.length - 3}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Date",
      sortable: true,
      render: (asset: RobloxAsset) => (
        <span className="text-slate-600 text-sm">
          {new Date(asset.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (asset: RobloxAsset) => (
        <div className="flex items-center gap-1">
          {asset.status === "failed" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRetry(asset);
              }}
              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
              title="Retry upload"
            >
              <ArrowPathRoundedSquareIcon className="w-4 h-4 text-blue-500" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(asset);
            }}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete asset"
          >
            <TrashIcon className="w-4 h-4 text-red-500" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <AdminHeader
        title="Roblox Assets"
        subtitle="Upload and manage assets for your Roblox games"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Assets"
          value={stats.total}
          icon={<ArchiveBoxIcon className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Images"
          value={stats.by_type.image}
          icon={<PhotoIconSolid className="w-6 h-6" />}
          color="cyan"
          subtitle={`${stats.by_type.image} decals`}
        />
        <StatCard
          title="Audio"
          value={stats.by_type.audio}
          icon={<MusicalNoteIconSolid className="w-6 h-6" />}
          color="purple"
          subtitle={`${stats.by_type.audio} sounds`}
        />
        <StatCard
          title="Models"
          value={stats.by_type.model}
          icon={<CubeIconSolid className="w-6 h-6" />}
          color="orange"
          subtitle={`${stats.by_type.model} 3D assets`}
        />
      </div>

      {/* Status Summary */}
      {stats.by_status.failed > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
          <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
          <span className="text-red-700">
            {stats.by_status.failed} asset{stats.by_status.failed > 1 ? "s" : ""}{" "}
            failed to upload. You can retry them individually.
          </span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search assets by name, description, or Roblox ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as AssetType | "all")}
              className="pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none bg-white"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="audio">Audio</option>
              <option value="model">Models</option>
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as AssetStatus | "all")
            }
            className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none bg-white"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>

          <button
            onClick={refetch}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <ArrowPathIcon className="w-5 h-5 text-gray-500" />
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-medium hover:from-blue-600 hover:to-violet-600 transition-all shadow-md"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700">
          {error}
        </div>
      )}

      {/* Results count */}
      <p className="text-sm text-slate-500 mb-4">
        {loading
          ? "Loading..."
          : `Showing ${filteredAssets.length} of ${assets.length} assets`}
      </p>

      {/* Assets Table */}
      <DataTable
        data={filteredAssets}
        columns={columns}
        loading={loading}
        emptyTitle="No assets found"
        emptyDescription="Upload your first asset to get started"
        keyExtractor={(asset) => asset.id}
        pageSize={10}
      />

      {/* Upload Modal */}
      <AssetUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={uploadAsset}
        uploading={uploading}
      />
    </>
  );
}
