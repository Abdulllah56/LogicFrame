"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Sparkles,
  Share2,
  Copy,
  Loader2,
  Check,
} from "lucide-react";
import ProposalCard from "../components/ProposalCard";

const statusFilters = [
  "all",
  "draft",
  "sent",
  "viewed",
  "accepted",
  "declined",
];

export default function ProposalsPage() {
  const [proposals, setProposals] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadProposals();
  }, []);

  async function loadProposals() {
    try {
      const res = await fetch("/api/portflow/proposals");
      if (res.ok) {
        const { proposals: p } = await res.json();
        setProposals(p || []);
      }
    } catch (err) {
      console.log("Failed to load proposals");
    } finally {
      setLoading(false);
    }
  }

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleShareLink = async (proposal) => {
    setSendingId(proposal.id);
    try {
      const res = await fetch(`/api/portflow/proposals/${proposal.id}/send`, {
        method: "POST",
      });
      if (res.ok) {
        const { proposalUrl } = await res.json();
        await navigator.clipboard.writeText(proposalUrl);
        showToast("Link copied to clipboard! Valid for 14 days.");
        // Update local state
        setProposals((prev) =>
          prev.map((p) =>
            p.id === proposal.id
              ? { ...p, status: "sent", sent_at: new Date().toISOString() }
              : p
          )
        );
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to send");
      }
    } catch (err) {
      showToast("Failed to share proposal");
    } finally {
      setSendingId(null);
    }
  };

  const handleCopyLink = async (proposal) => {
    const baseUrl =
      window.location.origin || "http://localhost:5000";
    const url = `${baseUrl}/portal/proposals/${proposal.magic_token}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(proposal.id);
    showToast("Link copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = proposals.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.client_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === "all" || p.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/90 text-white text-sm font-bold shadow-2xl animate-in slide-in-from-right">
          <Check size={16} />
          {toast}
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <FileText size={28} className="text-cyan-400" />
            Proposals
          </h1>
          <p className="text-slate-400 mt-1">
            {proposals.length} total ·{" "}
            {proposals.filter((p) => p.status === "draft").length} drafts
          </p>
        </div>
        <Link
          href="/portflow/proposals/new"
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 no-underline"
        >
          <Sparkles size={16} />
          AI Proposal
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search proposals..."
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all"
          />
        </div>
        <div className="flex gap-1.5 bg-white/[0.02] rounded-xl p-1 border border-white/[0.05]">
          {statusFilters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                activeFilter === f
                  ? "bg-cyan-400 text-[#030712] shadow-lg shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="text-cyan-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={48} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg font-semibold">
            No proposals found
          </p>
          <p className="text-slate-500 text-sm mt-1">
            Try adjusting your search or filter
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="relative group">
              <ProposalCard proposal={p} />
              {/* Share / Copy Link buttons */}
              <div className="absolute top-4 right-14 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                {p.status === "draft" && (
                  <button
                    onClick={() => handleShareLink(p)}
                    disabled={sendingId === p.id}
                    title="Send & copy share link"
                    className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-all"
                  >
                    {sendingId === p.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Share2 size={14} />
                    )}
                  </button>
                )}
                {(p.status === "sent" ||
                  p.status === "viewed") &&
                  p.magic_token && (
                    <button
                      onClick={() => handleCopyLink(p)}
                      title="Copy share link"
                      className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all"
                    >
                      {copiedId === p.id ? (
                        <Check size={14} />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
