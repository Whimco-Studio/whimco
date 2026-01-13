"use client";

import { useState, useEffect } from "react";
import {
  mockEngagementMetrics,
  mockServerReach,
  mockGrowthMetrics,
  mockSpotlightPosts,
  mockAnalyticsSummary,
  getEngagementTrend,
} from "@/lib/mock-data/analytics";
import {
  EngagementMetric,
  ServerReach,
  GrowthMetric,
  SpotlightPost,
  AnalyticsSummary,
} from "@/types/admin";

interface AnalyticsData {
  engagementMetrics: EngagementMetric[];
  serverReach: ServerReach[];
  growthMetrics: GrowthMetric[];
  posts: SpotlightPost[];
  summary: AnalyticsSummary;
  trends: ReturnType<typeof getEngagementTrend>;
  loading: boolean;
  error: string | null;
}

export function useAnalytics(userId?: string): AnalyticsData {
  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetric[]>([]);
  const [serverReach, setServerReach] = useState<ServerReach[]>([]);
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetric[]>([]);
  const [posts, setPosts] = useState<SpotlightPost[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary>(mockAnalyticsSummary);
  const [trends, setTrends] = useState(getEngagementTrend());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // If userId is provided, we would filter for user-specific data
        // For now, return all mock data
        setEngagementMetrics(mockEngagementMetrics);
        setServerReach(mockServerReach);
        setGrowthMetrics(mockGrowthMetrics);
        setPosts(mockSpotlightPosts);
        setSummary(mockAnalyticsSummary);
        setTrends(getEngagementTrend());
      } catch (err) {
        setError("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  return {
    engagementMetrics,
    serverReach,
    growthMetrics,
    posts,
    summary,
    trends,
    loading,
    error,
  };
}

// Hook for engagement data only
export function useEngagement() {
  const [metrics, setMetrics] = useState<EngagementMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setMetrics(mockEngagementMetrics);
      setLoading(false);
    };
    fetchData();
  }, []);

  return { metrics, trends: getEngagementTrend(), loading };
}

// Hook for server reach data only
export function useServerReach() {
  const [servers, setServers] = useState<ServerReach[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setServers(mockServerReach);
      setLoading(false);
    };
    fetchData();
  }, []);

  return { servers, loading };
}

// Hook for growth metrics only
export function useGrowth() {
  const [metrics, setMetrics] = useState<GrowthMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setMetrics(mockGrowthMetrics);
      setLoading(false);
    };
    fetchData();
  }, []);

  return { metrics, loading };
}

// Hook for spotlight posts
export function useSpotlightPosts() {
  const [posts, setPosts] = useState<SpotlightPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setPosts(mockSpotlightPosts);
      setLoading(false);
    };
    fetchData();
  }, []);

  return { posts, loading };
}
