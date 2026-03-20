"use client";

import React, { useState, useEffect, use } from "react";
import { createClient } from "@/utils/supabase/client";
import PortalHeader from "../../components/PortalHeader";
import ProposalView from "../../components/ProposalView";
import { AlertTriangle, Loader2, CheckCircle, ArrowRight } from "lucide-react";

export default function ClientProposalPage({ params }) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState(null);
  const [expired, setExpired] = useState(false);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    async function loadProposal() {
      try {
        const supabase = createClient();

        const { data, error } = await supabase
          .from("portflow_proposals")
          .select(`
            *,
            portflow_projects (
              title,
              description,
              portal_token
            )
          `)
          .eq("magic_token", token)
          .single();

        if (error || !data) {
          setInvalid(true);
          setLoading(false);
          return;
        }

        // Check expiration
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          setExpired(true);
          setLoading(false);
          return;
        }

        // Fetch freelancer info
        const { data: profile } = await supabase
          .from("portflow_clients")
          .select("name")
          .eq("id", data.client_id)
          .single();

        const proposalData = {
          ...data,
          client_name: profile?.name || "Client",
        };

        setProposal(proposalData);

        // Update status to viewed if currently sent
        if (data.status === "sent") {
          await supabase
            .from("portflow_proposals")
            .update({
              status: "viewed",
              viewed_at: new Date().toISOString(),
            })
            .eq("magic_token", token);
        }

        // Store client session
        try {
          localStorage.setItem(
            "portflow_client_session",
            JSON.stringify({
              token,
              type: "proposal",
              proposal_id: data.id,
              client_name: proposalData.client_name,
              accessed_at: new Date().toISOString(),
            })
          );
        } catch (e) {
          // localStorage not available
        }
      } catch (err) {
        console.error("Error loading proposal:", err);
        setInvalid(true);
      } finally {
        setLoading(false);
      }
    }

    loadProposal();
  }, [token]);

  const handleAccept = async (acceptData) => {
    try {
      const res = await fetch(
        `/api/portflow/proposals/${proposal.id}/accept`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(acceptData),
        }
      );

      if (res.ok) {
        const { portalToken } = await res.json();
        setProposal((prev) => ({ ...prev, status: "accepted" }));

        // Redirect to project portal after a short delay
        if (portalToken) {
          setTimeout(() => {
            window.location.href = `/portal/${portalToken}`;
          }, 2000);
        }

        return { success: true, portalToken };
      } else {
        const err = await res.json();
        return { success: false, error: err.error };
      }
    } catch (err) {
      return { success: false, error: "Failed to accept proposal" };
    }
  };

  const handleDecline = async (feedback) => {
    try {
      const res = await fetch(
        `/api/portflow/proposals/${proposal.id}/decline`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feedback }),
        }
      );

      if (res.ok) {
        setProposal((prev) => ({ ...prev, status: "declined" }));
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      return { success: false };
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] text-white">
        <PortalHeader subtitle="Proposal" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2
              size={32}
              className="text-cyan-400 animate-spin mx-auto"
            />
            <p className="text-slate-400 text-sm">Loading proposal...</p>
          </div>
        </div>
      </div>
    );
  }

  // Invalid token
  if (invalid) {
    return (
      <div className="min-h-screen bg-[#030712] text-white">
        <PortalHeader subtitle="Proposal" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4 max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-red-500/15 flex items-center justify-center mx-auto">
              <AlertTriangle size={28} className="text-red-400" />
            </div>
            <h2 className="text-2xl font-black text-white">
              Invalid Link
            </h2>
            <p className="text-slate-400 text-sm">
              This proposal link is invalid. Please contact the sender for a
              new link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Expired
  if (expired) {
    return (
      <div className="min-h-screen bg-[#030712] text-white">
        <PortalHeader subtitle="Proposal" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4 max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 flex items-center justify-center mx-auto">
              <AlertTriangle size={28} className="text-amber-400" />
            </div>
            <h2 className="text-2xl font-black text-white">Link Expired</h2>
            <p className="text-slate-400 text-sm">
              This proposal link has expired. Please contact the sender for a
              new link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Already accepted — show redirect
  if (proposal?.status === "accepted" && proposal?.portflow_projects?.portal_token) {
    return (
      <div className="min-h-screen bg-[#030712] text-white">
        <PortalHeader subtitle="Proposal" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4 max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto">
              <CheckCircle size={28} className="text-emerald-400" />
            </div>
            <h2 className="text-2xl font-black text-white">
              Proposal Accepted
            </h2>
            <p className="text-slate-400 text-sm">
              You have already accepted this proposal.
            </p>
            <a
              href={`/portal/${proposal.portflow_projects.portal_token}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold shadow-lg no-underline hover:shadow-cyan-500/40 transition-all"
            >
              View Your Project Portal
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <PortalHeader subtitle="Proposal" />
      <ProposalView
        proposal={proposal}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />
    </div>
  );
}
