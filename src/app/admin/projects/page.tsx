"use client";

import { useState } from "react";
import Link from "next/link";
import {
  RocketLaunchIcon,
  SparklesIcon,
  CubeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  HeartIcon,
  UserGroupIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import AdminHeader from "../../components/admin/AdminHeader";
import StatCard from "../../components/admin/StatCard";
import StatusBadge from "../../components/admin/StatusBadge";
import EmptyState from "../../components/admin/EmptyState";
import { useProjects } from "@/components/hooks/useProjects";
import { Project, ProjectScope, ProjectStatus } from "@/types/admin";

const scopeLabels: Record<ProjectScope, { label: string; color: string; icon: React.ReactNode }> = {
  quirkyverse: {
    label: "Quirkyverse",
    color: "from-purple-500 to-pink-500",
    icon: <SparklesIcon className="w-4 h-4" />,
  },
  standalone: {
    label: "Standalone",
    color: "from-blue-500 to-cyan-500",
    icon: <CubeIcon className="w-4 h-4" />,
  },
};

const statusColors: Record<ProjectStatus, string> = {
  active: "success",
  development: "info",
  paused: "warning",
  archived: "default",
};

export default function ProjectsPage() {
  const [scopeFilter, setScopeFilter] = useState<ProjectScope | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const [search, setSearch] = useState("");

  const { projects, summary, loading } = useProjects(scopeFilter, statusFilter);

  // Apply search filter
  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <AdminHeader
        title="Projects"
        subtitle="Manage your Roblox games and experiences"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Projects"
          value={loading ? "..." : summary.totalProjects}
          icon={<RocketLaunchIcon className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Quirkyverse"
          value={loading ? "..." : summary.quirkyverseProjects}
          subtitle={`${summary.quirkyverseCharacters} characters`}
          icon={<SparklesIcon className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Total Visits"
          value={loading ? "..." : summary.totalVisits.toLocaleString()}
          icon={<EyeIcon className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Active Players"
          value={loading ? "..." : summary.totalActivePlayers.toLocaleString()}
          subtitle="Right now"
          icon={<PlayIcon className="w-6 h-6" />}
          color="orange"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value as ProjectScope | "all")}
              className="pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none bg-white text-sm"
            >
              <option value="all">All Scopes</option>
              <option value="quirkyverse">Quirkyverse</option>
              <option value="standalone">Standalone</option>
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | "all")}
            className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none bg-white text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="development">In Development</option>
            <option value="paused">Paused</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-xl p-4 animate-pulse">
              <div className="h-40 bg-gray-200 rounded-xl mb-4" />
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-full mb-4" />
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded w-20" />
                <div className="h-6 bg-gray-200 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="Try adjusting your filters or search query"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const scopeInfo = scopeLabels[project.scope];

  return (
    <Link
      href={`/admin/projects/${project.id}`}
      className="group bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all"
    >
      {/* Thumbnail */}
      <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <RocketLaunchIcon className="w-16 h-16 text-gray-300" />
        </div>
        {/* Scope badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${scopeInfo.color}`}
          >
            {scopeInfo.icon}
            {scopeInfo.label}
          </span>
        </div>
        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={statusColors[project.status]} label={project.status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors line-clamp-1">
          {project.name}
        </h3>
        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{project.description}</p>

        {/* Stats */}
        {(project.visits || project.activePlayers) && (
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
            {project.visits && (
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <EyeIcon className="w-4 h-4" />
                <span>{(project.visits / 1000).toFixed(0)}K</span>
              </div>
            )}
            {project.favorites && (
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <HeartIcon className="w-4 h-4" />
                <span>{(project.favorites / 1000).toFixed(0)}K</span>
              </div>
            )}
            {project.activePlayers !== undefined && project.activePlayers > 0 && (
              <div className="flex items-center gap-1 text-sm text-emerald-600">
                <UserGroupIcon className="w-4 h-4" />
                <span>{project.activePlayers.toLocaleString()} playing</span>
              </div>
            )}
          </div>
        )}

        {/* Characters for Quirkyverse */}
        {project.scope === "quirkyverse" && project.characters && (
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-slate-400">Characters:</span>
            <div className="flex -space-x-2">
              {project.characters.slice(0, 4).map((char) => (
                <div
                  key={char.id}
                  className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold"
                  title={char.name}
                >
                  {char.name[0]}
                </div>
              ))}
              {project.characters.length > 4 && (
                <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] text-gray-500">
                  +{project.characters.length - 4}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
