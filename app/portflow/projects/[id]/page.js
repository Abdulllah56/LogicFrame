"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FolderKanban,
  CheckCircle,
  Clock,
  Calendar,
  DollarSign,
  MessageSquare,
  FileIcon,
  Send,
  ExternalLink,
  Copy,
} from "lucide-react";
import StatusBadge from "../../components/StatusBadge";

const dummyProject = {
  id: "p1",
  title: "SaaS Dashboard UI",
  description:
    "Complete redesign of the SaaS dashboard including analytics views, user management, and billing pages. Focus on performance and accessibility with a modern glassmorphism design system.",
  client_name: "Alex Rivera",
  client_email: "alex@agency.com",
  client_company: "Rivera Agency",
  status: "active",
  budget: 12000,
  currency: "USD",
  deadline: "2026-04-15T00:00:00Z",
  portal_token: "abc-123-xyz",
  created_at: "2026-02-01T00:00:00Z",
};

const dummyMilestones = [
  { id: "m1", title: "Discovery & Research", status: "completed", due_date: "2026-02-10T00:00:00Z", completed_at: "2026-02-09T00:00:00Z" },
  { id: "m2", title: "Wireframes & Design System", status: "completed", due_date: "2026-02-20T00:00:00Z", completed_at: "2026-02-19T00:00:00Z" },
  { id: "m3", title: "High-Fidelity Mockups", status: "completed", due_date: "2026-03-01T00:00:00Z", completed_at: "2026-03-02T00:00:00Z" },
  { id: "m4", title: "Frontend Development", status: "completed", due_date: "2026-03-15T00:00:00Z", completed_at: "2026-03-14T00:00:00Z" },
  { id: "m5", title: "API Integration", status: "in_progress", due_date: "2026-03-25T00:00:00Z" },
  { id: "m6", title: "Testing & Launch", status: "pending", due_date: "2026-04-15T00:00:00Z" },
];

const dummyMessages = [
  { id: "msg1", sender_type: "freelancer", sender_name: "You", content: "Hi Alex! Just finished the wireframes — take a look at the latest mockups in Figma.", created_at: "2026-03-10T10:00:00Z" },
  { id: "msg2", sender_type: "client", sender_name: "Alex Rivera", content: "These look great! I love the glassmorphism cards. Can we add a dark mode toggle?", created_at: "2026-03-10T14:30:00Z" },
  { id: "msg3", sender_type: "freelancer", sender_name: "You", content: "Absolutely! I've added dark mode support. It's now included in the design system.", created_at: "2026-03-11T09:00:00Z" },
];

const dummyFiles = [
  { id: "f1", name: "wireframes-v2.fig", size: 2400000, url: "#", mime_type: "application/fig", uploaded_by: "freelancer", created_at: "2026-02-20T00:00:00Z" },
  { id: "f2", name: "brand-guidelines.pdf", size: 1200000, url: "#", mime_type: "application/pdf", uploaded_by: "client", created_at: "2026-02-05T00:00:00Z" },
  { id: "f3", name: "mockups-final.fig", size: 5600000, url: "#", mime_type: "application/fig", uploaded_by: "freelancer", created_at: "2026-03-02T00:00:00Z" },
];

export default function ProjectDetailPage({ params }) {
  const resolvedParams = use(params);
  const [activeTab, setActiveTab] = useState("milestones");
  const [newMessage, setNewMessage] = useState("");

  const project = dummyProject;
  const completedMilestones = dummyMilestones.filter((m) => m.status === "completed").length;
  const progress = Math.round((completedMilestones / dummyMilestones.length) * 100);
  const formattedBudget = new Intl.NumberFormat("en-US", { style: "currency", currency: project.currency }).format(project.budget);

  const tabs = [
    { id: "milestones", label: "Milestones", icon: CheckCircle, count: dummyMilestones.length },
    { id: "messages", label: "Messages", icon: MessageSquare, count: dummyMessages.length },
    { id: "files", label: "Files", icon: FileIcon, count: dummyFiles.length },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Back */}
      <Link href="/portflow/projects" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors no-underline">
        <ArrowLeft size={16} />
        Back to Projects
      </Link>

      {/* Project Header */}
      <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] rounded-2xl p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
              <FolderKanban size={24} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{project.title}</h1>
              <p className="text-slate-400 text-sm mt-1">{project.client_name} · {project.client_company}</p>
            </div>
          </div>
          <StatusBadge status={project.status} />
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Progress</span>
            <span className="text-sm font-bold text-white">{progress}%</span>
          </div>
          <div className="h-2 w-full bg-white/[0.05] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-lg shadow-cyan-400/40 transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/[0.03] rounded-xl p-3">
            <DollarSign size={16} className="text-emerald-400 mb-1" />
            <p className="text-xs text-slate-400">Budget</p>
            <p className="text-lg font-bold text-white">{formattedBudget}</p>
          </div>
          <div className="bg-white/[0.03] rounded-xl p-3">
            <Calendar size={16} className="text-blue-400 mb-1" />
            <p className="text-xs text-slate-400">Deadline</p>
            <p className="text-sm font-semibold text-white">{new Date(project.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
          </div>
          <div className="bg-white/[0.03] rounded-xl p-3">
            <CheckCircle size={16} className="text-cyan-400 mb-1" />
            <p className="text-xs text-slate-400">Milestones</p>
            <p className="text-sm font-semibold text-white">{completedMilestones}/{dummyMilestones.length}</p>
          </div>
          <div className="bg-white/[0.03] rounded-xl p-3">
            <ExternalLink size={16} className="text-purple-400 mb-1" />
            <p className="text-xs text-slate-400">Client Portal</p>
            <button
              onClick={() => navigator.clipboard.writeText(`/portal/${project.portal_token}`)}
              className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              Copy Link <Copy size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/[0.02] rounded-xl p-1 border border-white/[0.05]">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex-1 justify-center ${activeTab === tab.id ? "bg-cyan-400 text-[#030712] shadow-lg shadow-cyan-500/20" : "text-slate-400 hover:text-white hover:bg-white/[0.03]"}`}>
              <TabIcon size={14} />
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${activeTab === tab.id ? "bg-[#030712]/20" : "bg-white/[0.06]"}`}>{tab.count}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Milestones */}
      {activeTab === "milestones" && (
        <div className="space-y-3">
          {dummyMilestones.map((m) => (
            <div key={m.id} className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.05] rounded-xl p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${m.status === "completed" ? "bg-emerald-500/20" : m.status === "in_progress" ? "bg-blue-500/20" : "bg-white/[0.05]"}`}>
                {m.status === "completed" ? <CheckCircle size={18} className="text-emerald-400" /> : <Clock size={18} className={m.status === "in_progress" ? "text-blue-400" : "text-slate-500"} />}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-bold ${m.status === "completed" ? "text-slate-400 line-through" : "text-white"}`}>{m.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">Due {new Date(m.due_date).toLocaleDateString()}</p>
              </div>
              <StatusBadge status={m.status} />
            </div>
          ))}
        </div>
      )}

      {/* Tab: Messages */}
      {activeTab === "messages" && (
        <div className="space-y-4">
          <div className="space-y-3">
            {dummyMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender_type === "client" ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${msg.sender_type === "client" ? "bg-white/[0.05] border border-white/[0.06]" : "bg-cyan-500/15 border border-cyan-500/20"}`}>
                  <p className="text-xs font-bold text-slate-400 mb-1">{msg.sender_name}</p>
                  <p className="text-sm text-white">{msg.content}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{new Date(msg.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all" />
            <button className="px-4 py-3 rounded-xl bg-cyan-500 text-[#030712] font-bold hover:bg-cyan-400 transition-colors"><Send size={16} /></button>
          </div>
        </div>
      )}

      {/* Tab: Files */}
      {activeTab === "files" && (
        <div className="space-y-3">
          {dummyFiles.map((f) => (
            <div key={f.id} className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.05] rounded-xl p-4 flex items-center gap-4 hover:border-white/[0.1] transition-all">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileIcon size={18} className="text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{f.name}</p>
                <p className="text-xs text-slate-500">{(f.size / 1000000).toFixed(1)} MB · Uploaded by {f.uploaded_by}</p>
              </div>
              <a href={f.url} className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors no-underline">Download</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
