"use client";

import Link from "next/link";
import GlassNav from "../components/GlassNav";
import {
  HeartIcon,
  SparklesIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  LightBulbIcon,
  StarIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

interface Value {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const values: Value[] = [
  {
    icon: <SparklesIcon className="w-6 h-6" />,
    title: "Whimsy First",
    description:
      "We believe games should spark joy and wonder. Every experience we create is designed to bring a smile.",
  },
  {
    icon: <HeartIcon className="w-6 h-6" />,
    title: "Player-Focused",
    description:
      "Our players are at the heart of everything we do. We listen, iterate, and craft experiences they'll love.",
  },
  {
    icon: <LightBulbIcon className="w-6 h-6" />,
    title: "Creative Innovation",
    description:
      "We're not afraid to try new ideas. Some of our best features came from wild experiments.",
  },
  {
    icon: <UserGroupIcon className="w-6 h-6" />,
    title: "Community Driven",
    description:
      "We grow together with our community. Your feedback shapes our games and our future.",
  },
];

const milestones = [
  { year: "2021", event: "Whimco founded with a dream to create joyful games" },
  { year: "2021", event: "The Quirkyverse concept was born" },
  { year: "2023", event: "Launched our first game on Roblox" },
  { year: "2025", event: "Tied Together reaches millions of players" },
  { year: "2026", event: "Woodlands Released" },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#1a0a1a]">
      <GlassNav />

      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a1a] via-[#1f0d2a] to-[#1a0a1a]" />

        {/* Warm glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-fuchsia-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

        {/* Sparkle elements */}
        <div className="sparkle sparkle-1" />
        <div className="sparkle sparkle-2" />
        <div className="sparkle sparkle-3" />
        <div className="sparkle sparkle-4" />
      </div>

      {/* Content */}
      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30">
            <HeartIcon className="w-5 h-5 text-fuchsia-400" />
            <span className="text-fuchsia-400 text-sm font-medium tracking-wider uppercase">
              Our Story
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            We Create{" "}
            <span className="bg-gradient-to-r from-fuchsia-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Whimsical Worlds
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-fuchsia-100/60 max-w-2xl mx-auto leading-relaxed">
            Whimco is a game development studio dedicated to crafting joyful,
            imaginative experiences that bring people together.
          </p>
        </div>

        {/* Story Section */}
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Story Text */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-400">
                  <RocketLaunchIcon className="w-6 h-6" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  How It Started
                </h2>
              </div>
              <p className="text-fuchsia-100/60 leading-relaxed">
                Whimco began with a simple idea: games should feel magical. We
                wanted to create experiences that capture the wonder of
                childhood imagination — worlds where anything is possible and
                every corner holds a surprise.
              </p>
              <p className="text-fuchsia-100/60 leading-relaxed">
                What started as a passion project has grown into something
                bigger. Today, we&apos;re building connected universes filled with
                charming characters, engaging gameplay, and stories that stay
                with you.
              </p>
              <p className="text-fuchsia-100/60 leading-relaxed">
                Our games have been played by millions of players around the
                world, but we&apos;re just getting started. The best is yet to come.
              </p>
            </div>

            {/* Timeline */}
            <div className="relative">
              <div className="backdrop-blur-xl bg-white/[0.04] border border-fuchsia-500/20 rounded-3xl p-6 sm:p-8">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <StarIcon className="w-5 h-5 text-fuchsia-400" />
                  Our Journey
                </h3>
                <div className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-16 text-fuchsia-400 font-mono font-bold">
                        {milestone.year}
                      </div>
                      <div className="flex-grow">
                        <div className="h-px bg-gradient-to-r from-fuchsia-500/40 to-transparent mb-2" />
                        <p className="text-fuchsia-100/70 text-sm">
                          {milestone.event}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              What We Believe In
            </h2>
            <p className="text-fuchsia-100/60 max-w-xl mx-auto">
              These values guide everything we create and how we work together.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map((value, index) => (
              <div
                key={index}
                className="group relative rounded-2xl overflow-hidden backdrop-blur-xl bg-white/[0.04] border border-fuchsia-500/20 p-6 hover:bg-white/[0.08] hover:border-fuchsia-500/40 transition-all duration-300"
              >
                <div className="p-3 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-400 w-fit mb-4 group-hover:scale-110 transition-transform">
                  {value.icon}
                </div>
                <h3 className="font-bold text-white text-lg mb-2">
                  {value.title}
                </h3>
                <p className="text-fuchsia-100/50 text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-20">
          <div className="backdrop-blur-xl bg-gradient-to-r from-fuchsia-500/10 via-pink-500/10 to-purple-500/10 border border-fuchsia-500/20 rounded-3xl p-8 sm:p-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  3M+
                </div>
                <div className="text-fuchsia-100/50 text-sm">Total Visits</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  17K+
                </div>
                <div className="text-fuchsia-100/50 text-sm">Favorites</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  5+
                </div>
                <div className="text-fuchsia-100/50 text-sm">Experiences</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  1
                </div>
                <div className="text-fuchsia-100/50 text-sm">Universe</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="backdrop-blur-xl bg-white/[0.04] border border-fuchsia-500/20 rounded-3xl p-8 sm:p-12">
            <SparklesIcon className="w-12 h-12 text-fuchsia-400 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Join the Adventure
            </h2>
            <p className="text-fuchsia-100/60 mb-6 max-w-lg mx-auto">
              Play our games, join our community, or follow along as we build
              new worlds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/experiences"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white font-semibold hover:from-fuchsia-400 hover:to-pink-400 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-fuchsia-500/30"
              >
                <SparklesIcon className="w-5 h-5" />
                Explore Our Games
              </Link>
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 text-white font-semibold hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all border border-fuchsia-500/30"
              >
                Developer Tools
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
