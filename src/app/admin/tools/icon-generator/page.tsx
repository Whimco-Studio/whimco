"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import { FBXLoader } from "three-stdlib";
import {
  ArrowLeftIcon,
  CameraIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import AdminHeader from "@/app/components/admin/AdminHeader";

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
  },
  {
    name: "BlackOutline",
    label: "Black Outline",
    outlineColor: "#000000",
    showModel: true,
  },
  {
    name: "WhiteOutline",
    label: "White Outline",
    outlineColor: "#ffffff",
    showModel: true,
  },
  {
    name: "OutlineOnly",
    label: "Outline Only",
    outlineColor: "#000000",
    showModel: false,
  },
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

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [variants, setVariants] = useState<CapturedVariant[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [assetName, setAssetName] = useState("");

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

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 200, 100);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-100, 100, -100);
    scene.add(fillLight);

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
    setVariants([]);

    // Set default asset name from filename
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    setAssetName(nameWithoutExt);

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

      // Enable shadows on meshes
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      sceneRef.current.add(object);
      modelRef.current = object;
      setModelLoaded(true);

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
      const file = files[0];
      if (file.name.toLowerCase().endsWith(".fbx")) {
        setSelectedFile(file);
        loadModel(file);
      } else {
        setError("Please drop an FBX file");
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

    // Set transparent background for capture
    scene.background = null;

    for (const config of VARIANT_CONFIG) {
      const outlineMeshes: THREE.Mesh[] = [];

      // Show or hide model based on config
      model.visible = config.showModel;

      // Add outline meshes if needed
      if (config.outlineColor) {
        const outlineColor = new THREE.Color(config.outlineColor);

        model.traverse((child) => {
          if (child instanceof THREE.Mesh && child.geometry) {
            const outlineMaterial = new THREE.MeshBasicMaterial({
              color: outlineColor,
              side: THREE.BackSide,
            });

            const outlineMesh = new THREE.Mesh(child.geometry, outlineMaterial);

            // Copy world transform
            child.updateWorldMatrix(true, false);
            outlineMesh.applyMatrix4(child.matrixWorld);

            // Scale up for outline effect
            const scale = 1.03;
            outlineMesh.scale.multiplyScalar(scale);

            scene.add(outlineMesh);
            outlineMeshes.push(outlineMesh);
          }
        });
      }

      // Render
      renderer.render(scene, camera);

      // Capture to blob
      const dataUrl = renderer.domElement.toDataURL("image/png");
      const blob = await (await fetch(dataUrl)).blob();

      capturedVariants.push({
        name: config.name,
        blob,
        preview: dataUrl,
      });

      // Clean up outline meshes
      outlineMeshes.forEach((mesh) => {
        scene.remove(mesh);
        (mesh.material as THREE.Material).dispose();
      });
    }

    // Restore original state
    model.visible = true;
    scene.background = originalBackground;
    if (grid) {
      grid.visible = gridWasVisible;
    }
    renderer.render(scene, camera);

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
                <p className="text-slate-600 font-medium mb-2">Drop FBX file here</p>
                <p className="text-slate-400 text-sm mb-4">or</p>
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

            {error && (
              <div className="absolute bottom-4 left-4 right-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-2">
                <ExclamationCircleIcon className="w-5 h-5" />
                {error}
              </div>
            )}
          </div>

          {/* Camera Angle Buttons */}
          {modelLoaded && (
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
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
