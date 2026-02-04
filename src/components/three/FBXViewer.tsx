"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import { FBXLoader } from "three-stdlib";
import {
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface FBXViewerProps {
  file?: File;
  url?: string;
  onLoad?: (stats: ModelStats) => void;
  onError?: (error: string) => void;
  className?: string;
  showControls?: boolean;
}

interface ModelStats {
  vertices: number;
  triangles: number;
  animations: string[];
}

interface AnimationState {
  mixer: THREE.AnimationMixer | null;
  actions: Map<string, THREE.AnimationAction>;
  currentAction: THREE.AnimationAction | null;
  isPlaying: boolean;
}

export default function FBXViewer({
  file,
  url,
  onLoad,
  onError,
  className = "",
  showControls = true,
}: FBXViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const animationRef = useRef<AnimationState>({
    mixer: null,
    actions: new Map(),
    currentAction: null,
    isPlaying: true,
  });
  const clockRef = useRef(new THREE.Clock());
  const frameIdRef = useRef<number>(0);
  const isInitializedRef = useRef(false);
  const loadedSourceRef = useRef<File | string | null>(null);

  // Use refs for callbacks to avoid re-triggering effects
  const onLoadRef = useRef(onLoad);
  const onErrorRef = useRef(onError);
  onLoadRef.current = onLoad;
  onErrorRef.current = onError;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animations, setAnimations] = useState<string[]>([]);
  const [selectedAnimation, setSelectedAnimation] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(true);
  const [stats, setStats] = useState<ModelStats | null>(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current || isInitializedRef.current) return;

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
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-100, 100, -100);
    scene.add(fillLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(400, 40, 0x444466, 0x333355);
    scene.add(gridHelper);

    // Animation loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);

      const delta = clockRef.current.getDelta();

      if (animationRef.current.mixer && animationRef.current.isPlaying) {
        animationRef.current.mixer.update(delta);
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

    isInitializedRef.current = true;

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frameIdRef.current);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      isInitializedRef.current = false;
    };
  }, []);

  // Load FBX model
  const loadModel = useCallback(async (source: File | string) => {
    if (!sceneRef.current) return;

    // Check if we already loaded this source
    if (loadedSourceRef.current === source) return;
    loadedSourceRef.current = source;

    setIsLoading(true);
    setError(null);

    // Remove existing model
    if (modelRef.current) {
      sceneRef.current.remove(modelRef.current);
      animationRef.current.mixer?.stopAllAction();
      animationRef.current.mixer = null;
      animationRef.current.actions.clear();
      animationRef.current.currentAction = null;
    }

    const loader = new FBXLoader();

    try {
      let object: THREE.Group;

      if (source instanceof File) {
        const arrayBuffer = await source.arrayBuffer();
        object = loader.parse(arrayBuffer, "");
      } else {
        object = await new Promise((resolve, reject) => {
          loader.load(source, resolve, undefined, reject);
        });
      }

      // Calculate model stats
      let vertexCount = 0;
      let triangleCount = 0;

      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const geometry = child.geometry as THREE.BufferGeometry;
          if (geometry.attributes.position) {
            vertexCount += geometry.attributes.position.count;
          }
          if (geometry.index) {
            triangleCount += geometry.index.count / 3;
          } else if (geometry.attributes.position) {
            triangleCount += geometry.attributes.position.count / 3;
          }

          // Enable shadows
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

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

      // Setup animations
      const animationNames: string[] = [];
      if (object.animations && object.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(object);
        animationRef.current.mixer = mixer;

        object.animations.forEach((clip) => {
          const action = mixer.clipAction(clip);
          animationRef.current.actions.set(clip.name, action);
          animationNames.push(clip.name);
        });

        // Play first animation by default
        if (animationNames.length > 0) {
          const firstAction = animationRef.current.actions.get(
            animationNames[0]
          );
          if (firstAction) {
            firstAction.play();
            animationRef.current.currentAction = firstAction;
            animationRef.current.isPlaying = true;
          }
        }
      }

      setAnimations(animationNames);
      setSelectedAnimation(animationNames[0] || "");
      setIsPlaying(true);

      const modelStats: ModelStats = {
        vertices: vertexCount,
        triangles: Math.round(triangleCount),
        animations: animationNames,
      };
      setStats(modelStats);
      onLoadRef.current?.(modelStats);

      // Reset camera position
      if (cameraRef.current && controlsRef.current) {
        cameraRef.current.position.set(0, 80, 150);
        controlsRef.current.target.set(0, 40, 0);
        controlsRef.current.update();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load model";
      setError(errorMessage);
      onErrorRef.current?.(errorMessage);
      loadedSourceRef.current = null; // Reset so user can retry
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load model when file or URL changes
  useEffect(() => {
    if (file) {
      loadModel(file);
    } else if (url) {
      loadModel(url);
    }
  }, [file, url, loadModel]);

  // Handle animation change
  const handleAnimationChange = (animationName: string) => {
    if (!animationRef.current.mixer) return;

    const newAction = animationRef.current.actions.get(animationName);
    const currentAction = animationRef.current.currentAction;

    if (newAction && newAction !== currentAction) {
      if (currentAction) {
        currentAction.fadeOut(0.3);
      }
      newAction.reset().fadeIn(0.3).play();
      animationRef.current.currentAction = newAction;
      setSelectedAnimation(animationName);
    }
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    animationRef.current.isPlaying = !animationRef.current.isPlaying;
    setIsPlaying(animationRef.current.isPlaying);
  };

  // Reset camera
  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 80, 150);
      controlsRef.current.target.set(0, 40, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Canvas container */}
      <div
        ref={containerRef}
        className="w-full h-full min-h-[300px] rounded-xl overflow-hidden"
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            <p className="text-white text-sm">Loading model...</p>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-xl">
          <div className="flex flex-col items-center gap-3 text-center px-4">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-400" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Controls */}
      {showControls && !isLoading && !error && animations.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2 p-3 bg-slate-900/80 backdrop-blur-sm rounded-xl">
          {/* Play/Pause button */}
          <button
            onClick={togglePlayPause}
            className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <PauseIcon className="w-5 h-5" />
            ) : (
              <PlayIcon className="w-5 h-5" />
            )}
          </button>

          {/* Animation selector */}
          <select
            value={selectedAnimation}
            onChange={(e) => handleAnimationChange(e.target.value)}
            className="flex-1 min-w-[120px] px-3 py-2 bg-slate-800 text-white text-sm rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            {animations.map((anim) => (
              <option key={anim} value={anim}>
                {anim}
              </option>
            ))}
          </select>

          {/* Reset camera button */}
          <button
            onClick={resetCamera}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
            title="Reset Camera"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Stats display */}
      {showControls && stats && !isLoading && !error && (
        <div className="absolute top-4 right-4 px-3 py-2 bg-slate-900/80 backdrop-blur-sm rounded-lg text-xs text-slate-300">
          <div>Vertices: {stats.vertices.toLocaleString()}</div>
          <div>Triangles: {stats.triangles.toLocaleString()}</div>
          <div>Animations: {stats.animations.length}</div>
        </div>
      )}
    </div>
  );
}
