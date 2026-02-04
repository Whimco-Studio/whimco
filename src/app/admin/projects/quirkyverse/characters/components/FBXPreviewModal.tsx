"use client";

import { useState, useCallback } from "react";
import { XMarkIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import FBXViewer from "@/components/three/FBXViewer";

interface FBXPreviewModalProps {
  characterName: string;
  animationName?: string;
  onClose: () => void;
}

export default function FBXPreviewModal({
  characterName,
  animationName,
  onClose,
}: FBXPreviewModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [modelStats, setModelStats] = useState<{
    vertices: number;
    triangles: number;
    animations: string[];
  } | null>(null);

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
        }
      }
    },
    []
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-slate-700">
              FBX Animation Preview
            </h2>
            <p className="text-sm text-slate-500">
              {characterName}
              {animationName && ` - ${animationName}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-hidden">
          {!selectedFile ? (
            // File drop zone
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                flex flex-col items-center justify-center h-[500px] border-2 border-dashed rounded-xl transition-colors
                ${
                  isDragging
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-300 hover:border-gray-400"
                }
              `}
            >
              <ArrowUpTrayIcon className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-lg font-medium text-slate-600 mb-2">
                Drop FBX file here
              </p>
              <p className="text-sm text-slate-400 mb-4">or</p>
              <label className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 cursor-pointer transition-colors">
                Browse Files
                <input
                  type="file"
                  accept=".fbx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-slate-400 mt-4">
                Supports .fbx files with embedded animations
              </p>
            </div>
          ) : (
            // FBX Viewer
            <div className="h-[500px]">
              <FBXViewer
                file={selectedFile}
                className="w-full h-full"
                showControls={true}
                onLoad={(stats) => setModelStats(stats)}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
          {selectedFile ? (
            <>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span>File: {selectedFile.name}</span>
                <span>
                  Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
                {modelStats && (
                  <span>Animations: {modelStats.animations.length}</span>
                )}
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Load Different File
              </button>
            </>
          ) : (
            <div className="text-sm text-slate-400">
              Select an FBX file to preview animations
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
