"use client";

import React, { useState, useEffect, use } from "react";
import { createClient } from "@/utils/supabase/client";
import PortalHeader from "../components/PortalHeader";
import ProjectPortalView from "../components/ProjectPortalView";
import { AlertTriangle, Loader2 } from "lucide-react";

export default function ClientPortalPage({ params }) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [messages, setMessages] = useState([]);
  const [files, setFiles] = useState([]);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    async function loadProject() {
      try {
        const supabase = createClient();

        // Fetch project by portal_token
        const { data: proj, error } = await supabase
          .from("portflow_projects")
          .select(`
            *,
            client:portflow_clients(id, name, email, company)
          `)
          .eq("portal_token", token)
          .single();

        if (error || !proj) {
          setInvalid(true);
          setLoading(false);
          return;
        }

        setProject({
          ...proj,
          client_name: proj.client?.name || "Client",
        });

        // Fetch milestones
        const { data: ms } = await supabase
          .from("portflow_milestones")
          .select("*")
          .eq("project_id", proj.id)
          .order("sort_order", { ascending: true });
        setMilestones(ms || []);

        // Fetch messages
        const { data: msgs } = await supabase
          .from("portflow_messages")
          .select("*")
          .eq("project_id", proj.id)
          .order("created_at", { ascending: true });
        setMessages(msgs || []);

        // Fetch files
        const { data: fs } = await supabase
          .from("portflow_files")
          .select("*")
          .eq("project_id", proj.id)
          .order("created_at", { ascending: false });
        setFiles(fs || []);

        // Store client session
        try {
          localStorage.setItem(
            "portflow_client_session",
            JSON.stringify({
              projectId: proj.id,
              portalToken: token,
              clientName: proj.client?.name || "Client",
              accessedAt: new Date().toISOString(),
            })
          );
        } catch (e) {
          // localStorage not available
        }
      } catch (err) {
        console.error("Error loading project:", err);
        setInvalid(true);
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [token]);

  const handleSendMessage = async (content) => {
    try {
      const session = JSON.parse(
        localStorage.getItem("portflow_client_session") || "{}"
      );
      const supabase = createClient();

      const { data, error } = await supabase
        .from("portflow_messages")
        .insert({
          project_id: project.id,
          sender_type: "client",
          sender_name: session.clientName || "Client",
          content,
        })
        .select()
        .single();

      if (!error && data) {
        setMessages((prev) => [...prev, data]);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] text-white">
        <PortalHeader subtitle="Project Portal" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2
              size={32}
              className="text-cyan-400 animate-spin mx-auto"
            />
            <p className="text-slate-400 text-sm">
              Loading project portal...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (invalid || !project) {
    return (
      <div className="min-h-screen bg-[#030712] text-white">
        <PortalHeader subtitle="Project Portal" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4 max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 flex items-center justify-center mx-auto">
              <AlertTriangle size={28} className="text-amber-400" />
            </div>
            <h2 className="text-2xl font-black text-white">
              Invalid Link
            </h2>
            <p className="text-slate-400 text-sm">
              This project portal link is no longer valid. Please contact the
              freelancer for a new link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <PortalHeader subtitle="Project Portal" />
      <ProjectPortalView
        project={project}
        milestones={milestones}
        messages={messages}
        files={files}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
