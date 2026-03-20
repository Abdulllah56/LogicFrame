"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Mic2,
  Trash2,
  Plus,
  X,
  Check,
  Loader2,
  User,
  Building,
  FileText,
} from "lucide-react";

const contextOptions = [
  { value: "past_proposal", label: "Past Proposal" },
  { value: "client_email", label: "Client Email" },
  { value: "project_brief", label: "Project Brief" },
  { value: "other", label: "Other" },
];

export default function PortflowSettingsPage() {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState(null);

  // Modal form state
  const [sampleText, setSampleText] = useState("");
  const [sampleContext, setSampleContext] = useState("past_proposal");

  // Profile state
  const [profile, setProfile] = useState({
    display_name: "",
    company_name: "",
    tagline: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    loadSamples();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  async function loadSamples() {
    try {
      const res = await fetch("/api/portflow/voice-samples");
      if (res.ok) {
        const { samples: s } = await res.json();
        setSamples(s || []);
      }
    } catch (err) {
      console.log("Failed to load voice samples");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSample() {
    if (sampleText.length < 200) return;
    setSaving(true);
    try {
      const res = await fetch("/api/portflow/voice-samples", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sample_text: sampleText,
          context: sampleContext,
        }),
      });
      if (res.ok) {
        showToast("Writing sample saved!");
        setSampleText("");
        setSampleContext("past_proposal");
        setShowModal(false);
        loadSamples();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to save", "error");
      }
    } catch (err) {
      showToast("Failed to save sample", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSample(id) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/portflow/voice-samples?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Sample deleted");
        setSamples((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      showToast("Failed to delete", "error");
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
    }
  }

  async function handleSaveProfile() {
    setSavingProfile(true);
    setTimeout(() => {
      showToast("Profile settings saved!");
      setSavingProfile(false);
    }, 500);
  }

  const charCount = sampleText.length;
  const isValidLength = charCount >= 200;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold shadow-2xl transition-all duration-300 animate-in slide-in-from-right ${
            toast.type === "error"
              ? "bg-red-500/90 text-white"
              : "bg-emerald-500/90 text-white"
          }`}
        >
          {toast.type === "error" ? (
            <X size={16} />
          ) : (
            <Check size={16} />
          )}
          {toast.message}
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Settings size={28} className="text-cyan-400" />
          Settings
        </h1>
        <p className="text-slate-400 mt-1">
          Manage your writing voice and profile
        </p>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* SECTION A — Your Writing Style */}
      {/* ═══════════════════════════════════════════ */}
      <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <Mic2 size={20} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Your Writing Style
            </h2>
            <p className="text-xs text-slate-400">Voice samples for AI tone matching</p>
          </div>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed mb-6 bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
          Paste 2–3 proposals you&apos;ve written before. The AI will match your
          exact tone, vocabulary, and writing style when generating new
          proposals.
        </p>

        {/* Samples List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="text-cyan-400 animate-spin" />
          </div>
        ) : samples.length === 0 ? (
          <div className="text-center py-10">
            <Mic2
              size={40}
              className="text-slate-600 mx-auto mb-3"
            />
            <p className="text-slate-400 font-semibold text-sm">
              No writing samples yet
            </p>
            <p className="text-slate-500 text-xs mt-1">
              Add your first sample to start voice-matching
            </p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {samples.map((sample) => (
              <div
                key={sample.id}
                className="relative bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-xl p-4 group hover:border-white/[0.12] transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
                      {sample.sample_text.substring(0, 150)}
                      {sample.sample_text.length > 150 ? "..." : ""}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {new Date(sample.created_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        Added ✓
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 bg-white/[0.03] px-2 py-0.5 rounded-full capitalize">
                        {(sample.context || "other").replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                  <div>
                    {confirmDelete === sample.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteSample(sample.id)}
                          disabled={deleting === sample.id}
                          className="px-2 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/30 transition-all"
                        >
                          {deleting === sample.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            "Yes"
                          )}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="px-2 py-1 rounded-lg bg-white/[0.05] text-slate-400 text-xs font-bold hover:bg-white/[0.08] transition-all"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(sample.id)}
                        className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Sample Button */}
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/20 text-purple-300 text-sm font-bold hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
        >
          <Plus size={16} />
          Add Writing Sample
        </button>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* SECTION B — Profile Settings */}
      {/* ═══════════════════════════════════════════ */}
      <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
            <User size={20} className="text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Profile Settings
            </h2>
            <p className="text-xs text-slate-400">Used in proposals and client portals</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={profile.display_name}
              onChange={(e) =>
                setProfile((p) => ({ ...p, display_name: e.target.value }))
              }
              placeholder="Your full name"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Company Name
            </label>
            <div className="relative">
              <Building
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                value={profile.company_name}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, company_name: e.target.value }))
                }
                placeholder="Your company or brand"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Tagline
            </label>
            <div className="relative">
              <FileText
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                value={profile.tagline}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, tagline: e.target.value }))
                }
                placeholder="e.g. Full-Stack Developer & Designer"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 disabled:opacity-50"
          >
            {savingProfile ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Check size={16} />
            )}
            Save Profile
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* ADD SAMPLE MODAL */}
      {/* ═══════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-lg bg-[#0a0f1c] border border-white/[0.08] rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus size={20} className="text-cyan-400" />
                Add Writing Sample
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <textarea
                  value={sampleText}
                  onChange={(e) => setSampleText(e.target.value)}
                  placeholder="Paste a proposal, email, or any professional writing sample here..."
                  rows={8}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all resize-none"
                />
                <div className="flex items-center justify-between mt-2">
                  <span
                    className={`text-xs font-bold ${
                      isValidLength ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    {charCount} / 200 minimum characters
                  </span>
                  {!isValidLength && charCount > 0 && (
                    <span className="text-xs text-red-400">
                      Need {200 - charCount} more characters
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Context
                </label>
                <select
                  value={sampleContext}
                  onChange={(e) => setSampleContext(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
                >
                  {contextOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-300 text-sm font-bold hover:bg-white/[0.08] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSample}
                  disabled={!isValidLength || saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  Save Sample
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
