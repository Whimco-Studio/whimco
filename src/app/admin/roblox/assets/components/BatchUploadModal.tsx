"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  XMarkIcon,
  CloudArrowUpIcon,
  PhotoIcon,
  MusicalNoteIcon,
  CubeIcon,
  DocumentIcon,
  XCircleIcon,
  CheckCircleIcon,
  UserCircleIcon,
  UserGroupIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  AssetType,
  AssetUploadPayload,
  RobloxAsset,
  DestinationType,
} from "@/types/roblox-assets";
import { useRobloxConfig } from "@/components/hooks/useRobloxConfig";

interface BatchUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (payload: AssetUploadPayload) => Promise<RobloxAsset>;
}

interface FileItem {
  id: string;
  file: File;
  name: string;
  assetType: AssetType;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
  robloxAssetId?: string;
}

const ACCEPTED_FILES: Record<AssetType, string[]> = {
  image: [".png", ".jpg", ".jpeg", ".bmp", ".tga"],
  audio: [".mp3", ".ogg"],
  model: [".fbx"],
};

const ACCEPT_STRING = Object.values(ACCEPTED_FILES).flat().join(",");

export default function BatchUploadModal({
  isOpen,
  onClose,
  onUpload,
}: BatchUploadModalProps) {
  const { config } = useRobloxConfig();

  const [files, setFiles] = useState<FileItem[]>([]);
  const [tagsInput, setTagsInput] = useState("");
  const [destinationType, setDestinationType] =
    useState<DestinationType>("user");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize destination from config
  useEffect(() => {
    if (config) {
      setDestinationType(config.default_destination_type);
      if (config.default_group_id) {
        setSelectedGroupId(config.default_group_id);
      } else if (config.groups.length > 0) {
        setSelectedGroupId(config.groups[0].id);
      }
    }
  }, [config]);

  const resetForm = () => {
    setFiles([]);
    setTagsInput("");
    setIsUploading(false);
    setUploadProgress({ current: 0, total: 0 });
    if (config) {
      setDestinationType(config.default_destination_type);
      setSelectedGroupId(
        config.default_group_id || config.groups[0]?.id || ""
      );
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      resetForm();
      onClose();
    }
  };

  const detectAssetType = (filename: string): AssetType => {
    const ext = filename.toLowerCase().split(".").pop() || "";
    if (ACCEPTED_FILES.image.some((e) => e.slice(1) === ext)) return "image";
    if (ACCEPTED_FILES.audio.some((e) => e.slice(1) === ext)) return "audio";
    if (ACCEPTED_FILES.model.some((e) => e.slice(1) === ext)) return "model";
    return "image";
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const addFiles = useCallback((newFiles: FileList) => {
    const fileItems: FileItem[] = Array.from(newFiles).map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      name: file.name.replace(/\.[^/.]+$/, ""),
      assetType: detectAssetType(file.name),
      status: "pending" as const,
    }));
    setFiles((prev) => [...prev, ...fileItems]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      // Reset input so same files can be selected again
      e.target.value = "";
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const updateFileName = (id: string, newName: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name: newName } : f))
    );
  };

  const handleUploadAll = async () => {
    if (files.length === 0) return;

    // Validate destination
    if (destinationType === "group" && !selectedGroupId) {
      alert("Please select a group");
      return;
    }

    if (destinationType === "user" && !config?.roblox_user_id) {
      alert("User ID not configured. Please configure in Settings.");
      return;
    }

    setIsUploading(true);
    setUploadProgress({ current: 0, total: files.length });

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    // Upload files sequentially to avoid overwhelming the API
    for (let i = 0; i < files.length; i++) {
      const fileItem = files[i];

      // Skip already uploaded or errored files on retry
      if (fileItem.status === "success") {
        setUploadProgress((prev) => ({ ...prev, current: i + 1 }));
        continue;
      }

      // Update status to uploading
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id ? { ...f, status: "uploading", error: undefined } : f
        )
      );

      try {
        const result = await onUpload({
          name: fileItem.name.trim(),
          description: "",
          asset_type: fileItem.assetType,
          original_file: fileItem.file,
          tags,
          destination_type: destinationType,
          roblox_user_id:
            destinationType === "user" ? config?.roblox_user_id : undefined,
          roblox_group_id:
            destinationType === "group" ? selectedGroupId : undefined,
        });

        // Update status to success
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id
              ? { ...f, status: "success", robloxAssetId: result.roblox_asset_id }
              : f
          )
        );
      } catch (err) {
        // Update status to error
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id
              ? {
                  ...f,
                  status: "error",
                  error: err instanceof Error ? err.message : "Upload failed",
                }
              : f
          )
        );
      }

      setUploadProgress((prev) => ({ ...prev, current: i + 1 }));
    }

    setIsUploading(false);
  };

  const getFileIcon = (type: AssetType) => {
    switch (type) {
      case "image":
        return <PhotoIcon className="w-5 h-5 text-blue-500" />;
      case "audio":
        return <MusicalNoteIcon className="w-5 h-5 text-purple-500" />;
      case "model":
        return <CubeIcon className="w-5 h-5 text-orange-500" />;
      default:
        return <DocumentIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusIcon = (status: FileItem["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case "error":
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case "uploading":
        return (
          <svg
            className="animate-spin h-5 w-5 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const successCount = files.filter((f) => f.status === "success").length;
  const errorCount = files.filter((f) => f.status === "error").length;
  const allDone = files.length > 0 && pendingCount === 0 && !isUploading;

  if (!isOpen) return null;

  const groups = config?.groups || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                Batch Upload
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Upload multiple assets at once
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* File Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
                transition-all duration-200
                ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT_STRING}
                onChange={handleFileSelect}
                multiple
                className="hidden"
              />

              <div className="flex flex-col items-center gap-2">
                <CloudArrowUpIcon className="w-10 h-10 text-gray-400" />
                <div>
                  <p className="font-medium text-slate-700">
                    Drop files here or click to browse
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Select multiple files at once
                  </p>
                </div>
              </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-slate-700">
                    Files ({files.length})
                  </h3>
                  {!isUploading && (
                    <button
                      onClick={() => setFiles([])}
                      className="text-sm text-red-500 hover:text-red-600"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="max-h-[200px] overflow-y-auto space-y-2 border border-gray-200 rounded-xl p-2">
                  {files.map((fileItem) => (
                    <div
                      key={fileItem.id}
                      className={`
                        flex items-center gap-3 p-3 rounded-lg
                        ${
                          fileItem.status === "success"
                            ? "bg-green-50"
                            : fileItem.status === "error"
                            ? "bg-red-50"
                            : fileItem.status === "uploading"
                            ? "bg-blue-50"
                            : "bg-gray-50"
                        }
                      `}
                    >
                      {getFileIcon(fileItem.assetType)}

                      <div className="flex-1 min-w-0">
                        {fileItem.status === "pending" && !isUploading ? (
                          <input
                            type="text"
                            value={fileItem.name}
                            onChange={(e) =>
                              updateFileName(fileItem.id, e.target.value)
                            }
                            className="w-full px-2 py-1 text-sm text-slate-700 bg-white border border-gray-200 rounded focus:outline-none focus:border-blue-500"
                            placeholder="Asset name"
                          />
                        ) : (
                          <p className="font-medium text-slate-700 text-sm truncate">
                            {fileItem.name}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-slate-400">
                            {formatFileSize(fileItem.file.size)}
                          </p>
                          {fileItem.robloxAssetId && (
                            <code className="text-xs bg-white/50 px-1 rounded">
                              {fileItem.robloxAssetId}
                            </code>
                          )}
                          {fileItem.error && (
                            <p className="text-xs text-red-500">
                              {fileItem.error}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {getStatusIcon(fileItem.status)}
                        {fileItem.status === "pending" && !isUploading && (
                          <button
                            onClick={() => removeFile(fileItem.id)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <TrashIcon className="w-4 h-4 text-gray-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress Summary */}
                {(isUploading || allDone) && (
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-600">
                      Progress: {uploadProgress.current}/{uploadProgress.total}
                    </span>
                    {successCount > 0 && (
                      <span className="text-green-600">
                        {successCount} uploaded
                      </span>
                    )}
                    {errorCount > 0 && (
                      <span className="text-red-600">{errorCount} failed</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Destination Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Upload To
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDestinationType("user")}
                  disabled={isUploading}
                  className={`
                    flex items-center gap-3 p-3 rounded-xl border-2 transition-all
                    ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
                    ${
                      destinationType === "user"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }
                  `}
                >
                  <UserCircleIcon
                    className={`w-5 h-5 ${
                      destinationType === "user" ? "text-blue-500" : "text-gray-400"
                    }`}
                  />
                  <div className="text-left">
                    <p
                      className={`text-sm font-medium ${
                        destinationType === "user"
                          ? "text-blue-700"
                          : "text-gray-600"
                      }`}
                    >
                      Personal
                    </p>
                    <p className="text-xs text-gray-400">
                      {config?.roblox_username || "Your account"}
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setDestinationType("group")}
                  disabled={groups.length === 0 || isUploading}
                  className={`
                    flex items-center gap-3 p-3 rounded-xl border-2 transition-all
                    ${groups.length === 0 || isUploading ? "opacity-50 cursor-not-allowed" : ""}
                    ${
                      destinationType === "group"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }
                  `}
                >
                  <UserGroupIcon
                    className={`w-5 h-5 ${
                      destinationType === "group" ? "text-blue-500" : "text-gray-400"
                    }`}
                  />
                  <div className="text-left">
                    <p
                      className={`text-sm font-medium ${
                        destinationType === "group"
                          ? "text-blue-700"
                          : "text-gray-600"
                      }`}
                    >
                      Group
                    </p>
                    <p className="text-xs text-gray-400">
                      {groups.length === 0
                        ? "No groups"
                        : `${groups.length} group${groups.length > 1 ? "s" : ""}`}
                    </p>
                  </div>
                </button>
              </div>

              {/* Group Selector */}
              {destinationType === "group" && groups.length > 0 && (
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  disabled={isUploading}
                  className="mt-3 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none bg-white text-slate-700 disabled:opacity-50"
                >
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group.id})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Tags */}
            <div>
              <label
                htmlFor="batch-tags"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Tags (applied to all)
              </label>
              <input
                id="batch-tags"
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                disabled={isUploading}
                placeholder="character, icon, batch-upload"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-700 bg-white disabled:opacity-50"
              />
              <p className="text-xs text-slate-400 mt-1">
                Comma-separated tags applied to all uploaded assets
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-100">
            <div className="text-sm text-slate-500">
              {files.length === 0
                ? "No files selected"
                : `${files.length} file${files.length > 1 ? "s" : ""} ready`}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isUploading}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-slate-600 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {allDone ? "Close" : "Cancel"}
              </button>
              {!allDone && (
                <button
                  onClick={handleUploadAll}
                  disabled={isUploading || files.length === 0 || pendingCount === 0}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-medium hover:from-blue-600 hover:to-violet-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>
                        Uploading ({uploadProgress.current}/{uploadProgress.total})
                      </span>
                    </>
                  ) : (
                    <>
                      <CloudArrowUpIcon className="w-5 h-5" />
                      <span>Upload All ({pendingCount})</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
