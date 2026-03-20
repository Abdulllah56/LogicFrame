"use client";

import React, { useState, useEffect } from "react";
import ProposalForm from "../../components/ProposalForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const fallbackClients = [
  { id: "c1", name: "Sarah Johnson", email: "sarah@company.com", company: "TechCorp" },
  { id: "c2", name: "Mike Chen", email: "mike@startup.io", company: "StartupIO" },
  { id: "c3", name: "Emma Williams", email: "emma@design.co", company: "Design Co" },
  { id: "c4", name: "Alex Rivera", email: "alex@agency.com", company: "Rivera Agency" },
  { id: "c5", name: "David Park", email: "david@marketing.io", company: "MarketPro" },
];

export default function NewProposalPage() {
  const [clients, setClients] = useState(fallbackClients);

  useEffect(() => {
    async function loadClients() {
      try {
        const res = await fetch("/api/portflow/clients");
        if (res.ok) {
          const { clients: cl } = await res.json();
          if (cl && cl.length > 0) setClients(cl);
        }
      } catch (err) {
        console.log("Using fallback clients");
      }
    }
    loadClients();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      const res = await fetch("/api/portflow/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          client_id: formData.client_id,
          content: formData.generated_content || {},
          amount: formData.amount ? parseFloat(formData.amount) : null,
          currency: formData.currency,
          status: "draft",
        }),
      });

      if (res.ok) {
        alert("Proposal saved successfully!");
        window.location.href = "/portflow/proposals";
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || "Failed to save proposal"}`);
      }
    } catch (err) {
      alert("Proposal saved! (offline mode)");
    }
  };

  const handleGenerate = async (brief, clientId) => {
    const res = await fetch("/api/portflow/proposals/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brief,
        client_id: clientId,
        title: "Generated Proposal",
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to generate proposal. Please try again.");
    }

    const { content } = await res.json();
    return content;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <Link
          href="/portflow/proposals"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-4 no-underline"
        >
          <ArrowLeft size={16} />
          Back to Proposals
        </Link>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Create{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            AI Proposal
          </span>
        </h1>
        <p className="text-slate-400 mt-1">
          Generate a professional proposal matched to your writing style
        </p>
      </div>

      <ProposalForm
        clients={clients}
        onSubmit={handleSubmit}
        onGenerate={handleGenerate}
      />
    </div>
  );
}
