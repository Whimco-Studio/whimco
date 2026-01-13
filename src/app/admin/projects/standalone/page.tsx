"use client";

import Link from "next/link";
import {
  CubeIcon,
  RocketLaunchIcon,
  EyeIcon,
  HeartIcon,
  UserGroupIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import AdminHeader from "../../../components/admin/AdminHeader";
import StatCard from "../../../components/admin/StatCard";
import StatusBadge from "../../../components/admin/StatusBadge";
import { useProjects } from "@/components/hooks/useProjects";
import { Project, ProjectStatus, ProjectType } from "@/types/admin";

const statusColors: Record<ProjectStatus, string> = {
  active: "success",
  development: "info",
  paused: "warning",
  archived: "default",
};

const typeLabels: Record<ProjectType, { label: string; color: string }> = {
  game: { label: "Game", color: "bg-blue-100 text-blue-700" },
  experience: { label: "Experience", color: "bg-purple-100 text-purple-700" },
  item: { label: "Item", color: "bg-green-100 text-green-700" },
  asset: { label: "Asset", color: "bg-orange-100 text-orange-700" },
};

export default function StandalonePage() {
  const { projects, summary, loading } = useProjects("standalone");

  // Calculate standalone-specific stats
  const totalVisits = projects.reduce((sum, p) => sum + (p.visits || 0), 0);
  const totalPlayers = projects.reduce((sum, p) => sum + (p.activePlayers || 0), 0);
  const activeGames = projects.filter((p) => p.status === "active" && p.type === "game").length;

  return (
    <>
      <AdminHeader
        title="Standalone Projects"
        subtitle="Independent games and experiences outside the Quirkyverse"
      />

      {/* Hero section */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 mb-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CubeIcon className="w-6 h-6" />
              <span className="text-sm font-medium opacity-90">Independent Projects</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Standalone Collection</h2>
            <p className="text-white/80 max-w-xl">
              Unique games and experiences that stand on their own. Each project has its own
              identity, characters, and world - separate from the Quirkyverse.
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold">{activeGames}</p>
            <p className="text-white/80 text-sm">Active Games</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Standalone Projects"
          value={loading ? "..." : projects.length}
          icon={<CubeIcon className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Active Games"
          value={loading ? "..." : activeGames}
          icon={<RocketLaunchIcon className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Total Visits"
          value={loading ? "..." : totalVisits.toLocaleString()}
          icon={<EyeIcon className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Active Players"
          value={loading ? "..." : totalPlayers.toLocaleString()}
          subtitle="Across all games"
          icon={<UserGroupIcon className="w-6 h-6" />}
          color="orange"
        />
      </div>

      {/* Projects by type */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-700">All Standalone Projects</h2>
        <Link
          href="/admin/projects"
          className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
        >
          View all projects
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-xl p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-full mb-4" />
              <div className="flex gap-4">
                <div className="h-8 bg-gray-200 rounded w-20" />
                <div className="h-8 bg-gray-200 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <StandaloneProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </>
  );
}

function StandaloneProjectCard({ project }: { project: Project }) {
  const typeInfo = typeLabels[project.type];

  return (
    <Link
      href={`/admin/projects/${project.id}`}
      className="group bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 text-xs rounded-full ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
            <StatusBadge status={statusColors[project.status]} label={project.status} />
          </div>
          <h3 className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
            {project.name}
          </h3>
        </div>
      </div>

      <p className="text-sm text-slate-500 line-clamp-2 mb-4">{project.description}</p>

      {/* Stats */}
      <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100">
        {project.visits && (
          <div className="flex items-center gap-1.5">
            <EyeIcon className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">
              {project.visits >= 1000000
                ? `${(project.visits / 1000000).toFixed(1)}M`
                : `${(project.visits / 1000).toFixed(0)}K`}
            </span>
          </div>
        )}
        {project.favorites && (
          <div className="flex items-center gap-1.5">
            <HeartIcon className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">
              {(project.favorites / 1000).toFixed(0)}K
            </span>
          </div>
        )}
        {project.activePlayers !== undefined && project.activePlayers > 0 && (
          <div className="flex items-center gap-1.5">
            <UserGroupIcon className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-600">
              {project.activePlayers.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
