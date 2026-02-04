"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import { FBXLoader } from "three-stdlib";
import {
  XMarkIcon,
  ArrowUpTrayIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClipboardDocumentIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { QuirkyverseAnimations, ANIMATION_NAMES } from "@/types/quirkyverse";

interface AnimationExtractorModalProps {
  characterName: string;
  currentAnimations: QuirkyverseAnimations;
  onClose: () => void;
  onSave: (animations: QuirkyverseAnimations) => Promise<void>;
}

interface ExtractedAnimation {
  name: string;
  clip: THREE.AnimationClip;
  duration: number;
  mappedName: string | null; // Which standard animation name it maps to
  robloxId: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
}

export default function AnimationExtractorModal({
  characterName,
  currentAnimations,
  onClose,
  onSave,
}: AnimationExtractorModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);
  const clockRef = useRef(new THREE.Clock());
  const frameIdRef = useRef<number>(0);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animations, setAnimations] = useState<ExtractedAnimation[]>([]);
  const [playingAnimation, setPlayingAnimation] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 100, 200);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 200, 100);
    scene.add(directionalLight);

    // Grid
    const gridHelper = new THREE.GridHelper(400, 40, 0x444466, 0x333355);
    scene.add(gridHelper);

    // Animation loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      const delta = clockRef.current.getDelta();
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }
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

  // Auto-map animation name to standard name
  const autoMapAnimationName = (clipName: string): string | null => {
    const normalized = clipName.toLowerCase().replace(/[^a-z0-9]/g, "");

    for (const standardName of ANIMATION_NAMES) {
      const standardNormalized = standardName.toLowerCase();
      if (normalized.includes(standardNormalized) || standardNormalized.includes(normalized)) {
        return standardName;
      }
    }

    // Common mappings
    const mappings: Record<string, string> = {
      "idle": "Idle1",
      "idle1": "Idle1",
      "idle2": "Idle2",
      "idle3": "Idle3",
      "walk": "Walk",
      "run": "Run",
      "jump": "Jump",
      "attack": "Attack",
      "hit": "Hit",
      "death": "Death",
      "die": "Death",
      "eat": "Eat",
      "swim": "Swim",
      "fly": "Fly",
      "sit": "Sit",
      "roll": "Roll",
      "spin": "Spin",
      "bounce": "Bounce",
      "fear": "Fear",
      "scared": "Fear",
      "clicked": "Clicked",
      "click": "Clicked",
    };

    return mappings[normalized] || null;
  };

  // Load FBX model
  const loadModel = useCallback(async (file: File) => {
    if (!sceneRef.current) return;

    setIsLoading(true);
    setError(null);
    setModelLoaded(false);
    setAnimations([]);

    // Remove existing model
    if (modelRef.current) {
      sceneRef.current.remove(modelRef.current);
      modelRef.current = null;
    }
    if (mixerRef.current) {
      mixerRef.current.stopAllAction();
      mixerRef.current = null;
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

      sceneRef.current.add(object);
      modelRef.current = object;

      // Create mixer
      const mixer = new THREE.AnimationMixer(object);
      mixerRef.current = mixer;

      // Extract animations
      if (object.animations && object.animations.length > 0) {
        const extracted: ExtractedAnimation[] = object.animations.map((clip) => ({
          name: clip.name,
          clip,
          duration: clip.duration,
          mappedName: autoMapAnimationName(clip.name),
          robloxId: "",
          uploading: false,
          uploaded: false,
        }));

        // Pre-fill with existing IDs if mapped
        extracted.forEach((anim) => {
          if (anim.mappedName && currentAnimations[anim.mappedName]) {
            anim.robloxId = String(currentAnimations[anim.mappedName]);
            anim.uploaded = true;
          }
        });

        setAnimations(extracted);
      }

      setModelLoaded(true);

      // Reset camera
      if (cameraRef.current && controlsRef.current) {
        cameraRef.current.position.set(0, 80, 150);
        controlsRef.current.target.set(0, 40, 0);
        controlsRef.current.update();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load model");
    } finally {
      setIsLoading(false);
    }
  }, [currentAnimations]);

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

  // Play animation
  const playAnimation = (animName: string) => {
    if (!mixerRef.current || !modelRef.current) return;

    const anim = animations.find((a) => a.name === animName);
    if (!anim) return;

    // Stop current animation
    if (currentActionRef.current) {
      currentActionRef.current.fadeOut(0.2);
    }

    // Play new animation
    const action = mixerRef.current.clipAction(anim.clip);
    action.reset().fadeIn(0.2).play();
    currentActionRef.current = action;
    setPlayingAnimation(animName);
  };

  // Stop animation
  const stopAnimation = () => {
    if (currentActionRef.current) {
      currentActionRef.current.fadeOut(0.2);
      currentActionRef.current = null;
    }
    setPlayingAnimation(null);
  };

  // Update mapped name
  const updateMappedName = (animName: string, mappedName: string | null) => {
    setAnimations((prev) =>
      prev.map((a) =>
        a.name === animName ? { ...a, mappedName } : a
      )
    );
  };

  // Update Roblox ID
  const updateRobloxId = (animName: string, robloxId: string) => {
    setAnimations((prev) =>
      prev.map((a) =>
        a.name === animName ? { ...a, robloxId, uploaded: robloxId.length > 0 } : a
      )
    );
  };

  // Copy ID to clipboard
  const copyToClipboard = (id: string, animName: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(animName);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Upload animation to Roblox
  const uploadAnimation = async (animName: string) => {
    if (!selectedFile) return;

    const anim = animations.find((a) => a.name === animName);
    if (!anim || !anim.mappedName) return;

    setAnimations((prev) =>
      prev.map((a) =>
        a.name === animName ? { ...a, uploading: true, error: undefined } : a
      )
    );

    try {
      // Create form data with the FBX file and animation info
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("name", `${characterName} - ${anim.mappedName}`);
      formData.append("animation_name", anim.name);
      formData.append("asset_type", "model"); // Animations are uploaded as models
      formData.append("tags", JSON.stringify(["animation", "quirkyverse", characterName.toLowerCase()]));
      formData.append("destination_type", "group");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://api.whimco.com"}/api/v1/roblox-assets/upload_animation/`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Token ${localStorage.getItem("auth_token")}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.error || `Upload failed: ${response.status}`);
      }

      const result = await response.json();

      setAnimations((prev) =>
        prev.map((a) =>
          a.name === animName
            ? { ...a, uploading: false, uploaded: true, robloxId: result.roblox_asset_id }
            : a
        )
      );
    } catch (err) {
      setAnimations((prev) =>
        prev.map((a) =>
          a.name === animName
            ? { ...a, uploading: false, error: err instanceof Error ? err.message : "Upload failed" }
            : a
        )
      );
    }
  };

  // Save all animations to character
  const saveAnimations = async () => {
    setIsUploading(true);

    const updatedAnimations: QuirkyverseAnimations = { ...currentAnimations };

    animations.forEach((anim) => {
      if (anim.mappedName && anim.robloxId) {
        updatedAnimations[anim.mappedName] = parseInt(anim.robloxId, 10);
      }
    });

    try {
      await onSave(updatedAnimations);
      onClose();
    } catch (err) {
      setError("Failed to save animations");
    } finally {
      setIsUploading(false);
    }
  };

  const mappedCount = animations.filter((a) => a.mappedName && a.robloxId).length;
  const totalMapped = animations.filter((a) => a.mappedName).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-slate-700">Animation Extractor</h2>
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
          <div className="w-1/2 flex flex-col border-r border-gray-200">
            <div
              ref={containerRef}
              className="flex-1 min-h-[400px] bg-slate-900 relative"
            >
              {!selectedFile && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <ArrowUpTrayIcon className="w-16 h-16 text-gray-500 mb-4" />
                  <p className="text-gray-300 font-medium mb-2">Load FBX with Animations</p>
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
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                    <p className="text-white">Loading model...</p>
                  </div>
                </div>
              )}
            </div>

            {modelLoaded && (
              <div className="p-3 bg-slate-800 border-t border-slate-700">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-300">
                    {animations.length} animation{animations.length !== 1 ? "s" : ""} found
                  </p>
                  <label className="text-sm text-purple-400 hover:text-purple-300 cursor-pointer">
                    Load Different FBX
                    <input
                      type="file"
                      accept=".fbx"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Right: Animation List */}
          <div className="w-1/2 flex flex-col bg-gray-50">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-slate-700">Extracted Animations</h3>
              <p className="text-xs text-slate-500 mt-1">
                Map animations to standard names and enter Roblox asset IDs
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {animations.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <PlayIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No animations loaded</p>
                </div>
              ) : (
                animations.map((anim) => (
                  <div
                    key={anim.name}
                    className={`p-4 rounded-xl border ${
                      anim.uploaded
                        ? "border-green-200 bg-green-50"
                        : anim.error
                        ? "border-red-200 bg-red-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    {/* Animation header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            playingAnimation === anim.name
                              ? stopAnimation()
                              : playAnimation(anim.name)
                          }
                          className={`p-2 rounded-lg transition-colors ${
                            playingAnimation === anim.name
                              ? "bg-purple-600 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {playingAnimation === anim.name ? (
                            <PauseIcon className="w-4 h-4" />
                          ) : (
                            <PlayIcon className="w-4 h-4" />
                          )}
                        </button>
                        <div>
                          <p className="font-medium text-slate-700 text-sm">{anim.name}</p>
                          <p className="text-xs text-slate-400">{anim.duration.toFixed(2)}s</p>
                        </div>
                      </div>
                      {anim.uploaded && (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      )}
                    </div>

                    {/* Mapping dropdown */}
                    <div className="mb-3">
                      <label className="text-xs text-slate-500 mb-1 block">Map to:</label>
                      <select
                        value={anim.mappedName || ""}
                        onChange={(e) =>
                          updateMappedName(anim.name, e.target.value || null)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 bg-white text-slate-700"
                      >
                        <option value="">-- Not Mapped --</option>
                        {ANIMATION_NAMES.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Roblox ID input */}
                    {anim.mappedName && (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={anim.robloxId}
                          onChange={(e) => updateRobloxId(anim.name, e.target.value)}
                          placeholder="Roblox Asset ID"
                          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-slate-700 font-mono"
                        />
                        {anim.robloxId && (
                          <button
                            onClick={() => copyToClipboard(anim.robloxId, anim.name)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            {copiedId === anim.name ? (
                              <CheckIcon className="w-4 h-4 text-green-500" />
                            ) : (
                              <ClipboardDocumentIcon className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Error message */}
                    {anim.error && (
                      <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                        <ExclamationCircleIcon className="w-4 h-4" />
                        {anim.error}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {animations.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-slate-600">
                    {mappedCount} of {totalMapped} mapped animations have IDs
                  </p>
                </div>
                <button
                  onClick={saveAnimations}
                  disabled={isUploading || mappedCount === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-5 h-5" />
                      Save Animations to Character
                    </>
                  )}
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
