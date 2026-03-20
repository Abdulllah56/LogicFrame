"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FolderKanban, Plus, Search } from "lucide-react";
import ProjectCard from "../components/ProjectCard";

const fallbackProjects = [
  { id: "p1", title: "SaaS Dashboard UI", client_name: "Alex Rivera", status: "active", budget: 12000, deadline: "2026-04-15T00:00:00Z", milestones_total: 6, milestones_done: 4 },
  { id: "p2", title: "API Integration Suite", client_name: "Sarah Johnson", status: "active", budget: 8500, deadline: "2026-03-30T00:00:00Z", milestones_total: 4, milestones_done: 1 },
  { id: "p3", title: "Mobile App MVP", client_name: "Mike Chen", status: "active", budget: 15000, deadline: "2026-05-01T00:00:00Z", milestones_total: 8, milestones_done: 2 },
  { id: "p4", title: "E-Commerce Storefront", client_name: "Emma Williams", status: "completed", budget: 9500, deadline: "2026-02-28T00:00:00Z", milestones_total: 5, milestones_done: 5 },
  { id: "p5", title: "Brand Website Refresh", client_name: "Lisa Thompson", status: "on_hold", budget: 4200, deadline: "2026-04-10T00:00:00Z", milestones_total: 3, milestones_done: 1 },
  { id: "p6", title: "Analytics Dashboard", client_name: "David Park", status: "active", budget: 7800, deadline: "2026-04-20T00:00:00Z", milestones_total: 5, milestones_done: 3 },
];

const statusFilters = ["all", "active", "completed", "on_hold", "cancelled"];

export default function ProjectsPage() {
  const [projects, setProjects] = useState(fallbackProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch("/api/portflow/projects");
        if (res.ok) {
          const { projects: p } = await res.json();
          if (p && p.length > 0) setProjects(p);
        }
      } catch (err) {
        console.log("Using fallback projects data");
      }
    }
    loadProjects();
  }, []);

  const filtered = projects.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || (p.client_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "all" || p.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <FolderKanban size={28} className="text-blue-400" />
            Projects
          </h1>
          <p className="text-slate-400 mt-1">
            {projects.length} total · {projects.filter((p) => p.status === "active").length} active
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-sm font-bold hover:bg-white/[0.08] transition-all">
          <Plus size={16} />
          New Project
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all"
          />
        </div>
        <div className="flex gap-1.5 bg-white/[0.02] rounded-xl p-1 border border-white/[0.05]">
          {statusFilters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${
                activeFilter === f
                  ? "bg-cyan-400 text-[#030712] shadow-lg shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              {f === "on_hold" ? "On Hold" : f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <FolderKanban size={48} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg font-semibold">No projects found</p>
          <p className="text-slate-500 text-sm mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
