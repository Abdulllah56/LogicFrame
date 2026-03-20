"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  FileText,
  FolderKanban,
  DollarSign,
  Plus,
  Sparkles,
  ArrowUpRight,
  Bell,
  TrendingUp,
} from "lucide-react";
import StatCard from "./components/StatCard";
import ProposalCard from "./components/ProposalCard";
import ProjectCard from "./components/ProjectCard";

// Fallback dummy data (used while API loads or if tables don't exist yet)
const fallbackStats = [
  { title: "Total Clients", value: "12", icon: Users, color: "purple", trend: "+3 this month", trendUp: true },
  { title: "Active Projects", value: "7", icon: FolderKanban, color: "blue", trend: "2 due soon", trendUp: true },
  { title: "Pending Proposals", value: "4", icon: FileText, color: "cyan", trend: "1 viewed", trendUp: true },
  { title: "Revenue", value: "$24.5K", icon: DollarSign, color: "green", trend: "+18%", trendUp: true },
];

const fallbackProposals = [
  { id: "1", title: "E-Commerce Platform Redesign", client_name: "Sarah Johnson", amount: 8500, status: "sent", created_at: "2026-03-12T10:00:00Z" },
  { id: "2", title: "Mobile App Development", client_name: "Mike Chen", amount: 15000, status: "accepted", created_at: "2026-03-08T14:00:00Z", sent_at: "2026-03-09T09:00:00Z" },
  { id: "3", title: "Brand Identity Package", client_name: "Emma Williams", amount: 3200, status: "draft", created_at: "2026-03-14T16:00:00Z" },
];

const fallbackProjects = [
  { id: "p1", title: "SaaS Dashboard UI", client_name: "Alex Rivera", status: "active", budget: 12000, deadline: "2026-04-15T00:00:00Z", milestones_total: 6, milestones_done: 4 },
  { id: "p2", title: "API Integration Suite", client_name: "Sarah Johnson", status: "active", budget: 8500, deadline: "2026-03-30T00:00:00Z", milestones_total: 4, milestones_done: 1 },
];

const fallbackNotifications = [
  { id: "n1", type: "proposal_viewed", title: "Proposal viewed", message: "Sarah Johnson viewed your E-Commerce proposal", time: "2 hours ago" },
  { id: "n2", type: "proposal_accepted", title: "Proposal accepted!", message: "Mike Chen accepted Mobile App Development", time: "Yesterday" },
  { id: "n3", type: "message", title: "New message", message: "Alex Rivera sent a message on SaaS Dashboard UI", time: "3 days ago" },
];

export default function PortflowDashboard() {
  const [proposals, setProposals] = useState(fallbackProposals);
  const [projects, setProjects] = useState(fallbackProjects);
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState(fallbackStats);
  const [notifications] = useState(fallbackNotifications);

  useEffect(() => {
    async function loadData() {
      try {
        const [proposalsRes, projectsRes, clientsRes] = await Promise.all([
          fetch("/api/portflow/proposals"),
          fetch("/api/portflow/projects"),
          fetch("/api/portflow/clients"),
        ]);

        if (proposalsRes.ok) {
          const { proposals: p } = await proposalsRes.json();
          if (p && p.length > 0) setProposals(p.slice(0, 3));
        }

        if (projectsRes.ok) {
          const { projects: pr } = await projectsRes.json();
          if (pr && pr.length > 0) setProjects(pr.filter((p) => p.status === "active").slice(0, 3));
        }

        let clientCount = 0;
        let totalRevenue = 0;
        if (clientsRes.ok) {
          const { clients: cl } = await clientsRes.json();
          if (cl) {
            setClients(cl);
            clientCount = cl.length;
            totalRevenue = cl.reduce((s, c) => s + (c.total_revenue || 0), 0);
          }
        }

        // Update stats if we got real data
        if (clientCount > 0 || proposals.length > 0 || projects.length > 0) {
          setStats([
            { title: "Total Clients", value: String(clientCount || clients.length), icon: Users, color: "purple", trend: "all time", trendUp: true },
            { title: "Active Projects", value: String(projects.filter((p) => p.status === "active").length), icon: FolderKanban, color: "blue", trend: "in progress", trendUp: true },
            { title: "Pending Proposals", value: String(proposals.filter((p) => p.status === "draft" || p.status === "sent").length), icon: FileText, color: "cyan", trend: "awaiting response", trendUp: true },
            { title: "Revenue", value: `$${(totalRevenue / 1000).toFixed(1)}K`, icon: DollarSign, color: "green", trend: "total earned", trendUp: true },
          ]);
        }
      } catch (err) {
        // Keep fallback data on error
        console.log("Using fallback dashboard data");
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="relative">
        <div className="absolute -left-10 -top-10 w-32 h-32 bg-cyan-500/20 blur-[60px] rounded-full" />
        <div className="flex items-start justify-between relative z-10">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              Port<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">flow</span>
            </h1>
            <p className="text-slate-400 mt-2 text-lg">
              Your client portal & proposal command center
            </p>
          </div>
          <Link
            href="/portflow/proposals/new"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-[1.02] no-underline"
          >
            <Sparkles size={16} />
            New AI Proposal
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Proposals */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText size={20} className="text-cyan-400" />
              Recent Proposals
            </h2>
            <Link href="/portflow/proposals" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 no-underline">
              View All <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proposals.map((p) => (
              <ProposalCard key={p.id} proposal={p} />
            ))}
            <Link
              href="/portflow/proposals/new"
              className="bg-gradient-to-br from-white/[0.02] to-transparent border border-dashed border-white/[0.08] rounded-2xl p-5 flex flex-col items-center justify-center gap-3 hover:border-cyan-500/30 hover:bg-cyan-500/[0.03] transition-all duration-300 min-h-[180px] no-underline group"
            >
              <div className="w-12 h-12 rounded-xl bg-white/[0.05] flex items-center justify-center group-hover:bg-cyan-500/10 transition-colors">
                <Plus size={24} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </div>
              <span className="text-sm font-bold text-slate-500 group-hover:text-slate-300 transition-colors">
                Create New Proposal
              </span>
            </Link>
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell size={20} className="text-cyan-400" />
            Notifications
          </h2>
          <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] rounded-2xl divide-y divide-white/[0.05] overflow-hidden">
            {notifications.map((n) => (
              <div key={n.id} className="p-4 hover:bg-white/[0.02] transition-colors cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    n.type === "proposal_accepted" ? "bg-emerald-500/15" : n.type === "proposal_viewed" ? "bg-blue-500/15" : "bg-purple-500/15"
                  }`}>
                    {n.type === "proposal_accepted" ? (
                      <TrendingUp size={14} className="text-emerald-400" />
                    ) : n.type === "proposal_viewed" ? (
                      <FileText size={14} className="text-blue-400" />
                    ) : (
                      <Bell size={14} className="text-purple-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white leading-tight">{n.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{n.message}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{n.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderKanban size={20} className="text-blue-400" />
            Active Projects
          </h2>
          <Link href="/portflow/projects" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 no-underline">
            View All <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
