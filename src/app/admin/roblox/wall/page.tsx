"use client";

import { useState } from "react";
import Image from "next/image";
import {
  EyeSlashIcon,
  EyeIcon,
  TrashIcon,
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
  const { posts, loading } = useWallPosts();
  const [filter, setFilter] = useState<"all" | "pinned" | "hidden">("all");

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
              className="bg-white rounded-2xl shadow-xl p-6 animate-pulse"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
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

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6">
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
            onClick={() => setFilter(tab.key as typeof filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white"
                : "bg-white text-slate-600 hover:bg-gray-50"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Posts */}
      {filteredPosts.length === 0 ? (
        <EmptyState
          title="No posts found"
          description={`No ${filter === "all" ? "" : filter} posts to display`}
        />
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <WallPostCard key={post.id} post={post} formatDate={formatDate} />
          ))}
        </div>
      )}
    </>
  );
}

function WallPostCard({
  post,
  formatDate,
}: {
  post: WallPost;
  formatDate: (date: string) => string;
}) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-xl p-6 ${
        post.isHidden ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
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
            <span className="font-medium text-slate-700">
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
            className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
              post.isPinned ? "text-blue-500" : "text-slate-400"
            }`}
            title={post.isPinned ? "Unpin post" : "Pin post"}
          >
            <PinSolidIcon className="w-5 h-5" />
          </button>
          <button
            className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
              post.isHidden ? "text-orange-500" : "text-slate-400"
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
            className="p-2 rounded-lg hover:bg-gray-100 text-slate-400 hover:text-red-500 transition-colors"
            title="Delete post"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
