// Roblox Asset Types

export type AssetType = "image" | "audio" | "model" | "animation";
export type AssetStatus = "pending" | "uploading" | "processing" | "completed" | "failed";
export type DestinationType = "user" | "group";

export interface RobloxAsset {
  id: string;
  name: string;
  description: string;
  asset_type: AssetType;
  original_file: string;
  s3_url: string;
  roblox_asset_id: string;
  destination_type: DestinationType;
  roblox_user_id: string;
  roblox_group_id: string;
  destination_display: string;
  status: AssetStatus;
  error_message: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  uploaded_by: string | null;
  uploaded_by_username: string;
}

// Roblox Configuration Types
export interface RobloxGroup {
  id: string;
  name: string;
  accessible?: boolean;
}

export interface RobloxConfig {
  is_configured: boolean;
  api_key_preview: string;
  default_destination_type: DestinationType;
  default_group_id: string;
  roblox_user_id: string;
  roblox_username: string;
  groups: RobloxGroup[];
  groups_last_fetched: string | null;
  updated_at: string;
}

export interface RobloxConfigUpdatePayload {
  api_key?: string;
  default_destination_type?: DestinationType;
  default_group_id?: string;
  roblox_user_id?: string;
  roblox_username?: string;
}

export interface AssetUploadPayload {
  name: string;
  description?: string;
  asset_type: AssetType;
  original_file: File;
  tags?: string[];
  destination_type?: DestinationType;
  roblox_user_id?: string;
  roblox_group_id?: string;
}

export interface AssetSearchParams {
  q?: string;
  type?: AssetType;
  status?: AssetStatus;
  tag?: string;
  tags?: string;
  page?: number;
}

export interface AssetStats {
  total: number;
  by_type: {
    image: number;
    audio: number;
    model: number;
  };
  by_status: {
    pending: number;
    uploading: number;
    processing: number;
    completed: number;
    failed: number;
  };
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
