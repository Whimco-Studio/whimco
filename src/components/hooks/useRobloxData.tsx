"use client";

import { useState, useEffect, useCallback } from "react";
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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setRoles(mockRoles);
      setLoading(false);
    };
    fetchData();
  }, []);

  const addRole = useCallback(async (role: Omit<RobloxRole, "id">) => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newRole: RobloxRole = {
      ...role,
      id: `role-${Date.now()}`,
    };
    setRoles((prev) => [...prev, newRole]);
    setSaving(false);
    return newRole;
  }, []);

  const updateRole = useCallback(async (id: string, updates: Partial<RobloxRole>) => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRoles((prev) =>
      prev.map((role) => (role.id === id ? { ...role, ...updates } : role))
    );
    setSaving(false);
  }, []);

  const deleteRole = useCallback(async (id: string) => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRoles((prev) => prev.filter((role) => role.id !== id));
    setSaving(false);
  }, []);

  return { roles, loading, saving, addRole, updateRole, deleteRole };
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

  const refetch = useCallback(async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setMembers(mockMembers);
    setLoading(false);
  }, []);

  return { members, loading, refetch };
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

  const pinPost = useCallback(async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id ? { ...post, isPinned: !post.isPinned } : post
      )
    );
  }, []);

  const hidePost = useCallback(async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id ? { ...post, isHidden: !post.isHidden } : post
      )
    );
  }, []);

  const deletePost = useCallback(async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    setPosts((prev) => prev.filter((post) => post.id !== id));
  }, []);

  const refetch = useCallback(async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setPosts(mockWallPosts);
    setLoading(false);
  }, []);

  return { posts, loading, pinPost, hidePost, deletePost, refetch };
}

export function usePayouts() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setPayouts(mockPayouts);
      setLoading(false);
    };
    fetchData();
  }, []);

  const addPayout = useCallback(async (payout: Omit<Payout, "id">) => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newPayout: Payout = {
      ...payout,
      id: `payout-${Date.now()}`,
    };
    setPayouts((prev) => [newPayout, ...prev]);
    setSaving(false);
    return newPayout;
  }, []);

  const updatePayout = useCallback(async (id: string, updates: Partial<Payout>) => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setPayouts((prev) =>
      prev.map((payout) => (payout.id === id ? { ...payout, ...updates } : payout))
    );
    setSaving(false);
  }, []);

  const refetch = useCallback(async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setPayouts(mockPayouts);
    setLoading(false);
  }, []);

  return { payouts, loading, saving, addPayout, updatePayout, refetch };
}
