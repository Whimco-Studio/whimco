"use client";

import Link from "next/link";
import GlassNav from "../components/GlassNav";
import {
  CodeBracketIcon,
  PuzzlePieceIcon,
  CubeTransparentIcon,
  FolderIcon,
  ArrowTopRightOnSquareIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

interface Tool {
  id: string;
  name: string;
  description: string;
  type: "repo" | "plugin" | "demo" | "asset";
  url?: string;
  status?: "available" | "coming-soon" | "beta";
  tags?: string[];
}

interface ToolCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  tools: Tool[];
}

const toolCategories: ToolCategory[] = [
  {
    id: "repositories",
    name: "Open Source Repositories",
    description: "Code we've shared with the community",
    icon: <CodeBracketIcon className="w-6 h-6" />,
    tools: [
      {
        id: "whimco-site",
        name: "Whimco Website",
        description: "The source code for this very website you're looking at.",
        type: "repo",
        url: "https://github.com/whimco/whimco",
        status: "available",
        tags: ["Next.js", "React", "TypeScript"],
      },
    ],
  },
  {
    id: "plugins",
    name: "Roblox Plugins",
    description: "Tools to supercharge your Roblox development",
    icon: <PuzzlePieceIcon className="w-6 h-6" />,
    tools: [
      {
        id: "plugin-coming",
        name: "More Coming Soon",
        description: "We're cooking up some useful plugins for the Roblox community.",
        type: "plugin",
        status: "coming-soon",
        tags: ["Roblox Studio"],
      },
    ],
  },
  {
    id: "demos",
    name: "Demo Places",
    description: "Playable examples and technical showcases",
    icon: <CubeTransparentIcon className="w-6 h-6" />,
    tools: [
      {
        id: "demo-coming",
        name: "Demo Experiences",
        description: "Interactive demos showcasing our systems and techniques.",
        type: "demo",
        status: "coming-soon",
        tags: ["Roblox"],
      },
    ],
  },
  {
    id: "assets",
    name: "Assets & Resources",
    description: "Free resources for your projects",
    icon: <FolderIcon className="w-6 h-6" />,
    tools: [
      {
        id: "asset-coming",
        name: "Asset Packs",
        description: "Models, textures, and other resources we've created.",
        type: "asset",
        status: "coming-soon",
        tags: ["3D Models", "Textures"],
      },
    ],
  },
];

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-[#0a1628]">
      <GlassNav />

      {/* Blueprint Grid Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-[#0d1f3c] to-[#0a1628]" />

        {/* Blueprint grid */}
        <div className="absolute inset-0 blueprint-grid opacity-30" />

        {/* Subtle glowing orbs with blueprint colors */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '-2s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '-4s' }} />

        {/* Corner decorations - blueprint style */}
        <div className="absolute top-20 left-8 w-32 h-32 border border-cyan-500/20 rounded-lg rotate-45 opacity-40" />
        <div className="absolute bottom-20 right-8 w-24 h-24 border border-cyan-500/20 rounded-lg -rotate-12 opacity-40" />

        {/* Technical measurement lines */}
        <div className="absolute top-32 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
        <div className="absolute bottom-32 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30">
            <WrenchScrewdriverIcon className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-400 text-sm font-medium tracking-wider uppercase">Developer Resources</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            <span className="blueprint-text">The Workshop</span>
          </h1>
          <p className="text-lg sm:text-xl text-cyan-100/60 max-w-2xl mx-auto">
            Our collection of tools, plugins, and resources.
            <span className="text-cyan-400"> Open source </span>
            and free to use.
          </p>

          {/* Blueprint decorative line */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-cyan-500/50" />
            <SparklesIcon className="w-5 h-5 text-cyan-500/50" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-cyan-500/50" />
          </div>
        </div>

        {/* Tool Categories */}
        <div className="space-y-12">
          {toolCategories.map((category, categoryIndex) => (
            <section key={category.id} className="relative">
              {/* Section number - blueprint style */}
              <div className="absolute -left-4 top-0 text-cyan-500/20 font-mono text-6xl font-bold select-none hidden lg:block">
                {String(categoryIndex + 1).padStart(2, '0')}
              </div>

              {/* Category Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  {category.icon}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {category.name}
                  </h2>
                  <p className="text-cyan-100/50 text-sm">{category.description}</p>
                </div>
              </div>

              {/* Tools Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.tools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* CTA Section */}
        <section className="mt-20 text-center">
          <div className="blueprint-card rounded-3xl p-8 sm:p-12">
            {/* Technical corners */}
            <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-cyan-500/40" />
            <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-cyan-500/40" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-cyan-500/40" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-cyan-500/40" />

            <DocumentTextIcon className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Want to Contribute?
            </h2>
            <p className="text-cyan-100/60 mb-6 max-w-lg mx-auto">
              We love collaboration. Check out our repos, submit issues, or reach out if you want to work together.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://github.com/whimco"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cyan-500 text-white font-semibold hover:bg-cyan-400 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-cyan-500/30"
              >
                <CodeBracketIcon className="w-5 h-5" />
                View on GitHub
              </a>
              <Link
                href="/experiences"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 text-white font-semibold hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all border border-cyan-500/30"
              >
                See Our Games
                <ArrowTopRightOnSquareIcon className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const isAvailable = tool.status === "available";
  const isComingSoon = tool.status === "coming-soon";
  const isBeta = tool.status === "beta";

  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (isAvailable && tool.url) {
      return (
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block"
        >
          {children}
        </a>
      );
    }
    return <div className="group relative">{children}</div>;
  };

  return (
    <CardWrapper>
      <div
        className={`relative h-full rounded-2xl overflow-hidden transition-all duration-300 ${
          isAvailable
            ? "blueprint-card-interactive hover:scale-[1.02] hover:shadow-cyan-500/20 hover:shadow-xl cursor-pointer"
            : "blueprint-card opacity-60"
        }`}
      >
        {/* Blueprint corner marks */}
        <div className="absolute top-2 left-2 w-3 h-3 border-l border-t border-cyan-500/40" />
        <div className="absolute top-2 right-2 w-3 h-3 border-r border-t border-cyan-500/40" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-l border-b border-cyan-500/40" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-r border-b border-cyan-500/40" />

        {/* Status Badge */}
        {(isComingSoon || isBeta) && (
          <div className="absolute top-4 right-4 z-10">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                isComingSoon
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
              }`}
            >
              {isComingSoon ? "Coming Soon" : "Beta"}
            </span>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          <h3 className={`font-bold text-lg mb-2 transition-colors ${
            isAvailable ? "text-white group-hover:text-cyan-300" : "text-white/70"
          }`}>
            {tool.name}
          </h3>
          <p className="text-cyan-100/50 text-sm mb-4 line-clamp-2">
            {tool.description}
          </p>

          {/* Tags */}
          {tool.tags && tool.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tool.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 rounded-md bg-cyan-500/10 text-cyan-400/70 text-xs font-mono border border-cyan-500/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Action */}
          {isAvailable && tool.url && (
            <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium">
              <span>View Resource</span>
              <ArrowTopRightOnSquareIcon className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
          )}
        </div>
      </div>
    </CardWrapper>
  );
}
