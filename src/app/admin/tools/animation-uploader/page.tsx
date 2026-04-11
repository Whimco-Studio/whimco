"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationCircleIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import AdminHeader from "@/app/components/admin/AdminHeader";
import { robloxAssetsApi, robloxConfigApi } from "@/lib/api/roblox-assets";

interface QueuedAnimation {
  id: string;
  file: File;
  name: string;
  status: "pending" | "uploading" | "done" | "error";
  robloxAssetId?: string;
  error?: string;
}

interface UploadResult {
  name: string;
  robloxAssetId: string;
}

export default function AnimationUploaderPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<QueuedAnimation[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, label: "" });
  const [results, setResults] = useState<UploadResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [exportName, setExportName] = useState("AnimationExport");

  const addFiles = (files: FileList) => {
    const newFiles: QueuedAnimation[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.name.toLowerCase().endsWith(".fbx")) {
        newFiles.push({
          id: `${Date.now()}-${i}`,
          file,
          name: file.name.replace(/\.[^/.]+$/, ""),
          status: "pending",
        });
      }
    }
    if (newFiles.length > 0) {
      setQueue((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFromQueue = (id: string) => {
    setQueue((prev) => prev.filter((f) => f.id !== id));
  };

  const clearQueue = () => {
    setQueue([]);
    setResults([]);
    setError(null);
    setProgress({ current: 0, total: 0, label: "" });
  };

  const uploadAll = async () => {
    const pending = queue.filter((q) => q.status === "pending");
    if (pending.length === 0) return;

    setIsUploading(true);
    setError(null);
    setProgress({ current: 0, total: pending.length, label: "Fetching config..." });

    try {
      const config = await robloxConfigApi.get();
      if (!config.is_configured) {
        throw new Error("Roblox API is not configured. Go to Settings to set up your API key.");
      }

      const uploadResults: UploadResult[] = [...results];
      let uploaded = 0;

      for (const item of pending) {
        setProgress({
          current: uploaded,
          total: pending.length,
          label: `Uploading ${item.name}...`,
        });

        setQueue((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, status: "uploading" as const } : f))
        );

        try {
          const asset = await robloxAssetsApi.upload({
            name: item.name,
            asset_type: "animation",
            original_file: item.file,
            description: `Animation: ${item.name}`,
            tags: ["animation-uploader"],
            destination_type: config.default_destination_type,
            roblox_group_id: config.default_destination_type === "group" ? config.default_group_id : undefined,
            roblox_user_id: config.default_destination_type === "user" ? config.roblox_user_id : undefined,
          });

          if (asset.status === "failed") {
            throw new Error(asset.error_message || "Upload failed");
          }

          if (!asset.roblox_asset_id) {
            throw new Error(`No asset ID returned (status: ${asset.status})`);
          }

          setQueue((prev) =>
            prev.map((f) =>
              f.id === item.id
                ? { ...f, status: "done" as const, robloxAssetId: asset.roblox_asset_id }
                : f
            )
          );

          uploadResults.push({
            name: item.name,
            robloxAssetId: asset.roblox_asset_id,
          });

          uploaded++;
          setProgress({
            current: uploaded,
            total: pending.length,
            label: `Uploaded ${item.name} (${asset.roblox_asset_id})`,
          });
        } catch (err) {
          setQueue((prev) =>
            prev.map((f) =>
              f.id === item.id
                ? { ...f, status: "error" as const, error: err instanceof Error ? err.message : "Upload failed" }
                : f
            )
          );
          uploaded++;
        }
      }

      setResults(uploadResults);
      setProgress({
        current: pending.length,
        total: pending.length,
        label: `Done! ${uploadResults.length} animations uploaded.`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const generateJson = (): string => {
    const data: Record<string, number> = {};
    for (const r of results) {
      data[r.name] = parseInt(r.robloxAssetId);
    }
    return JSON.stringify(data, null, 4);
  };

  const generateLuaModule = (): string => {
    const entries = results
      .map((r) => `\t${r.name} = ${r.robloxAssetId},`)
      .join("\n");
    return `return {\n${entries}\n}`;
  };

  const generateRbxmx = (): string => {
    const makeReferent = () => {
      const hex = () => Math.random().toString(16).substring(2, 10);
      return `RBX${hex()}${hex()}${hex()}${hex()}`;
    };

    const luaSource = generateLuaModule();

    return `<roblox xmlns:xmime="http://www.w3.org/2005/05/xmlmime" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.roblox.com/roblox.xsd" version="4">
	<Meta name="ExplicitAutoJoints">true</Meta>
	<External>null</External>
	<External>nil</External>
	<Item class="ModuleScript" referent="${makeReferent()}">
		<Properties>
			<Content name="LinkedSource"><null></null></Content>
			<ProtectedString name="Source"><![CDATA[${luaSource}]]></ProtectedString>
			<string name="ScriptGuid">{${makeReferent()}}</string>
			<BinaryString name="AttributesSerialize"></BinaryString>
			<SecurityCapabilities name="Capabilities">0</SecurityCapabilities>
			<bool name="DefinesCapabilities">false</bool>
			<string name="Name">${exportName}</string>
			<int64 name="SourceAssetId">-1</int64>
			<BinaryString name="Tags"></BinaryString>
		</Properties>
	</Item>
</roblox>`;
  };

  const downloadJson = () => {
    const blob = new Blob([generateJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadRbxmx = () => {
    const blob = new Blob([generateRbxmx()], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportName}.rbxmx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadBoth = () => {
    downloadJson();
    setTimeout(() => downloadRbxmx(), 100);
  };

  const pendingCount = queue.filter((q) => q.status === "pending").length;
  const doneCount = queue.filter((q) => q.status === "done").length;
  const errorCount = queue.filter((q) => q.status === "error").length;

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <AdminHeader />

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/tools"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Animation Uploader</h1>
          <p className="text-slate-500 mt-1">
            Bulk upload FBX animations to Roblox and export asset IDs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-700">Animation Queue</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {queue.length === 0
                      ? "Add FBX animation files to upload"
                      : `${queue.length} files | ${pendingCount} pending | ${doneCount} done${errorCount > 0 ? ` | ${errorCount} failed` : ""}`}
                  </p>
                </div>
                <label className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 cursor-pointer transition-colors text-sm font-medium">
                  Add Files
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".fbx"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) addFiles(e.target.files);
                      e.target.value = "";
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Export Name */}
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                <span className="text-xs text-slate-500">Export Name:</span>
                <input
                  type="text"
                  value={exportName}
                  onChange={(e) => setExportName(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-slate-700"
                  placeholder="AnimationExport"
                />
              </div>

              {queue.length > 0 ? (
                <>
                  <div className="p-4 space-y-1.5 max-h-[500px] overflow-y-auto">
                    {queue.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${
                          item.status === "uploading"
                            ? "bg-blue-50 border-blue-200"
                            : item.status === "done"
                            ? "bg-green-50 border-green-200"
                            : item.status === "error"
                            ? "bg-red-50 border-red-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {item.status === "uploading" ? (
                            <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                          ) : item.status === "done" ? (
                            <CheckIcon className="w-4 h-4 text-green-600" />
                          ) : item.status === "error" ? (
                            <ExclamationCircleIcon className="w-4 h-4 text-red-600" />
                          ) : (
                            <PlayIcon className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-700 truncate">{item.name}</p>
                          {item.robloxAssetId && (
                            <p className="text-xs text-green-600">{item.robloxAssetId}</p>
                          )}
                          {item.error && (
                            <p className="text-xs text-red-600">{item.error}</p>
                          )}
                        </div>
                        {item.status === "pending" && !isUploading && (
                          <button
                            type="button"
                            onClick={() => removeFromQueue(item.id)}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  {isUploading && progress.total > 0 && (
                    <div className="px-4 py-3 border-t border-gray-100">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-purple-600 h-full transition-all duration-300"
                            style={{ width: `${(progress.current / progress.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-600 flex-shrink-0">
                          {progress.current} / {progress.total}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{progress.label}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="p-4 border-t border-gray-100 flex items-center gap-3">
                    {isUploading ? (
                      <div className="flex-1 flex items-center gap-2 text-sm text-slate-600">
                        <div className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                        Uploading...
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={uploadAll}
                          disabled={pendingCount === 0}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-colors"
                        >
                          <CloudArrowUpIcon className="w-5 h-5" />
                          Upload {pendingCount} Animation{pendingCount !== 1 ? "s" : ""}
                        </button>
                        <button
                          type="button"
                          onClick={clearQueue}
                          className="px-4 py-3 text-slate-600 hover:text-red-600 transition-colors text-sm"
                        >
                          Clear
                        </button>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div
                  className="p-12 text-center text-slate-400 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <PlayIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium">Drop FBX files or click to browse</p>
                  <p className="text-xs mt-1">Supports bulk selection</p>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Status message when done */}
            {!isUploading && progress.label && results.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm text-green-700">{progress.label}</p>
              </div>
            )}
          </div>

          {/* Export Panel */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-slate-700">Export</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {results.length === 0
                    ? "Upload animations to export asset IDs"
                    : `${results.length} animation${results.length !== 1 ? "s" : ""} ready`}
                </p>
              </div>

              {results.length > 0 ? (
                <>
                  <div className="p-4 space-y-2">
                    <button
                      type="button"
                      onClick={downloadBoth}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors"
                    >
                      <ArrowDownTrayIcon className="w-5 h-5" />
                      Download JSON + RBXMX
                    </button>
                    <button
                      type="button"
                      onClick={downloadJson}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-slate-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      JSON Only
                    </button>
                    <button
                      type="button"
                      onClick={downloadRbxmx}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-slate-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      RBXMX Only
                    </button>
                  </div>

                  {/* Preview */}
                  <div className="p-4 border-t border-gray-100">
                    <p className="text-xs text-slate-500 mb-2">Lua Module Preview:</p>
                    <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto max-h-[300px] overflow-y-auto">
                      {generateLuaModule()}
                    </pre>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-slate-400">
                  <ArrowDownTrayIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No results yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
