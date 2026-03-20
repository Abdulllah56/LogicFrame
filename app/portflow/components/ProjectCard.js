"use client";

import React from "react";
import Link from "next/link";
import { FolderKanban, Calendar, DollarSign } from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function ProjectCard({ project }) {
  const {
    id,
    title,
    client_name,
    status,
    budget,
    currency = "USD",
    deadline,
    milestones_total = 0,
    milestones_done = 0,
  } = project;

  const formattedBudget = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(budget || 0);

  const progress =
    milestones_total > 0
      ? Math.round((milestones_done / milestones_total) * 100)
      : 0;

  const deadlineStr = deadline
    ? new Date(deadline).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No deadline";

  return (
    <div className="group relative bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.12] transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
      <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <FolderKanban size={18} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm leading-tight">
                {title}
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">{client_name}</p>
            </div>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-400 font-medium">Progress</span>
            <span className="text-xs font-bold text-white">{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-md shadow-cyan-400/30 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {milestones_done}/{milestones_total} milestones
          </p>
        </div>

        {/* Details */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <DollarSign size={14} className="text-emerald-400" />
            <span className="font-semibold text-white">{formattedBudget}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar size={14} />
            <span>{deadlineStr}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-white/[0.05]">
          <Link
            href={`/portflow/projects/${id}`}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors no-underline"
          >
            View Project →
          </Link>
        </div>
      </div>
    </div>
  );
}
