"use client";

import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  User,
  FileText,
  Loader2,
  X,
} from "lucide-react";

export default function ProposalView({ proposal, onAccept, onDecline }) {
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [declineLoading, setDeclineLoading] = useState(false);
  const [acceptSuccess, setAcceptSuccess] = useState(false);

  // Accept form state
  const [fullName, setFullName] = useState("");
  const [signatureName, setSignatureName] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Decline form state
  const [declineFeedback, setDeclineFeedback] = useState("");

  if (!proposal) return null;

  const {
    title,
    content,
    amount,
    currency = "USD",
    freelancer_name,
    client_name,
    created_at,
    expires_at,
    status,
  } = proposal;

  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount || 0);

  const formattedDate = created_at
    ? new Date(created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const expiresDate = expires_at
    ? new Date(expires_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const isActionable = status === "sent" || status === "viewed";

  const canAccept =
    fullName.trim().length > 0 &&
    signatureName.trim().length > 0 &&
    fullName.trim().toLowerCase() === signatureName.trim().toLowerCase() &&
    agreeTerms;

  const handleAcceptSubmit = async () => {
    setAcceptLoading(true);
    const result = await onAccept({
      clientName: fullName,
      selectedTier: null,
      selectedPrice: amount,
    });
    setAcceptLoading(false);

    if (result?.success) {
      setAcceptSuccess(true);
      setShowAcceptModal(false);
    }
  };

  const handleDeclineSubmit = async () => {
    setDeclineLoading(true);
    await onDecline(declineFeedback);
    setDeclineLoading(false);
    setShowDeclineModal(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Proposal Header */}
      <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] rounded-2xl p-8 mb-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
            <FileText size={24} className="text-cyan-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-white mb-1">{title}</h1>
            <p className="text-slate-400 text-sm">
              Prepared for{" "}
              <span className="text-white font-semibold">{client_name}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/[0.03] rounded-xl p-3">
            <DollarSign size={16} className="text-emerald-400 mb-1" />
            <p className="text-xs text-slate-400">Amount</p>
            <p className="text-lg font-bold text-white">{formattedAmount}</p>
          </div>
          <div className="bg-white/[0.03] rounded-xl p-3">
            <Calendar size={16} className="text-blue-400 mb-1" />
            <p className="text-xs text-slate-400">Date</p>
            <p className="text-sm font-semibold text-white">{formattedDate}</p>
          </div>
          <div className="bg-white/[0.03] rounded-xl p-3">
            <User size={16} className="text-purple-400 mb-1" />
            <p className="text-xs text-slate-400">From</p>
            <p className="text-sm font-semibold text-white">
              {freelancer_name || "—"}
            </p>
          </div>
          {expiresDate && (
            <div className="bg-white/[0.03] rounded-xl p-3">
              <Calendar size={16} className="text-amber-400 mb-1" />
              <p className="text-xs text-slate-400">Expires</p>
              <p className="text-sm font-semibold text-white">{expiresDate}</p>
            </div>
          )}
        </div>
      </div>

      {/* Proposal Content Sections */}
      {content &&
        typeof content === "object" &&
        Object.entries(content).map(([section, text]) => (
          <div
            key={section}
            className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.05] rounded-2xl p-6 mb-4"
          >
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-3">
              {section.replace(/_/g, " ")}
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
              {text}
            </p>
          </div>
        ))}

      {/* Action Buttons */}
      {isActionable && (
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={() => setShowAcceptModal(true)}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 text-sm"
          >
            <CheckCircle size={18} />
            Accept Proposal
          </button>
          <button
            onClick={() => setShowDeclineModal(true)}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-300 font-bold hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all duration-300 text-sm"
          >
            <XCircle size={18} />
            Decline
          </button>
        </div>
      )}

      {/* Accepted status */}
      {(status === "accepted" || acceptSuccess) && (
        <div className="mt-8 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center">
          <CheckCircle size={32} className="text-emerald-400 mx-auto mb-2" />
          <p className="text-emerald-400 font-bold">
            Proposal accepted! Redirecting to your project portal...
          </p>
        </div>
      )}

      {status === "declined" && (
        <div className="mt-8 bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
          <XCircle size={32} className="text-red-400 mx-auto mb-2" />
          <p className="text-red-400 font-bold">
            This proposal has been declined
          </p>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* ACCEPT MODAL */}
      {/* ═══════════════════════════════════════════ */}
      {showAcceptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowAcceptModal(false)}
          />
          <div className="relative w-full max-w-md bg-[#0a0f1c] border border-white/[0.08] rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Accept Proposal</h3>
              <button
                onClick={() => setShowAcceptModal(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <p className="text-sm text-emerald-300 font-semibold">
                  You are accepting:
                </p>
                <p className="text-white font-bold mt-1">{title}</p>
                {amount && (
                  <p className="text-emerald-400 font-bold text-lg mt-1">
                    {formattedAmount}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Type your full name to sign
                </label>
                <input
                  type="text"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  placeholder="Re-type your full name as signature"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all"
                />
                {signatureName.length > 0 &&
                  fullName.length > 0 &&
                  fullName.trim().toLowerCase() !==
                    signatureName.trim().toLowerCase() && (
                    <p className="text-red-400 text-xs mt-1">
                      Names must match exactly
                    </p>
                  )}
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/[0.05] accent-emerald-500"
                />
                <span className="text-sm text-slate-300">
                  I agree to the terms outlined in this proposal
                </span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAcceptModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-300 text-sm font-bold hover:bg-white/[0.08] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAcceptSubmit}
                  disabled={!canAccept || acceptLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-bold shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {acceptLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle size={16} />
                  )}
                  Confirm & Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* DECLINE MODAL */}
      {/* ═══════════════════════════════════════════ */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowDeclineModal(false)}
          />
          <div className="relative w-full max-w-md bg-[#0a0f1c] border border-white/[0.08] rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">
                Decline Proposal
              </h3>
              <button
                onClick={() => setShowDeclineModal(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  What would you like to change? (optional)
                </label>
                <textarea
                  value={declineFeedback}
                  onChange={(e) => setDeclineFeedback(e.target.value)}
                  placeholder="Share your feedback or what you'd like to see differently..."
                  rows={4}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowDeclineModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-300 text-sm font-bold hover:bg-white/[0.08] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeclineSubmit}
                  disabled={declineLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-bold hover:bg-red-500/30 transition-all"
                >
                  {declineLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <XCircle size={16} />
                  )}
                  Send Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
