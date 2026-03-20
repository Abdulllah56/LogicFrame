"use client";

import React from "react";
import { User, Mail, Building, FolderKanban } from "lucide-react";

export default function ClientCard({ client, onClick }) {
  const {
    name,
    email,
    company,
    project_count = 0,
    total_revenue = 0,
    avatar_url,
  } = client;

  const formattedRevenue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(total_revenue);

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div
      onClick={onClick}
      className="group relative bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.12] transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5 cursor-pointer"
    >
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        {/* Avatar + Name */}
        <div className="flex items-center gap-4 mb-4">
          {avatar_url ? (
            <img
              src={avatar_url}
              alt={name}
              className="w-12 h-12 rounded-xl object-cover border border-white/10"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-white font-bold text-sm">
              {initials}
            </div>
          )}
          <div>
            <h3 className="text-white font-bold text-sm">{name}</h3>
            {company && (
              <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                <Building size={12} />
                {company}
              </p>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
          <Mail size={13} />
          <span>{email}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 pt-3 border-t border-white/[0.05]">
          <div className="flex items-center gap-1.5 text-xs">
            <FolderKanban size={13} className="text-blue-400" />
            <span className="text-slate-400">
              <span className="text-white font-semibold">{project_count}</span>{" "}
              projects
            </span>
          </div>
          <div className="text-xs text-slate-400">
            <span className="text-emerald-400 font-semibold">
              {formattedRevenue}
            </span>{" "}
            revenue
          </div>
        </div>
      </div>
    </div>
  );
}
