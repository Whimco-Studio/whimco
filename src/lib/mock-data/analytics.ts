import {
  EngagementMetric,
  ServerReach,
  GrowthMetric,
  SpotlightPost,
  AnalyticsSummary,
} from "@/types/admin";

export const mockEngagementMetrics: EngagementMetric[] = [
  { date: "2024-01-07", views: 1250, reactions: 340, comments: 45, shares: 28 },
  { date: "2024-01-08", views: 1480, reactions: 420, comments: 52, shares: 35 },
  { date: "2024-01-09", views: 1320, reactions: 380, comments: 48, shares: 31 },
  { date: "2024-01-10", views: 1890, reactions: 560, comments: 72, shares: 45 },
  { date: "2024-01-11", views: 2100, reactions: 620, comments: 85, shares: 52 },
  { date: "2024-01-12", views: 1950, reactions: 580, comments: 78, shares: 48 },
  { date: "2024-01-13", views: 2340, reactions: 710, comments: 95, shares: 62 },
];

export const mockServerReach: ServerReach[] = [
  {
    serverId: "1",
    serverName: "Roblox Creators Hub",
    serverIcon: "/icons/discord-server.png",
    members: 15420,
    views: 8540,
    reactions: 2340,
    lastBroadcast: "2024-01-13T10:30:00Z",
  },
  {
    serverId: "2",
    serverName: "Game Developers United",
    serverIcon: "/icons/discord-server.png",
    members: 8750,
    views: 4200,
    reactions: 1150,
    lastBroadcast: "2024-01-13T09:15:00Z",
  },
  {
    serverId: "3",
    serverName: "Creative Corner",
    serverIcon: "/icons/discord-server.png",
    members: 12300,
    views: 6100,
    reactions: 1680,
    lastBroadcast: "2024-01-12T18:45:00Z",
  },
  {
    serverId: "4",
    serverName: "Indie Game Showcase",
    serverIcon: "/icons/discord-server.png",
    members: 6800,
    views: 3200,
    reactions: 890,
    lastBroadcast: "2024-01-12T14:20:00Z",
  },
  {
    serverId: "5",
    serverName: "Roblox Trading Post",
    serverIcon: "/icons/discord-server.png",
    members: 22100,
    views: 9800,
    reactions: 2100,
    lastBroadcast: "2024-01-11T20:00:00Z",
  },
  {
    serverId: "6",
    serverName: "Scripters Anonymous",
    serverIcon: "/icons/discord-server.png",
    members: 4500,
    views: 2100,
    reactions: 620,
    lastBroadcast: "2024-01-11T16:30:00Z",
  },
  {
    serverId: "7",
    serverName: "Build Masters",
    serverIcon: "/icons/discord-server.png",
    members: 9200,
    views: 4800,
    reactions: 1340,
    lastBroadcast: "2024-01-10T12:00:00Z",
  },
  {
    serverId: "8",
    serverName: "Game Design Academy",
    serverIcon: "/icons/discord-server.png",
    members: 11500,
    views: 5600,
    reactions: 1520,
    lastBroadcast: "2024-01-09T08:45:00Z",
  },
];

export const mockGrowthMetrics: GrowthMetric[] = [
  {
    period: "Week 1",
    newServers: 12,
    totalReach: 45000,
    engagementRate: 8.2,
    trending: false,
  },
  {
    period: "Week 2",
    newServers: 18,
    totalReach: 62000,
    engagementRate: 9.1,
    trending: true,
  },
  {
    period: "Week 3",
    newServers: 15,
    totalReach: 78000,
    engagementRate: 8.8,
    trending: false,
  },
  {
    period: "Week 4",
    newServers: 24,
    totalReach: 95000,
    engagementRate: 10.2,
    trending: true,
  },
];

export const mockSpotlightPosts: SpotlightPost[] = [
  {
    id: "1",
    title: "New Game Release: Adventure Quest",
    content:
      "Excited to announce the release of Adventure Quest! Explore vast worlds, defeat epic bosses, and collect rare items.",
    imageUrl: "/images/adventure-quest.png",
    createdAt: "2024-01-12T14:30:00Z",
    author: "WhimcoOwner",
    servers: 45,
    totalViews: 12500,
    totalReactions: 3400,
    totalComments: 450,
    totalShares: 280,
  },
  {
    id: "2",
    title: "Major Update v2.5 - New Features",
    content:
      "Update v2.5 brings new weapons, improved graphics, and a brand new quest line. Download now!",
    imageUrl: "/images/update-v25.png",
    createdAt: "2024-01-10T10:00:00Z",
    author: "DevMaster99",
    servers: 38,
    totalViews: 9800,
    totalReactions: 2800,
    totalComments: 320,
    totalShares: 195,
  },
  {
    id: "3",
    title: "Community Event: Build Competition",
    content:
      "Join our monthly build competition! Theme: Futuristic Cities. Prizes for top 3 builders!",
    imageUrl: "/images/build-comp.png",
    createdAt: "2024-01-08T16:00:00Z",
    author: "ModHelper",
    servers: 52,
    totalViews: 15200,
    totalReactions: 4100,
    totalComments: 580,
    totalShares: 340,
  },
  {
    id: "4",
    title: "Developer Spotlight: Script Wizard",
    content:
      "This week we feature Script Wizard, who created the amazing combat system for our game!",
    createdAt: "2024-01-05T12:00:00Z",
    author: "WhimcoOwner",
    servers: 30,
    totalViews: 6500,
    totalReactions: 1800,
    totalComments: 210,
    totalShares: 120,
  },
  {
    id: "5",
    title: "Bug Bounty Program Launch",
    content:
      "We're launching a bug bounty program! Find bugs, report them, and earn Robux rewards.",
    createdAt: "2024-01-03T09:00:00Z",
    author: "DevMaster99",
    servers: 42,
    totalViews: 11000,
    totalReactions: 2950,
    totalComments: 390,
    totalShares: 250,
  },
];

export const mockAnalyticsSummary: AnalyticsSummary = {
  totalViews: 125000,
  totalReactions: 34500,
  totalComments: 4800,
  totalShares: 2900,
  serversReached: 156,
  averageEngagementRate: 9.2,
  weekOverWeekGrowth: 15.8,
  topPerformingServer: "Roblox Creators Hub",
};

// Helper functions for calculating trends
export function calculateChange(current: number, previous: number): number {
  if (previous === 0) return 100;
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}

export function getEngagementTrend(): {
  views: number;
  reactions: number;
  comments: number;
  shares: number;
} {
  const lastWeek = mockEngagementMetrics.slice(-7);
  const previousWeek = mockEngagementMetrics.slice(-14, -7);

  const sumMetrics = (metrics: EngagementMetric[]) => ({
    views: metrics.reduce((sum, m) => sum + m.views, 0),
    reactions: metrics.reduce((sum, m) => sum + m.reactions, 0),
    comments: metrics.reduce((sum, m) => sum + m.comments, 0),
    shares: metrics.reduce((sum, m) => sum + m.shares, 0),
  });

  const current = sumMetrics(lastWeek);
  const previous = sumMetrics(previousWeek.length ? previousWeek : lastWeek);

  return {
    views: calculateChange(current.views, previous.views),
    reactions: calculateChange(current.reactions, previous.reactions),
    comments: calculateChange(current.comments, previous.comments),
    shares: calculateChange(current.shares, previous.shares),
  };
}
