"use client";

import { useState } from "react";
import Link from "next/link";
import GlassNav from "../components/GlassNav";
import {
  SparklesIcon,
  CubeIcon,
  PlayIcon,
  HeartIcon,
  ArrowRightIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

// Types for public display
interface PublicProject {
  id: string;
  name: string;
  description: string;
  thumbnailUrl?: string;
  robloxGameId?: string;
  visits?: number;
  favorites?: number;
  activePlayers?: number;
  status: "live" | "coming-soon" | "beta";
}

interface Verse {
  id: string;
  name: string;
  tagline: string;
  description: string;
  color: string;
  projects: PublicProject[];
}

// Mock data for public display
const verses: Verse[] = [
  {
    id: "quirkyverse",
    name: "The Quirkyverse",
    tagline: "Where Characters Cross Worlds",
    description:
      "A connected universe where beloved characters appear across multiple games. Follow the Quirkymals through different experiences.",
    color: "from-purple-600/80 via-purple-500/70 to-indigo-600/80",
    projects: [
      {
        id: "qv-quirkymals",
        name: "Quirkymals",
        description:
          "The flagship adventure where you first meet the Quirkymals and discover the Quirkyverse.",
        robloxGameId: "123456789",
        visits: 1250000,
        favorites: 45000,
        activePlayers: 1250,
        status: "coming-soon",
      },
      {
        id: "qv-tied-together",
        name: "Tied Together",
        description:
          "An obby where you and your friends have to complete the level while being tied together.",
        robloxGameId: "108003034980758",
        visits: 3100000,
        favorites: 16860,
        activePlayers: 30,
        status: "live",
      },
      {
        id: "qv-quirkyroads",
        name: "Quirky Roads",
        description:
          "Cross the road safely while avoiding obstacles and cars.",
        robloxGameId: "12126572599",
        visits: 8879,
        favorites: 155,
        activePlayers: 0,
        status: "live",
      },
    ],
  },
];

const standaloneProjects: PublicProject[] = [
  {
    id: "tower-defense",
    name: "Tower Defense Titans",
    description:
      "Strategic tower defense with unique hero mechanics. Build, defend, and conquer!",
    robloxGameId: "345678901",
    visits: 2100000,
    favorites: 72000,
    activePlayers: 3200,
    status: "live",
  },
  {
    id: "speed-racers",
    name: "Speed Racers Ultimate",
    description:
      "High-octane racing with customizable vehicles. Compete and climb the leaderboards!",
    robloxGameId: "456789012",
    visits: 1800000,
    favorites: 58000,
    activePlayers: 2800,
    status: "live",
  },
  {
    id: "cozy-cafe",
    name: "Cozy Cafe Simulator",
    description:
      "A relaxing cafe management game. Design your cafe, serve customers, unlock recipes.",
    status: "coming-soon",
  },
];

export default function ExperiencesPage() {
  const [expandedVerse, setExpandedVerse] = useState<string | null>("quirkyverse");

  return (
    <main className="min-h-screen bg-[#0d0a1a]">
      <GlassNav />

      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/30 via-transparent to-purple-950/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            Our Experiences
          </h1>
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto">
            Explore our collection of games and experiences on Roblox.
            From connected universes to standalone adventures.
          </p>
        </div>

        {/* Verses Section */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <SparklesIcon className="w-8 h-8 text-purple-400" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Verses</h2>
          </div>
          <p className="text-white/60 mb-8 max-w-xl">
            Connected universes where characters and stories interweave across multiple games.
          </p>

          {/* Verse Cards */}
          <div className="space-y-6">
            {verses.map((verse) => (
              <div
                key={verse.id}
                className="rounded-3xl overflow-hidden backdrop-blur-xl bg-white/[0.06] border border-white/15 shadow-2xl"
              >
                {/* Verse Header */}
                <button
                  type="button"
                  onClick={() =>
                    setExpandedVerse(expandedVerse === verse.id ? null : verse.id)
                  }
                  className={`w-full p-6 sm:p-8 text-left bg-gradient-to-r ${verse.color} transition-all`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm font-medium mb-1">
                        {verse.tagline}
                      </p>
                      <h3 className="text-2xl sm:text-3xl font-bold text-white">
                        {verse.name}
                      </h3>
                      <p className="text-white/80 mt-2 max-w-2xl hidden sm:block">
                        {verse.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-white/80 text-sm hidden sm:block">
                        {verse.projects.length} games
                      </span>
                      <ChevronDownIcon
                        className={`w-6 h-6 text-white transition-transform ${
                          expandedVerse === verse.id ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>
                </button>

                {/* Verse Projects */}
                {expandedVerse === verse.id && (
                  <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {verse.projects.map((project) => (
                      <ProjectCard key={project.id} project={project} verseColor={verse.color} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Standalone Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <CubeIcon className="w-8 h-8 text-indigo-400" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Standalone Games</h2>
          </div>
          <p className="text-white/60 mb-8 max-w-xl">
            Unique experiences that stand on their own, each with its own world and identity.
          </p>

          {/* Standalone Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {standaloneProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-20 text-center">
          <div className="backdrop-blur-xl bg-white/[0.06] border border-white/15 rounded-3xl p-8 sm:p-12 shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Stay Updated
            </h2>
            <p className="text-white/70 mb-6 max-w-lg mx-auto">
              Follow us to get notified about new game releases, updates, and events.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://www.roblox.com/groups/YOUR_GROUP_ID"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-gray-900 font-semibold hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-white/20"
              >
                <PlayIcon className="w-5 h-5" />
                Join Our Roblox Group
              </a>
              <Link
                href="/spotlight"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 text-white font-semibold hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all border border-white/20"
              >
                View Spotlight
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function ProjectCard({
  project,
  verseColor,
}: {
  project: PublicProject;
  verseColor?: string;
}) {
  const isLive = project.status === "live";
  const isComingSoon = project.status === "coming-soon";

  return (
    <div
      className={`group relative rounded-2xl overflow-hidden backdrop-blur-lg transition-all hover:scale-[1.02] shadow-xl ${
        isLive
          ? "bg-white/[0.08] border border-white/20 hover:border-purple-400/50 hover:shadow-purple-500/10"
          : "bg-white/[0.04] border border-white/10"
      }`}
    >
      {/* Thumbnail placeholder */}
      <div
        className={`h-32 ${
          verseColor
            ? `bg-gradient-to-br ${verseColor} opacity-40`
            : "bg-gradient-to-br from-indigo-500/30 to-purple-500/30"
        }`}
      >
        {isComingSoon && (
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium backdrop-blur-sm">
              Coming Soon
            </span>
          </div>
        )}
        {project.activePlayers !== undefined && project.activePlayers > 0 && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/80 text-white text-xs font-medium backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              {project.activePlayers.toLocaleString()} playing
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h4 className="font-bold text-white text-lg mb-1 group-hover:text-cyan-300 transition-colors">
          {project.name}
        </h4>
        <p className="text-white/60 text-sm line-clamp-2 mb-4">{project.description}</p>

        {/* Stats */}
        {isLive && (project.visits || project.favorites) && (
          <div className="flex items-center gap-4 mb-4">
            {project.visits && (
              <div className="flex items-center gap-1.5 text-white/50 text-sm">
                <PlayIcon className="w-4 h-4" />
                <span>{(project.visits / 1000000).toFixed(1)}M</span>
              </div>
            )}
            {project.favorites && (
              <div className="flex items-center gap-1.5 text-white/50 text-sm">
                <HeartIcon className="w-4 h-4" />
                <span>{(project.favorites / 1000).toFixed(0)}K</span>
              </div>
            )}
          </div>
        )}

        {/* Play button */}
        {isLive && project.robloxGameId ? (
          <a
            href={`https://www.roblox.com/games/${project.robloxGameId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 w-full justify-center px-4 py-3 rounded-xl bg-white text-gray-900 font-semibold hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-white/20"
          >
            <PlayIcon className="w-5 h-5" />
            Play Now
          </a>
        ) : (
          <div className="inline-flex items-center gap-2 w-full justify-center px-4 py-2.5 rounded-xl bg-white/5 text-white/40 font-medium border border-white/5 cursor-not-allowed">
            <SparklesIcon className="w-5 h-5" />
            {isComingSoon ? "Coming Soon" : "Unavailable"}
          </div>
        )}
      </div>
    </div>
  );
}
