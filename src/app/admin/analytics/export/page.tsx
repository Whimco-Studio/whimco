"use client";

import { useState } from "react";
import {
  ArrowDownTrayIcon,
  DocumentTextIcon,
  TableCellsIcon,
  CalendarIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import AdminHeader from "../../../components/admin/AdminHeader";
import { useAnalytics } from "@/components/hooks/useAnalytics";

type ExportFormat = "csv" | "json";
type DateRange = "7d" | "30d" | "90d" | "all";
type DataType = "engagement" | "reach" | "posts" | "all";

export default function ExportPage() {
  const { engagementMetrics, serverReach, posts } = useAnalytics();
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [dataTypes, setDataTypes] = useState<DataType[]>(["all"]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleDataTypeChange = (type: DataType) => {
    if (type === "all") {
      setDataTypes(["all"]);
    } else {
      const newTypes = dataTypes.filter((t) => t !== "all");
      if (newTypes.includes(type)) {
        setDataTypes(newTypes.filter((t) => t !== type));
      } else {
        setDataTypes([...newTypes, type]);
      }
      if (newTypes.length === 0) {
        setDataTypes(["all"]);
      }
    }
  };

  const generateExport = () => {
    setIsExporting(true);
    setExportSuccess(false);

    // Simulate export delay
    setTimeout(() => {
      const exportData: Record<string, unknown> = {};

      if (dataTypes.includes("all") || dataTypes.includes("engagement")) {
        exportData.engagement = engagementMetrics;
      }
      if (dataTypes.includes("all") || dataTypes.includes("reach")) {
        exportData.serverReach = serverReach;
      }
      if (dataTypes.includes("all") || dataTypes.includes("posts")) {
        exportData.posts = posts;
      }

      let content: string;
      let filename: string;
      let mimeType: string;

      if (format === "json") {
        content = JSON.stringify(exportData, null, 2);
        filename = `whimco-analytics-${dateRange}.json`;
        mimeType = "application/json";
      } else {
        // Convert to CSV (simplified)
        const csvRows: string[] = [];

        if (exportData.engagement) {
          csvRows.push("=== Engagement Metrics ===");
          csvRows.push("Date,Views,Reactions,Comments,Shares");
          (exportData.engagement as typeof engagementMetrics).forEach((m) => {
            csvRows.push(`${m.date},${m.views},${m.reactions},${m.comments},${m.shares}`);
          });
          csvRows.push("");
        }

        if (exportData.serverReach) {
          csvRows.push("=== Server Reach ===");
          csvRows.push("Server,Members,Views,Reactions,Last Broadcast");
          (exportData.serverReach as typeof serverReach).forEach((s) => {
            csvRows.push(`"${s.serverName}",${s.members},${s.views},${s.reactions},${s.lastBroadcast}`);
          });
          csvRows.push("");
        }

        if (exportData.posts) {
          csvRows.push("=== Spotlight Posts ===");
          csvRows.push("Title,Created,Servers,Views,Reactions,Comments,Shares");
          (exportData.posts as typeof posts).forEach((p) => {
            csvRows.push(`"${p.title}",${p.createdAt},${p.servers},${p.totalViews},${p.totalReactions},${p.totalComments},${p.totalShares}`);
          });
        }

        content = csvRows.join("\n");
        filename = `whimco-analytics-${dateRange}.csv`;
        mimeType = "text/csv";
      }

      // Create and trigger download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsExporting(false);
      setExportSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => setExportSuccess(false), 3000);
    }, 1000);
  };

  return (
    <>
      <AdminHeader
        title="Export Data"
        subtitle="Download your analytics data in various formats"
      />

      <div className="max-w-2xl">
        {/* Format Selection */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-700 mb-4">Export Format</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setFormat("csv")}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                format === "csv"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  format === "csv"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <TableCellsIcon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-700">CSV</p>
                <p className="text-xs text-slate-400">Spreadsheet compatible</p>
              </div>
            </button>

            <button
              onClick={() => setFormat("json")}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                format === "json"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  format === "json"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <DocumentTextIcon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-700">JSON</p>
                <p className="text-xs text-slate-400">Developer friendly</p>
              </div>
            </button>
          </div>
        </div>

        {/* Date Range */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-700 mb-4">Date Range</h2>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>

        {/* Data Types */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-700 mb-4">Data to Export</h2>
          <div className="space-y-3">
            {[
              { id: "all", label: "All Data", description: "Export everything" },
              {
                id: "engagement",
                label: "Engagement Metrics",
                description: "Views, reactions, comments, shares",
              },
              {
                id: "reach",
                label: "Server Reach",
                description: "Server breakdown and member counts",
              },
              {
                id: "posts",
                label: "Spotlight Posts",
                description: "Post performance data",
              },
            ].map((option) => (
              <label
                key={option.id}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                  dataTypes.includes(option.id as DataType)
                    ? "bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={dataTypes.includes(option.id as DataType)}
                  onChange={() => handleDataTypeChange(option.id as DataType)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <div>
                  <p className="font-medium text-slate-700">{option.label}</p>
                  <p className="text-xs text-slate-400">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={generateExport}
          disabled={isExporting}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 text-lg font-medium text-white bg-gradient-to-r from-blue-500 to-violet-500 rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Exporting...
            </>
          ) : exportSuccess ? (
            <>
              <CheckCircleIcon className="w-6 h-6" />
              Export Complete!
            </>
          ) : (
            <>
              <ArrowDownTrayIcon className="w-6 h-6" />
              Export Data
            </>
          )}
        </button>

        {exportSuccess && (
          <p className="text-center text-sm text-emerald-600 mt-4">
            Your download should start automatically
          </p>
        )}
      </div>
    </>
  );
}
