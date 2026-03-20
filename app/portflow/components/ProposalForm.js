"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Send,
  FileText,
  User,
  CheckCircle,
} from "lucide-react";

const steps = [
  { id: 1, label: "Client & Brief", icon: User },
  { id: 2, label: "AI Generate", icon: Sparkles },
  { id: 3, label: "Review & Send", icon: Send },
];

export default function ProposalForm({ clients = [], onSubmit, onGenerate }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [formData, setFormData] = useState({
    client_id: "",
    title: "",
    brief: "",
    amount: "",
    currency: "USD",
    generated_content: null,
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerateError(null);
    try {
      if (onGenerate) {
        const content = await onGenerate(formData.brief, formData.client_id);
        updateField("generated_content", content);
      }
      setCurrentStep(3);
    } catch (err) {
      console.error("Generation failed:", err);
      setGenerateError(err.message || "Failed to generate proposal. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const inputClass =
    "w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all";

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const StepIcon = step.icon;

          return (
            <React.Fragment key={step.id}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? "bg-cyan-400 text-[#030712] shadow-lg shadow-cyan-500/30"
                      : isCompleted
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-white/[0.05] text-slate-500"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle size={18} />
                  ) : (
                    <StepIcon size={18} />
                  )}
                </div>
                <span
                  className={`text-xs font-bold hidden sm:inline ${
                    isActive
                      ? "text-white"
                      : isCompleted
                      ? "text-emerald-400"
                      : "text-slate-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="w-12 h-px bg-white/[0.08] mx-1" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step 1: Client & Brief */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <User size={20} className="text-cyan-400" />
              Client & Project Details
            </h3>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Select Client
                </label>
                <select
                  value={formData.client_id}
                  onChange={(e) => updateField("client_id", e.target.value)}
                  className={inputClass}
                >
                  <option value="">Choose a client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.company || c.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Proposal Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="e.g. Website Redesign Proposal"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Project Brief
                </label>
                <textarea
                  value={formData.brief}
                  onChange={(e) => updateField("brief", e.target.value)}
                  placeholder="Describe the project scope, deliverables, timeline expectations..."
                  rows={6}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => updateField("amount", e.target.value)}
                    placeholder="5000"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => updateField("currency", e.target.value)}
                    className={inputClass}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="PKR">PKR</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setCurrentStep(2)}
              disabled={!formData.title || !formData.brief}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next: Generate
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: AI Generate */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <Sparkles size={28} className="text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              AI Proposal Generator
            </h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
              Our AI will analyze your brief and generate a professional proposal
              matched to your writing voice. Your voice samples will be used for
              tone matching.
            </p>

            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mb-6 text-left">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Brief Preview
              </p>
              <p className="text-sm text-slate-300 line-clamp-4">
                {formData.brief}
              </p>
            </div>

            {generateError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4 text-left">
                <p className="text-sm text-red-400 font-semibold mb-1">Generation Failed</p>
                <p className="text-xs text-red-300/80">{generateError}</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating with AI...
                </>
              ) : generateError ? (
                <>
                  <Sparkles size={16} />
                  Retry Generation
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generate Proposal
                </>
              )}
            </button>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/[0.03] transition-all"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Send */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FileText size={20} className="text-cyan-400" />
              Review Your Proposal
            </h3>

            {formData.generated_content ? (
              <div className="space-y-4">
                {Object.entries(formData.generated_content).map(
                  ([section, text]) => (
                    <div key={section}>
                      <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-1">
                        {section.replace(/_/g, " ")}
                      </h4>
                      <textarea
                        value={text}
                        onChange={(e) =>
                          updateField("generated_content", {
                            ...formData.generated_content,
                            [section]: e.target.value,
                          })
                        }
                        rows={4}
                        className={`${inputClass} resize-none`}
                      />
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">
                No content generated yet. Go back to generate.
              </p>
            )}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/[0.03] transition-all"
            >
              <ArrowLeft size={16} />
              Re-generate
            </button>
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-sm font-bold hover:bg-white/[0.08] transition-all"
              >
                <FileText size={16} />
                Save Draft
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300"
              >
                <Send size={16} />
                Send to Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
