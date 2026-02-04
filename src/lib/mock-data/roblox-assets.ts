import { RobloxAsset, AssetStats, RobloxConfig, RobloxGroup } from "@/types/roblox-assets";

// Mock groups
export const mockRobloxGroups: RobloxGroup[] = [
  { id: "9876543", name: "Whimco Studios", accessible: true },
  { id: "1234567", name: "Quirkyverse Games", accessible: true },
];

// Mock configuration
export const mockRobloxConfig: RobloxConfig = {
  is_configured: true,
  api_key_preview: "nkR1****************************Yx9z",
  default_destination_type: "group",
  default_group_id: "9876543",
  roblox_user_id: "123456789",
  roblox_username: "WhimcoOwner",
  groups: mockRobloxGroups,
  groups_last_fetched: "2024-01-13T12:00:00Z",
  updated_at: "2024-01-13T12:00:00Z",
};

export const mockRobloxAssets: RobloxAsset[] = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    name: "Quirky Character Icon",
    description: "Main icon for Quirky character in the Quirkyverse",
    asset_type: "image",
    original_file: "https://whimco-assets.s3.amazonaws.com/roblox-assets/image/quirky-icon.png",
    s3_url: "https://whimco-assets.s3.amazonaws.com/roblox-assets/image/quirky-icon.png",
    roblox_asset_id: "12345678901",
    destination_type: "group",
    roblox_user_id: "",
    roblox_group_id: "9876543",
    destination_display: "Whimco Studios",
    status: "completed",
    error_message: "",
    tags: ["character", "icon", "quirkyverse"],
    created_at: "2024-01-10T14:30:00Z",
    updated_at: "2024-01-10T14:35:00Z",
    uploaded_by: "user-123",
    uploaded_by_username: "WhimcoOwner",
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f23456789012",
    name: "Background Music Loop",
    description: "Ambient music for lobby area",
    asset_type: "audio",
    original_file: "https://whimco-assets.s3.amazonaws.com/roblox-assets/audio/lobby-music.mp3",
    s3_url: "https://whimco-assets.s3.amazonaws.com/roblox-assets/audio/lobby-music.mp3",
    roblox_asset_id: "12345678902",
    destination_type: "user",
    roblox_user_id: "123456789",
    roblox_group_id: "",
    destination_display: "WhimcoOwner",
    status: "completed",
    error_message: "",
    tags: ["music", "ambient", "lobby"],
    created_at: "2024-01-09T10:15:00Z",
    updated_at: "2024-01-09T10:20:00Z",
    uploaded_by: "user-123",
    uploaded_by_username: "WhimcoOwner",
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-345678901234",
    name: "Victory Fanfare",
    description: "Sound effect for winning a level",
    asset_type: "audio",
    original_file: "https://whimco-assets.s3.amazonaws.com/roblox-assets/audio/victory.mp3",
    s3_url: "https://whimco-assets.s3.amazonaws.com/roblox-assets/audio/victory.mp3",
    roblox_asset_id: "12345678903",
    destination_type: "group",
    roblox_user_id: "",
    roblox_group_id: "9876543",
    destination_display: "Whimco Studios",
    status: "completed",
    error_message: "",
    tags: ["sfx", "victory", "win"],
    created_at: "2024-01-08T16:45:00Z",
    updated_at: "2024-01-08T16:50:00Z",
    uploaded_by: "user-456",
    uploaded_by_username: "DevMaster99",
  },
  {
    id: "d4e5f6a7-b8c9-0123-defa-456789012345",
    name: "Game Logo",
    description: "Official Quirkyverse game logo",
    asset_type: "image",
    original_file: "https://whimco-assets.s3.amazonaws.com/roblox-assets/image/game-logo.png",
    s3_url: "https://whimco-assets.s3.amazonaws.com/roblox-assets/image/game-logo.png",
    roblox_asset_id: "12345678904",
    destination_type: "group",
    roblox_user_id: "",
    roblox_group_id: "1234567",
    destination_display: "Quirkyverse Games",
    status: "completed",
    error_message: "",
    tags: ["logo", "branding", "quirkyverse"],
    created_at: "2024-01-07T09:00:00Z",
    updated_at: "2024-01-07T09:05:00Z",
    uploaded_by: "user-123",
    uploaded_by_username: "WhimcoOwner",
  },
  {
    id: "e5f6a7b8-c9d0-1234-efab-567890123456",
    name: "Character Model - Quirky",
    description: "3D model for main Quirky character",
    asset_type: "model",
    original_file: "https://whimco-assets.s3.amazonaws.com/roblox-assets/model/quirky-model.fbx",
    s3_url: "https://whimco-assets.s3.amazonaws.com/roblox-assets/model/quirky-model.fbx",
    roblox_asset_id: "12345678905",
    destination_type: "group",
    roblox_user_id: "",
    roblox_group_id: "9876543",
    destination_display: "Whimco Studios",
    status: "completed",
    error_message: "",
    tags: ["character", "model", "quirky", "3d"],
    created_at: "2024-01-06T11:30:00Z",
    updated_at: "2024-01-06T12:00:00Z",
    uploaded_by: "user-456",
    uploaded_by_username: "DevMaster99",
  },
  {
    id: "f6a7b8c9-d0e1-2345-fabc-678901234567",
    name: "Button Click SFX",
    description: "UI button click sound effect",
    asset_type: "audio",
    original_file: "https://whimco-assets.s3.amazonaws.com/roblox-assets/audio/button-click.mp3",
    s3_url: "https://whimco-assets.s3.amazonaws.com/roblox-assets/audio/button-click.mp3",
    roblox_asset_id: "",
    destination_type: "group",
    roblox_user_id: "",
    roblox_group_id: "9876543",
    destination_display: "Whimco Studios",
    status: "failed",
    error_message: "Rate limited - too many requests. Please try again later.",
    tags: ["sfx", "ui", "button"],
    created_at: "2024-01-12T08:00:00Z",
    updated_at: "2024-01-12T08:05:00Z",
    uploaded_by: "user-123",
    uploaded_by_username: "WhimcoOwner",
  },
  {
    id: "a7b8c9d0-e1f2-3456-abcd-789012345678",
    name: "Environment Props Pack",
    description: "Collection of environment prop models",
    asset_type: "model",
    original_file: "https://whimco-assets.s3.amazonaws.com/roblox-assets/model/props-pack.fbx",
    s3_url: "https://whimco-assets.s3.amazonaws.com/roblox-assets/model/props-pack.fbx",
    roblox_asset_id: "",
    destination_type: "user",
    roblox_user_id: "123456789",
    roblox_group_id: "",
    destination_display: "WhimcoOwner",
    status: "processing",
    error_message: "",
    tags: ["props", "environment", "3d"],
    created_at: "2024-01-13T10:00:00Z",
    updated_at: "2024-01-13T10:02:00Z",
    uploaded_by: "user-456",
    uploaded_by_username: "DevMaster99",
  },
  {
    id: "b8c9d0e1-f2a3-4567-bcde-890123456789",
    name: "Achievement Badge",
    description: "Badge icon for completing all levels",
    asset_type: "image",
    original_file: "https://whimco-assets.s3.amazonaws.com/roblox-assets/image/achievement-badge.png",
    s3_url: "https://whimco-assets.s3.amazonaws.com/roblox-assets/image/achievement-badge.png",
    roblox_asset_id: "12345678908",
    destination_type: "group",
    roblox_user_id: "",
    roblox_group_id: "9876543",
    destination_display: "Whimco Studios",
    status: "completed",
    error_message: "",
    tags: ["badge", "achievement", "icon"],
    created_at: "2024-01-05T15:20:00Z",
    updated_at: "2024-01-05T15:25:00Z",
    uploaded_by: "user-789",
    uploaded_by_username: "ArtistCreative",
  },
];

export const mockAssetStats: AssetStats = {
  total: mockRobloxAssets.length,
  by_type: {
    image: mockRobloxAssets.filter((a) => a.asset_type === "image").length,
    audio: mockRobloxAssets.filter((a) => a.asset_type === "audio").length,
    model: mockRobloxAssets.filter((a) => a.asset_type === "model").length,
  },
  by_status: {
    pending: mockRobloxAssets.filter((a) => a.status === "pending").length,
    uploading: mockRobloxAssets.filter((a) => a.status === "uploading").length,
    processing: mockRobloxAssets.filter((a) => a.status === "processing").length,
    completed: mockRobloxAssets.filter((a) => a.status === "completed").length,
    failed: mockRobloxAssets.filter((a) => a.status === "failed").length,
  },
};

// Helper functions for filtering mock data
export function filterMockAssets(params: {
  q?: string;
  type?: string;
  status?: string;
  tag?: string;
}): RobloxAsset[] {
  let filtered = [...mockRobloxAssets];

  if (params.q) {
    const query = params.q.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.name.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query) ||
        a.roblox_asset_id.includes(query)
    );
  }

  if (params.type) {
    filtered = filtered.filter((a) => a.asset_type === params.type);
  }

  if (params.status) {
    filtered = filtered.filter((a) => a.status === params.status);
  }

  if (params.tag) {
    const tag = params.tag;
    filtered = filtered.filter((a) => a.tags.includes(tag));
  }

  return filtered;
}
