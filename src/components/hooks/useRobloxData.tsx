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

// Toggle this to use mock data during development
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

interface RobloxSummary {
  totalMembers: number;
  activeMembers: number;
  totalRoles: number;
  wallPosts: number;
  totalPaidThisMonth: number;
  pendingPayouts: number;
}

interface RobloxData {
  roles: RobloxRole[];
  members: RobloxMember[];
  wallPosts: WallPost[];
  payouts: Payout[];
  summary: RobloxSummary;
  loading: boolean;
  error: string | null;
}

export function useRobloxData(): RobloxData {
  const [roles, setRoles] = useState<RobloxRole[]>([]);
  const [members, setMembers] = useState<RobloxMember[]>([]);
  const [wallPosts, setWallPosts] = useState<WallPost[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [summary, setSummary] = useState<RobloxSummary>(mockRobloxSummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (USE_MOCK_DATA) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          setRoles(mockRoles);
          setMembers(mockMembers);
          setWallPosts(mockWallPosts);
          setPayouts(mockPayouts);
          setSummary(mockRobloxSummary);
        } else {
          const {
            robloxRolesApi,
            robloxMembersApi,
            robloxWallPostsApi,
            robloxPayoutsApi,
            robloxSummaryApi,
          } = await import("@/lib/api/roblox-data");

          const [rolesData, membersData, postsData, payoutsData, summaryData] =
            await Promise.all([
              robloxRolesApi.list().catch(() => []),
              robloxMembersApi.list().catch(() => []),
              robloxWallPostsApi.list().catch(() => []),
              robloxPayoutsApi.list().catch(() => []),
              robloxSummaryApi.get().catch(() => mockRobloxSummary),
            ]);

          setRoles(rolesData);
          setMembers(membersData);
          setWallPosts(postsData);
          setPayouts(payoutsData);
          setSummary(summaryData);
        }
      } catch (err) {
        console.error("Failed to load Roblox data:", err);
        setError("Failed to load Roblox data");
        // Fallback to mock data on error
        setRoles(mockRoles);
        setMembers(mockMembers);
        setWallPosts(mockWallPosts);
        setPayouts(mockPayouts);
        setSummary(mockRobloxSummary);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { roles, members, wallPosts, payouts, summary, loading, error };
}

// ============================================================================
// Roles Hook
// ============================================================================

export function useRoles() {
  const [roles, setRoles] = useState<RobloxRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setRoles(mockRoles);
      } else {
        const { robloxRolesApi } = await import("@/lib/api/roblox-data");
        const data = await robloxRolesApi.list();
        setRoles(data);
      }
    } catch (err) {
      console.error("Failed to fetch roles:", err);
      setRoles(mockRoles);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const addRole = useCallback(async (role: Omit<RobloxRole, "id">) => {
    setSaving(true);
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const newRole: RobloxRole = {
          ...role,
          id: Date.now(),
        };
        setRoles((prev) => [...prev, newRole]);
        return newRole;
      } else {
        const { robloxRolesApi } = await import("@/lib/api/roblox-data");
        const newRole = await robloxRolesApi.create(role);
        setRoles((prev) => [...prev, newRole]);
        return newRole;
      }
    } finally {
      setSaving(false);
    }
  }, []);

  const updateRole = useCallback(async (id: string, updates: Partial<RobloxRole>) => {
    setSaving(true);
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const numId = Number(id);
        setRoles((prev) =>
          prev.map((role) => (role.id === numId ? { ...role, ...updates } : role))
        );
      } else {
        const { robloxRolesApi } = await import("@/lib/api/roblox-data");
        const updated = await robloxRolesApi.update(id, updates);
        setRoles((prev) =>
          prev.map((role) => (String(role.id) === id ? updated : role))
        );
      }
    } finally {
      setSaving(false);
    }
  }, []);

  const deleteRole = useCallback(async (id: string) => {
    setSaving(true);
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const numId = Number(id);
        setRoles((prev) => prev.filter((role) => role.id !== numId));
      } else {
        const { robloxRolesApi } = await import("@/lib/api/roblox-data");
        await robloxRolesApi.delete(id);
        setRoles((prev) => prev.filter((role) => String(role.id) !== id));
      }
    } finally {
      setSaving(false);
    }
  }, []);

  const syncRoles = useCallback(async () => {
    setLoading(true);
    try {
      if (!USE_MOCK_DATA) {
        const { robloxRolesApi } = await import("@/lib/api/roblox-data");
        await robloxRolesApi.sync();
      }
      await fetchRoles();
    } finally {
      setLoading(false);
    }
  }, [fetchRoles]);

  return { roles, loading, saving, addRole, updateRole, deleteRole, syncRoles, refetch: fetchRoles };
}

// ============================================================================
// Members Hook
// ============================================================================

export function useMembers() {
  const [members, setMembers] = useState<RobloxMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setMembers(mockMembers);
      } else {
        const { robloxMembersApi } = await import("@/lib/api/roblox-data");
        const data = await robloxMembersApi.list();
        setMembers(data);
      }
    } catch (err) {
      console.error("Failed to fetch members:", err);
      setMembers(mockMembers);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const syncMembers = useCallback(async () => {
    setLoading(true);
    try {
      if (!USE_MOCK_DATA) {
        const { robloxMembersApi } = await import("@/lib/api/roblox-data");
        await robloxMembersApi.sync();
      }
      await fetchMembers();
    } finally {
      setLoading(false);
    }
  }, [fetchMembers]);

  return { members, loading, refetch: fetchMembers, syncMembers };
}

// ============================================================================
// Wall Posts Hook
// ============================================================================

export function useWallPosts() {
  const [posts, setPosts] = useState<WallPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setPosts(mockWallPosts);
      } else {
        const { robloxWallPostsApi } = await import("@/lib/api/roblox-data");
        const data = await robloxWallPostsApi.list();
        setPosts(data);
      }
    } catch (err) {
      console.error("Failed to fetch wall posts:", err);
      setPosts(mockWallPosts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const pinPost = useCallback(async (id: string) => {
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        const numId = Number(id);
        setPosts((prev) =>
          prev.map((post) =>
            post.id === numId ? { ...post, isPinned: !post.isPinned } : post
          )
        );
      } else {
        const { robloxWallPostsApi } = await import("@/lib/api/roblox-data");
        const updated = await robloxWallPostsApi.pin(id);
        setPosts((prev) =>
          prev.map((post) => (String(post.id) === id ? updated : post))
        );
      }
    } catch (err) {
      console.error("Failed to pin post:", err);
    }
  }, []);

  const hidePost = useCallback(async (id: string) => {
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        const numId = Number(id);
        setPosts((prev) =>
          prev.map((post) =>
            post.id === numId ? { ...post, isHidden: !post.isHidden } : post
          )
        );
      } else {
        const { robloxWallPostsApi } = await import("@/lib/api/roblox-data");
        const updated = await robloxWallPostsApi.hide(id);
        setPosts((prev) =>
          prev.map((post) => (String(post.id) === id ? updated : post))
        );
      }
    } catch (err) {
      console.error("Failed to hide post:", err);
    }
  }, []);

  const deletePost = useCallback(async (id: string) => {
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        const numId = Number(id);
        setPosts((prev) => prev.filter((post) => post.id !== numId));
      } else {
        const { robloxWallPostsApi } = await import("@/lib/api/roblox-data");
        await robloxWallPostsApi.delete(id);
        setPosts((prev) => prev.filter((post) => String(post.id) !== id));
      }
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  }, []);

  const syncPosts = useCallback(async () => {
    setLoading(true);
    try {
      if (!USE_MOCK_DATA) {
        const { robloxWallPostsApi } = await import("@/lib/api/roblox-data");
        await robloxWallPostsApi.sync();
      }
      await fetchPosts();
    } finally {
      setLoading(false);
    }
  }, [fetchPosts]);

  return { posts, loading, pinPost, hidePost, deletePost, refetch: fetchPosts, syncPosts };
}

// ============================================================================
// Payouts Hook
// ============================================================================

export function usePayouts() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPayouts = useCallback(async () => {
    setLoading(true);
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setPayouts(mockPayouts);
      } else {
        const { robloxPayoutsApi } = await import("@/lib/api/roblox-data");
        const data = await robloxPayoutsApi.list();
        setPayouts(data);
      }
    } catch (err) {
      console.error("Failed to fetch payouts:", err);
      setPayouts(mockPayouts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  const addPayout = useCallback(async (payout: Omit<Payout, "id">) => {
    setSaving(true);
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const newPayout: Payout = {
          ...payout,
          id: Date.now(),
        };
        setPayouts((prev) => [newPayout, ...prev]);
        return newPayout;
      } else {
        const { robloxPayoutsApi } = await import("@/lib/api/roblox-data");
        const payload = {
          recipient_id: String(payout.recipient.id),
          recipient_username: payout.recipient.username,
          recipient_display_name: payout.recipient.displayName,
          recipient_avatar_url: payout.recipient.avatarUrl,
          amount: payout.amount,
          percentage: payout.percentage,
          status: payout.status as "pending" | "completed" | "failed",
          note: payout.note,
          payout_date: payout.date,
        };
        const newPayout = await robloxPayoutsApi.create(payload);
        setPayouts((prev) => [newPayout, ...prev]);
        return newPayout;
      }
    } finally {
      setSaving(false);
    }
  }, []);

  const updatePayout = useCallback(async (id: string, updates: Partial<Payout>) => {
    setSaving(true);
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const numId = Number(id);
        setPayouts((prev) =>
          prev.map((payout) => (payout.id === numId ? { ...payout, ...updates } : payout))
        );
      } else {
        const { robloxPayoutsApi } = await import("@/lib/api/roblox-data");
        const updated = await robloxPayoutsApi.update(id, updates);
        setPayouts((prev) =>
          prev.map((payout) => (String(payout.id) === id ? updated : payout))
        );
      }
    } finally {
      setSaving(false);
    }
  }, []);

  return { payouts, loading, saving, addPayout, updatePayout, refetch: fetchPayouts };
}
