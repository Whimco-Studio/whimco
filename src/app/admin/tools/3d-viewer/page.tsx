"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowUpTrayIcon,
  CubeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import AdminHeader from "@/app/components/admin/AdminHeader";
import FBXViewer from "@/components/three/FBXViewer";

interface ModelStats {
  vertices: number;
  triangles: number;
  animations: string[];
}

export default function ThreeDViewerPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [modelStats, setModelStats] = useState<ModelStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.toLowerCase().endsWith(".fbx")) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError("Please upload an FBX file");
      }
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.name.toLowerCase().endsWith(".fbx")) {
          setSelectedFile(file);
          setError(null);
        } else {
          setError("Please upload an FBX file");
        }
      }
    },
    []
  );

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setModelStats(null);
    setError(null);
  }, []);

  return (
    <>
      <AdminHeader
        title="3D Model Viewer"
        subtitle="Preview FBX models with animations"
      />

      {/* Back link */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Main content */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {!selectedFile ? (
          // File upload area
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              flex flex-col items-center justify-center min-h-[600px] border-2 border-dashed m-4 rounded-xl transition-colors
              ${
                isDragging
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-300 hover:border-gray-400"
              }
            `}
          >
            <CubeIcon className="w-20 h-20 text-gray-300 mb-6" />
            <h2 className="text-xl font-semibold text-slate-700 mb-2">
              Upload 3D Model
            </h2>
            <p className="text-slate-500 mb-6 text-center max-w-md">
              Drag and drop an FBX file here to preview it in 3D with animation
              playback controls
            </p>
            <label className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 cursor-pointer transition-colors">
              <ArrowUpTrayIcon className="w-5 h-5" />
              Choose FBX File
              <input
                type="file"
                accept=".fbx"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            <p className="text-xs text-slate-400 mt-4">
              Supported format: .fbx (Autodesk FBX)
            </p>

            {error && (
              <div className="mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>
        ) : (
          // 3D Viewer
          <div className="relative">
            {/* File info bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-100 border-b border-slate-200">
              <div className="flex items-center gap-4">
                <CubeIcon className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="font-medium text-slate-700">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    {modelStats && (
                      <>
                        {" "}
                        | {modelStats.vertices.toLocaleString()} vertices |{" "}
                        {modelStats.triangles.toLocaleString()} triangles |{" "}
                        {modelStats.animations.length} animation
                        {modelStats.animations.length !== 1 ? "s" : ""}
                      </>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={clearFile}
                className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
                Close
              </button>
            </div>

            {/* Viewer */}
            <div className="h-[600px]">
              <FBXViewer
                file={selectedFile}
                className="w-full h-full"
                showControls={true}
                onLoad={(stats) => setModelStats(stats)}
                onError={(err) => setError(err)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
        <h3 className="font-bold text-slate-700 mb-4">Viewer Controls</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="font-medium text-slate-700 mb-1">Rotate</p>
            <p className="text-slate-500">Left-click + drag</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="font-medium text-slate-700 mb-1">Pan</p>
            <p className="text-slate-500">Right-click + drag</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="font-medium text-slate-700 mb-1">Zoom</p>
            <p className="text-slate-500">Scroll wheel</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="font-medium text-slate-700 mb-1">Animations</p>
            <p className="text-slate-500">Use controls at bottom</p>
          </div>
        </div>
      </div>
    </>
  );
}
