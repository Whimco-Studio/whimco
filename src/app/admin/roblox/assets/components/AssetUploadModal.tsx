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
} from "@heroicons/react/24/outline";
import { AssetType, AssetUploadPayload, RobloxAsset, DestinationType, RobloxGroup } from "@/types/roblox-assets";
import { useRobloxConfig } from "@/components/hooks/useRobloxConfig";

interface AssetUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (payload: AssetUploadPayload) => Promise<RobloxAsset>;
  uploading: boolean;
}

const ACCEPTED_FILES: Record<AssetType, string[]> = {
  image: [".png", ".jpg", ".jpeg", ".bmp", ".tga"],
  audio: [".mp3", ".ogg"],
  model: [".fbx"],
};

const ACCEPT_STRING = Object.values(ACCEPTED_FILES).flat().join(",");

export default function AssetUploadModal({
  isOpen,
  onClose,
  onUpload,
  uploading,
}: AssetUploadModalProps) {
  const { config } = useRobloxConfig();

  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [assetType, setAssetType] = useState<AssetType>("image");
  const [tagsInput, setTagsInput] = useState("");
  const [destinationType, setDestinationType] = useState<DestinationType>("user");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
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
    setFile(null);
    setName("");
    setDescription("");
    setAssetType("image");
    setTagsInput("");
    setUploadStatus("idle");
    setErrorMessage("");
    // Reset destination to defaults
    if (config) {
      setDestinationType(config.default_destination_type);
      setSelectedGroupId(config.default_group_id || (config.groups[0]?.id || ""));
    }
  };

  const handleClose = () => {
    if (!uploading) {
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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      setAssetType(detectAssetType(droppedFile.name));
      if (!name) {
        const defaultName = droppedFile.name.replace(/\.[^/.]+$/, "");
        setName(defaultName);
      }
    }
  }, [name]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setAssetType(detectAssetType(selectedFile.name));
      if (!name) {
        const defaultName = selectedFile.name.replace(/\.[^/.]+$/, "");
        setName(defaultName);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !name.trim()) {
      setErrorMessage("Please select a file and enter a name");
      return;
    }

    // Validate destination
    if (destinationType === "group" && !selectedGroupId) {
      setErrorMessage("Please select a group");
      return;
    }

    if (destinationType === "user" && !config?.roblox_user_id) {
      setErrorMessage("User ID not configured. Please configure in Settings.");
      return;
    }

    setUploadStatus("idle");
    setErrorMessage("");

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    try {
      await onUpload({
        name: name.trim(),
        description: description.trim(),
        asset_type: assetType,
        original_file: file,
        tags,
        destination_type: destinationType,
        roblox_user_id: destinationType === "user" ? config?.roblox_user_id : undefined,
        roblox_group_id: destinationType === "group" ? selectedGroupId : undefined,
      });

      setUploadStatus("success");

      setTimeout(() => {
        resetForm();
        onClose();
      }, 1500);
    } catch (err) {
      setUploadStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const getFileIcon = () => {
    if (!file) return <CloudArrowUpIcon className="w-12 h-12 text-gray-400" />;

    switch (assetType) {
      case "image":
        return <PhotoIcon className="w-12 h-12 text-blue-500" />;
      case "audio":
        return <MusicalNoteIcon className="w-12 h-12 text-purple-500" />;
      case "model":
        return <CubeIcon className="w-12 h-12 text-orange-500" />;
      default:
        return <DocumentIcon className="w-12 h-12 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

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
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-slate-800">
              Upload Asset
            </h2>
            <button
              onClick={handleClose}
              disabled={uploading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
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
                    : file
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT_STRING}
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="flex flex-col items-center gap-2">
                {getFileIcon()}

                {file ? (
                  <div>
                    <p className="font-medium text-slate-700">{file.name}</p>
                    <p className="text-sm text-slate-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-slate-700">
                      Drop your file here or click to browse
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      Supports PNG, JPG, MP3, OGG, FBX (max 50MB)
                    </p>
                  </div>
                )}

                {file && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Remove file
                  </button>
                )}
              </div>
            </div>

            {/* Destination Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Upload To
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDestinationType("user")}
                  className={`
                    flex items-center gap-3 p-3 rounded-xl border-2 transition-all
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
                    <p className={`text-sm font-medium ${destinationType === "user" ? "text-blue-700" : "text-gray-600"}`}>
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
                  disabled={groups.length === 0}
                  className={`
                    flex items-center gap-3 p-3 rounded-xl border-2 transition-all
                    ${groups.length === 0 ? "opacity-50 cursor-not-allowed" : ""}
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
                    <p className={`text-sm font-medium ${destinationType === "group" ? "text-blue-700" : "text-gray-600"}`}>
                      Group
                    </p>
                    <p className="text-xs text-gray-400">
                      {groups.length === 0 ? "No groups" : `${groups.length} group${groups.length > 1 ? "s" : ""}`}
                    </p>
                  </div>
                </button>
              </div>

              {/* Group Selector */}
              {destinationType === "group" && groups.length > 0 && (
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="mt-3 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none bg-white text-slate-700"
                >
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group.id})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Asset Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Asset Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["image", "audio", "model"] as AssetType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setAssetType(type)}
                    className={`
                      flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all
                      ${
                        assetType === type
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                  >
                    {type === "image" && (
                      <PhotoIcon
                        className={`w-5 h-5 ${
                          assetType === type ? "text-blue-500" : "text-gray-400"
                        }`}
                      />
                    )}
                    {type === "audio" && (
                      <MusicalNoteIcon
                        className={`w-5 h-5 ${
                          assetType === type ? "text-blue-500" : "text-gray-400"
                        }`}
                      />
                    )}
                    {type === "model" && (
                      <CubeIcon
                        className={`w-5 h-5 ${
                          assetType === type ? "text-blue-500" : "text-gray-400"
                        }`}
                      />
                    )}
                    <span
                      className={`text-xs capitalize ${
                        assetType === type ? "text-blue-700" : "text-gray-600"
                      }`}
                    >
                      {type}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter asset name"
                maxLength={50}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-700 bg-white"
                required
              />
              <p className="text-xs text-slate-400 mt-1">
                {name.length}/50 characters
              </p>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a description (optional)"
                rows={2}
                maxLength={1000}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none text-slate-700 bg-white"
              />
            </div>

            {/* Tags */}
            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Tags
              </label>
              <input
                id="tags"
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="character, icon, quirkyverse"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-700 bg-white"
              />
              <p className="text-xs text-slate-400 mt-1">
                Comma-separated tags for searching
              </p>
            </div>

            {/* Status Messages */}
            {uploadStatus === "success" && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl text-green-700">
                <CheckCircleIcon className="w-5 h-5" />
                <span>Asset uploaded successfully!</span>
              </div>
            )}

            {(uploadStatus === "error" || errorMessage) && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700">
                <XCircleIcon className="w-5 h-5" />
                <span>{errorMessage || "Upload failed. Please try again."}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={uploading}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-slate-600 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || !file || !name.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-medium hover:from-blue-600 hover:to-violet-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading ? (
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
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="w-5 h-5" />
                    <span>Upload</span>
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
