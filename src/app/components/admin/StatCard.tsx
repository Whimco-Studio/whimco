"use client";

import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from "@heroicons/react/24/solid";

type ColorVariant = "blue" | "green" | "orange" | "red" | "purple" | "cyan";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  color?: ColorVariant;
  subtitle?: string;
}

const gradients: Record<ColorVariant, string> = {
  blue: "from-blue-500 to-violet-500",
  green: "from-emerald-500 to-teal-500",
  orange: "from-orange-500 to-yellow-500",
  red: "from-red-500 to-pink-500",
  purple: "from-purple-500 to-indigo-500",
  cyan: "from-cyan-500 to-blue-500",
};

const iconBgColors: Record<ColorVariant, string> = {
  blue: "from-blue-500/20 to-violet-500/20",
  green: "from-emerald-500/20 to-teal-500/20",
  orange: "from-orange-500/20 to-yellow-500/20",
  red: "from-red-500/20 to-pink-500/20",
  purple: "from-purple-500/20 to-indigo-500/20",
  cyan: "from-cyan-500/20 to-blue-500/20",
};

const iconTextColors: Record<ColorVariant, string> = {
  blue: "text-blue-600",
  green: "text-emerald-600",
  orange: "text-orange-600",
  red: "text-red-600",
  purple: "text-purple-600",
  cyan: "text-cyan-600",
};

export default function StatCard({
  title,
  value,
  change,
  icon,
  color = "blue",
  subtitle,
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="relative flex flex-col min-w-0 break-words backdrop-blur-xl bg-white/70 border border-white/20 shadow-xl rounded-2xl overflow-hidden group hover:bg-white/80 transition-all">
      {/* Subtle gradient accent on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${gradients[color]} mix-blend-soft-light`} />

      <div className="relative flex-auto p-5">
        <div className="flex flex-row -mx-3">
          <div className="flex-none w-2/3 max-w-full px-3">
            <p className="mb-0 font-sans text-xs font-semibold leading-normal uppercase text-slate-500 tracking-wide">
              {title}
            </p>
            <h5 className="mb-1 font-bold text-slate-800 text-2xl">
              {typeof value === "number" ? value.toLocaleString() : value}
            </h5>
            {change !== undefined && (
              <p className="mb-0 text-slate-500 text-sm flex items-center gap-1">
                {isPositive ? (
                  <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500" />
                ) : (
                  <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                )}
                <span
                  className={`font-semibold ${
                    isPositive ? "text-emerald-500" : "text-red-500"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {change}%
                </span>
                <span className="text-slate-400">{subtitle || "vs last period"}</span>
              </p>
            )}
            {!change && subtitle && (
              <p className="mb-0 text-xs text-slate-400">{subtitle}</p>
            )}
          </div>
          <div className="px-3 text-right basis-1/3 flex items-center justify-end">
            <div
              className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${iconBgColors[color]} ${iconTextColors[color]} shadow-lg backdrop-blur-sm ring-1 ring-white/30`}
            >
              {icon}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
