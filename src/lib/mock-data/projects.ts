import { Project, ProjectCharacter } from "@/types/admin";

// Shared characters in the Quirkyverse
export const quirkyverseCharacters: ProjectCharacter[] = [
  {
    id: "char-1",
    name: "Dove",
    avatarUrl: "/characters/dove.png",
    description: "A curious and adventurous spirit who loves exploring new worlds",
  },
  {
    id: "char-2",
    name: "Pip",
    avatarUrl: "/characters/pip.png",
    description: "A mischievous but loyal companion with a heart of gold",
  },
  {
    id: "char-3",
    name: "Luna",
    avatarUrl: "/characters/luna.png",
    description: "A mysterious guide who appears when least expected",
  },
  {
    id: "char-4",
    name: "Spark",
    avatarUrl: "/characters/spark.png",
    description: "An energetic inventor always creating new gadgets",
  },
  {
    id: "char-5",
    name: "Echo",
    avatarUrl: "/characters/echo.png",
    description: "A quiet observer with hidden depths and wisdom",
  },
];

export const mockProjects: Project[] = [
  // Quirkyverse Projects
  {
    id: "proj-1",
    name: "Quirkyverse: Origins",
    description:
      "The flagship game where players first meet Dove and discover the mysterious Quirkyverse. An open-world adventure with puzzle-solving and exploration.",
    scope: "quirkyverse",
    status: "active",
    type: "game",
    thumbnailUrl: "/projects/quirkyverse-origins.png",
    robloxGameId: "123456789",
    robloxUniverseId: "987654321",
    createdAt: "2023-06-15",
    updatedAt: "2024-01-10",
    visits: 1250000,
    favorites: 45000,
    likes: 38000,
    activePlayers: 1250,
    characters: [quirkyverseCharacters[0], quirkyverseCharacters[1], quirkyverseCharacters[2]],
    relatedProjects: ["proj-2", "proj-3", "proj-4"],
  },
  {
    id: "proj-2",
    name: "Quirkyverse: Pip's Workshop",
    description:
      "A crafting and building simulator where players help Pip create inventions. Features collaborative building and mini-games.",
    scope: "quirkyverse",
    status: "active",
    type: "experience",
    thumbnailUrl: "/projects/pips-workshop.png",
    robloxGameId: "234567890",
    robloxUniverseId: "098765432",
    createdAt: "2023-09-20",
    updatedAt: "2024-01-08",
    visits: 820000,
    favorites: 28000,
    likes: 24000,
    activePlayers: 890,
    characters: [quirkyverseCharacters[1], quirkyverseCharacters[3]],
    relatedProjects: ["proj-1", "proj-3"],
  },
  {
    id: "proj-3",
    name: "Quirkyverse: Luna's Dreamscape",
    description:
      "A surreal puzzle adventure through Luna's dreams. Features mind-bending mechanics and beautiful visuals.",
    scope: "quirkyverse",
    status: "development",
    type: "game",
    thumbnailUrl: "/projects/lunas-dreamscape.png",
    createdAt: "2024-01-05",
    updatedAt: "2024-01-12",
    characters: [quirkyverseCharacters[2], quirkyverseCharacters[4]],
    relatedProjects: ["proj-1", "proj-2"],
  },
  {
    id: "proj-4",
    name: "Quirkyverse Character Pack",
    description:
      "Official character accessories and items featuring the Quirkyverse cast. Includes avatars, clothing, and emotes.",
    scope: "quirkyverse",
    status: "active",
    type: "item",
    thumbnailUrl: "/projects/character-pack.png",
    createdAt: "2023-11-01",
    updatedAt: "2023-12-15",
    visits: 450000,
    favorites: 15000,
    likes: 12000,
    characters: quirkyverseCharacters,
    relatedProjects: ["proj-1"],
  },

  // Standalone Projects
  {
    id: "proj-5",
    name: "Tower Defense Titans",
    description:
      "A strategic tower defense game with unique hero mechanics. Build defenses, summon titans, and protect your base.",
    scope: "standalone",
    status: "active",
    type: "game",
    thumbnailUrl: "/projects/tower-defense.png",
    robloxGameId: "345678901",
    robloxUniverseId: "109876543",
    createdAt: "2023-03-10",
    updatedAt: "2024-01-05",
    visits: 2100000,
    favorites: 72000,
    likes: 65000,
    activePlayers: 3200,
  },
  {
    id: "proj-6",
    name: "Speed Racers Ultimate",
    description:
      "High-octane racing game with customizable vehicles and tracks. Compete in tournaments and climb the leaderboards.",
    scope: "standalone",
    status: "active",
    type: "game",
    thumbnailUrl: "/projects/speed-racers.png",
    robloxGameId: "456789012",
    robloxUniverseId: "210987654",
    createdAt: "2023-07-22",
    updatedAt: "2024-01-11",
    visits: 1800000,
    favorites: 58000,
    likes: 52000,
    activePlayers: 2800,
  },
  {
    id: "proj-7",
    name: "Cozy Cafe Simulator",
    description:
      "A relaxing cafe management game. Design your cafe, serve customers, and unlock new recipes and decorations.",
    scope: "standalone",
    status: "development",
    type: "experience",
    thumbnailUrl: "/projects/cozy-cafe.png",
    createdAt: "2023-12-01",
    updatedAt: "2024-01-13",
  },
  {
    id: "proj-8",
    name: "Mystery Manor",
    description:
      "A detective adventure game where players solve mysteries in a haunted mansion. Features cooperative gameplay.",
    scope: "standalone",
    status: "paused",
    type: "game",
    thumbnailUrl: "/projects/mystery-manor.png",
    robloxGameId: "567890123",
    createdAt: "2023-05-15",
    updatedAt: "2023-10-20",
    visits: 650000,
    favorites: 22000,
    likes: 18000,
    activePlayers: 0,
  },
  {
    id: "proj-9",
    name: "Whimco Asset Library",
    description:
      "A collection of high-quality 3D models, textures, and effects for Roblox developers. Free to use in your games.",
    scope: "standalone",
    status: "active",
    type: "asset",
    thumbnailUrl: "/projects/asset-library.png",
    createdAt: "2023-02-01",
    updatedAt: "2024-01-10",
    visits: 320000,
    favorites: 45000,
    likes: 40000,
  },
];

// Summary stats
export const projectsSummary = {
  totalProjects: mockProjects.length,
  quirkyverseProjects: mockProjects.filter((p) => p.scope === "quirkyverse").length,
  standaloneProjects: mockProjects.filter((p) => p.scope === "standalone").length,
  activeProjects: mockProjects.filter((p) => p.status === "active").length,
  inDevelopment: mockProjects.filter((p) => p.status === "development").length,
  totalVisits: mockProjects.reduce((sum, p) => sum + (p.visits || 0), 0),
  totalActivePlayers: mockProjects.reduce((sum, p) => sum + (p.activePlayers || 0), 0),
  quirkyverseCharacters: quirkyverseCharacters.length,
};

// Get projects by scope
export function getProjectsByScope(scope?: "quirkyverse" | "standalone" | "all") {
  if (!scope || scope === "all") return mockProjects;
  return mockProjects.filter((p) => p.scope === scope);
}

// Get related Quirkyverse projects
export function getRelatedProjects(projectId: string): Project[] {
  const project = mockProjects.find((p) => p.id === projectId);
  if (!project?.relatedProjects) return [];
  return mockProjects.filter((p) => project.relatedProjects?.includes(p.id));
}
