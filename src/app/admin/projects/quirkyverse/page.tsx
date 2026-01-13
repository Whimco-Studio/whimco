"use client";

import { useState } from "react";
import Link from "next/link";
import {
  SparklesIcon,
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
import { Project, ProjectStatus } from "@/types/admin";

const statusColors: Record<ProjectStatus, string> = {
  active: "success",
  development: "info",
  paused: "warning",
  archived: "default",
};

export default function QuirkyversePage() {
  const { projects, characters, summary, loading } = useProjects("quirkyverse");

  // Calculate Quirkyverse-specific stats
  const totalVisits = projects.reduce((sum, p) => sum + (p.visits || 0), 0);
  const totalPlayers = projects.reduce((sum, p) => sum + (p.activePlayers || 0), 0);

  return (
    <>
      <AdminHeader
        title="Quirkyverse"
        subtitle="Games and experiences in the Quirkyverse universe"
      />

      {/* Hero section */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 mb-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <SparklesIcon className="w-6 h-6" />
              <span className="text-sm font-medium opacity-90">Connected Universe</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">The Quirkyverse</h2>
            <p className="text-white/80 max-w-xl">
              A shared universe where characters cross between games, stories interweave,
              and players can follow their favorite characters across multiple experiences.
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold">{characters.length}</p>
            <p className="text-white/80 text-sm">Shared Characters</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Quirkyverse Games"
          value={loading ? "..." : projects.length}
          icon={<RocketLaunchIcon className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Shared Characters"
          value={loading ? "..." : characters.length}
          icon={<SparklesIcon className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Total Visits"
          value={loading ? "..." : totalVisits.toLocaleString()}
          icon={<EyeIcon className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Active Players"
          value={loading ? "..." : totalPlayers.toLocaleString()}
          subtitle="Across all games"
          icon={<UserGroupIcon className="w-6 h-6" />}
          color="orange"
        />
      </div>

      {/* Characters showcase */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <h2 className="text-lg font-bold text-slate-700 mb-4">Quirkyverse Characters</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {characters.map((char) => (
            <div
              key={char.id}
              className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-2xl font-bold text-white mb-2">
                {char.name[0]}
              </div>
              <p className="font-medium text-slate-700">{char.name}</p>
              <p className="text-xs text-slate-400 text-center line-clamp-2 mt-1">
                {char.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-700">Quirkyverse Projects</h2>
        <Link
          href="/admin/projects"
          className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
        >
          View all projects
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <QuirkyverseProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </>
  );
}

function QuirkyverseProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/admin/projects/${project.id}`}
      className="group bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-slate-700 group-hover:text-purple-600 transition-colors">
            {project.name}
          </h3>
          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{project.description}</p>
        </div>
        <StatusBadge status={statusColors[project.status]} label={project.status} />
      </div>

      {/* Characters */}
      {project.characters && project.characters.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-slate-400">Featured:</span>
          <div className="flex flex-wrap gap-1">
            {project.characters.map((char) => (
              <span
                key={char.id}
                className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700"
              >
                {char.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
        {project.visits && (
          <div className="flex items-center gap-1.5">
            <EyeIcon className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-600">
              {(project.visits / 1000000).toFixed(1)}M visits
            </span>
          </div>
        )}
        {project.favorites && (
          <div className="flex items-center gap-1.5">
            <HeartIcon className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-600">
              {(project.favorites / 1000).toFixed(0)}K favorites
            </span>
          </div>
        )}
        {project.activePlayers !== undefined && project.activePlayers > 0 && (
          <div className="flex items-center gap-1.5">
            <UserGroupIcon className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-600">
              {project.activePlayers.toLocaleString()} playing
            </span>
          </div>
        )}
      </div>

      {/* Related projects */}
      {project.relatedProjects && project.relatedProjects.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-slate-400">
            Connected to {project.relatedProjects.length} other Quirkyverse{" "}
            {project.relatedProjects.length === 1 ? "project" : "projects"}
          </span>
        </div>
      )}
    </Link>
  );
}
