"use client";

import { useState, useCallback, useRef } from "react";
import {
  XMarkIcon,
  ArrowUpTrayIcon,
  PhotoIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import RobloxAssetImage from "@/components/RobloxAssetImage";
import { ICON_VARIANTS, QuirkyverseIcons } from "@/types/quirkyverse";

interface IconEditModalProps {
  characterName: string;
  characterId: string;
  currentIcons: QuirkyverseIcons;
  onClose: () => void;
  onSave: (icons: QuirkyverseIcons) => Promise<void>;
}

interface IconUploadState {
  file: File | null;
  preview: string | null;
  aspectRatio: number | null;
  isUploading: boolean;
}

const ICON_LABELS: Record<string, string> = {
  BlackOutline: "Black Outline",
  NoOutline: "No Outline",
  OutlineOnly: "Outline Only",
  WhiteOutline: "White Outline",
};

export default function IconEditModal({
  characterName,
  characterId,
  currentIcons,
  onClose,
  onSave,
}: IconEditModalProps) {
  const [icons, setIcons] = useState<QuirkyverseIcons>({ ...currentIcons });
  const [uploads, setUploads] = useState<Record<string, IconUploadState>>(() =>
    ICON_VARIANTS.reduce(
      (acc, variant) => ({
        ...acc,
        [variant]: {
          file: null,
          preview: null,
          aspectRatio: null,
          isUploading: false,
        },
      }),
      {}
    )
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileSelect = useCallback(
    (variant: string, file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          setUploads((prev) => ({
            ...prev,
            [variant]: {
              file,
              preview: e.target?.result as string,
              aspectRatio,
              isUploading: false,
            },
          }));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const handleInputChange = useCallback(
    (variant: string, e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(variant, files[0]);
      }
    },
    [handleFileSelect]
  );

  const clearUpload = useCallback((variant: string) => {
    setUploads((prev) => ({
      ...prev,
      [variant]: {
        file: null,
        preview: null,
        aspectRatio: null,
        isUploading: false,
      },
    }));
    // Reset file input
    if (fileInputRefs.current[variant]) {
      fileInputRefs.current[variant]!.value = "";
    }
  }, []);

  const handleManualIdChange = useCallback((variant: string, value: string) => {
    const numValue = value ? parseInt(value, 10) : undefined;
    setIcons((prev) => ({
      ...prev,
      [variant]: numValue,
    }));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      // Process any uploads
      const updatedIcons: QuirkyverseIcons = { ...icons };

      for (const variant of ICON_VARIANTS) {
        const upload = uploads[variant];
        if (upload.file) {
          // Mark as uploading
          setUploads((prev) => ({
            ...prev,
            [variant]: { ...prev[variant], isUploading: true },
          }));

          // Upload to backend
          const formData = new FormData();
          formData.append("file", upload.file);
          formData.append("character_id", characterId);
          formData.append("icon_variant", variant);

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "https://api.whimco.com"}/api/v1/roblox-assets/`,
            {
              method: "POST",
              body: formData,
              credentials: "include",
            }
          );

          if (!response.ok) {
            throw new Error(`Failed to upload ${variant} icon`);
          }

          const result = await response.json();

          // Update icons with the returned asset ID
          updatedIcons[variant] = result.roblox_asset_id || result.asset_id;
          updatedIcons[`${variant}AspectRatio`] = upload.aspectRatio || 1;

          // Mark upload complete
          setUploads((prev) => ({
            ...prev,
            [variant]: { ...prev[variant], isUploading: false },
          }));
        }
      }

      // Save all icons
      await onSave(updatedIcons);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save icons");
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges =
    Object.values(uploads).some((u) => u.file !== null) ||
    JSON.stringify(icons) !== JSON.stringify(currentIcons);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-slate-700">Edit Icons</h2>
            <p className="text-sm text-slate-500">{characterName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-6">
            {ICON_VARIANTS.map((variant) => {
              const currentAssetId = icons[variant];
              const upload = uploads[variant];

              return (
                <div
                  key={variant}
                  className="border border-gray-200 rounded-xl p-4"
                >
                  <h3 className="font-medium text-slate-700 mb-3">
                    {ICON_LABELS[variant]}
                  </h3>

                  {/* Preview area */}
                  <div className="flex items-start gap-4 mb-4">
                    {/* Current icon */}
                    <div className="flex flex-col items-center">
                      <p className="text-xs text-slate-400 mb-2">Current</p>
                      {currentAssetId ? (
                        <RobloxAssetImage
                          assetId={currentAssetId}
                          size={150}
                          className="border border-gray-200"
                        />
                      ) : (
                        <div className="w-[80px] h-[80px] bg-gray-100 rounded-lg flex items-center justify-center">
                          <PhotoIcon className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                      {currentAssetId && (
                        <p className="text-xs text-slate-400 mt-1 font-mono">
                          {currentAssetId}
                        </p>
                      )}
                    </div>

                    {/* New upload preview */}
                    {upload.preview && (
                      <div className="flex flex-col items-center">
                        <p className="text-xs text-green-600 mb-2">New</p>
                        <div className="relative">
                          <img
                            src={upload.preview}
                            alt="New icon"
                            className="w-[80px] h-[80px] object-contain rounded-lg border-2 border-green-500"
                          />
                          <button
                            onClick={() => clearUpload(variant)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        </div>
                        {upload.aspectRatio && (
                          <p className="text-xs text-slate-400 mt-1">
                            AR: {upload.aspectRatio.toFixed(2)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Upload button */}
                  <div className="flex items-center gap-2">
                    <label
                      className={`
                        flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors
                        ${
                          upload.isUploading
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                        }
                      `}
                    >
                      <ArrowUpTrayIcon className="w-4 h-4" />
                      {upload.file ? "Replace" : "Upload"}
                      <input
                        ref={(el) => {
                          fileInputRefs.current[variant] = el;
                        }}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleInputChange(variant, e)}
                        disabled={upload.isUploading}
                        className="hidden"
                      />
                    </label>

                    {/* Manual asset ID input */}
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Or enter asset ID"
                        value={icons[variant]?.toString() || ""}
                        onChange={(e) =>
                          handleManualIdChange(variant, e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* Uploading indicator */}
                  {upload.isUploading && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-purple-600">
                      <div className="w-4 h-4 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                      Uploading...
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
          <p className="text-sm text-slate-400">
            {hasChanges
              ? "You have unsaved changes"
              : "No changes to save"}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl transition-colors
                ${
                  hasChanges && !isSaving
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }
              `}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckIcon className="w-5 h-5" />
                  Save Icons
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
