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
    <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl rounded-2xl">
      <div className="flex-auto p-4">
        <div className="flex flex-row -mx-3">
          <div className="flex-none w-2/3 max-w-full px-3">
            <p className="mb-0 font-sans text-xs font-semibold leading-normal uppercase text-slate-400">
              {title}
            </p>
            <h5 className="mb-1 font-bold text-slate-700 text-xl">
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
          <div className="px-3 text-right basis-1/3">
            <div
              className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-tl ${gradients[color]} text-white shadow-lg`}
            >
              {icon}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
