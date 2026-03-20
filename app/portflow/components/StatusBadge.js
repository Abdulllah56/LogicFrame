"use client";

import React from "react";

const statusColors = {
  draft: "bg-slate-500/15 text-slate-300 border-slate-500/20",
  sent: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  viewed: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  accepted: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  declined: "bg-red-500/15 text-red-400 border-red-500/20",
  expired: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  active: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  on_hold: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/20",
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  in_progress: "bg-blue-500/15 text-blue-400 border-blue-500/20",
};

const statusLabels = {
  draft: "Draft",
  sent: "Sent",
  viewed: "Viewed",
  accepted: "Accepted",
  declined: "Declined",
  expired: "Expired",
  active: "Active",
  completed: "Completed",
  on_hold: "On Hold",
  cancelled: "Cancelled",
  pending: "Pending",
  in_progress: "In Progress",
};

export default function StatusBadge({ status }) {
  const colorClass = statusColors[status] || statusColors.draft;
  const label = statusLabels[status] || status;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${colorClass}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}
