"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  Users,
  ArrowLeft,
  Sparkles,
  Send,
  Settings,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/portflow" },
  { name: "Proposals", icon: FileText, href: "/portflow/proposals" },
  { name: "Projects", icon: FolderKanban, href: "/portflow/projects" },
  { name: "Clients", icon: Users, href: "/portflow/clients" },
  { name: "Settings", icon: Settings, href: "/portflow/settings" },
];

export default function PortflowSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-[#030712] border-r border-white/5 relative overflow-hidden">
      {/* Background Aesthetic Glow */}
      <div className="absolute top-0 -left-20 w-40 h-40 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-40 h-40 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />

      {/* Logo / Brand Section */}
      <div className="flex items-center gap-3 px-6 h-20 border-b border-white/[0.05] relative z-10">
        <div className="relative group/logo">
          <div className="absolute -inset-2 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-xl blur-lg opacity-20 group-hover/logo:opacity-40 transition-opacity" />
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-[#030712] font-black shadow-lg shadow-cyan-500/20 relative z-10 transform group-hover/logo:scale-105 transition-transform duration-300">
            <Send size={18} />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black text-white tracking-tighter leading-none">
            Port<span className="text-cyan-400">flow</span>
          </span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">
            Client Portal
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-8 overflow-y-auto relative z-10">
        <div className="space-y-2">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-3">
            Navigation
          </div>
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/portflow" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 group/item relative no-underline
                  ${isActive ? "text-[#030712]" : "text-slate-400 hover:text-white"}
                `}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-cyan-400 rounded-xl shadow-xl shadow-cyan-400/30 z-0" />
                )}
                {!isActive && (
                  <div className="absolute inset-0 bg-white/0 group-hover/item:bg-white/[0.03] rounded-xl transition-colors z-0" />
                )}

                <item.icon
                  size={18}
                  className={`relative z-10 transition-colors duration-300 ${
                    isActive
                      ? "text-[#030712]"
                      : "text-slate-500 group-hover/item:text-cyan-400"
                  }`}
                />
                <span className="relative z-10">{item.name}</span>

                {isActive && (
                  <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#030712] z-10 shadow-sm" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Quick Action */}
        <div className="px-3">
          <Link
            href="/portflow/proposals/new"
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-[1.02] no-underline"
          >
            <Sparkles size={16} />
            <span>AI Proposal</span>
          </Link>
        </div>

        {/* Pro Status */}
        <div className="px-3">
          <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.05] rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 blur-2xl rounded-full" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-cyan-400" />
                <span className="text-[10px] font-black text-white uppercase tracking-wider">
                  Portflow Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                AI-powered proposals with your unique voice.
              </p>
              <div className="h-1 w-full bg-white/[0.05] rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-cyan-400 rounded-full shadow-md shadow-cyan-400/50" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Back to Dashboard */}
      <div className="p-4 border-t border-white/[0.05] bg-black/20 backdrop-blur-md relative z-10">
        <Link
          href="/dashboard"
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/[0.03] transition-all duration-300 no-underline"
        >
          <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center">
            <ArrowLeft size={18} />
          </div>
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
