"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import { FBXLoader } from "three-stdlib";
import {
  XMarkIcon,
  CameraIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  SunIcon,
  MoonIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

interface IconGeneratorModalProps {
  characterName: string;
  onClose: () => void;
  onSave: (icons: GeneratedIcons) => Promise<void>;
}

interface GeneratedIcons {
  BlackOutline?: number;
  BlackOutlineAspectRatio?: number;
  NoOutline?: number;
  NoOutlineAspectRatio?: number;
  OutlineOnly?: number;
  OutlineOnlyAspectRatio?: number;
  WhiteOutline?: number;
  WhiteOutlineAspectRatio?: number;
}

interface CapturedVariant {
  name: string;
  key: keyof GeneratedIcons;
  aspectRatioKey: keyof GeneratedIcons;
  blob: Blob | null;
  preview: string | null;
  uploading: boolean;
  uploaded: boolean;
  assetId?: number;
  error?: string;
}

const CAMERA_ANGLES = [
  { name: "Front", position: [0, 50, 150], icon: "⬆️" },
  { name: "Back", position: [0, 50, -150], icon: "⬇️" },
  { name: "Left", position: [-150, 50, 0], icon: "⬅️" },
  { name: "Right", position: [150, 50, 0], icon: "➡️" },
  { name: "Top", position: [0, 200, 0.1], icon: "🔝" },
  { name: "3/4 Front Left", position: [-100, 80, 100], icon: "↖️" },
  { name: "3/4 Front Right", position: [100, 80, 100], icon: "↗️" },
  { name: "3/4 Back Left", position: [-100, 80, -100], icon: "↙️" },
  { name: "3/4 Back Right", position: [100, 80, -100], icon: "↘️" },
];

const VARIANT_CONFIG: Array<{
  name: string;
  key: keyof GeneratedIcons;
  aspectRatioKey: keyof GeneratedIcons;
  outlineColor: string | null;
  showModel: boolean;
}> = [
  {
    name: "No Outline",
    key: "NoOutline",
    aspectRatioKey: "NoOutlineAspectRatio",
    outlineColor: null,
    showModel: true,
  },
  {
    name: "Black Outline",
    key: "BlackOutline",
    aspectRatioKey: "BlackOutlineAspectRatio",
    outlineColor: "#000000",
    showModel: true,
  },
  {
    name: "White Outline",
    key: "WhiteOutline",
    aspectRatioKey: "WhiteOutlineAspectRatio",
    outlineColor: "#ffffff",
    showModel: true,
  },
  {
    name: "Outline Only",
    key: "OutlineOnly",
    aspectRatioKey: "OutlineOnlyAspectRatio",
    outlineColor: "#000000",
    showModel: false,
  },
];

type LightingMode = "lit" | "unlit" | "soft" | "dramatic";

const LIGHTING_MODES: Array<{
  id: LightingMode;
  label: string;
  description: string;
  icon: string;
}> = [
  { id: "lit", label: "Standard", description: "Default lighting", icon: "sun" },
  { id: "unlit", label: "Base Color", description: "Flat colors, no shading", icon: "moon" },
  { id: "soft", label: "Soft", description: "High ambient, soft shadows", icon: "sparkles" },
  { id: "dramatic", label: "Dramatic", description: "Strong directional light", icon: "sun" },
];

export default function IconGeneratorModal({
  characterName,
  onClose,
  onSave,
}: IconGeneratorModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const gridRef = useRef<THREE.GridHelper | null>(null);
  const frameIdRef = useRef<number>(0);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const directionalLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);
  const originalMaterialsRef = useRef<Map<THREE.Mesh, THREE.Material | THREE.Material[]>>(new Map());

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [variants, setVariants] = useState<CapturedVariant[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lightingMode, setLightingMode] = useState<LightingMode>("lit");
  const [strokeWidth, setStrokeWidth] = useState(4);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(100, 80, 100);
    cameraRef.current = camera;

    // Renderer - enable alpha for transparent captures
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 50, 0);
    controls.update();
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 200, 100);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    directionalLightRef.current = directionalLight;

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-100, 100, -100);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    // Grid
    const gridHelper = new THREE.GridHelper(200, 20, 0xcccccc, 0xdddddd);
    scene.add(gridHelper);
    gridRef.current = gridHelper;

    // Animation loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frameIdRef.current);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Load FBX model
  const loadModel = useCallback(async (file: File) => {
    if (!sceneRef.current) return;

    setIsLoading(true);
    setError(null);
    setModelLoaded(false);

    // Remove existing model
    if (modelRef.current) {
      sceneRef.current.remove(modelRef.current);
      modelRef.current = null;
    }

    const loader = new FBXLoader();

    try {
      const arrayBuffer = await file.arrayBuffer();
      const object = loader.parse(arrayBuffer, "");

      // Center and scale model
      const box = new THREE.Box3().setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 100 / maxDim;

      object.scale.multiplyScalar(scale);
      object.position.sub(center.multiplyScalar(scale));
      object.position.y = 0;

      // Store original materials and enable shadows
      originalMaterialsRef.current.clear();
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          originalMaterialsRef.current.set(child, child.material);
        }
      });

      sceneRef.current.add(object);
      modelRef.current = object;
      setModelLoaded(true);
      setLightingMode("lit");

      // Reset camera
      if (cameraRef.current && controlsRef.current) {
        cameraRef.current.position.set(100, 80, 100);
        controlsRef.current.target.set(0, 40, 0);
        controlsRef.current.update();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load model");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.toLowerCase().endsWith(".fbx")) {
        setSelectedFile(file);
        loadModel(file);
        setVariants([]);
      } else {
        setError("Please select an FBX file");
      }
    }
  };

  // Snap camera to angle
  const snapToAngle = (position: number[]) => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(position[0], position[1], position[2]);
      controlsRef.current.target.set(0, 40, 0);
      controlsRef.current.update();
    }
  };

  // Apply lighting mode
  const applyLightingMode = useCallback((mode: LightingMode) => {
    const model = modelRef.current;
    const ambientLight = ambientLightRef.current;
    const directionalLight = directionalLightRef.current;
    const fillLight = fillLightRef.current;

    if (!model || !ambientLight || !directionalLight || !fillLight) return;

    // Restore original materials first
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const original = originalMaterialsRef.current.get(child);
        if (original) {
          child.material = original;
        }
      }
    });

    switch (mode) {
      case "lit":
        ambientLight.intensity = 0.7;
        directionalLight.intensity = 0.8;
        fillLight.intensity = 0.4;
        break;

      case "unlit":
        ambientLight.intensity = 1;
        directionalLight.intensity = 0;
        fillLight.intensity = 0;

        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const originalMat = originalMaterialsRef.current.get(child);
            if (originalMat && !Array.isArray(originalMat)) {
              let color = new THREE.Color(0xcccccc);
              if ('color' in originalMat && originalMat.color instanceof THREE.Color) {
                color = originalMat.color.clone();
              }
              let map: THREE.Texture | null = null;
              if ('map' in originalMat && originalMat.map instanceof THREE.Texture) {
                map = originalMat.map;
              }
              const unlitMat = new THREE.MeshBasicMaterial({
                color: map ? 0xffffff : color,
                map: map,
              });
              child.material = unlitMat;
            } else if (originalMat && Array.isArray(originalMat)) {
              child.material = originalMat.map((mat) => {
                let color = new THREE.Color(0xcccccc);
                if ('color' in mat && mat.color instanceof THREE.Color) {
                  color = mat.color.clone();
                }
                let map: THREE.Texture | null = null;
                if ('map' in mat && mat.map instanceof THREE.Texture) {
                  map = mat.map;
                }
                return new THREE.MeshBasicMaterial({
                  color: map ? 0xffffff : color,
                  map: map,
                });
              });
            }
          }
        });
        break;

      case "soft":
        ambientLight.intensity = 1.2;
        directionalLight.intensity = 0.3;
        fillLight.intensity = 0.3;
        break;

      case "dramatic":
        ambientLight.intensity = 0.3;
        directionalLight.intensity = 1.2;
        fillLight.intensity = 0.1;
        break;
    }

    setLightingMode(mode);
  }, []);

  // Helper: Find trim bounds of non-transparent pixels
  const getTrimBounds = (imageData: ImageData, padding: number = 0) => {
    const { data, width, height } = imageData;
    let minX = width, minY = height, maxX = 0, maxY = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha > 0) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    // Add padding
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(width - 1, maxX + padding);
    maxY = Math.min(height - 1, maxY + padding);

    return { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1 };
  };

  // Helper: Create stroke layer (returns ImageData with just the stroke)
  const createStrokeLayer = (
    sourceData: ImageData,
    width: number,
    height: number,
    strokeColor: string,
    strokeWidthPx: number
  ): ImageData => {
    const strokeData = new ImageData(width, height);
    const src = sourceData.data;
    const dst = strokeData.data;

    // Parse stroke color
    const color = new THREE.Color(strokeColor);
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);

    // For each pixel, check if it should be part of the stroke
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const alpha = src[idx + 3];

        // Only create stroke on transparent pixels (alpha < 10)
        if (alpha < 10) {
          let hasOpaqueNeighbor = false;

          // Check neighbors within stroke width
          for (let dy = -strokeWidthPx; dy <= strokeWidthPx && !hasOpaqueNeighbor; dy++) {
            for (let dx = -strokeWidthPx; dx <= strokeWidthPx; dx++) {
              const nx = x + dx;
              const ny = y + dy;

              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= strokeWidthPx) {
                  const nIdx = (ny * width + nx) * 4;
                  if (src[nIdx + 3] > 128) {
                    hasOpaqueNeighbor = true;
                  }
                }
              }
            }
          }

          if (hasOpaqueNeighbor) {
            dst[idx] = r;
            dst[idx + 1] = g;
            dst[idx + 2] = b;
            dst[idx + 3] = 255;
          }
        }
      }
    }

    return strokeData;
  };

  // Capture current view and generate variants
  const captureVariants = async () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !modelRef.current) {
      return;
    }

    setIsCapturing(true);
    const capturedVariants: CapturedVariant[] = [];

    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const model = modelRef.current;
    const grid = gridRef.current;

    // Store original state
    const originalBackground = scene.background;
    const gridWasVisible = grid?.visible ?? false;

    // Hide grid for capture
    if (grid) {
      grid.visible = false;
    }

    // Set transparent background
    scene.background = null;

    // Render model once
    model.visible = true;
    renderer.render(scene, camera);

    // Get base image from renderer
    const baseCanvas = renderer.domElement;
    const baseCtx = document.createElement("canvas").getContext("2d")!;
    baseCtx.canvas.width = baseCanvas.width;
    baseCtx.canvas.height = baseCanvas.height;
    baseCtx.drawImage(baseCanvas, 0, 0);

    // Get trim bounds with padding for stroke
    const baseImageData = baseCtx.getImageData(0, 0, baseCanvas.width, baseCanvas.height);
    const bounds = getTrimBounds(baseImageData, strokeWidth + 2);

    // Get trimmed source data for stroke calculation
    const trimmedSourceData = baseCtx.getImageData(bounds.minX, bounds.minY, bounds.width, bounds.height);

    for (const config of VARIANT_CONFIG) {
      // Create working canvas at trimmed size
      const workCanvas = document.createElement("canvas");
      workCanvas.width = bounds.width;
      workCanvas.height = bounds.height;
      const workCtx = workCanvas.getContext("2d")!;

      // Apply stroke if needed (draw stroke FIRST, then model on top)
      if (config.outlineColor) {
        const strokeLayer = createStrokeLayer(
          trimmedSourceData,
          bounds.width,
          bounds.height,
          config.outlineColor,
          strokeWidth
        );
        workCtx.putImageData(strokeLayer, 0, 0);
      }

      // Draw model on top (if showModel is true)
      if (config.showModel) {
        workCtx.drawImage(
          baseCanvas,
          bounds.minX, bounds.minY, bounds.width, bounds.height,
          0, 0, bounds.width, bounds.height
        );
      }

      // Convert to blob
      const dataUrl = workCanvas.toDataURL("image/png");
      const blob = await (await fetch(dataUrl)).blob();

      capturedVariants.push({
        name: config.name,
        key: config.key,
        aspectRatioKey: config.aspectRatioKey,
        blob,
        preview: dataUrl,
        uploading: false,
        uploaded: false,
      });
    }

    // Restore original state
    scene.background = originalBackground;
    if (grid) {
      grid.visible = gridWasVisible;
    }
    renderer.render(scene, camera);

    setVariants(capturedVariants);
    setIsCapturing(false);
  };

  // Upload all variants
  const uploadAllVariants = async () => {
    if (variants.length === 0) return;

    setIsSaving(true);

    const updatedVariants = [...variants];
    const generatedIcons: GeneratedIcons = {};

    for (let i = 0; i < updatedVariants.length; i++) {
      const variant = updatedVariants[i];
      if (!variant.blob) continue;

      // Update uploading state
      updatedVariants[i] = { ...variant, uploading: true };
      setVariants([...updatedVariants]);

      try {
        // Create form data
        const formData = new FormData();
        formData.append("file", variant.blob, `${characterName}_${variant.key}.png`);
        formData.append("name", `${characterName} - ${variant.name}`);
        formData.append("asset_type", "image");
        formData.append("tags", JSON.stringify(["icon", "quirkyverse", characterName.toLowerCase()]));
        formData.append("destination_type", "group");

        // Upload to API
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "https://api.whimco.com"}/api/v1/roblox-assets/`,
          {
            method: "POST",
            body: formData,
            headers: {
              Authorization: `Token ${localStorage.getItem("auth_token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status}`);
        }

        const result = await response.json();
        const assetId = parseInt(result.roblox_asset_id, 10);

        // Calculate aspect ratio (from preview image)
        const img = new Image();
        img.src = variant.preview!;
        await new Promise((resolve) => { img.onload = resolve; });
        const aspectRatio = img.width / img.height;

        // Update variant
        updatedVariants[i] = {
          ...variant,
          uploading: false,
          uploaded: true,
          assetId,
        };

        // Store in generated icons
        generatedIcons[variant.key] = assetId;
        generatedIcons[variant.aspectRatioKey] = aspectRatio;
      } catch (err) {
        updatedVariants[i] = {
          ...variant,
          uploading: false,
          error: err instanceof Error ? err.message : "Upload failed",
        };
      }

      setVariants([...updatedVariants]);
    }

    // Save to character if all succeeded
    const allSucceeded = updatedVariants.every((v) => v.uploaded);
    if (allSucceeded && Object.keys(generatedIcons).length > 0) {
      try {
        await onSave(generatedIcons);
      } catch (err) {
        setError("Failed to save icons to character");
      }
    }

    setIsSaving(false);
  };

  const allVariantsUploaded = variants.length > 0 && variants.every((v) => v.uploaded);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-slate-700">Icon Generator</h2>
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
        <div className="flex-1 flex overflow-hidden">
          {/* Left: 3D Viewport */}
          <div className="flex-1 flex flex-col border-r border-gray-200">
            {/* Viewport */}
            <div
              ref={containerRef}
              className="flex-1 min-h-[400px] bg-gray-100 relative"
            >
              {!selectedFile && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <ArrowUpTrayIcon className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-slate-600 font-medium mb-2">Load FBX Model</p>
                  <label className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 cursor-pointer">
                    Browse Files
                    <input
                      type="file"
                      accept=".fbx"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                    <p className="text-slate-600">Loading model...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            {modelLoaded && (
              <div className="p-3 bg-gray-50 border-t border-gray-200 space-y-3">
                {/* Lighting Mode & Outline Thickness */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-500 mb-2">LIGHTING</p>
                    <div className="flex flex-wrap gap-1">
                      {LIGHTING_MODES.map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => applyLightingMode(mode.id)}
                          className={`flex items-center gap-1 px-2 py-1.5 text-xs rounded-lg border transition-colors ${
                            lightingMode === mode.id
                              ? "bg-purple-100 border-purple-300 text-purple-700"
                              : "bg-white border-gray-200 text-slate-600 hover:bg-gray-100"
                          }`}
                          title={mode.description}
                        >
                          {mode.icon === "sun" && <SunIcon className="w-3 h-3" />}
                          {mode.icon === "moon" && <MoonIcon className="w-3 h-3" />}
                          {mode.icon === "sparkles" && <SparklesIcon className="w-3 h-3" />}
                          <span>{mode.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="w-32">
                    <p className="text-xs font-medium text-slate-500 mb-2">
                      OUTLINE: <span className="text-purple-600">{strokeWidth}px</span>
                    </p>
                    <input
                      type="range"
                      min="1"
                      max="12"
                      value={strokeWidth}
                      onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                  </div>
                </div>

                {/* Camera Angle Buttons */}
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2">SNAP TO ANGLE</p>
                  <div className="flex flex-wrap gap-2">
                    {CAMERA_ANGLES.map((angle) => (
                      <button
                        key={angle.name}
                        onClick={() => snapToAngle(angle.position)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                        title={angle.name}
                      >
                        <span>{angle.icon}</span>
                        <span className="text-slate-600">{angle.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            {modelLoaded && (
              <div className="p-3 border-t border-gray-200 flex items-center gap-3">
                <label className="px-3 py-2 text-sm text-slate-600 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  Load Different FBX
                  <input
                    type="file"
                    accept=".fbx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={captureVariants}
                  disabled={isCapturing}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  {isCapturing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Capturing...
                    </>
                  ) : (
                    <>
                      <CameraIcon className="w-5 h-5" />
                      Capture Icons
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right: Variants Preview */}
          <div className="w-80 flex flex-col bg-gray-50">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-slate-700">Generated Variants</h3>
              <p className="text-xs text-slate-500 mt-1">
                Position the model and click Capture to generate all icon variants
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {variants.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <CameraIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No captures yet</p>
                </div>
              ) : (
                variants.map((variant) => (
                  <div
                    key={variant.key}
                    className={`p-3 rounded-xl border ${
                      variant.uploaded
                        ? "border-green-200 bg-green-50"
                        : variant.error
                        ? "border-red-200 bg-red-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {variant.preview && (
                        <img
                          src={variant.preview}
                          alt={variant.name}
                          className="w-16 h-16 object-contain rounded-lg border border-gray-200"
                          style={{
                            background: `repeating-conic-gradient(#e5e5e5 0% 25%, #ffffff 0% 50%) 50% / 12px 12px`
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-700 text-sm">
                          {variant.name}
                        </p>
                        {variant.uploading && (
                          <p className="text-xs text-purple-600 flex items-center gap-1">
                            <div className="w-3 h-3 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                            Uploading...
                          </p>
                        )}
                        {variant.uploaded && variant.assetId && (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircleIcon className="w-4 h-4" />
                            ID: {variant.assetId}
                          </p>
                        )}
                        {variant.error && (
                          <p className="text-xs text-red-600 flex items-center gap-1">
                            <ExclamationCircleIcon className="w-4 h-4" />
                            {variant.error}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Upload Button */}
            {variants.length > 0 && !allVariantsUploaded && (
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={uploadAllVariants}
                  disabled={isSaving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-colors"
                >
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <ArrowUpTrayIcon className="w-5 h-5" />
                      Upload All to Roblox
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Success State */}
            {allVariantsUploaded && (
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-green-600 mb-3">
                  <CheckCircleIcon className="w-5 h-5" />
                  <span className="font-medium">All icons uploaded!</span>
                </div>
                <button
                  onClick={onClose}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border-t border-red-100 text-red-600 flex items-center gap-2">
            <ExclamationCircleIcon className="w-5 h-5" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
