"use client";

import React from "react";

const colorMap = {
  cyan: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    glow: "shadow-cyan-500/20",
    border: "border-cyan-500/20",
  },
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    glow: "shadow-blue-500/20",
    border: "border-blue-500/20",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    glow: "shadow-purple-500/20",
    border: "border-purple-500/20",
  },
  green: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/20",
    border: "border-emerald-500/20",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    glow: "shadow-amber-500/20",
    border: "border-amber-500/20",
  },
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = "cyan",
  trend,
  trendUp,
}) {
  const c = colorMap[color] || colorMap.cyan;

  return (
    <div className="relative group">
      <div
        className={`bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.1] transition-all duration-500 hover:shadow-lg ${c.glow}`}
      >
        {/* Glow */}
        <div
          className={`absolute top-0 right-0 w-24 h-24 ${c.bg} blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div
              className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center`}
            >
              {Icon && <Icon size={22} className={c.text} />}
            </div>
            {trend && (
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  trendUp
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-slate-500/10 text-slate-400"
                }`}
              >
                {trend}
              </span>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-3xl font-black text-white tracking-tight">
              {value}
            </p>
            <p className="text-sm text-slate-400 font-medium">{title}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
