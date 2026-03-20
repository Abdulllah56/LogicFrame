"use client";

import React from "react";
import Link from "next/link";
import { FileText, DollarSign, Calendar, MoreVertical } from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function ProposalCard({ proposal }) {
  const {
    id,
    title,
    client_name,
    client_email,
    amount,
    currency = "USD",
    status,
    created_at,
    sent_at,
  } = proposal;

  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount || 0);

  const formattedDate = created_at
    ? new Date(created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <div className="group relative bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.12] transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5">
      {/* Hover glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <FileText size={18} className="text-cyan-400" />
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

        {/* Details */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <DollarSign size={14} className="text-emerald-400" />
            <span className="font-semibold text-white">{formattedAmount}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar size={14} />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
          <span className="text-[11px] text-slate-500">
            {sent_at ? `Sent ${new Date(sent_at).toLocaleDateString()}` : "Not sent yet"}
          </span>
          <Link
            href={`/portflow/proposals/${id || "new"}`}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors no-underline"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
}
