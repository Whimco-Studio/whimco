/**
 * Quirkyverse character types for the admin dashboard.
 */

export interface QuirkyverseAnimations {
  Attack?: number;
  Bounce?: number;
  Clicked?: number;
  Death?: number;
  Eat?: number;
  Fear?: number;
  Fly?: number;
  Hit?: number;
  Idle1?: number;
  Idle2?: number;
  Idle3?: number;
  Jump?: number;
  Roll?: number;
  Run?: number;
  Sit?: number;
  Spin?: number;
  Swim?: number;
  Walk?: number;
  [key: string]: number | undefined;
}

export interface QuirkyverseIcons {
  BlackOutline?: number;
  BlackOutlineAspectRatio?: number;
  NoOutline?: number;
  NoOutlineAspectRatio?: number;
  OutlineOnly?: number;
  OutlineOnlyAspectRatio?: number;
  WhiteOutline?: number;
  WhiteOutlineAspectRatio?: number;
  [key: string]: number | undefined;
}

export interface QuirkyverseCharacter {
  id: string;
  name: string;
  displayName: string;
  description: string;
  speciesType: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  animations: QuirkyverseAnimations;
  icons: QuirkyverseIcons;
  additionalAssets: Record<string, unknown>;
  animationCount: number;
  iconCount: number;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
}

export interface QuirkyverseCharacterCreatePayload {
  name: string;
  displayName?: string;
  description?: string;
  speciesType?: string;
  rarity?: string;
  animations?: QuirkyverseAnimations;
  icons?: QuirkyverseIcons;
  additionalAssets?: Record<string, unknown>;
  isPublished?: boolean;
  isFeatured?: boolean;
}

export interface QuirkyverseCharacterBulkImportPayload {
  characters: Array<{
    name: string;
    displayName?: string;
    description?: string;
    speciesType?: string;
    rarity?: string;
    animations?: QuirkyverseAnimations;
    icons?: QuirkyverseIcons;
    additionalAssets?: Record<string, unknown>;
    isPublished?: boolean;
    isFeatured?: boolean;
  }>;
}

export interface QuirkyverseStats {
  total: number;
  published: number;
  featured: number;
  byRarity: {
    common: number;
    uncommon: number;
    rare: number;
    epic: number;
    legendary: number;
  };
  completeAnimations: number;
}

export interface QuirkyverseSearchParams {
  q?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  rarity?: string;
  speciesType?: string;
}

// Animation names for display
export const ANIMATION_NAMES = [
  "Attack",
  "Bounce",
  "Clicked",
  "Death",
  "Eat",
  "Fear",
  "Fly",
  "Hit",
  "Idle1",
  "Idle2",
  "Idle3",
  "Jump",
  "Roll",
  "Run",
  "Sit",
  "Spin",
  "Swim",
  "Walk",
] as const;

// Icon variant names for display
export const ICON_VARIANTS = [
  "BlackOutline",
  "NoOutline",
  "OutlineOnly",
  "WhiteOutline",
] as const;

// Rarity levels with colors
export const RARITY_CONFIG = {
  common: { label: "Common", color: "#9CA3AF" },
  uncommon: { label: "Uncommon", color: "#22C55E" },
  rare: { label: "Rare", color: "#3B82F6" },
  epic: { label: "Epic", color: "#A855F7" },
  legendary: { label: "Legendary", color: "#F59E0B" },
} as const;
