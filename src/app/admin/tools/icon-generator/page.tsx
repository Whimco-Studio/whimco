"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import { FBXLoader } from "three-stdlib";
import {
  ArrowLeftIcon,
  CameraIcon,
  ArrowDownTrayIcon,
  ExclamationCircleIcon,
  CubeIcon,
  SunIcon,
  MoonIcon,
  SparklesIcon,
  XMarkIcon,
  CheckIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import AdminHeader from "@/app/components/admin/AdminHeader";

interface QueuedFile {
  id: string;
  file: File;
  name: string;
  status: "pending" | "processing" | "done" | "error";
  variants?: CapturedVariant[];
  error?: string;
}

interface CapturedVariant {
  name: string;
  blob: Blob | null;
  preview: string | null;
}

interface BatchResult {
  modelName: string;
  variants: CapturedVariant[];
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

const VARIANT_CONFIG = [
  { name: "Base", label: "Base (Colored)", type: "base" },
  { name: "WhiteFill", label: "White Fill (Backdrop)", type: "whitefill" },
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

export default function IconGeneratorPage() {
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

  const [fileQueue, setFileQueue] = useState<QueuedFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [batchResults, setBatchResults] = useState<BatchResult[]>([]);

  // Settings
  const [lightingMode, setLightingMode] = useState<LightingMode>("unlit");
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [selectedAngle, setSelectedAngle] = useState(CAMERA_ANGLES[5]); // Default to 3/4 Front Left

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(100, 80, 100);
    cameraRef.current = camera;

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

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 50, 0);
    controls.update();
    controlsRef.current = controls;

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

    const gridHelper = new THREE.GridHelper(200, 20, 0xcccccc, 0xdddddd);
    scene.add(gridHelper);
    gridRef.current = gridHelper;

    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

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

  // Load FBX model for preview
  const loadModelForPreview = useCallback(async (file: File) => {
    if (!sceneRef.current) return;

    setIsLoading(true);
    setError(null);

    if (modelRef.current) {
      sceneRef.current.remove(modelRef.current);
      modelRef.current = null;
    }

    const loader = new FBXLoader();

    try {
      const arrayBuffer = await file.arrayBuffer();
      const object = loader.parse(arrayBuffer, "");

      const box = new THREE.Box3().setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 100 / maxDim;

      object.scale.multiplyScalar(scale);
      object.position.sub(center.multiplyScalar(scale));
      object.position.y = 0;

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

      // Apply current lighting mode
      applyLightingModeToModel(lightingMode, object);

      // Calculate proper camera distance to fit model
      if (cameraRef.current && controlsRef.current) {
        const scaledBox = new THREE.Box3().setFromObject(object);
        const scaledSize = scaledBox.getSize(new THREE.Vector3());
        const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
        const maxSize = Math.max(scaledSize.x, scaledSize.y, scaledSize.z);

        const fov = cameraRef.current.fov * (Math.PI / 180);
        const cameraDistance = (maxSize / 2) / Math.tan(fov / 2) * 1.5;

        const angleDir = new THREE.Vector3(
          selectedAngle.position[0],
          selectedAngle.position[1],
          selectedAngle.position[2]
        ).normalize();

        const cameraPos = angleDir.multiplyScalar(cameraDistance);
        cameraRef.current.position.copy(cameraPos);
        controlsRef.current.target.copy(scaledCenter);
        controlsRef.current.update();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load model");
    } finally {
      setIsLoading(false);
    }
  }, [lightingMode, selectedAngle]);

  // Apply lighting mode to a model
  const applyLightingModeToModel = useCallback((mode: LightingMode, model?: THREE.Group) => {
    const targetModel = model || modelRef.current;
    const ambientLight = ambientLightRef.current;
    const directionalLight = directionalLightRef.current;
    const fillLight = fillLightRef.current;

    if (!ambientLight || !directionalLight || !fillLight) return;

    // Restore original materials first if we have a model
    if (targetModel) {
      targetModel.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const original = originalMaterialsRef.current.get(child);
          if (original) {
            child.material = original;
          }
        }
      });
    }

    switch (mode) {
      case "lit":
        ambientLight.intensity = 0.7;
        directionalLight.intensity = 0.8;
        fillLight.intensity = 0.4;
        break;

      case "unlit":
        // For unlit/base color mode, use very high ambient with some fill from all directions
        // This creates a flat, shadowless look while preserving material colors
        ambientLight.intensity = 3;
        directionalLight.intensity = 0.5;
        directionalLight.position.set(0, 1, 0); // From above for even lighting
        fillLight.intensity = 0.5;
        fillLight.position.set(0, -1, 0); // From below to fill shadows
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
  }, []);

  // Handle lighting mode change
  const handleLightingModeChange = useCallback((mode: LightingMode) => {
    setLightingMode(mode);
    applyLightingModeToModel(mode);
  }, [applyLightingModeToModel]);

  // Snap camera to angle
  const snapToAngle = (angle: typeof CAMERA_ANGLES[0]) => {
    setSelectedAngle(angle);
    if (cameraRef.current && controlsRef.current && modelRef.current) {
      // Calculate proper camera distance to fit model
      const scaledBox = new THREE.Box3().setFromObject(modelRef.current);
      const scaledSize = scaledBox.getSize(new THREE.Vector3());
      const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
      const maxSize = Math.max(scaledSize.x, scaledSize.y, scaledSize.z);

      const fov = cameraRef.current.fov * (Math.PI / 180);
      const cameraDistance = (maxSize / 2) / Math.tan(fov / 2) * 1.5;

      const angleDir = new THREE.Vector3(
        angle.position[0],
        angle.position[1],
        angle.position[2]
      ).normalize();

      const cameraPos = angleDir.multiplyScalar(cameraDistance);
      cameraRef.current.position.copy(cameraPos);
      controlsRef.current.target.copy(scaledCenter);
      controlsRef.current.update();
    } else if (cameraRef.current && controlsRef.current) {
      // No model loaded, use default position
      cameraRef.current.position.set(angle.position[0], angle.position[1], angle.position[2]);
      controlsRef.current.target.set(0, 40, 0);
      controlsRef.current.update();
    }
  };

  // Handle file selection (multiple)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles: QueuedFile[] = [];
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
      setFileQueue((prev) => [...prev, ...newFiles]);

      // Auto-select first file for preview if none selected
      if (!selectedFileId && newFiles.length > 0) {
        setSelectedFileId(newFiles[0].id);
        loadModelForPreview(newFiles[0].file);
      }
    }
    // Reset input
    e.target.value = "";
  };

  // Handle drag and drop (multiple)
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const newFiles: QueuedFile[] = [];
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
      setFileQueue((prev) => [...prev, ...newFiles]);

      if (!selectedFileId && newFiles.length > 0) {
        setSelectedFileId(newFiles[0].id);
        loadModelForPreview(newFiles[0].file);
      }
    }
  }, [selectedFileId, loadModelForPreview]);

  // Select file for preview
  const selectFileForPreview = (queuedFile: QueuedFile) => {
    setSelectedFileId(queuedFile.id);
    loadModelForPreview(queuedFile.file);
  };

  // Remove file from queue
  const removeFromQueue = (id: string) => {
    setFileQueue((prev) => prev.filter((f) => f.id !== id));
    if (selectedFileId === id) {
      setSelectedFileId(null);
      if (modelRef.current && sceneRef.current) {
        sceneRef.current.remove(modelRef.current);
        modelRef.current = null;
      }
    }
  };

  // Clear all files
  const clearQueue = () => {
    setFileQueue([]);
    setSelectedFileId(null);
    setBatchResults([]);
    if (modelRef.current && sceneRef.current) {
      sceneRef.current.remove(modelRef.current);
      modelRef.current = null;
    }
  };

  // Helper functions for capture
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

    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(width - 1, maxX + padding);
    maxY = Math.min(height - 1, maxY + padding);

    return { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1 };
  };

  // Create white fill layer (model silhouette + expanded stroke area, all white)
  const createWhiteFillLayer = (
    sourceData: ImageData,
    width: number,
    height: number,
    expandPx: number
  ): ImageData => {
    const fillData = new ImageData(width, height);
    const src = sourceData.data;
    const dst = fillData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const alpha = src[idx + 3];

        // If pixel is already opaque, fill it white
        if (alpha > 10) {
          dst[idx] = 255;
          dst[idx + 1] = 255;
          dst[idx + 2] = 255;
          dst[idx + 3] = 255;
        } else {
          // Check if near an opaque pixel (within expand distance)
          let hasOpaqueNeighbor = false;
          const checkRadius = expandPx + 1;

          for (let dy = -checkRadius; dy <= checkRadius && !hasOpaqueNeighbor; dy++) {
            for (let dx = -checkRadius; dx <= checkRadius; dx++) {
              const nx = x + dx;
              const ny = y + dy;

              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= checkRadius) {
                  const nIdx = (ny * width + nx) * 4;
                  if (src[nIdx + 3] > 240) {
                    hasOpaqueNeighbor = true;
                  }
                }
              }
            }
          }

          if (hasOpaqueNeighbor) {
            dst[idx] = 255;
            dst[idx + 1] = 255;
            dst[idx + 2] = 255;
            dst[idx + 3] = 255;
          }
        }
      }
    }

    return fillData;
  };

  // Capture single model variants
  const captureModelVariants = async (file: File, modelName: string): Promise<CapturedVariant[]> => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) {
      throw new Error("Renderer not initialized");
    }

    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const grid = gridRef.current;

    // Remove existing model
    if (modelRef.current) {
      scene.remove(modelRef.current);
      modelRef.current = null;
    }

    // Load the model
    const loader = new FBXLoader();
    const arrayBuffer = await file.arrayBuffer();
    const object = loader.parse(arrayBuffer, "");

    // Center and scale
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 100 / maxDim;

    object.scale.multiplyScalar(scale);
    object.position.sub(center.multiplyScalar(scale));
    object.position.y = 0;

    // Store and setup materials
    originalMaterialsRef.current.clear();
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        originalMaterialsRef.current.set(child, child.material);
      }
    });

    scene.add(object);
    modelRef.current = object;

    // Apply lighting mode
    applyLightingModeToModel(lightingMode, object);

    // Calculate proper camera distance to fit model
    const scaledBox = new THREE.Box3().setFromObject(object);
    const scaledSize = scaledBox.getSize(new THREE.Vector3());
    const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
    const maxSize = Math.max(scaledSize.x, scaledSize.y, scaledSize.z);

    // Calculate distance needed to fit model in view
    const fov = camera.fov * (Math.PI / 180);
    const cameraDistance = (maxSize / 2) / Math.tan(fov / 2) * 1.5; // 1.5x padding

    // Get direction from selected angle and apply proper distance
    const angleDir = new THREE.Vector3(
      selectedAngle.position[0],
      selectedAngle.position[1],
      selectedAngle.position[2]
    ).normalize();

    const cameraPos = angleDir.multiplyScalar(cameraDistance);
    camera.position.copy(cameraPos);

    // Look at model center
    controlsRef.current?.target.copy(scaledCenter);
    controlsRef.current?.update();

    // Capture
    const originalBackground = scene.background;
    const gridWasVisible = grid?.visible ?? false;

    if (grid) grid.visible = false;
    scene.background = null;

    object.visible = true;
    renderer.render(scene, camera);

    const baseCanvas = renderer.domElement;
    const baseCtx = document.createElement("canvas").getContext("2d")!;
    baseCtx.canvas.width = baseCanvas.width;
    baseCtx.canvas.height = baseCanvas.height;
    baseCtx.drawImage(baseCanvas, 0, 0);

    const baseImageData = baseCtx.getImageData(0, 0, baseCanvas.width, baseCanvas.height);
    const bounds = getTrimBounds(baseImageData, strokeWidth + 2);
    const trimmedSourceData = baseCtx.getImageData(bounds.minX, bounds.minY, bounds.width, bounds.height);

    const capturedVariants: CapturedVariant[] = [];

    for (const config of VARIANT_CONFIG) {
      const workCanvas = document.createElement("canvas");
      workCanvas.width = bounds.width;
      workCanvas.height = bounds.height;
      const workCtx = workCanvas.getContext("2d")!;

      if (config.type === "base") {
        // Base variant: just the colored model
        workCtx.drawImage(
          baseCanvas,
          bounds.minX, bounds.minY, bounds.width, bounds.height,
          0, 0, bounds.width, bounds.height
        );
      } else if (config.type === "whitefill") {
        // White fill variant: model silhouette + expanded area, all white
        const whiteFillLayer = createWhiteFillLayer(
          trimmedSourceData,
          bounds.width,
          bounds.height,
          strokeWidth
        );
        workCtx.putImageData(whiteFillLayer, 0, 0);
      }

      const dataUrl = workCanvas.toDataURL("image/png");
      const blob = await (await fetch(dataUrl)).blob();

      capturedVariants.push({
        name: config.name,
        blob,
        preview: dataUrl,
      });
    }

    // Restore
    scene.background = originalBackground;
    if (grid) grid.visible = gridWasVisible;
    renderer.render(scene, camera);

    return capturedVariants;
  };

  // Batch process all files
  const batchProcessAll = async () => {
    if (fileQueue.length === 0) return;

    setIsBatchProcessing(true);
    setBatchProgress({ current: 0, total: fileQueue.length });
    setBatchResults([]);

    const results: BatchResult[] = [];

    for (let i = 0; i < fileQueue.length; i++) {
      const queuedFile = fileQueue[i];
      setBatchProgress({ current: i + 1, total: fileQueue.length });

      // Update status
      setFileQueue((prev) =>
        prev.map((f) =>
          f.id === queuedFile.id ? { ...f, status: "processing" as const } : f
        )
      );

      try {
        const variants = await captureModelVariants(queuedFile.file, queuedFile.name);

        results.push({
          modelName: queuedFile.name,
          variants,
        });

        setFileQueue((prev) =>
          prev.map((f) =>
            f.id === queuedFile.id ? { ...f, status: "done" as const, variants } : f
          )
        );
      } catch (err) {
        setFileQueue((prev) =>
          prev.map((f) =>
            f.id === queuedFile.id
              ? { ...f, status: "error" as const, error: err instanceof Error ? err.message : "Failed" }
              : f
          )
        );
      }
    }

    setBatchResults(results);
    setIsBatchProcessing(false);
  };

  // Download all results
  const downloadAllResults = () => {
    batchResults.forEach((result) => {
      result.variants.forEach((variant) => {
        if (variant.blob) {
          const url = URL.createObjectURL(variant.blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${result.modelName}_${variant.name}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    });
  };

  const selectedFile = fileQueue.find((f) => f.id === selectedFileId);
  const hasFiles = fileQueue.length > 0;
  const allDone = fileQueue.length > 0 && fileQueue.every((f) => f.status === "done");
  const totalVariants = batchResults.reduce((sum, r) => sum + r.variants.length, 0);

  return (
    <>
      <AdminHeader
        title="Batch Icon Generator"
        subtitle="Generate icon variants from multiple 3D models"
      />

      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Viewport & Settings */}
        <div className="lg:col-span-2 space-y-4">
          {/* 3D Viewport */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div
              ref={containerRef}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="h-[400px] bg-gray-100 relative"
            >
              {!hasFiles && (
                <div className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 m-4 rounded-xl">
                  <CubeIcon className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-slate-600 font-medium mb-2">Drop FBX files here</p>
                  <p className="text-slate-400 text-sm mb-4">Upload multiple files for batch processing</p>
                  <label className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 cursor-pointer">
                    Browse Files
                    <input
                      type="file"
                      accept=".fbx"
                      multiple
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
                    <p className="text-slate-600">Loading preview...</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="absolute bottom-4 left-4 right-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-2">
                  <ExclamationCircleIcon className="w-5 h-5" />
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Settings Panel */}
          <div className="bg-white rounded-2xl shadow-xl p-4 space-y-4">
            <h3 className="font-semibold text-slate-700">Settings (Applied to All)</h3>

            {/* Lighting Mode */}
            <div>
              <p className="text-sm font-medium text-slate-600 mb-2">Lighting Mode</p>
              <div className="flex flex-wrap gap-2">
                {LIGHTING_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => handleLightingModeChange(mode.id)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors ${
                      lightingMode === mode.id
                        ? "bg-purple-100 border-purple-300 text-purple-700"
                        : "bg-gray-50 border-gray-200 text-slate-600 hover:bg-gray-100"
                    }`}
                  >
                    {mode.icon === "sun" && <SunIcon className="w-4 h-4" />}
                    {mode.icon === "moon" && <MoonIcon className="w-4 h-4" />}
                    {mode.icon === "sparkles" && <SparklesIcon className="w-4 h-4" />}
                    <span>{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Backdrop Thickness */}
            <div>
              <p className="text-sm font-medium text-slate-600 mb-2">
                Backdrop Expansion: <span className="text-purple-600">{strokeWidth}px</span>
              </p>
              <input
                type="range"
                min="1"
                max="20"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                className="w-full max-w-xs h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <p className="text-xs text-slate-400 mt-1">How much the white backdrop extends beyond the model</p>
            </div>

            {/* Camera Angle */}
            <div>
              <p className="text-sm font-medium text-slate-600 mb-2">Camera Angle</p>
              <div className="flex flex-wrap gap-2">
                {CAMERA_ANGLES.map((angle) => (
                  <button
                    key={angle.name}
                    onClick={() => snapToAngle(angle)}
                    className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      selectedAngle.name === angle.name
                        ? "bg-purple-100 border-purple-300 text-purple-700"
                        : "bg-gray-100 border-gray-200 text-slate-600 hover:bg-gray-200"
                    }`}
                  >
                    <span>{angle.icon}</span>
                    <span>{angle.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* File Queue & Results */}
        <div className="space-y-4">
          {/* File Queue */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-700">File Queue</h3>
                <p className="text-xs text-slate-500">{fileQueue.length} files</p>
              </div>
              <div className="flex gap-2">
                <label className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 cursor-pointer">
                  Add Files
                  <input
                    type="file"
                    accept=".fbx"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                {hasFiles && (
                  <button
                    onClick={clearQueue}
                    className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto">
              {fileQueue.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <CubeIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No files added</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {fileQueue.map((qf) => (
                    <div
                      key={qf.id}
                      onClick={() => selectFileForPreview(qf)}
                      className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 ${
                        selectedFileId === qf.id ? "bg-purple-50" : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">
                          {qf.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {qf.status === "pending" && "Pending"}
                          {qf.status === "processing" && "Processing..."}
                          {qf.status === "done" && "Completed"}
                          {qf.status === "error" && qf.error}
                        </p>
                      </div>
                      {qf.status === "done" && (
                        <CheckIcon className="w-5 h-5 text-green-500" />
                      )}
                      {qf.status === "processing" && (
                        <div className="w-5 h-5 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                      )}
                      {qf.status === "error" && (
                        <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromQueue(qf.id);
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <XMarkIcon className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Batch Process Button */}
            {hasFiles && (
              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={batchProcessAll}
                  disabled={isBatchProcessing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                >
                  {isBatchProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing {batchProgress.current}/{batchProgress.total}...
                    </>
                  ) : (
                    <>
                      <CameraIcon className="w-5 h-5" />
                      Generate All Icons
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Results */}
          {batchResults.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-slate-700">Results</h3>
                <p className="text-xs text-slate-500">
                  {batchResults.length} models, {totalVariants} images
                </p>
              </div>

              <div className="max-h-[300px] overflow-y-auto p-4 space-y-4">
                {batchResults.map((result, idx) => (
                  <div key={idx} className="space-y-2">
                    <p className="text-sm font-medium text-slate-600">{result.modelName}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {result.variants.map((variant) => {
                        const config = VARIANT_CONFIG.find((c) => c.name === variant.name);
                        return (
                          <div key={variant.name} className="text-center">
                            {variant.preview && (
                              <img
                                src={variant.preview}
                                alt={variant.name}
                                className="w-full aspect-square object-contain rounded border border-gray-200"
                                style={{
                                  background: `repeating-conic-gradient(#e5e5e5 0% 25%, #ffffff 0% 50%) 50% / 12px 12px`
                                }}
                              />
                            )}
                            <p className="text-xs text-slate-400 mt-1 truncate">
                              {config?.label || variant.name}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={downloadAllResults}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  Download All ({totalVariants} images)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
        <h3 className="font-bold text-slate-700 mb-4">How to Use</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="p-4 bg-purple-50 rounded-xl">
            <p className="font-medium text-purple-700 mb-1">1. Add Models</p>
            <p className="text-slate-600">Drop or select multiple FBX files</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl">
            <p className="font-medium text-purple-700 mb-1">2. Configure</p>
            <p className="text-slate-600">Set lighting, outline, and camera angle</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl">
            <p className="font-medium text-purple-700 mb-1">3. Generate</p>
            <p className="text-slate-600">Click Generate All to batch process</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl">
            <p className="font-medium text-purple-700 mb-1">4. Download</p>
            <p className="text-slate-600">Download all icons at once</p>
          </div>
        </div>
      </div>
    </>
  );
}
