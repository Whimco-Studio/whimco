"use client";

import { useState } from "react";
import Image from "next/image";
import {
  EyeSlashIcon,
  EyeIcon,
  TrashIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import AdminHeader from "../../../components/admin/AdminHeader";
import StatusBadge from "../../../components/admin/StatusBadge";
import EmptyState from "../../../components/admin/EmptyState";
import { useWallPosts } from "@/components/hooks/useRobloxData";
import { WallPost } from "@/types/admin";

// Custom pin icon since heroicons doesn't have one
function PinSolidIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M16 4c0-1.1-.9-2-2-2H10c-1.1 0-2 .9-2 2v1.5L6.34 7.16c-.59.59-.59 1.54 0 2.12l.32.32L8 13.32V20c0 .55.45 1 1 1h1v1c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-1h1c.55 0 1-.45 1-1v-6.68l1.34-3.72.32-.32c.59-.58.59-1.53 0-2.12L16 5.5V4z" />
    </svg>
  );
}

export default function WallPostsPage() {
  const { posts, loading, pinPost, hidePost, deletePost, refetch } = useWallPosts();
  const [filter, setFilter] = useState<"all" | "pinned" | "hidden">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filteredPosts = posts.filter((post) => {
    if (filter === "pinned") return post.isPinned;
    if (filter === "hidden") return post.isHidden;
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handlePin = async (id: string) => {
    setActionLoading(id);
    await pinPost(id);
    setActionLoading(null);
  };

  const handleHide = async (id: string) => {
    setActionLoading(id);
    await hidePost(id);
    setActionLoading(null);
  };

  const handleDelete = async (id: string, authorName: string) => {
    if (confirm(`Are you sure you want to delete ${authorName}'s post?`)) {
      setActionLoading(id);
      await deletePost(id);
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <>
        <AdminHeader
          title="Wall Posts"
          subtitle="Moderate group wall posts and announcements"
        />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-xl p-6 animate-pulse"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200/50" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200/50 rounded w-1/4 mb-2" />
                  <div className="h-3 bg-gray-200/50 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-200/50 rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader
        title="Wall Posts"
        subtitle="Moderate group wall posts and announcements"
      />

      {/* Filter tabs and refresh */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {[
            { key: "all", label: "All Posts", count: posts.length },
            {
              key: "pinned",
              label: "Pinned",
              count: posts.filter((p) => p.isPinned).length,
            },
            {
              key: "hidden",
              label: "Hidden",
              count: posts.filter((p) => p.isHidden).length,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key as typeof filter)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === tab.key
                  ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg"
                  : "backdrop-blur-md bg-white/60 border border-white/20 text-slate-600 hover:bg-white/80"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={refetch}
          className="p-2.5 rounded-xl backdrop-blur-md bg-white/60 border border-white/20 hover:bg-white/80 transition-colors"
          title="Refresh posts"
        >
          <ArrowPathIcon className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Posts */}
      {filteredPosts.length === 0 ? (
        <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-xl overflow-hidden">
          <EmptyState
            title="No posts found"
            description={`No ${filter === "all" ? "" : filter} posts to display`}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <WallPostCard
              key={post.id}
              post={post}
              formatDate={formatDate}
              onPin={() => handlePin(String(post.id))}
              onHide={() => handleHide(String(post.id))}
              onDelete={() => handleDelete(String(post.id), post.author.displayName)}
              isLoading={actionLoading === String(post.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}

function WallPostCard({
  post,
  formatDate,
  onPin,
  onHide,
  onDelete,
  isLoading,
}: {
  post: WallPost;
  formatDate: (date: string) => string;
  onPin: () => void;
  onHide: () => void;
  onDelete: () => void;
  isLoading: boolean;
}) {
  return (
    <div
      className={`backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-xl p-6 transition-all ${
        post.isHidden ? "opacity-60" : ""
      } ${isLoading ? "animate-pulse" : ""}`}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-violet-500 flex-shrink-0 ring-2 ring-white/50">
          <Image
            src={post.author.avatarUrl}
            alt={post.author.displayName}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-700">
              {post.author.displayName}
            </span>
            <span className="text-slate-400 text-sm">
              @{post.author.username}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-400 text-sm">
              {formatDate(post.createdAt)}
            </span>
            {post.isPinned && (
              <StatusBadge status="info" label="Pinned" size="sm" />
            )}
            {post.isHidden && (
              <StatusBadge status="warning" label="Hidden" size="sm" />
            )}
          </div>

          <p className="mt-2 text-slate-600 whitespace-pre-wrap">
            {post.isHidden ? "[Content hidden by moderator]" : post.content}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={onPin}
            disabled={isLoading}
            className={`p-2 rounded-xl backdrop-blur-md transition-all disabled:opacity-50 ${
              post.isPinned
                ? "bg-blue-100/50 text-blue-500"
                : "hover:bg-gray-100/50 text-slate-400"
            }`}
            title={post.isPinned ? "Unpin post" : "Pin post"}
          >
            <PinSolidIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={onHide}
            disabled={isLoading}
            className={`p-2 rounded-xl backdrop-blur-md transition-all disabled:opacity-50 ${
              post.isHidden
                ? "bg-orange-100/50 text-orange-500"
                : "hover:bg-gray-100/50 text-slate-400"
            }`}
            title={post.isHidden ? "Show post" : "Hide post"}
          >
            {post.isHidden ? (
              <EyeIcon className="w-5 h-5" />
            ) : (
              <EyeSlashIcon className="w-5 h-5" />
            )}
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={isLoading}
            className="p-2 rounded-xl backdrop-blur-md hover:bg-red-100/50 text-slate-400 hover:text-red-500 transition-all disabled:opacity-50"
            title="Delete post"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
