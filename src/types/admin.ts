// User & Role Types
export type UserRole = "admin" | "user";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
  createdAt: string;
}

// Roblox Types
export interface RobloxRole {
  id: number;
  name: string;
  rank: number;
  memberCount: number;
  permissions: string[];
  color: string;
}

export interface RobloxMember {
  id: number;
  username: string;
  displayName: string;
  avatarUrl: string;
  role: RobloxRole;
  joinDate: string;
  lastActive: string;
  totalEarnings: number;
}

export interface WallPost {
  id: number;
  author: {
    id: number;
    username: string;
    displayName: string;
    avatarUrl: string;
  };
  content: string;
  createdAt: string;
  isPinned: boolean;
  isHidden: boolean;
}

export type PayoutStatus = "pending" | "completed" | "failed";

export interface Payout {
  id: number;
  recipient: {
    id: number;
    username: string;
    displayName: string;
    avatarUrl: string;
  };
  amount: number;
  percentage: number;
  date: string;
  status: PayoutStatus;
  note: string;
}

// Analytics Types
export interface EngagementMetric {
  date: string;
  views: number;
  reactions: number;
  comments: number;
  shares: number;
}

export interface ServerReach {
  serverId: string;
  serverName: string;
  serverIcon: string;
  members: number;
  views: number;
  reactions: number;
  lastBroadcast: string;
}

export interface GrowthMetric {
  period: string;
  newServers: number;
  totalReach: number;
  engagementRate: number;
  trending: boolean;
}

export interface SpotlightPost {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  author: string;
  servers: number;
  totalViews: number;
  totalReactions: number;
  totalComments: number;
  totalShares: number;
}

export interface AnalyticsSummary {
  totalViews: number;
  totalReactions: number;
  totalComments: number;
  totalShares: number;
  serversReached: number;
  averageEngagementRate: number;
  weekOverWeekGrowth: number;
  topPerformingServer: string;
}

// Navigation Types
export interface NavItem {
  name: string;
  href: string;
  icon: string;
  children?: NavItem[];
  adminOnly?: boolean;
}
