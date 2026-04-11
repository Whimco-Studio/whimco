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
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";
import AdminHeader from "@/app/components/admin/AdminHeader";
import { robloxAssetsApi, robloxConfigApi } from "@/lib/api/roblox-assets";
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
  width: number;
  height: number;
}

interface RobloxUploadResult {
  assetName: string;
  variants: Array<{
    variantName: string;
    robloxAssetId: string;
    width: number;
    height: number;
  }>;
}

const CAMERA_ANGLES = [
  { name: "Front", position: [0, 50, 150], icon: "⬆️" },
  { name: "Back", position: [0, 50, -150], icon: "⬇️" },
  { name: "Left", position: [-150, 50, 0], icon: "⬅️" },
  { name: "Right", position: [150, 50, 0], icon: "➡️" },
  { name: "Top", position: [0, 200, 0.1], icon: "🔝" },
  { name: "3/4 Front Left", position: [-100, 30, 100], icon: "↖️" },
  { name: "3/4 Front Right", position: [100, 30, 100], icon: "↗️" },
  { name: "3/4 Back Left", position: [-100, 30, -100], icon: "↙️" },
  { name: "3/4 Back Right", position: [100, 30, -100], icon: "↘️" },
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

  // Per-mesh PBR texture configuration
  type TextureSlot = "color" | "roughness" | "metallic" | "normal" | "emissive";
  interface TextureSlotState {
    file: File | null;
    preview: string | null;
    texture: THREE.Texture | null;
  }
  interface MeshTextureConfig {
    slots: Record<TextureSlot, TextureSlotState>;
    emissiveIntensity: number;
    doubleSided: boolean;
  }
  interface MeshInfo {
    uuid: string;
    name: string;
  }
  const emptySlot: TextureSlotState = { file: null, preview: null, texture: null };
  const makeEmptyConfig = (): MeshTextureConfig => ({
    slots: { color: { ...emptySlot }, roughness: { ...emptySlot }, metallic: { ...emptySlot }, normal: { ...emptySlot }, emissive: { ...emptySlot } },
    emissiveIntensity: 1.0,
    doubleSided: false,
  });

  const [meshList, setMeshList] = useState<MeshInfo[]>([]);
  const [selectedMeshId, setSelectedMeshId] = useState<string>("__all__");
  const [meshConfigs, setMeshConfigs] = useState<Map<string, MeshTextureConfig>>(new Map());
  // Keep a ref in sync so useCallback functions can access current configs
  const meshConfigsRef = useRef(meshConfigs);
  meshConfigsRef.current = meshConfigs;

  // Batch processing state
  const [fileQueue, setFileQueue] = useState<QueuedFile[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [batchAngle, setBatchAngle] = useState(CAMERA_ANGLES[5]); // default: 3/4 Front Left

  // Roblox upload state
  const [isUploadingToRoblox, setIsUploadingToRoblox] = useState(false);
  const [robloxUploadProgress, setRobloxUploadProgress] = useState({ current: 0, total: 0, label: "" });
  const [robloxUploadError, setRobloxUploadError] = useState<string | null>(null);

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

  // Detect flipY from existing model textures
  const getModelFlipY = (): boolean => {
    let flipY = true;
    const model = modelRef.current;
    if (model) {
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          for (const mat of mats) {
            if ("map" in mat && mat.map instanceof THREE.Texture) {
              flipY = mat.map.flipY;
              return;
            }
          }
        }
      });
    }
    return flipY;
  };

  // Get config for a mesh, or create a default one
  const getOrCreateConfig = (meshId: string): MeshTextureConfig => {
    return meshConfigs.get(meshId) ?? makeEmptyConfig();
  };

  // Get the effective config for a mesh (check mesh-specific first, then "all")
  const getEffectiveConfig = (meshId: string, configs: Map<string, MeshTextureConfig>): MeshTextureConfig => {
    const meshSpecific = configs.get(meshId);
    const allConfig = configs.get("__all__");
    if (!meshSpecific && !allConfig) return makeEmptyConfig();
    if (!meshSpecific) return allConfig!;
    if (!allConfig) return meshSpecific;
    // Merge: mesh-specific slots override "all" slots where set
    const merged = makeEmptyConfig();
    merged.doubleSided = meshSpecific.doubleSided || allConfig.doubleSided;
    merged.emissiveIntensity = meshSpecific.slots.emissive.texture ? meshSpecific.emissiveIntensity : allConfig.emissiveIntensity;
    const slotKeys: TextureSlot[] = ["color", "roughness", "metallic", "normal", "emissive"];
    for (const key of slotKeys) {
      merged.slots[key] = meshSpecific.slots[key].texture ? meshSpecific.slots[key] : allConfig.slots[key];
    }
    return merged;
  };

  // Load a texture file into a slot for a specific mesh (or "__all__")
  const setTextureSlot = (meshId: string, slot: TextureSlot, file: File) => {
    const blobUrl = URL.createObjectURL(file);
    textureMapRef.current.set(file.name.toLowerCase(), blobUrl);

    const loader = new THREE.TextureLoader();
    loader.load(blobUrl, (texture) => {
      texture.colorSpace = (slot === "color" || slot === "emissive") ? THREE.SRGBColorSpace : THREE.LinearSRGBColorSpace;
      texture.flipY = getModelFlipY();
      texture.needsUpdate = true;

      setMeshConfigs((prev) => {
        const next = new Map(prev);
        const config = next.get(meshId) ?? makeEmptyConfig();
        if (config.slots[slot].preview) URL.revokeObjectURL(config.slots[slot].preview!);
        config.slots[slot] = { file, preview: blobUrl, texture };
        next.set(meshId, config);
        applyAllMeshTextures(next);
        return next;
      });
    });
  };

  const clearTextureSlot = (meshId: string, slot: TextureSlot) => {
    setMeshConfigs((prev) => {
      const next = new Map(prev);
      const config = next.get(meshId);
      if (!config) return prev;
      if (config.slots[slot].preview) URL.revokeObjectURL(config.slots[slot].preview!);
      config.slots[slot] = { ...emptySlot };
      next.set(meshId, config);
      applyAllMeshTextures(next);
      return next;
    });
  };

  const setMeshDoubleSided = (meshId: string, doubleSided: boolean) => {
    setMeshConfigs((prev) => {
      const next = new Map(prev);
      const config = next.get(meshId) ?? makeEmptyConfig();
      config.doubleSided = doubleSided;
      next.set(meshId, config);
      applyAllMeshTextures(next);
      return next;
    });
  };

  const setMeshEmissiveIntensity = (meshId: string, intensity: number) => {
    setMeshConfigs((prev) => {
      const next = new Map(prev);
      const config = next.get(meshId) ?? makeEmptyConfig();
      config.emissiveIntensity = intensity;
      next.set(meshId, config);
      applyAllMeshTextures(next);
      return next;
    });
  };

  const clearAllMeshConfigs = () => {
    setMeshConfigs((prev) => {
      prev.forEach((config) => {
        Object.values(config.slots).forEach((s) => {
          if (s.preview) URL.revokeObjectURL(s.preview);
        });
      });
      return new Map();
    });
    setSelectedMeshId("__all__");
    // Restore original materials
    const model = modelRef.current;
    if (model) {
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const original = originalMaterialsRef.current.get(child);
          if (original) child.material = original;
        }
      });
    }
  };

  // Apply per-mesh texture configs to the model
  const applyAllMeshTextures = (configs: Map<string, MeshTextureConfig>) => {
    const model = modelRef.current;
    if (!model) return;

    const hasAnyConfig = configs.size > 0;
    if (!hasAnyConfig) return;

    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const effective = getEffectiveConfig(child.uuid, configs);
        const hasAnyTexture = Object.values(effective.slots).some((s) => s.texture);
        const needsDoubleSide = effective.doubleSided;

        if (!hasAnyTexture && !needsDoubleSide) return;

        const origMat = originalMaterialsRef.current.get(child);
        const base = origMat && !Array.isArray(origMat) ? origMat : null;

        let color = new THREE.Color(0xcccccc);
        let existingMap: THREE.Texture | null = null;
        if (base && "color" in base && base.color instanceof THREE.Color) color = base.color.clone();
        if (base && "map" in base && base.map instanceof THREE.Texture) existingMap = base.map;

        const mat = new THREE.MeshStandardMaterial({
          color: effective.slots.color.texture ? 0xffffff : color,
          map: effective.slots.color.texture || existingMap,
          roughnessMap: effective.slots.roughness.texture || null,
          roughness: effective.slots.roughness.texture ? 1.0 : 0.5,
          metalnessMap: effective.slots.metallic.texture || null,
          metalness: effective.slots.metallic.texture ? 1.0 : 0.0,
          normalMap: effective.slots.normal.texture || null,
          emissiveMap: effective.slots.emissive.texture || null,
          emissive: effective.slots.emissive.texture ? new THREE.Color(0xffffff) : new THREE.Color(0x000000),
          emissiveIntensity: effective.emissiveIntensity,
          side: effective.doubleSided ? THREE.DoubleSide : THREE.FrontSide,
        });

        child.material = mat;
      }
    });
  };

  // A reusable blob URL for a 1x1 transparent PNG, used as fallback for missing textures
  const fallbackBlobUrlRef = useRef<string | null>(null);
  const getFallbackBlobUrl = () => {
    if (!fallbackBlobUrlRef.current) {
      const bytes = new Uint8Array([
        0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0x00,0x00,0x00,0x0d,0x49,0x48,0x44,0x52,
        0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,0x08,0x06,0x00,0x00,0x00,0x1f,0x15,0xc4,
        0x89,0x00,0x00,0x00,0x0a,0x49,0x44,0x41,0x54,0x78,0x9c,0x62,0x00,0x00,0x00,0x02,
        0x00,0x01,0xe5,0x27,0xde,0xfc,0x00,0x00,0x00,0x00,0x49,0x45,0x4e,0x44,0xae,0x42,
        0x60,0x82,
      ]);
      fallbackBlobUrlRef.current = URL.createObjectURL(new Blob([bytes], { type: "image/png" }));
    }
    return fallbackBlobUrlRef.current;
  };

  // Create a LoadingManager that intercepts texture requests and serves from uploaded files
  const createTextureLoadingManager = () => {
    const manager = new THREE.LoadingManager();
    manager.setURLModifier((url: string) => {
      // Pass through blob URLs and data URIs (these are embedded textures already resolved by FBXLoader)
      if (url.startsWith("blob:") || url.startsWith("data:")) {
        return url;
      }
      // Extract just the filename from the URL (handles full paths, relative paths, encoded names)
      const decoded = decodeURIComponent(url);
      const filename = decoded.split(/[\\/]/).pop()?.toLowerCase() || "";
      const blobUrl = textureMapRef.current.get(filename);
      if (blobUrl) {
        return blobUrl;
      }
      // Return a blob URL for a 1x1 transparent pixel to suppress 404s for missing textures
      return getFallbackBlobUrl();
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

      // Enumerate meshes for per-mesh texture assignment
      const meshes: MeshInfo[] = [];
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          meshes.push({ uuid: child.uuid, name: child.name || `Mesh ${meshes.length + 1}` });
        }
      });
      setMeshList(meshes);
      setSelectedMeshId("__all__");
      setMeshConfigs(new Map());

      // Wait for any async texture loading (blob URL textures load asynchronously)
      await waitForTextures(object);

      setModelLoaded(true);

      // Reset to standard lighting when loading new model
      setLightingMode("lit");

      // Fit camera to model
      if (cameraRef.current && controlsRef.current) {
        const dir = new THREE.Vector3(100, 80, 100).normalize();
        fitCameraToModel(cameraRef.current, object, controlsRef.current, dir);
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

  // Register texture files into the filename map for FBXLoader auto-resolution
  const registerTextureFilesForLoader = (files: File[]) => {
    for (const file of files) {
      const blobUrl = URL.createObjectURL(file);
      textureMapRef.current.set(file.name.toLowerCase(), blobUrl);
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const { fbxFile, textureFiles } = separateFiles(files);
      if (textureFiles.length > 0) {
        registerTextureFilesForLoader(textureFiles);
      }
      if (fbxFile) {
        setSelectedFile(fbxFile);
        loadModel(fbxFile);
      } else {
        setError("Please select an FBX file");
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
        registerTextureFilesForLoader(textureFiles);
      }
      if (fbxFile) {
        setSelectedFile(fbxFile);
        loadModel(fbxFile);
      } else {
        setError("Please drop an FBX file");
      }
    }
  }, [loadModel]);

  // Fit camera to model bounds — keeps the same viewing direction but adjusts distance
  const fitCameraToModel = (camera: THREE.PerspectiveCamera, model: THREE.Group, controls: OrbitControls, direction?: THREE.Vector3) => {
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const sphere = new THREE.Sphere();
    box.getBoundingSphere(sphere);

    const fovRad = camera.fov * (Math.PI / 180);
    const hFov = 2 * Math.atan(Math.tan(fovRad / 2) * camera.aspect);
    const effectiveFov = Math.min(fovRad, hFov);

    // Distance so the full bounding sphere fits in view, plus 15% padding
    const distance = (sphere.radius / Math.sin(effectiveFov / 2)) * 1.15;

    const dir = direction || camera.position.clone().sub(controls.target).normalize();
    camera.position.copy(center).add(dir.multiplyScalar(distance));
    controls.target.copy(center);
    controls.update();
  };

  // Snap camera to angle
  const snapToAngle = (position: number[]) => {
    if (cameraRef.current && controlsRef.current && modelRef.current) {
      const dir = new THREE.Vector3(position[0], position[1], position[2]).normalize();
      fitCameraToModel(cameraRef.current, modelRef.current, controlsRef.current, dir);
    } else if (cameraRef.current && controlsRef.current) {
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

    // Re-apply per-mesh texture configs on top of the new lighting materials
    applyAllMeshTextures(meshConfigsRef.current);
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
        width: bounds.width,
        height: bounds.height,
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
    const batchCameraAngle = batchAngle.position;

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

        // Fit camera to model bounds using selected batch angle
        if (controlsRef.current) {
          const dir = new THREE.Vector3(batchCameraAngle[0], batchCameraAngle[1], batchCameraAngle[2]).normalize();
          fitCameraToModel(camera, object, controlsRef.current, dir);
        }

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
            width: bounds.width,
            height: bounds.height,
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

  // Generate a random rbxmx referent ID
  const makeReferent = () => {
    const hex = () => Math.random().toString(16).substring(2, 10);
    return `RBX${hex()}${hex()}${hex()}${hex()}`;
  };

  // Generate RBXMX XML from uploaded assets
  const generateRbxmx = (containerName: string, items: RobloxUploadResult[]): string => {
    const imageLabel = (
      name: string,
      imageId: string,
      aspectRatio: number,
      opts: {
        anchorCenter?: boolean;
        sizeScale?: boolean;
        children?: string;
      } = {}
    ) => {
      const anchorX = opts.anchorCenter ? "0.5" : "0";
      const anchorY = opts.anchorCenter ? "0.5" : "0";
      const posXS = opts.anchorCenter ? "0.5" : "0";
      const posYS = opts.anchorCenter ? "0.5" : "0";
      const sizeXS = opts.sizeScale ? "0.980000019" : "0";
      const sizeXO = opts.sizeScale ? "0" : "95";
      const sizeYS = opts.sizeScale ? "0.980000019" : "0";
      const sizeYO = opts.sizeScale ? "0" : "85";

      return `<Item class="ImageLabel" referent="${makeReferent()}">
				<Properties>
					<Content name="Image"><url>rbxthumb://type=Asset&amp;id=${imageId}&amp;w=420&amp;h=420</url></Content>
					<Color3 name="ImageColor3"><R>1</R><G>1</G><B>1</B></Color3>
					<Vector2 name="ImageRectOffset"><X>0</X><Y>0</Y></Vector2>
					<Vector2 name="ImageRectSize"><X>0</X><Y>0</Y></Vector2>
					<float name="ImageTransparency">0</float>
					<token name="ResampleMode">0</token>
					<token name="ScaleType">0</token>
					<Rect2D name="SliceCenter"><min><X>0</X><Y>0</Y></min><max><X>0</X><Y>0</Y></max></Rect2D>
					<float name="SliceScale">1</float>
					<UDim2 name="TileSize"><XS>1</XS><XO>0</XO><YS>1</YS><YO>0</YO></UDim2>
					<bool name="Active">false</bool>
					<Vector2 name="AnchorPoint"><X>${anchorX}</X><Y>${anchorY}</Y></Vector2>
					<token name="AutomaticSize">0</token>
					<Color3 name="BackgroundColor3"><R>1</R><G>1</G><B>1</B></Color3>
					<float name="BackgroundTransparency">1</float>
					<Color3 name="BorderColor3"><R>0</R><G>0</G><B>0</B></Color3>
					<token name="BorderMode">0</token>
					<int name="BorderSizePixel">0</int>
					<bool name="ClipsDescendants">false</bool>
					<bool name="Draggable">false</bool>
					<token name="InputSink">0</token>
					<bool name="Interactable">true</bool>
					<int name="LayoutOrder">0</int>
					<Ref name="NextSelectionDown">null</Ref>
					<Ref name="NextSelectionLeft">null</Ref>
					<Ref name="NextSelectionRight">null</Ref>
					<Ref name="NextSelectionUp">null</Ref>
					<UDim2 name="Position"><XS>${posXS}</XS><XO>0</XO><YS>${posYS}</YS><YO>0</YO></UDim2>
					<float name="Rotation">0</float>
					<bool name="Selectable">false</bool>
					<Ref name="SelectionImageObject">null</Ref>
					<int name="SelectionOrder">0</int>
					<UDim2 name="Size"><XS>${sizeXS}</XS><XO>${sizeXO}</XO><YS>${sizeYS}</YS><YO>${sizeYO}</YO></UDim2>
					<token name="SizeConstraint">0</token>
					<bool name="Visible">true</bool>
					<int name="ZIndex">1</int>
					<bool name="AutoLocalize">true</bool>
					<Ref name="RootLocalizationTable">null</Ref>
					<token name="SelectionBehaviorDown">0</token>
					<token name="SelectionBehaviorLeft">0</token>
					<token name="SelectionBehaviorRight">0</token>
					<token name="SelectionBehaviorUp">0</token>
					<bool name="SelectionGroup">false</bool>
					<BinaryString name="AttributesSerialize"></BinaryString>
					<SecurityCapabilities name="Capabilities">0</SecurityCapabilities>
					<bool name="DefinesCapabilities">false</bool>
					<string name="Name">${name}</string>
					<int64 name="SourceAssetId">-1</int64>
					<BinaryString name="Tags"></BinaryString>
				</Properties>
				<Item class="UIAspectRatioConstraint" referent="${makeReferent()}">
					<Properties>
						<float name="AspectRatio">${aspectRatio}</float>
						<token name="AspectType">0</token>
						<token name="DominantAxis">0</token>
						<BinaryString name="AttributesSerialize"></BinaryString>
						<SecurityCapabilities name="Capabilities">0</SecurityCapabilities>
						<bool name="DefinesCapabilities">false</bool>
						<string name="Name">UIAspectRatioConstraint</string>
						<int64 name="SourceAssetId">-1</int64>
						<BinaryString name="Tags"></BinaryString>
					</Properties>
				</Item>${opts.children ? "\n" + opts.children : ""}
			</Item>`;
    };

    // Build items for each model
    const modelItems = items.map((item) => {
      const extruded = item.variants.find((v) => v.variantName === "WhiteExtruded");
      const noOutline = item.variants.find((v) => v.variantName === "NoOutline");
      if (!extruded || !noOutline) return "";

      const aspectRatio = extruded.width / extruded.height;

      const innerLabel = imageLabel(
        `${item.assetName}_NoOutline`,
        noOutline.robloxAssetId,
        aspectRatio,
        { anchorCenter: true, sizeScale: true }
      );

      return imageLabel(
        `${item.assetName}WhiteExtruded`,
        extruded.robloxAssetId,
        aspectRatio,
        { children: innerLabel }
      );
    }).filter(Boolean).join("\n\t\t\t\t");

    return `<roblox xmlns:xmime="http://www.w3.org/2005/05/xmlmime" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.roblox.com/roblox.xsd" version="4">
	<Meta name="ExplicitAutoJoints">true</Meta>
	<External>null</External>
	<External>nil</External>
	<Item class="Frame" referent="${makeReferent()}">
		<Properties>
			<token name="Style">0</token>
			<bool name="Active">false</bool>
			<Vector2 name="AnchorPoint"><X>0</X><Y>0</Y></Vector2>
			<token name="AutomaticSize">0</token>
			<Color3 name="BackgroundColor3"><R>1</R><G>1</G><B>1</B></Color3>
			<float name="BackgroundTransparency">1</float>
			<Color3 name="BorderColor3"><R>0</R><G>0</G><B>0</B></Color3>
			<token name="BorderMode">0</token>
			<int name="BorderSizePixel">0</int>
			<bool name="ClipsDescendants">false</bool>
			<bool name="Draggable">false</bool>
			<token name="InputSink">0</token>
			<bool name="Interactable">true</bool>
			<int name="LayoutOrder">0</int>
			<Ref name="NextSelectionDown">null</Ref>
			<Ref name="NextSelectionLeft">null</Ref>
			<Ref name="NextSelectionRight">null</Ref>
			<Ref name="NextSelectionUp">null</Ref>
			<UDim2 name="Position"><XS>0</XS><XO>0</XO><YS>0</YS><YO>0</YO></UDim2>
			<float name="Rotation">0</float>
			<bool name="Selectable">false</bool>
			<Ref name="SelectionImageObject">null</Ref>
			<int name="SelectionOrder">0</int>
			<UDim2 name="Size"><XS>1</XS><XO>0</XO><YS>1</YS><YO>0</YO></UDim2>
			<token name="SizeConstraint">0</token>
			<bool name="Visible">true</bool>
			<int name="ZIndex">1</int>
			<bool name="AutoLocalize">true</bool>
			<Ref name="RootLocalizationTable">null</Ref>
			<token name="SelectionBehaviorDown">0</token>
			<token name="SelectionBehaviorLeft">0</token>
			<token name="SelectionBehaviorRight">0</token>
			<token name="SelectionBehaviorUp">0</token>
			<bool name="SelectionGroup">false</bool>
			<BinaryString name="AttributesSerialize"></BinaryString>
			<SecurityCapabilities name="Capabilities">0</SecurityCapabilities>
			<bool name="DefinesCapabilities">false</bool>
			<string name="Name">${containerName}</string>
			<int64 name="SourceAssetId">-1</int64>
			<BinaryString name="Tags"></BinaryString>
		</Properties>
		<Item class="ScrollingFrame" referent="${makeReferent()}">
			<Properties>
				<token name="AutomaticCanvasSize">2</token>
				<Content name="BottomImage"><url>rbxasset://textures/ui/Scroll/scroll-bottom.png</url></Content>
				<Vector2 name="CanvasPosition"><X>0</X><Y>0</Y></Vector2>
				<UDim2 name="CanvasSize"><XS>0</XS><XO>0</XO><YS>0</YS><YO>0</YO></UDim2>
				<token name="ElasticBehavior">0</token>
				<token name="HorizontalScrollBarInset">0</token>
				<Content name="MidImage"><url>rbxasset://textures/ui/Scroll/scroll-middle.png</url></Content>
				<Color3 name="ScrollBarImageColor3"><R>0</R><G>0</G><B>0</B></Color3>
				<float name="ScrollBarImageTransparency">0</float>
				<int name="ScrollBarThickness">12</int>
				<token name="ScrollingDirection">4</token>
				<bool name="ScrollingEnabled">true</bool>
				<Content name="TopImage"><url>rbxasset://textures/ui/Scroll/scroll-top.png</url></Content>
				<token name="VerticalScrollBarInset">0</token>
				<token name="VerticalScrollBarPosition">0</token>
				<bool name="Active">true</bool>
				<Vector2 name="AnchorPoint"><X>0</X><Y>0</Y></Vector2>
				<token name="AutomaticSize">0</token>
				<Color3 name="BackgroundColor3"><R>1</R><G>1</G><B>1</B></Color3>
				<float name="BackgroundTransparency">1</float>
				<Color3 name="BorderColor3"><R>0</R><G>0</G><B>0</B></Color3>
				<token name="BorderMode">0</token>
				<int name="BorderSizePixel">0</int>
				<bool name="ClipsDescendants">true</bool>
				<bool name="Draggable">false</bool>
				<token name="InputSink">0</token>
				<bool name="Interactable">true</bool>
				<int name="LayoutOrder">0</int>
				<Ref name="NextSelectionDown">null</Ref>
				<Ref name="NextSelectionLeft">null</Ref>
				<Ref name="NextSelectionRight">null</Ref>
				<Ref name="NextSelectionUp">null</Ref>
				<UDim2 name="Position"><XS>0</XS><XO>0</XO><YS>0</YS><YO>0</YO></UDim2>
				<float name="Rotation">0</float>
				<bool name="Selectable">true</bool>
				<Ref name="SelectionImageObject">null</Ref>
				<int name="SelectionOrder">0</int>
				<UDim2 name="Size"><XS>1</XS><XO>0</XO><YS>1</YS><YO>0</YO></UDim2>
				<token name="SizeConstraint">0</token>
				<bool name="Visible">true</bool>
				<int name="ZIndex">1</int>
				<bool name="AutoLocalize">true</bool>
				<Ref name="RootLocalizationTable">null</Ref>
				<token name="SelectionBehaviorDown">0</token>
				<token name="SelectionBehaviorLeft">0</token>
				<token name="SelectionBehaviorRight">0</token>
				<token name="SelectionBehaviorUp">0</token>
				<bool name="SelectionGroup">true</bool>
				<BinaryString name="AttributesSerialize"></BinaryString>
				<SecurityCapabilities name="Capabilities">0</SecurityCapabilities>
				<bool name="DefinesCapabilities">false</bool>
				<string name="Name">ScrollingFrame</string>
				<int64 name="SourceAssetId">-1</int64>
				<BinaryString name="Tags"></BinaryString>
			</Properties>
			<Item class="UIListLayout" referent="${makeReferent()}">
				<Properties>
					<token name="HorizontalFlex">0</token>
					<token name="ItemLineAlignment">0</token>
					<UDim name="Padding"><S>0</S><O>0</O></UDim>
					<token name="VerticalFlex">0</token>
					<bool name="Wraps">true</bool>
					<token name="FillDirection">0</token>
					<token name="HorizontalAlignment">1</token>
					<token name="SortOrder">2</token>
					<token name="VerticalAlignment">1</token>
					<BinaryString name="AttributesSerialize"></BinaryString>
					<SecurityCapabilities name="Capabilities">0</SecurityCapabilities>
					<bool name="DefinesCapabilities">false</bool>
					<string name="Name">UIListLayout</string>
					<int64 name="SourceAssetId">-1</int64>
					<BinaryString name="Tags"></BinaryString>
				</Properties>
			</Item>
			${modelItems}
		</Item>
	</Item>
</roblox>`;
  };

  // Upload variants to Roblox and generate RBXMX
  const uploadToRobloxAndExport = async (
    items: Array<{ assetName: string; variants: CapturedVariant[] }>,
    containerName: string
  ) => {
    setIsUploadingToRoblox(true);
    setRobloxUploadError(null);

    // Count total uploads
    const totalUploads = items.reduce(
      (sum, item) => sum + item.variants.filter((v) => v.blob).length,
      0
    );
    setRobloxUploadProgress({ current: 0, total: totalUploads, label: "Fetching config..." });

    try {
      // Get Roblox config for destination
      const config = await robloxConfigApi.get();
      if (!config.is_configured) {
        throw new Error("Roblox API is not configured. Go to Settings to set up your API key.");
      }

      const results: RobloxUploadResult[] = [];
      let uploaded = 0;

      for (const item of items) {
        const uploadedVariants: RobloxUploadResult["variants"] = [];

        for (const variant of item.variants) {
          if (!variant.blob) continue;

          setRobloxUploadProgress({
            current: uploaded,
            total: totalUploads,
            label: `Uploading ${item.assetName}_${variant.name}...`,
          });

          // Convert blob to File for the API
          const file = new File(
            [variant.blob],
            `${item.assetName}_${variant.name}.png`,
            { type: "image/png" }
          );

          const asset = await robloxAssetsApi.upload({
            name: `${item.assetName}_${variant.name}`,
            asset_type: "image",
            original_file: file,
            description: `Icon variant: ${variant.name}`,
            tags: ["icon-generator", variant.name.toLowerCase()],
            destination_type: config.default_destination_type,
            roblox_group_id: config.default_destination_type === "group" ? config.default_group_id : undefined,
            roblox_user_id: config.default_destination_type === "user" ? config.roblox_user_id : undefined,
          });

          if (asset.status === "failed") {
            throw new Error(`Roblox upload failed for ${item.assetName}_${variant.name}: ${asset.error_message || "Unknown error"}`);
          }

          if (!asset.roblox_asset_id) {
            throw new Error(`No Roblox asset ID returned for ${item.assetName}_${variant.name} (status: ${asset.status})`);
          }

          uploadedVariants.push({
            variantName: variant.name,
            robloxAssetId: asset.roblox_asset_id,
            width: variant.width,
            height: variant.height,
          });

          uploaded++;
          setRobloxUploadProgress({
            current: uploaded,
            total: totalUploads,
            label: `Uploaded ${item.assetName}_${variant.name} (${asset.roblox_asset_id})`,
          });
        }

        results.push({ assetName: item.assetName, variants: uploadedVariants });
      }

      // Generate and download RBXMX
      setRobloxUploadProgress({
        current: totalUploads,
        total: totalUploads,
        label: "Generating RBXMX file...",
      });

      const rbxmx = generateRbxmx(containerName, results);
      const blob = new Blob([rbxmx], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${containerName}.rbxmx`;
      a.click();
      URL.revokeObjectURL(url);

      setRobloxUploadProgress({
        current: totalUploads,
        total: totalUploads,
        label: `Done! ${totalUploads} images uploaded, RBXMX downloaded.`,
      });
    } catch (err) {
      setRobloxUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploadingToRoblox(false);
    }
  };

  // Upload single capture variants
  const uploadSingleToRoblox = () => {
    if (variants.length === 0 || !assetName) return;
    uploadToRobloxAndExport(
      [{ assetName, variants }],
      assetName
    );
  };

  // Upload all batch results
  const uploadBatchToRoblox = () => {
    const completedItems = fileQueue
      .filter((qf) => qf.status === "done" && qf.variants && qf.variants.length > 0)
      .map((qf) => ({ assetName: qf.name, variants: qf.variants! }));
    if (completedItems.length === 0) return;
    uploadToRobloxAndExport(completedItems, "IconExport");
  };

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

              {/* Per-Mesh PBR Texture Slots */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-600">Textures</p>
                  <div className="flex items-center gap-2">
                    {meshConfigs.size > 0 && (
                      <button
                        type="button"
                        onClick={clearAllMeshConfigs}
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                {/* Mesh Selector */}
                {meshList.length > 1 && (
                  <div className="mb-3">
                    <select
                      value={selectedMeshId}
                      onChange={(e) => setSelectedMeshId(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:border-purple-500"
                    >
                      <option value="__all__">All Meshes</option>
                      {meshList.map((m) => (
                        <option key={m.uuid} value={m.uuid}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Texture Slot Grid */}
                {(() => {
                  const config = getOrCreateConfig(selectedMeshId);
                  return (
                    <>
                      <div className="grid grid-cols-5 gap-2">
                        {([
                          { slot: "color" as TextureSlot, label: "Color" },
                          { slot: "roughness" as TextureSlot, label: "Rough" },
                          { slot: "metallic" as TextureSlot, label: "Metal" },
                          { slot: "normal" as TextureSlot, label: "Normal" },
                          { slot: "emissive" as TextureSlot, label: "Emissive" },
                        ]).map(({ slot, label }) => (
                          <div key={slot} className="relative group">
                            <label className={`block cursor-pointer rounded-lg border-2 border-dashed transition-colors overflow-hidden ${
                              config.slots[slot].file
                                ? "border-purple-300 bg-purple-50"
                                : "border-gray-200 hover:border-purple-300 bg-gray-50"
                            }`}>
                              {config.slots[slot].preview ? (
                                <img
                                  src={config.slots[slot].preview!}
                                  alt={label}
                                  className="w-full aspect-square object-cover"
                                />
                              ) : (
                                <div className="w-full aspect-square flex items-center justify-center">
                                  <span className="text-xl text-gray-300">+</span>
                                </div>
                              )}
                              <input
                                type="file"
                                accept=".png,.jpg,.jpeg,.tga,.bmp"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) setTextureSlot(selectedMeshId, slot, file);
                                }}
                                className="hidden"
                              />
                            </label>
                            {config.slots[slot].file && (
                              <button
                                type="button"
                                onClick={() => clearTextureSlot(selectedMeshId, slot)}
                                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <XMarkIcon className="w-3 h-3" />
                              </button>
                            )}
                            <p className="text-xs text-center text-slate-500 mt-1">{label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Emissive Intensity + Double Sided */}
                      <div className="flex flex-wrap items-center gap-4 mt-3">
                        {config.slots.emissive.texture && (
                          <div className="flex-1 min-w-[140px]">
                            <p className="text-xs text-slate-500 mb-1">
                              Emissive: <span className="text-purple-600">{config.emissiveIntensity.toFixed(1)}</span>
                            </p>
                            <input
                              type="range"
                              min="0"
                              max="5"
                              step="0.1"
                              value={config.emissiveIntensity}
                              onChange={(e) => setMeshEmissiveIntensity(selectedMeshId, parseFloat(e.target.value))}
                              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                            />
                          </div>
                        )}
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={config.doubleSided}
                            onChange={(e) => setMeshDoubleSided(selectedMeshId, e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 accent-purple-600"
                          />
                          <span className="text-xs text-slate-600">Double Sided</span>
                        </label>
                      </div>
                    </>
                  );
                })()}
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
            <div className="p-4 border-t border-gray-100 space-y-2">
              <button
                type="button"
                onClick={downloadAll}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                Download All
              </button>
              <button
                type="button"
                onClick={uploadSingleToRoblox}
                disabled={isUploadingToRoblox || !assetName}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <CloudArrowUpIcon className="w-5 h-5" />
                Upload to Roblox & Export RBXMX
              </button>
            </div>
          )}

          {/* Roblox Upload Progress (single mode) */}
          {(isUploadingToRoblox || robloxUploadProgress.label) && variants.length > 0 && (
            <div className="p-4 border-t border-gray-100">
              {isUploadingToRoblox && robloxUploadProgress.total > 0 && (
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full transition-all duration-300"
                      style={{ width: `${(robloxUploadProgress.current / robloxUploadProgress.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-600 flex-shrink-0">
                    {robloxUploadProgress.current} / {robloxUploadProgress.total}
                  </span>
                </div>
              )}
              {robloxUploadProgress.label && (
                <p className="text-xs text-slate-500">{robloxUploadProgress.label}</p>
              )}
              {robloxUploadError && (
                <p className="text-xs text-red-600 mt-1">{robloxUploadError}</p>
              )}
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
                  if (textureFiles.length > 0) registerTextureFilesForLoader(textureFiles);
                  addFilesToQueue(e.target.files);
                }
              }}
              className="hidden"
            />
          </label>
        </div>

        {/* Batch Angle Selector */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 mr-1">Angle:</span>
          {CAMERA_ANGLES.map((angle) => (
            <button
              key={angle.name}
              type="button"
              onClick={() => {
                setBatchAngle(angle);
                snapToAngle(angle.position);
              }}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                batchAngle.name === angle.name
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-slate-600 hover:bg-gray-200"
              }`}
            >
              {angle.icon} {angle.name}
            </button>
          ))}
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
                    <>
                      <button
                        type="button"
                        onClick={downloadAllBatchResults}
                        className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                      >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        Download Zip
                      </button>
                      <button
                        type="button"
                        onClick={uploadBatchToRoblox}
                        disabled={isUploadingToRoblox}
                        className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        <CloudArrowUpIcon className="w-5 h-5" />
                        Roblox + RBXMX
                      </button>
                    </>
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
              {/* Roblox Upload Progress (batch mode) */}
              {(isUploadingToRoblox || robloxUploadProgress.label) && hasCompletedBatch && (
                <div className="mt-3">
                  {isUploadingToRoblox && robloxUploadProgress.total > 0 && (
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full transition-all duration-300"
                          style={{ width: `${(robloxUploadProgress.current / robloxUploadProgress.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-600 flex-shrink-0">
                        {robloxUploadProgress.current} / {robloxUploadProgress.total}
                      </span>
                    </div>
                  )}
                  {robloxUploadProgress.label && (
                    <p className="text-xs text-slate-500">{robloxUploadProgress.label}</p>
                  )}
                  {robloxUploadError && (
                    <p className="text-xs text-red-600 mt-1">{robloxUploadError}</p>
                  )}
                </div>
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
