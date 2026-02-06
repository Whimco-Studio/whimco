"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import AdminHeader from "@/app/components/admin/AdminHeader";
import JSZip from "jszip";

type FaceId = "Ft" | "Bk" | "Lf" | "Rt" | "Up" | "Dn";

interface FaceConfig {
  id: FaceId;
  label: string;
  suffix: string;
}

interface GeneratedFace {
  id: FaceId;
  label: string;
  suffix: string;
  blob: Blob | null;
  preview: string | null;
}

const FACES: FaceConfig[] = [
  { id: "Ft", label: "Front", suffix: "SkyboxFt" },
  { id: "Bk", label: "Back", suffix: "SkyboxBk" },
  { id: "Lf", label: "Left", suffix: "SkyboxLf" },
  { id: "Rt", label: "Right", suffix: "SkyboxRt" },
  { id: "Up", label: "Up", suffix: "SkyboxUp" },
  { id: "Dn", label: "Down", suffix: "SkyboxDn" },
];

const FACE_SIZES = [512, 1024, 2048, 4096];

// Bilinear interpolation sample from source image
function sampleBilinear(
  srcData: Uint8ClampedArray,
  srcW: number,
  srcH: number,
  u: number,
  v: number
): [number, number, number, number] {
  // Wrap u horizontally for seamless panning
  u = ((u % 1) + 1) % 1;
  // Clamp v vertically
  v = Math.max(0, Math.min(1, v));

  const x = u * (srcW - 1);
  const y = v * (srcH - 1);

  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = (x0 + 1) % srcW; // wrap horizontally
  const y1 = Math.min(y0 + 1, srcH - 1);

  const fx = x - x0;
  const fy = y - y0;

  const w00 = (1 - fx) * (1 - fy);
  const w10 = fx * (1 - fy);
  const w01 = (1 - fx) * fy;
  const w11 = fx * fy;

  const i00 = (y0 * srcW + x0) * 4;
  const i10 = (y0 * srcW + x1) * 4;
  const i01 = (y1 * srcW + x0) * 4;
  const i11 = (y1 * srcW + x1) * 4;

  return [
    srcData[i00] * w00 + srcData[i10] * w10 + srcData[i01] * w01 + srcData[i11] * w11,
    srcData[i00 + 1] * w00 + srcData[i10 + 1] * w10 + srcData[i01 + 1] * w01 + srcData[i11 + 1] * w11,
    srcData[i00 + 2] * w00 + srcData[i10 + 2] * w10 + srcData[i01 + 2] * w01 + srcData[i11 + 2] * w11,
    255,
  ];
}

// Generate a single cube face from an equirectangular panoramic image
function renderCubeFace(
  faceId: FaceId,
  srcData: Uint8ClampedArray,
  srcW: number,
  srcH: number,
  faceSize: number
): ImageData {
  const out = new ImageData(faceSize, faceSize);
  const data = out.data;

  for (let y = 0; y < faceSize; y++) {
    for (let x = 0; x < faceSize; x++) {
      // Normalize pixel to [-1, 1]
      const nx = (2 * (x + 0.5)) / faceSize - 1;
      const ny = (2 * (y + 0.5)) / faceSize - 1;

      // Compute 3D direction based on face
      let dx: number, dy: number, dz: number;
      switch (faceId) {
        case "Ft": // +Z
          dx = nx;
          dy = -ny;
          dz = 1;
          break;
        case "Bk": // -Z
          dx = -nx;
          dy = -ny;
          dz = -1;
          break;
        case "Lf": // -X
          dx = -1;
          dy = -ny;
          dz = nx;
          break;
        case "Rt": // +X
          dx = 1;
          dy = -ny;
          dz = -nx;
          break;
        case "Up": // +Y
          dx = nx;
          dy = 1;
          dz = ny;
          break;
        case "Dn": // -Y
          dx = nx;
          dy = -1;
          dz = -ny;
          break;
      }

      // Convert to spherical coordinates
      const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
      dx /= len;
      dy /= len;
      dz /= len;

      const lon = Math.atan2(dz, dx); // [-PI, PI]
      const lat = Math.asin(dy); // [-PI/2, PI/2]

      // Map to equirectangular UV
      const u = (lon / (2 * Math.PI)) + 0.5;
      const v = 0.5 - lat / Math.PI;

      const [r, g, b, a] = sampleBilinear(srcData, srcW, srcH, u, v);

      const idx = (y * faceSize + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = a;
    }
  }

  return out;
}

// Apply Roblox-specific post-processing to a face canvas
function postProcessForRoblox(
  canvas: HTMLCanvasElement,
  faceId: FaceId
): HTMLCanvasElement {
  const size = canvas.width;
  const result = document.createElement("canvas");
  result.width = size;
  result.height = size;
  const ctx = result.getContext("2d")!;

  // All faces get 180-degree rotation
  ctx.translate(size / 2, size / 2);
  ctx.rotate(Math.PI);

  // Additional transforms per face
  switch (faceId) {
    case "Rt":
      // Horizontal flip
      ctx.scale(-1, 1);
      break;
    case "Up":
      // +90 degree rotation (total = 180 + 90 = 270)
      ctx.rotate(Math.PI / 2);
      break;
    case "Dn":
      // -90 degree rotation (total = 180 - 90 = 90)
      ctx.rotate(-Math.PI / 2);
      break;
  }

  ctx.drawImage(canvas, -size / 2, -size / 2);
  return result;
}

export default function SkyboxConverterPage() {
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [aspectWarning, setAspectWarning] = useState(false);
  const [assetName, setAssetName] = useState("Skybox");
  const [faceSize, setFaceSize] = useState(1024);
  const [faces, setFaces] = useState<GeneratedFace[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setSourceImage(img);
      setSourcePreview(url);
      setFaces([]);

      // Check aspect ratio (~2:1 for equirectangular)
      const ratio = img.width / img.height;
      setAspectWarning(ratio < 1.8 || ratio > 2.2);

      // Default asset name from file name
      const name = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
      if (name) setAssetName(name);
    };
    img.src = url;
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const convert = useCallback(async () => {
    if (!sourceImage) return;

    setProcessing(true);
    setFaces([]);

    // Draw source image to canvas to get pixel data
    const srcCanvas = document.createElement("canvas");
    srcCanvas.width = sourceImage.naturalWidth;
    srcCanvas.height = sourceImage.naturalHeight;
    const srcCtx = srcCanvas.getContext("2d")!;
    srcCtx.drawImage(sourceImage, 0, 0);
    const srcData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height).data;
    const srcW = srcCanvas.width;
    const srcH = srcCanvas.height;

    const results: GeneratedFace[] = [];

    for (let i = 0; i < FACES.length; i++) {
      const face = FACES[i];
      setProgressText(`Processing face ${i + 1} of 6: ${face.label}...`);

      // Yield to UI
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Render the cube face
      const imageData = renderCubeFace(face.id, srcData, srcW, srcH, faceSize);

      // Draw to canvas
      const faceCanvas = document.createElement("canvas");
      faceCanvas.width = faceSize;
      faceCanvas.height = faceSize;
      const faceCtx = faceCanvas.getContext("2d")!;
      faceCtx.putImageData(imageData, 0, 0);

      // Post-process for Roblox orientation
      const processed = postProcessForRoblox(faceCanvas, face.id);

      // Convert to blob
      const blob = await new Promise<Blob | null>((resolve) =>
        processed.toBlob((b) => resolve(b), "image/png")
      );

      const preview = processed.toDataURL("image/png");

      results.push({
        id: face.id,
        label: face.label,
        suffix: face.suffix,
        blob,
        preview,
      });

      // Update incrementally so user sees progress
      setFaces([...results]);
    }

    setProcessing(false);
    setProgressText("");
  }, [sourceImage, faceSize]);

  const downloadFace = useCallback(
    (face: GeneratedFace) => {
      if (!face.blob) return;
      const url = URL.createObjectURL(face.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${assetName}_${face.suffix}.png`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [assetName]
  );

  const downloadAllZip = useCallback(async () => {
    if (faces.length === 0) return;

    const zip = new JSZip();
    for (const face of faces) {
      if (face.blob) {
        zip.file(`${face.suffix}.png`, face.blob);
      }
    }

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${assetName}_faces.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }, [faces, assetName]);

  return (
    <>
      <AdminHeader
        title="Skybox Converter"
        subtitle="Convert panoramic images to Roblox skybox faces"
      />

      {/* Back link */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="space-y-6">
        {/* Upload Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
            transition-all duration-200
            ${
              isDragOver
                ? "border-blue-400 bg-blue-50/50"
                : sourcePreview
                ? "border-slate-200 bg-white/60"
                : "border-slate-300 bg-white/40 hover:border-blue-300 hover:bg-blue-50/30"
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileInput}
            className="hidden"
          />

          {sourcePreview ? (
            <div className="space-y-3">
              <img
                src={sourcePreview}
                alt="Source panorama"
                className="max-h-48 mx-auto rounded-lg shadow-md"
              />
              <p className="text-sm text-slate-500">
                {sourceImage!.naturalWidth} x {sourceImage!.naturalHeight}
                {" | "}Click or drag to replace
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <PhotoIcon className="w-12 h-12 mx-auto text-slate-400" />
              <div>
                <p className="text-slate-700 font-medium">
                  Drop a panoramic image here
                </p>
                <p className="text-sm text-slate-500">
                  Equirectangular (2:1 ratio) JPG, PNG, or WebP
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Aspect ratio warning */}
        {aspectWarning && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                Aspect ratio warning
              </p>
              <p className="text-sm text-amber-700">
                This image doesn&apos;t appear to be 2:1 (equirectangular). The
                conversion may produce distorted results.
              </p>
            </div>
          </div>
        )}

        {/* Settings */}
        {sourceImage && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/30 shadow-sm">
            {/* Asset Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Asset Name
              </label>
              <input
                type="text"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300"
                placeholder="Skybox"
              />
              <p className="mt-1 text-xs text-slate-400">
                Used for file naming: {assetName}_SkyboxFt.png
              </p>
            </div>

            {/* Face Size */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Face Size
              </label>
              <div className="flex gap-2">
                {FACE_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setFaceSize(size)}
                    className={`
                      flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${
                        faceSize === size
                          ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-md"
                          : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
                      }
                    `}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {faceSize}x{faceSize} pixels per face
              </p>
            </div>
          </div>
        )}

        {/* Convert Button */}
        {sourceImage && (
          <div className="flex items-center gap-4">
            <button
              onClick={convert}
              disabled={processing}
              className={`
                px-6 py-3 rounded-xl font-medium text-sm transition-all
                ${
                  processing
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
                }
              `}
            >
              {processing ? "Converting..." : "Convert to Skybox Faces"}
            </button>

            {processing && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-slate-600">{progressText}</span>
              </div>
            )}

            {faces.length === 6 && !processing && (
              <button
                onClick={downloadAllZip}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                Download All as ZIP
              </button>
            )}
          </div>
        )}

        {/* Face Preview Grid */}
        {faces.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Generated Faces
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {faces.map((face) => (
                <div
                  key={face.id}
                  className="group relative rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all"
                >
                  {face.preview && (
                    <img
                      src={face.preview}
                      alt={face.label}
                      className="w-full aspect-square object-cover"
                    />
                  )}

                  {/* Label overlay */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="text-xs font-medium text-white">
                      {face.label}{" "}
                      <span className="text-white/70">({face.suffix})</span>
                    </p>
                  </div>

                  {/* Download button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadFace(face);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/80 backdrop-blur-sm text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-blue-600"
                    title={`Download ${face.suffix}`}
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
