"use client";

import React, { useState } from "react";
import {
  CheckCircle,
  Clock,
  FolderKanban,
  MessageSquare,
  FileIcon,
  Calendar,
  DollarSign,
  Send as SendIcon,
} from "lucide-react";

export default function ProjectPortalView({ project, milestones = [], messages = [], files = [], onSendMessage }) {
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  if (!project) return null;

  const { title, description, status, budget, currency = "USD", deadline, client_name } = project;

  const formattedBudget = new Intl.NumberFormat("en-US", { style: "currency", currency }).format(budget || 0);
  const deadlineStr = deadline ? new Date(deadline).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "No deadline";

  const completedMilestones = milestones.filter((m) => m.status === "completed").length;
  const progress = milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0;

  const tabs = [
    { id: "overview", label: "Overview", icon: FolderKanban },
    { id: "milestones", label: "Milestones", icon: CheckCircle },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "files", label: "Files", icon: FileIcon },
  ];

  const handleSend = () => {
    if (newMessage.trim() && onSendMessage) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Project Header */}
      <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] rounded-2xl p-8 mb-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
            <FolderKanban size={24} className="text-blue-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-white mb-1">{title}</h1>
            {description && <p className="text-slate-400 text-sm">{description}</p>}
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Project Progress</span>
            <span className="text-sm font-bold text-white">{progress}%</span>
          </div>
          <div className="h-2 w-full bg-white/[0.05] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-lg shadow-cyan-400/40 transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/[0.03] rounded-xl p-3">
            <DollarSign size={16} className="text-emerald-400 mb-1" />
            <p className="text-xs text-slate-400">Budget</p>
            <p className="text-lg font-bold text-white">{formattedBudget}</p>
          </div>
          <div className="bg-white/[0.03] rounded-xl p-3">
            <Calendar size={16} className="text-blue-400 mb-1" />
            <p className="text-xs text-slate-400">Deadline</p>
            <p className="text-sm font-semibold text-white">{deadlineStr}</p>
          </div>
          <div className="bg-white/[0.03] rounded-xl p-3">
            <CheckCircle size={16} className="text-cyan-400 mb-1" />
            <p className="text-xs text-slate-400">Milestones</p>
            <p className="text-sm font-semibold text-white">{completedMilestones}/{milestones.length}</p>
          </div>
          <div className="bg-white/[0.03] rounded-xl p-3">
            <Clock size={16} className="text-purple-400 mb-1" />
            <p className="text-xs text-slate-400">Status</p>
            <p className="text-sm font-semibold text-white capitalize">{status}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white/[0.02] rounded-xl p-1 border border-white/[0.05]">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex-1 justify-center ${
                activeTab === tab.id ? "bg-cyan-400 text-[#030712] shadow-lg shadow-cyan-500/20" : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              <TabIcon size={14} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content: Overview */}
      {activeTab === "overview" && (
        <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.05] rounded-2xl p-6">
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-3">Project Description</h3>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{description || "No description provided."}</p>
        </div>
      )}

      {/* Tab Content: Milestones */}
      {activeTab === "milestones" && (
        <div className="space-y-3">
          {milestones.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <CheckCircle size={32} className="mx-auto mb-2 opacity-30" />
              <p>No milestones yet</p>
            </div>
          ) : (
            milestones.map((m, i) => (
              <div key={m.id || i} className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.05] rounded-xl p-4 flex items-center gap-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.status === "completed" ? "bg-emerald-500/20" : m.status === "in_progress" ? "bg-blue-500/20" : "bg-white/[0.05]"}`}>
                  {m.status === "completed" ? (
                    <CheckCircle size={16} className="text-emerald-400" />
                  ) : (
                    <Clock size={16} className={m.status === "in_progress" ? "text-blue-400" : "text-slate-500"} />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${m.status === "completed" ? "text-slate-400 line-through" : "text-white"}`}>{m.title}</p>
                  {m.due_date && <p className="text-xs text-slate-500 mt-0.5">{new Date(m.due_date).toLocaleDateString()}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Content: Messages */}
      {activeTab === "messages" && (
        <div className="space-y-4">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
                <p>No messages yet</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={msg.id || i} className={`flex ${msg.sender_type === "client" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.sender_type === "client" ? "bg-cyan-500/20 border border-cyan-500/20" : "bg-white/[0.05] border border-white/[0.06]"}`}>
                    <p className="text-xs font-bold text-slate-400 mb-1">{msg.sender_name || msg.sender_type}</p>
                    <p className="text-sm text-white">{msg.content}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{msg.created_at ? new Date(msg.created_at).toLocaleString() : ""}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <div className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all"
            />
            <button onClick={handleSend} className="px-4 py-3 rounded-xl bg-cyan-500 text-[#030712] font-bold hover:bg-cyan-400 transition-colors">
              <SendIcon size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Tab Content: Files */}
      {activeTab === "files" && (
        <div className="space-y-3">
          {files.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <FileIcon size={32} className="mx-auto mb-2 opacity-30" />
              <p>No files shared yet</p>
            </div>
          ) : (
            files.map((f, i) => (
              <a key={f.id || i} href={f.url} target="_blank" rel="noopener noreferrer" className="block bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.05] rounded-xl p-4 hover:border-white/[0.1] transition-all no-underline">
                <div className="flex items-center gap-3">
                  <FileIcon size={18} className="text-blue-400" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{f.name}</p>
                    <p className="text-xs text-slate-500">{f.size ? `${(f.size / 1024).toFixed(1)} KB` : ""}</p>
                  </div>
                </div>
              </a>
            ))
          )}
        </div>
      )}
    </div>
  );
}
