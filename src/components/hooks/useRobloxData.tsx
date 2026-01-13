"use client";

import { useState, useEffect } from "react";
import {
  mockRoles,
  mockMembers,
  mockWallPosts,
  mockPayouts,
  mockRobloxSummary,
} from "@/lib/mock-data/roblox";
import { RobloxRole, RobloxMember, WallPost, Payout } from "@/types/admin";

interface RobloxData {
  roles: RobloxRole[];
  members: RobloxMember[];
  wallPosts: WallPost[];
  payouts: Payout[];
  summary: typeof mockRobloxSummary;
  loading: boolean;
  error: string | null;
}

export function useRobloxData(): RobloxData {
  const [roles, setRoles] = useState<RobloxRole[]>([]);
  const [members, setMembers] = useState<RobloxMember[]>([]);
  const [wallPosts, setWallPosts] = useState<WallPost[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [summary, setSummary] = useState(mockRobloxSummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        setRoles(mockRoles);
        setMembers(mockMembers);
        setWallPosts(mockWallPosts);
        setPayouts(mockPayouts);
        setSummary(mockRobloxSummary);
      } catch (err) {
        setError("Failed to load Roblox data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { roles, members, wallPosts, payouts, summary, loading, error };
}

// Individual hooks for specific data
export function useRoles() {
  const [roles, setRoles] = useState<RobloxRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setRoles(mockRoles);
      setLoading(false);
    };
    fetchData();
  }, []);

  return { roles, loading };
}

export function useMembers() {
  const [members, setMembers] = useState<RobloxMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setMembers(mockMembers);
      setLoading(false);
    };
    fetchData();
  }, []);

  return { members, loading };
}

export function useWallPosts() {
  const [posts, setPosts] = useState<WallPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setPosts(mockWallPosts);
      setLoading(false);
    };
    fetchData();
  }, []);

  return { posts, loading };
}

export function usePayouts() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setPayouts(mockPayouts);
      setLoading(false);
    };
    fetchData();
  }, []);

  return { payouts, loading };
}
