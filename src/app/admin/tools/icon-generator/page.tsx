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
} from "@heroicons/react/24/outline";
import AdminHeader from "@/app/components/admin/AdminHeader";
import JSZip from "jszip";

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
  downloading?: boolean;
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
  {
    name: "NoOutline",
    label: "No Outline",
    outlineColor: null,
    showModel: true,
    fillColor: null,
  },
  {
    name: "WhiteExtruded",
    label: "White Extruded",
    outlineColor: "#ffffff",
    showModel: false,
    fillColor: "#ffffff",
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

export default function IconGeneratorPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const gridRef = useRef<THREE.GridHelper | null>(null);
  const frameIdRef = useRef<number>(0);
  const animatingRef = useRef<boolean>(true);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const directionalLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);
  const originalMaterialsRef = useRef<Map<THREE.Mesh, THREE.Material | THREE.Material[]>>(new Map());
  const textureMapRef = useRef<Map<string, string>>(new Map());

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [variants, setVariants] = useState<CapturedVariant[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [assetName, setAssetName] = useState("");
  const [lightingMode, setLightingMode] = useState<LightingMode>("lit");
  const [strokeWidth, setStrokeWidth] = useState(4);

  // Batch processing state
  const [fileQueue, setFileQueue] = useState<QueuedFile[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

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
    renderer.setClearColor(0x000000, 0); // Transparent background
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
      if (!animatingRef.current) return;
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

  // Register texture files as blob URLs so FBXLoader can resolve external references
  const registerTextureFiles = (files: File[]) => {
    // Revoke old blob URLs
    textureMapRef.current.forEach((url) => URL.revokeObjectURL(url));
    textureMapRef.current.clear();

    for (const file of files) {
      const blobUrl = URL.createObjectURL(file);
      // Map by filename (case-insensitive) since FBX references may differ in case
      textureMapRef.current.set(file.name.toLowerCase(), blobUrl);
    }
  };

  // Create a LoadingManager that intercepts texture requests and serves from uploaded files
  const createTextureLoadingManager = () => {
    const manager = new THREE.LoadingManager();
    manager.setURLModifier((url: string) => {
      // Extract just the filename from the URL (handles full paths, relative paths, encoded names)
      const decoded = decodeURIComponent(url);
      const filename = decoded.split(/[\\/]/).pop()?.toLowerCase() || "";
      const blobUrl = textureMapRef.current.get(filename);
      if (blobUrl) {
        return blobUrl;
      }
      // Return a data URI for a 1x1 transparent pixel to suppress 404s for missing textures
      return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQABNjN9GQAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAAA0lEQVQI12P4z8BQDwAEgAF/QualzQAAAABJRU5ErkJggg==";
    });
    return manager;
  };

  // Load FBX model
  const loadModel = useCallback(async (file: File) => {
    if (!sceneRef.current) return;

    setIsLoading(true);
    setError(null);
    setModelLoaded(false);
    setVariants([]);

    // Set default asset name from filename
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    setAssetName(nameWithoutExt);

    // Remove existing model
    if (modelRef.current) {
      sceneRef.current.remove(modelRef.current);
      modelRef.current = null;
    }

    const loadManager = createTextureLoadingManager();
    const loader = new FBXLoader(loadManager);

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
          // Store original material for restoration
          originalMaterialsRef.current.set(child, child.material);
        }
      });

      sceneRef.current.add(object);
      modelRef.current = object;

      // Wait for any async texture loading (blob URL textures load asynchronously)
      await waitForTextures(object);

      setModelLoaded(true);

      // Reset to standard lighting when loading new model
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

  // Separate FBX and texture files from a FileList
  const separateFiles = (files: FileList) => {
    const textureExts = [".png", ".jpg", ".jpeg", ".tga", ".bmp", ".tiff", ".tif"];
    let fbxFile: File | null = null;
    const textureFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const name = file.name.toLowerCase();
      if (name.endsWith(".fbx")) {
        fbxFile = file;
      } else if (textureExts.some((ext) => name.endsWith(ext))) {
        textureFiles.push(file);
      }
    }
    return { fbxFile, textureFiles };
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const { fbxFile, textureFiles } = separateFiles(files);
      if (textureFiles.length > 0) {
        registerTextureFiles(textureFiles);
      }
      if (fbxFile) {
        setSelectedFile(fbxFile);
        loadModel(fbxFile);
      } else {
        setError("Please select an FBX file (texture files can be included alongside)");
      }
    }
  };

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const { fbxFile, textureFiles } = separateFiles(files);
      if (textureFiles.length > 0) {
        registerTextureFiles(textureFiles);
      }
      if (fbxFile) {
        setSelectedFile(fbxFile);
        loadModel(fbxFile);
      } else if (textureFiles.length > 0) {
        // Only texture files dropped - that's fine, just register them
      } else {
        setError("Please drop an FBX file (texture files can be included alongside)");
      }
    }
  }, [loadModel]);

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
        // Standard lighting
        ambientLight.intensity = 0.7;
        directionalLight.intensity = 0.8;
        fillLight.intensity = 0.4;
        break;

      case "unlit":
        // Base color mode - convert to MeshBasicMaterial
        ambientLight.intensity = 1;
        directionalLight.intensity = 0;
        fillLight.intensity = 0;

        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const originalMat = originalMaterialsRef.current.get(child);
            if (originalMat && !Array.isArray(originalMat)) {
              // Get the color from the original material
              let color = new THREE.Color(0xcccccc);
              if ('color' in originalMat && originalMat.color instanceof THREE.Color) {
                color = originalMat.color.clone();
              }

              // Check for texture map - if it has one, we'll use it
              let map: THREE.Texture | null = null;
              if ('map' in originalMat && originalMat.map instanceof THREE.Texture) {
                map = originalMat.map;
              }

              // Create unlit material
              const unlitMat = new THREE.MeshBasicMaterial({
                color: map ? 0xffffff : color,
                map: map,
              });
              child.material = unlitMat;
            } else if (originalMat && Array.isArray(originalMat)) {
              // Handle multi-material
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
        // Soft lighting - high ambient, low directional
        ambientLight.intensity = 1.2;
        directionalLight.intensity = 0.3;
        fillLight.intensity = 0.3;
        break;

      case "dramatic":
        // Dramatic lighting - low ambient, strong directional
        ambientLight.intensity = 0.3;
        directionalLight.intensity = 1.2;
        fillLight.intensity = 0.1;
        break;
    }

    setLightingMode(mode);
  }, []);

  // Helper: Wait for all texture images on a model to finish decoding
  const waitForTextures = async (object: THREE.Object3D) => {
    const promises: Promise<void>[] = [];
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        for (const mat of mats) {
          for (const key of Object.keys(mat)) {
            const value = (mat as Record<string, unknown>)[key];
            if (
              value instanceof THREE.Texture &&
              value.image instanceof HTMLImageElement &&
              !value.image.complete
            ) {
              promises.push(
                new Promise<void>((resolve) => {
                  (value.image as HTMLImageElement).addEventListener("load", () => resolve(), { once: true });
                  (value.image as HTMLImageElement).addEventListener("error", () => resolve(), { once: true });
                })
              );
            }
          }
        }
      }
    });
    if (promises.length > 0) {
      console.log(`[Textures] waiting for ${promises.length} texture(s) to decode...`);
      await Promise.all(promises);
      console.log("[Textures] all textures decoded");
    }
  };

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

  // Helper: Create stroke layer with fringe to prevent dark edge artifacts
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

        // Create stroke on transparent/semi-transparent pixels (alpha < 240)
        // This covers anti-aliased edges so they blend with stroke color, not black
        if (alpha < 240) {
          let hasOpaqueNeighbor = false;

          // Check neighbors within stroke width + 1 (extra for anti-aliasing coverage)
          const checkRadius = strokeWidthPx + 1;
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
    console.log("[Single] === captureVariants START ===");
    const capturedVariants: CapturedVariant[] = [];

    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const model = modelRef.current;
    const grid = gridRef.current;

    console.log("[Single] lightingMode:", lightingMode, "strokeWidth:", strokeWidth);
    console.log("[Single] canvas size:", renderer.domElement.width, "x", renderer.domElement.height);
    console.log("[Single] camera pos:", camera.position.toArray(), "model visible:", model.visible);

    // Count materials by type
    const matTypes: string[] = [];
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material;
        if (Array.isArray(mat)) {
          mat.forEach((m) => matTypes.push(m.type));
        } else {
          matTypes.push(mat.type);
        }
      }
    });
    console.log("[Single] material types:", matTypes);

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
    console.log("[Single] compileAsync START");
    await renderer.compileAsync(scene, camera);
    console.log("[Single] compileAsync DONE, rendering...");
    renderer.render(scene, camera);

    // Get base image from renderer
    const baseCanvas = renderer.domElement;
    const baseCtx = document.createElement("canvas").getContext("2d")!;
    baseCtx.canvas.width = baseCanvas.width;
    baseCtx.canvas.height = baseCanvas.height;
    baseCtx.drawImage(baseCanvas, 0, 0);

    // Check if rendered image has non-black pixels
    const checkData = baseCtx.getImageData(0, 0, baseCanvas.width, baseCanvas.height);
    let nonBlackPixels = 0;
    let nonTransparentPixels = 0;
    for (let px = 0; px < checkData.data.length; px += 4) {
      if (checkData.data[px + 3] > 0) nonTransparentPixels++;
      if (checkData.data[px] > 0 || checkData.data[px + 1] > 0 || checkData.data[px + 2] > 0) nonBlackPixels++;
    }
    console.log("[Single] post-render pixel check — nonBlack:", nonBlackPixels, "nonTransparent:", nonTransparentPixels, "total:", checkData.data.length / 4);

    // Get trim bounds with padding for stroke
    const baseImageData = baseCtx.getImageData(0, 0, baseCanvas.width, baseCanvas.height);
    const bounds = getTrimBounds(baseImageData, strokeWidth + 2);
    console.log("[Single] trim bounds:", bounds);

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

      // Fill silhouette with solid color (if fillColor is set)
      if (config.fillColor) {
        const r = parseInt(config.fillColor.slice(1, 3), 16);
        const g = parseInt(config.fillColor.slice(3, 5), 16);
        const b = parseInt(config.fillColor.slice(5, 7), 16);
        const fillData = workCtx.getImageData(0, 0, bounds.width, bounds.height);
        for (let px = 0; px < trimmedSourceData.data.length; px += 4) {
          if (trimmedSourceData.data[px + 3] > 0) {
            fillData.data[px] = r;
            fillData.data[px + 1] = g;
            fillData.data[px + 2] = b;
            fillData.data[px + 3] = 255;
          }
        }
        workCtx.putImageData(fillData, 0, 0);
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
        blob,
        preview: dataUrl,
      });
      console.log("[Single] variant:", config.name, "blob size:", blob.size, "showModel:", config.showModel, "outline:", config.outlineColor, "fill:", config.fillColor);
    }

    // Restore original state
    scene.background = originalBackground;
    if (grid) {
      grid.visible = gridWasVisible;
    }
    renderer.render(scene, camera);

    console.log("[Single] === captureVariants DONE === variants:", capturedVariants.length);
    setVariants(capturedVariants);
    setIsCapturing(false);
  };

  // Download single variant
  const downloadVariant = (variant: CapturedVariant) => {
    if (!variant.blob) return;
    const url = URL.createObjectURL(variant.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${assetName}_${variant.name}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download all variants
  const downloadAll = () => {
    variants.forEach((variant) => {
      if (variant.blob) {
        downloadVariant(variant);
      }
    });
  };

  // Add files to batch queue
  const addFilesToQueue = (files: FileList) => {
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
    if (newFiles.length > 0) {
      setFileQueue((prev) => [...prev, ...newFiles]);
    }
  };

  // Remove file from queue
  const removeFromQueue = (id: string) => {
    setFileQueue((prev) => prev.filter((f) => f.id !== id));
  };

  // Clear entire queue
  const clearQueue = () => {
    setFileQueue([]);
  };

  // Batch process all files in queue
  const batchProcessAll = async () => {
    if (fileQueue.length === 0 || !sceneRef.current || !rendererRef.current || !cameraRef.current) return;

    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    const grid = gridRef.current;
    const ambientLight = ambientLightRef.current;
    const directionalLight = directionalLightRef.current;
    const fillLight = fillLightRef.current;

    if (!ambientLight || !directionalLight || !fillLight) return;

    // Capture the current lighting mode at start of batch
    const batchLightingMode = lightingMode;
    const batchStrokeWidth = strokeWidth;

    setIsBatchProcessing(true);
    setBatchProgress({ current: 0, total: fileQueue.length });
    animatingRef.current = false;
    console.log("[Batch] === batchProcessAll START === files:", fileQueue.length, "lightingMode:", batchLightingMode, "strokeWidth:", batchStrokeWidth, "animating paused");

    for (let i = 0; i < fileQueue.length; i++) {
      const queuedFile = fileQueue[i];
      if (queuedFile.status === "done") continue;

      setBatchProgress({ current: i + 1, total: fileQueue.length });
      setFileQueue((prev) =>
        prev.map((f) => (f.id === queuedFile.id ? { ...f, status: "processing" as const } : f))
      );

      try {
        // Remove existing model
        if (modelRef.current) {
          scene.remove(modelRef.current);
          modelRef.current = null;
        }

        // Load model with a LoadingManager to track async texture loading
        const arrayBuffer = await queuedFile.file.arrayBuffer();

        const loadManager = createTextureLoadingManager();
        let resourcesLoading = false;
        const resourcesReady = new Promise<void>((resolve) => {
          loadManager.onStart = () => { resourcesLoading = true; };
          loadManager.onLoad = () => resolve();
          loadManager.onError = () => resolve();
        });

        const fileLoader = new FBXLoader(loadManager);
        const object = fileLoader.parse(arrayBuffer, "");

        // Wait for any async resources (embedded textures) to finish loading
        if (resourcesLoading) {
          console.log(`[Batch] [${i + 1}] waiting for async resources (textures)...`);
          await Promise.race([
            resourcesReady,
            new Promise<void>((resolve) => setTimeout(resolve, 10000)),
          ]);
          console.log(`[Batch] [${i + 1}] resources loaded`);
        }

        // Center and scale
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 100 / maxDim;

        object.scale.multiplyScalar(scale);
        object.position.sub(center.multiplyScalar(scale));
        object.position.y = 0;

        // Store original materials
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
        console.log(`[Batch] [${i + 1}/${fileQueue.length}] "${queuedFile.name}" loaded — meshes:`, originalMaterialsRef.current.size, "scale:", scale.toFixed(4), "maxDim:", maxDim.toFixed(2));

        // Warm-up render to upload textures to GPU
        renderer.render(scene, camera);
        console.log(`[Batch] [${i + 1}] warm-up render done (texture upload)`);

        // Apply lighting mode (same logic as applyLightingMode)
        // Restore original materials first
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const original = originalMaterialsRef.current.get(child);
            if (original) {
              child.material = original;
            }
          }
        });

        switch (batchLightingMode) {
          case "lit":
            ambientLight.intensity = 0.7;
            directionalLight.intensity = 0.8;
            fillLight.intensity = 0.4;
            break;
          case "unlit":
            ambientLight.intensity = 1;
            directionalLight.intensity = 0;
            fillLight.intensity = 0;
            object.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                const originalMat = originalMaterialsRef.current.get(child);
                if (originalMat && !Array.isArray(originalMat)) {
                  let color = new THREE.Color(0xcccccc);
                  if ("color" in originalMat && originalMat.color instanceof THREE.Color) {
                    color = originalMat.color.clone();
                  }
                  let map: THREE.Texture | null = null;
                  if ("map" in originalMat && originalMat.map instanceof THREE.Texture) {
                    map = originalMat.map;
                  }
                  const mapImg = map?.image as HTMLImageElement | undefined;
                  console.log(`[Batch] [${i + 1}] unlit material:`, {
                    origType: originalMat.type,
                    origColor: ("color" in originalMat && originalMat.color instanceof THREE.Color) ? originalMat.color.getHexString() : "N/A",
                    hasMap: !!map,
                    mapNeedsUpdate: map?.needsUpdate,
                    mapImageComplete: mapImg?.complete,
                    mapImageSize: mapImg ? `${mapImg.width}x${mapImg.height}` : "N/A",
                    mapImageSrc: mapImg?.src?.substring(0, 80),
                    resultColor: map ? "ffffff" : color.getHexString(),
                  });
                  child.material = new THREE.MeshBasicMaterial({
                    color: map ? 0xffffff : color,
                    map: map,
                  });
                  // Force texture re-upload to GPU
                  if (map) map.needsUpdate = true;
                } else if (originalMat && Array.isArray(originalMat)) {
                  child.material = originalMat.map((mat) => {
                    let color = new THREE.Color(0xcccccc);
                    if ("color" in mat && mat.color instanceof THREE.Color) {
                      color = mat.color.clone();
                    }
                    let map: THREE.Texture | null = null;
                    if ("map" in mat && mat.map instanceof THREE.Texture) {
                      map = mat.map;
                    }
                    const newMat = new THREE.MeshBasicMaterial({
                      color: map ? 0xffffff : color,
                      map: map,
                    });
                    if (map) map.needsUpdate = true;
                    return newMat;
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

        // Position camera
        camera.position.set(100, 80, 100);
        controlsRef.current?.target.set(0, 40, 0);
        controlsRef.current?.update();

        // Log material types after lighting applied
        const batchMatTypes: string[] = [];
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const mat = child.material;
            if (Array.isArray(mat)) {
              mat.forEach((m) => batchMatTypes.push(m.type));
            } else {
              batchMatTypes.push(mat.type);
            }
          }
        });
        console.log(`[Batch] [${i + 1}] lighting: "${batchLightingMode}" — material types:`, batchMatTypes);
        console.log(`[Batch] [${i + 1}] ambient: ${ambientLight.intensity}, dir: ${directionalLight.intensity}, fill: ${fillLight.intensity}`);
        console.log(`[Batch] [${i + 1}] camera pos:`, camera.position.toArray(), "canvas:", renderer.domElement.width, "x", renderer.domElement.height);

        // CAPTURE VARIANTS - exact same logic as captureVariants
        const capturedVariants: CapturedVariant[] = [];
        const originalBackground = scene.background;
        const gridWasVisible = grid?.visible ?? false;

        if (grid) grid.visible = false;
        scene.background = null;

        object.visible = true;
        console.log(`[Batch] [${i + 1}] compileAsync START`);
        await renderer.compileAsync(scene, camera);
        console.log(`[Batch] [${i + 1}] compileAsync DONE`);

        // Force texture re-upload after compileAsync may have consumed needsUpdate
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            for (const mat of mats) {
              if ("map" in mat && mat.map instanceof THREE.Texture) {
                console.log(`[Batch] [${i + 1}] forcing texture needsUpdate (was: ${mat.map.needsUpdate})`);
                mat.map.needsUpdate = true;
              }
            }
          }
        });

        console.log(`[Batch] [${i + 1}] rendering...`);
        renderer.render(scene, camera);

        // Get base image from renderer
        const baseCanvas = renderer.domElement;
        const baseCtx = document.createElement("canvas").getContext("2d")!;
        baseCtx.canvas.width = baseCanvas.width;
        baseCtx.canvas.height = baseCanvas.height;
        baseCtx.drawImage(baseCanvas, 0, 0);

        // Check if rendered image has non-black pixels
        const batchCheckData = baseCtx.getImageData(0, 0, baseCanvas.width, baseCanvas.height);
        let batchNonBlack = 0;
        let batchNonTransparent = 0;
        for (let px = 0; px < batchCheckData.data.length; px += 4) {
          if (batchCheckData.data[px + 3] > 0) batchNonTransparent++;
          if (batchCheckData.data[px] > 0 || batchCheckData.data[px + 1] > 0 || batchCheckData.data[px + 2] > 0) batchNonBlack++;
        }
        console.log(`[Batch] [${i + 1}] post-render pixel check — nonBlack:`, batchNonBlack, "nonTransparent:", batchNonTransparent, "total:", batchCheckData.data.length / 4);

        const baseImageData = baseCtx.getImageData(0, 0, baseCanvas.width, baseCanvas.height);
        const bounds = getTrimBounds(baseImageData, batchStrokeWidth + 2);
        console.log(`[Batch] [${i + 1}] trim bounds:`, bounds);
        const trimmedSourceData = baseCtx.getImageData(bounds.minX, bounds.minY, bounds.width, bounds.height);

        for (const config of VARIANT_CONFIG) {
          const workCanvas = document.createElement("canvas");
          workCanvas.width = bounds.width;
          workCanvas.height = bounds.height;
          const workCtx = workCanvas.getContext("2d")!;

          if (config.outlineColor) {
            const strokeLayer = createStrokeLayer(
              trimmedSourceData,
              bounds.width,
              bounds.height,
              config.outlineColor,
              batchStrokeWidth
            );
            workCtx.putImageData(strokeLayer, 0, 0);
          }

          // Fill silhouette with solid color (if fillColor is set)
          if (config.fillColor) {
            const r = parseInt(config.fillColor.slice(1, 3), 16);
            const g = parseInt(config.fillColor.slice(3, 5), 16);
            const b = parseInt(config.fillColor.slice(5, 7), 16);
            const fillData = workCtx.getImageData(0, 0, bounds.width, bounds.height);
            for (let px = 0; px < trimmedSourceData.data.length; px += 4) {
              if (trimmedSourceData.data[px + 3] > 0) {
                fillData.data[px] = r;
                fillData.data[px + 1] = g;
                fillData.data[px + 2] = b;
                fillData.data[px + 3] = 255;
              }
            }
            workCtx.putImageData(fillData, 0, 0);
          }

          if (config.showModel) {
            workCtx.drawImage(
              baseCtx.canvas,
              bounds.minX, bounds.minY, bounds.width, bounds.height,
              0, 0, bounds.width, bounds.height
            );
          }

          const dataUrl = workCanvas.toDataURL("image/png");
          const blob = await (await fetch(dataUrl)).blob();

          capturedVariants.push({
            name: config.name,
            blob,
            preview: dataUrl,
          });
          console.log(`[Batch] [${i + 1}] variant:`, config.name, "blob size:", blob.size, "showModel:", config.showModel, "outline:", config.outlineColor, "fill:", config.fillColor);
        }

        console.log(`[Batch] [${i + 1}] "${queuedFile.name}" DONE — variants:`, capturedVariants.length);

        // Restore
        scene.background = originalBackground;
        if (grid) grid.visible = gridWasVisible;
        renderer.render(scene, camera);

        setFileQueue((prev) =>
          prev.map((f) => (f.id === queuedFile.id ? { ...f, status: "done" as const, variants: capturedVariants } : f))
        );
      } catch (err) {
        console.error(`[Batch] [${i + 1}] "${queuedFile.name}" ERROR:`, err);
        setFileQueue((prev) =>
          prev.map((f) =>
            f.id === queuedFile.id
              ? { ...f, status: "error" as const, error: err instanceof Error ? err.message : "Failed" }
              : f
          )
        );
      }
    }

    animatingRef.current = true;
    console.log("[Batch] === batchProcessAll DONE === animating resumed");
    setIsBatchProcessing(false);
  };

  // Download all batch results as zip
  const downloadAllBatchResults = async () => {
    const zip = new JSZip();

    fileQueue.forEach((qf) => {
      if (qf.variants) {
        const folder = zip.folder(qf.name);
        if (folder) {
          qf.variants.forEach((variant) => {
            if (variant.blob) {
              folder.file(`${variant.name}.png`, variant.blob);
            }
          });
        }
      }
    });

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "icon_batch_export.zip";
    a.click();
    URL.revokeObjectURL(url);
  };

  const completedCount = fileQueue.filter((f) => f.status === "done").length;
  const hasCompletedBatch = completedCount > 0;

  return (
    <>
      <AdminHeader
        title="Icon Generator"
        subtitle="Generate icon variants from 3D models"
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Viewport */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl overflow-hidden">
          <div
            ref={containerRef}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="h-[500px] bg-gray-100 relative"
          >
            {!selectedFile && (
              <div className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 m-4 rounded-xl">
                <CubeIcon className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-slate-600 font-medium mb-2">Drop FBX + texture files here</p>
                <p className="text-slate-400 text-sm mb-4">or</p>
                <label className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 cursor-pointer">
                  Browse Files
                  <input
                    type="file"
                    accept=".fbx,.png,.jpg,.jpeg,.tga,.bmp"
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
                  <p className="text-slate-600">Loading model...</p>
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

          {/* Controls Row */}
          {modelLoaded && (
            <div className="p-4 border-t border-gray-100 space-y-4">
              {/* Lighting Mode & Outline Thickness */}
              <div className="flex flex-wrap gap-6">
                <div className="flex-1 min-w-[200px]">
                  <p className="text-sm font-medium text-slate-600 mb-2">Lighting Mode</p>
                  <div className="flex flex-wrap gap-2">
                    {LIGHTING_MODES.map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => applyLightingMode(mode.id)}
                        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors ${
                          lightingMode === mode.id
                            ? "bg-purple-100 border-purple-300 text-purple-700"
                            : "bg-gray-50 border-gray-200 text-slate-600 hover:bg-gray-100"
                        }`}
                        title={mode.description}
                      >
                        {mode.icon === "sun" && <SunIcon className="w-4 h-4" />}
                        {mode.icon === "moon" && <MoonIcon className="w-4 h-4" />}
                        {mode.icon === "sparkles" && <SparklesIcon className="w-4 h-4" />}
                        <span>{mode.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-48">
                  <p className="text-sm font-medium text-slate-600 mb-2">
                    Outline Thickness: <span className="text-purple-600">{strokeWidth}px</span>
                  </p>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>1px</span>
                    <span>12px</span>
                  </div>
                </div>
              </div>

              {/* Camera Angle Buttons */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-600">Snap to Angle</p>
                  <label className="text-sm text-purple-600 hover:text-purple-700 cursor-pointer">
                    Load Different FBX
                    <input
                      type="file"
                      accept=".fbx"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CAMERA_ANGLES.map((angle) => (
                    <button
                      key={angle.name}
                      onClick={() => snapToAngle(angle.position)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors"
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

          {/* Capture Button */}
          {modelLoaded && (
            <div className="p-4 border-t border-gray-100 flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm text-slate-500 mb-1 block">Asset Name</label>
                <input
                  type="text"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  placeholder="Enter asset name"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-slate-700"
                />
              </div>
              <button
                onClick={captureVariants}
                disabled={isCapturing}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-colors"
              >
                {isCapturing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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

        {/* Variants Panel */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-slate-700">Generated Variants</h3>
            <p className="text-xs text-slate-500 mt-1">
              4 icon variants will be generated
            </p>
          </div>

          <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
            {variants.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <CameraIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No captures yet</p>
                <p className="text-xs mt-1">Load an FBX and click Capture</p>
              </div>
            ) : (
              variants.map((variant) => {
                const config = VARIANT_CONFIG.find((c) => c.name === variant.name);
                return (
                  <div
                    key={variant.name}
                    className="p-3 rounded-xl border border-gray-200 bg-gray-50"
                  >
                    <div className="flex items-start gap-3">
                      {variant.preview && (
                        <img
                          src={variant.preview}
                          alt={variant.name}
                          className="w-20 h-20 object-contain rounded-lg border border-gray-200"
                          style={{
                            background: `repeating-conic-gradient(#e5e5e5 0% 25%, #ffffff 0% 50%) 50% / 16px 16px`
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-700 text-sm">
                          {config?.label || variant.name}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {assetName}_{variant.name}.png
                        </p>
                        <button
                          onClick={() => downloadVariant(variant)}
                          className="mt-2 flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                        >
                          <ArrowDownTrayIcon className="w-3 h-3" />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {variants.length > 0 && (
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={downloadAll}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                Download All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Batch Processing Queue */}
      <div className="mt-6 bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-700">Batch Processing</h3>
            <p className="text-xs text-slate-500 mt-1">
              Add multiple FBX files to process at once
            </p>
          </div>
          <label className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 cursor-pointer transition-colors text-sm font-medium">
            Add Files
            <input
              type="file"
              accept=".fbx,.png,.jpg,.jpeg,.tga,.bmp"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  const { textureFiles } = separateFiles(e.target.files);
                  if (textureFiles.length > 0) registerTextureFiles(textureFiles);
                  addFilesToQueue(e.target.files);
                }
              }}
              className="hidden"
            />
          </label>
        </div>

        {fileQueue.length > 0 ? (
          <>
            <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto">
              {fileQueue.map((qf) => (
                <div
                  key={qf.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    qf.status === "processing"
                      ? "bg-blue-50 border-blue-200"
                      : qf.status === "done"
                      ? "bg-green-50 border-green-200"
                      : qf.status === "error"
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex-shrink-0">
                    {qf.status === "processing" ? (
                      <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    ) : qf.status === "done" ? (
                      <CheckIcon className="w-5 h-5 text-green-600" />
                    ) : qf.status === "error" ? (
                      <ExclamationCircleIcon className="w-5 h-5 text-red-600" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{qf.name}</p>
                    {qf.error && <p className="text-xs text-red-600 mt-0.5">{qf.error}</p>}
                    {qf.status === "done" && qf.variants && (
                      <p className="text-xs text-green-600 mt-0.5">{qf.variants.length} variants generated</p>
                    )}
                  </div>
                  {qf.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => removeFromQueue(qf.id)}
                      className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100 flex items-center gap-3">
              {isBatchProcessing ? (
                <div className="flex-1 flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-purple-600 h-full transition-all duration-300"
                      style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-600 flex-shrink-0">
                    {batchProgress.current} / {batchProgress.total}
                  </span>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={batchProcessAll}
                    disabled={fileQueue.every((f) => f.status === "done")}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-colors"
                  >
                    <CameraIcon className="w-5 h-5" />
                    Process All ({fileQueue.filter((f) => f.status === "pending").length} pending)
                  </button>
                  {hasCompletedBatch && (
                    <button
                      type="button"
                      onClick={downloadAllBatchResults}
                      className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                    >
                      <ArrowDownTrayIcon className="w-5 h-5" />
                      Download Zip
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={clearQueue}
                    className="px-4 py-3 text-slate-600 hover:text-red-600 transition-colors"
                  >
                    Clear
                  </button>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-slate-400">
            <CubeIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No files in queue</p>
            <p className="text-xs mt-1">Add multiple FBX files for batch processing</p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
        <h3 className="font-bold text-slate-700 mb-4">How to Use</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="p-4 bg-purple-50 rounded-xl">
            <p className="font-medium text-purple-700 mb-1">1. Load Model</p>
            <p className="text-slate-600">Drop or select an FBX file</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl">
            <p className="font-medium text-purple-700 mb-1">2. Position</p>
            <p className="text-slate-600">Use snap buttons or orbit controls</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl">
            <p className="font-medium text-purple-700 mb-1">3. Capture</p>
            <p className="text-slate-600">Click Capture to generate variants</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl">
            <p className="font-medium text-purple-700 mb-1">4. Download</p>
            <p className="text-slate-600">Download individual or all icons</p>
          </div>
        </div>
      </div>
    </>
  );
}
