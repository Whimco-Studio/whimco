"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  SparklesIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowLeftIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  FilmIcon,
  PhotoIcon,
  ArrowUpTrayIcon,
  PlayIcon,
  PencilIcon,
  CameraIcon,
  DocumentArrowUpIcon,
} from "@heroicons/react/24/outline";
import AdminHeader from "../../../../components/admin/AdminHeader";
import StatCard from "../../../../components/admin/StatCard";
import { useQuirkyverse } from "@/components/hooks/useQuirkyverse";
import {
  QuirkyverseCharacter,
  QuirkyverseIcons,
  ANIMATION_NAMES,
  ICON_VARIANTS,
  RARITY_CONFIG,
} from "@/types/quirkyverse";
import RobloxAssetImage from "@/components/RobloxAssetImage";
import FBXPreviewModal from "./components/FBXPreviewModal";
import IconEditModal from "./components/IconEditModal";
import IconGeneratorModal from "./components/IconGeneratorModal";
import AnimationExtractorModal from "./components/AnimationExtractorModal";

export default function QuirkyverseCharactersPage() {
  const {
    characters,
    stats,
    isLoading,
    error,
    refresh,
    bulkImport,
    updateCharacter,
  } = useQuirkyverse();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRarity, setSelectedRarity] = useState<string>("all");
  const [selectedCharacter, setSelectedCharacter] =
    useState<QuirkyverseCharacter | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showFBXPreview, setShowFBXPreview] = useState(false);
  const [showIconEdit, setShowIconEdit] = useState(false);
  const [showIconGenerator, setShowIconGenerator] = useState(false);
  const [showAnimationExtractor, setShowAnimationExtractor] = useState(false);

  // Filter characters
  const filteredCharacters = useMemo(() => {
    return characters.filter((char) => {
      const matchesSearch =
        char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        char.displayName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRarity =
        selectedRarity === "all" || char.rarity === selectedRarity;
      return matchesSearch && matchesRarity;
    });
  }, [characters, searchQuery, selectedRarity]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (error) {
    return (
      <>
        <AdminHeader
          title="Quirkyverse Characters"
          subtitle="Manage Quirkymal characters and their assets"
        />
        <div className="bg-red-50 text-red-600 p-4 rounded-xl">
          Error loading characters: {error}
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader
        title="Quirkyverse Characters"
        subtitle="Manage Quirkymal characters and their assets"
      />

      {/* Back link */}
      <Link
        href="/admin/projects/quirkyverse"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Quirkyverse Overview
      </Link>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          title="Total Characters"
          value={isLoading ? "..." : stats?.total || 0}
          icon={<SparklesIcon className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Published"
          value={isLoading ? "..." : stats?.published || 0}
          icon={<CheckIcon className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Complete Animations"
          value={isLoading ? "..." : stats?.completeAnimations || 0}
          subtitle="18/18 animations"
          icon={<FilmIcon className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Rare+"
          value={
            isLoading
              ? "..."
              : (stats?.byRarity?.rare || 0) +
                (stats?.byRarity?.epic || 0) +
                (stats?.byRarity?.legendary || 0)
          }
          icon={<SparklesIcon className="w-6 h-6" />}
          color="orange"
        />
        <StatCard
          title="Featured"
          value={isLoading ? "..." : stats?.featured || 0}
          icon={<SparklesIcon className="w-6 h-6" />}
          color="cyan"
        />
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-1 gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search characters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-slate-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            {/* Rarity filter */}
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            >
              <option value="all">All Rarities</option>
              {Object.entries(RARITY_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors"
            >
              <ArrowUpTrayIcon className="w-5 h-5" />
              Bulk Import
            </button>
            <button
              onClick={() => {
                /* TODO: Add character modal */
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Add Character
            </button>
          </div>
        </div>
      </div>

      {/* Character grid and detail panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Character list */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6">
          <h3 className="font-bold text-slate-700 mb-4">
            Characters ({filteredCharacters.length})
          </h3>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse p-4 rounded-xl bg-gray-100"
                >
                  <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
                </div>
              ))}
            </div>
          ) : filteredCharacters.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <SparklesIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No characters found</p>
              {characters.length === 0 && (
                <p className="text-sm mt-2">
                  Click &quot;Bulk Import&quot; to add characters
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredCharacters.map((char) => (
                <CharacterCard
                  key={char.id}
                  character={char}
                  isSelected={selectedCharacter?.id === char.id}
                  onClick={() => setSelectedCharacter(char)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {selectedCharacter ? (
            <CharacterDetail
              character={selectedCharacter}
              onCopy={copyToClipboard}
              copiedId={copiedId}
              onPreviewAnimation={() => setShowFBXPreview(true)}
              onEditIcons={() => setShowIconEdit(true)}
              onGenerateIcons={() => setShowIconGenerator(true)}
              onExtractAnimations={() => setShowAnimationExtractor(true)}
            />
          ) : (
            <div className="text-center py-12 text-slate-400">
              <SparklesIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Select a character to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onImport={async (data) => {
            await bulkImport(data);
            setShowImportModal(false);
            refresh();
          }}
        />
      )}

      {/* FBX Preview Modal */}
      {showFBXPreview && selectedCharacter && (
        <FBXPreviewModal
          characterName={selectedCharacter.displayName || selectedCharacter.name}
          onClose={() => setShowFBXPreview(false)}
        />
      )}

      {/* Icon Edit Modal */}
      {showIconEdit && selectedCharacter && (
        <IconEditModal
          characterName={selectedCharacter.displayName || selectedCharacter.name}
          characterId={selectedCharacter.id}
          currentIcons={selectedCharacter.icons}
          onClose={() => setShowIconEdit(false)}
          onSave={async (icons: QuirkyverseIcons) => {
            await updateCharacter(selectedCharacter.id, { icons });
            setSelectedCharacter((prev) =>
              prev ? { ...prev, icons } : null
            );
          }}
        />
      )}

      {/* Icon Generator Modal */}
      {showIconGenerator && selectedCharacter && (
        <IconGeneratorModal
          characterName={selectedCharacter.displayName || selectedCharacter.name}
          onClose={() => setShowIconGenerator(false)}
          onSave={async (icons) => {
            const updatedIcons = { ...selectedCharacter.icons, ...icons };
            await updateCharacter(selectedCharacter.id, { icons: updatedIcons });
            setSelectedCharacter((prev) =>
              prev ? { ...prev, icons: updatedIcons } : null
            );
          }}
        />
      )}

      {/* Animation Extractor Modal */}
      {showAnimationExtractor && selectedCharacter && (
        <AnimationExtractorModal
          characterName={selectedCharacter.displayName || selectedCharacter.name}
          currentAnimations={selectedCharacter.animations}
          onClose={() => setShowAnimationExtractor(false)}
          onSave={async (animations) => {
            await updateCharacter(selectedCharacter.id, { animations });
            setSelectedCharacter((prev) =>
              prev ? { ...prev, animations } : null
            );
          }}
        />
      )}
    </>
  );
}

function CharacterCard({
  character,
  isSelected,
  onClick,
}: {
  character: QuirkyverseCharacter;
  isSelected: boolean;
  onClick: () => void;
}) {
  const rarityConfig = RARITY_CONFIG[character.rarity] || RARITY_CONFIG.common;

  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center p-4 rounded-xl transition-all text-left w-full
        ${
          isSelected
            ? "bg-purple-100 ring-2 ring-purple-500"
            : "bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100"
        }
      `}
    >
      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-2xl font-bold text-white mb-2">
        {character.name[0]}
      </div>
      <p className="font-medium text-slate-700 text-sm text-center">
        {character.displayName || character.name}
      </p>
      <div className="flex items-center gap-2 mt-1">
        <span
          className="px-2 py-0.5 text-xs rounded-full"
          style={{
            backgroundColor: `${rarityConfig.color}20`,
            color: rarityConfig.color,
          }}
        >
          {rarityConfig.label}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
        <FilmIcon className="w-3 h-3" />
        <span>{character.animationCount}/18</span>
        <PhotoIcon className="w-3 h-3 ml-1" />
        <span>{character.iconCount}/4</span>
      </div>
    </button>
  );
}

function CharacterDetail({
  character,
  onCopy,
  copiedId,
  onPreviewAnimation,
  onEditIcons,
  onGenerateIcons,
  onExtractAnimations,
}: {
  character: QuirkyverseCharacter;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
  onPreviewAnimation: () => void;
  onEditIcons: () => void;
  onGenerateIcons: () => void;
  onExtractAnimations: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"animations" | "icons">(
    "animations"
  );
  const rarityConfig = RARITY_CONFIG[character.rarity] || RARITY_CONFIG.common;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-3xl font-bold text-white">
          {character.name[0]}
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-700">
            {character.displayName || character.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="px-2 py-0.5 text-xs rounded-full"
              style={{
                backgroundColor: `${rarityConfig.color}20`,
                color: rarityConfig.color,
              }}
            >
              {rarityConfig.label}
            </span>
            {character.isPublished && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">
                Published
              </span>
            )}
            {character.isFeatured && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">
                Featured
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {character.description && (
        <p className="text-sm text-slate-500 mb-4">{character.description}</p>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("animations")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "animations"
              ? "text-purple-600 border-b-2 border-purple-600"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <FilmIcon className="w-4 h-4 inline mr-1" />
          Animations ({character.animationCount})
        </button>
        <button
          onClick={() => setActiveTab("icons")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "icons"
              ? "text-purple-600 border-b-2 border-purple-600"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <PhotoIcon className="w-4 h-4 inline mr-1" />
          Icons ({character.iconCount})
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mb-4">
        {activeTab === "animations" && (
          <>
            <button
              onClick={onExtractAnimations}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
            >
              <DocumentArrowUpIcon className="w-4 h-4" />
              Extract from FBX
            </button>
            <button
              onClick={onPreviewAnimation}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              <PlayIcon className="w-4 h-4" />
              Preview
            </button>
          </>
        )}
        {activeTab === "icons" && (
          <>
            <button
              onClick={onGenerateIcons}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
            >
              <CameraIcon className="w-4 h-4" />
              Generate Icons
            </button>
            <button
              onClick={onEditIcons}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              <PencilIcon className="w-4 h-4" />
              Edit Icons
            </button>
          </>
        )}
      </div>

      {/* Content */}
      <div className="max-h-[400px] overflow-y-auto">
        {activeTab === "animations" ? (
          <div className="space-y-2">
            {ANIMATION_NAMES.map((animName) => {
              const assetId = character.animations[animName];
              const copyKey = `anim-${character.id}-${animName}`;
              return (
                <div
                  key={animName}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
                >
                  <span className="text-sm text-slate-600">{animName}</span>
                  {assetId ? (
                    <button
                      onClick={() => onCopy(String(assetId), copyKey)}
                      className="flex items-center gap-1 px-2 py-1 text-xs font-mono bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                    >
                      {copiedId === copyKey ? (
                        <>
                          <CheckIcon className="w-3 h-3 text-green-500" />
                          <span className="text-green-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <ClipboardDocumentIcon className="w-3 h-3 text-gray-400" />
                          <span className="text-slate-700">{assetId}</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-xs text-slate-300">Not set</span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {ICON_VARIANTS.map((iconName) => {
              const assetId = character.icons[iconName];
              const aspectRatio = character.icons[`${iconName}AspectRatio`];
              const copyKey = `icon-${character.id}-${iconName}`;
              return (
                <div
                  key={iconName}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100"
                >
                  {/* Icon preview */}
                  {assetId ? (
                    <RobloxAssetImage
                      assetId={assetId}
                      size={150}
                      className="w-12 h-12 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center">
                      <PhotoIcon className="w-6 h-6 text-gray-300" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-slate-600">{iconName}</span>
                    {aspectRatio && (
                      <p className="text-xs text-slate-400">
                        Aspect Ratio: {Number(aspectRatio).toFixed(2)}
                      </p>
                    )}
                  </div>

                  {/* Copy button */}
                  {assetId ? (
                    <button
                      onClick={() => onCopy(String(assetId), copyKey)}
                      className="flex items-center gap-1 px-2 py-1 text-xs font-mono bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                    >
                      {copiedId === copyKey ? (
                        <>
                          <CheckIcon className="w-3 h-3 text-green-500" />
                          <span className="text-green-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <ClipboardDocumentIcon className="w-3 h-3 text-gray-400" />
                          <span className="text-slate-700">{assetId}</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-xs text-slate-300">Not set</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ImportModal({
  onClose,
  onImport,
}: {
  onClose: () => void;
  onImport: (data: { characters: Array<{ name: string; [key: string]: unknown }> }) => Promise<void>;
}) {
  const [jsonInput, setJsonInput] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    setError(null);
    setIsImporting(true);

    try {
      const data = JSON.parse(jsonInput);

      // Handle different input formats
      let characters: Array<{ name: string; [key: string]: unknown }> = [];

      if (Array.isArray(data)) {
        // Direct array of characters - ensure each has a name
        characters = data.filter((item): item is { name: string; [key: string]: unknown } =>
          typeof item === "object" && item !== null && typeof item.name === "string"
        );
      } else if (data.characters && Array.isArray(data.characters)) {
        // { characters: [...] } format
        characters = data.characters.filter((item: unknown): item is { name: string; [key: string]: unknown } =>
          typeof item === "object" && item !== null && typeof (item as Record<string, unknown>).name === "string"
        );
      } else if (typeof data === "object" && data !== null) {
        // Object with character names as keys (like the user's format)
        // e.g., { Alligator: { Attack: 123, ... }, Alpaca: { ... } }
        characters = Object.entries(data).map(([name, value]) => {
          if (typeof value === "object" && value !== null) {
            const valueObj = value as Record<string, unknown>;
            // Check if this looks like animations (has Animation keys) or icons (has Outline keys)
            const isAnimations = "Attack" in valueObj || "Walk" in valueObj || "Idle1" in valueObj;
            const isIcons = "BlackOutline" in valueObj || "NoOutline" in valueObj;

            if (isAnimations) {
              return { name, animations: value };
            } else if (isIcons) {
              return { name, icons: value };
            }
          }
          return { name, ...(typeof value === "object" && value !== null ? value : {}) };
        });
      }

      if (characters.length === 0) {
        throw new Error("No characters found in the input");
      }

      await onImport({ characters });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON format");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-slate-700">Bulk Import Characters</h2>
          <p className="text-sm text-slate-500 mt-1">
            Paste your character data as JSON
          </p>
        </div>

        <div className="p-6">
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={`Paste JSON in any of these formats:

// Format 1: Array of characters
[
  { "name": "Alligator", "animations": { "Attack": 123, "Walk": 456 } }
]

// Format 2: Object with character names as keys (animations)
{
  "Alligator": { "Attack": 123, "Walk": 456 },
  "Alpaca": { "Attack": 789, "Walk": 101 }
}

// Format 3: Object with character names as keys (icons)
{
  "Alligator": { "BlackOutline": 123, "NoOutline": 456 }
}`}
            className="w-full h-64 p-4 border border-gray-200 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={isImporting || !jsonInput.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isImporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <ArrowUpTrayIcon className="w-5 h-5" />
                Import Characters
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
