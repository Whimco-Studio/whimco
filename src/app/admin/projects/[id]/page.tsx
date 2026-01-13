"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  SparklesIcon,
  CubeIcon,
  EyeIcon,
  HeartIcon,
  HandThumbUpIcon,
  UserGroupIcon,
  CalendarIcon,
  LinkIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import AdminHeader from "../../../components/admin/AdminHeader";
import StatCard from "../../../components/admin/StatCard";
import StatusBadge from "../../../components/admin/StatusBadge";
import EmptyState from "../../../components/admin/EmptyState";
import { useProject } from "@/components/hooks/useProjects";
import { Project, ProjectStatus } from "@/types/admin";

const statusColors: Record<ProjectStatus, string> = {
  active: "success",
  development: "info",
  paused: "warning",
  archived: "default",
};

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { project, relatedProjects, loading, error } = useProject(resolvedParams.id);

  if (loading) {
    return (
      <>
        <AdminHeader title="Loading..." />
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8" />
          <div className="grid grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-2xl" />
            ))}
          </div>
        </div>
      </>
    );
  }

  if (error || !project) {
    return (
      <>
        <AdminHeader title="Project Not Found" />
        <EmptyState
          title="Project not found"
          description="The project you're looking for doesn't exist or has been removed."
          action={{
            label: "Back to Projects",
            onClick: () => window.history.back(),
          }}
        />
      </>
    );
  }

  const isQuirkyverse = project.scope === "quirkyverse";

  return (
    <>
      {/* Back button */}
      <Link
        href={isQuirkyverse ? "/admin/projects/quirkyverse" : "/admin/projects/standalone"}
        className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to {isQuirkyverse ? "Quirkyverse" : "Standalone"} Projects
      </Link>

      <AdminHeader title={project.name} />

      {/* Project header card */}
      <div
        className={`rounded-2xl p-6 mb-8 text-white ${
          isQuirkyverse
            ? "bg-gradient-to-r from-purple-500 to-pink-500"
            : "bg-gradient-to-r from-blue-500 to-cyan-500"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-white/20">
                {isQuirkyverse ? (
                  <SparklesIcon className="w-4 h-4" />
                ) : (
                  <CubeIcon className="w-4 h-4" />
                )}
                {isQuirkyverse ? "Quirkyverse" : "Standalone"}
              </span>
              <StatusBadge status={statusColors[project.status]} label={project.status} />
            </div>
            <p className="text-white/90 max-w-2xl">{project.description}</p>

            {/* Roblox links */}
            {project.robloxGameId && (
              <div className="flex items-center gap-4 mt-4">
                <a
                  href={`https://www.roblox.com/games/${project.robloxGameId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-sm font-medium"
                >
                  <LinkIcon className="w-4 h-4" />
                  View on Roblox
                </a>
              </div>
            )}
          </div>

          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-sm font-medium">
            <PencilIcon className="w-4 h-4" />
            Edit Project
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Visits"
          value={project.visits?.toLocaleString() || "N/A"}
          icon={<EyeIcon className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Favorites"
          value={project.favorites?.toLocaleString() || "N/A"}
          icon={<HeartIcon className="w-6 h-6" />}
          color="red"
        />
        <StatCard
          title="Likes"
          value={project.likes?.toLocaleString() || "N/A"}
          icon={<HandThumbUpIcon className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Active Players"
          value={project.activePlayers?.toLocaleString() || "0"}
          subtitle="Right now"
          icon={<UserGroupIcon className="w-6 h-6" />}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Characters (Quirkyverse only) */}
          {isQuirkyverse && project.characters && project.characters.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-lg font-bold text-slate-700 mb-4">Featured Characters</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {project.characters.map((char) => (
                  <div
                    key={char.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-lg font-bold text-white">
                      {char.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">{char.name}</p>
                      <p className="text-xs text-slate-400 line-clamp-1">{char.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Projects (Quirkyverse only) */}
          {isQuirkyverse && relatedProjects.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-lg font-bold text-slate-700 mb-4">
                Connected Quirkyverse Projects
              </h2>
              <div className="space-y-3">
                {relatedProjects.map((related) => (
                  <Link
                    key={related.id}
                    href={`/admin/projects/${related.id}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-slate-700">{related.name}</p>
                      <p className="text-sm text-slate-400 line-clamp-1">
                        {related.description}
                      </p>
                    </div>
                    <StatusBadge
                      status={statusColors[related.status]}
                      label={related.status}
                    />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project details */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-bold text-slate-700 mb-4">Details</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-slate-400">Type</dt>
                <dd className="mt-1 text-slate-700 capitalize">{project.type}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-400">Scope</dt>
                <dd className="mt-1 text-slate-700 capitalize">{project.scope}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-400">Status</dt>
                <dd className="mt-1">
                  <StatusBadge status={statusColors[project.status]} label={project.status} />
                </dd>
              </div>
              {project.robloxGameId && (
                <div>
                  <dt className="text-sm font-medium text-slate-400">Roblox Game ID</dt>
                  <dd className="mt-1 text-slate-700 font-mono text-sm">
                    {project.robloxGameId}
                  </dd>
                </div>
              )}
              {project.robloxUniverseId && (
                <div>
                  <dt className="text-sm font-medium text-slate-400">Universe ID</dt>
                  <dd className="mt-1 text-slate-700 font-mono text-sm">
                    {project.robloxUniverseId}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-bold text-slate-700 mb-4">Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Created</p>
                  <p className="text-sm text-slate-400">
                    {new Date(project.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Last Updated</p>
                  <p className="text-sm text-slate-400">
                    {new Date(project.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
