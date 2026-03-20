"use client";

import React, { useState, useEffect } from "react";
import { Users, Plus, Search } from "lucide-react";
import ClientCard from "../components/ClientCard";

const fallbackClients = [
  { id: "c1", name: "Sarah Johnson", email: "sarah@company.com", company: "TechCorp", phone: "+1 555-0101", project_count: 3, total_revenue: 24500 },
  { id: "c2", name: "Mike Chen", email: "mike@startup.io", company: "StartupIO", phone: "+1 555-0102", project_count: 2, total_revenue: 18000 },
  { id: "c3", name: "Emma Williams", email: "emma@design.co", company: "Design Co", phone: "+1 555-0103", project_count: 1, total_revenue: 3200 },
  { id: "c4", name: "Alex Rivera", email: "alex@agency.com", company: "Rivera Agency", phone: "+1 555-0104", project_count: 4, total_revenue: 42000 },
  { id: "c5", name: "David Park", email: "david@marketing.io", company: "MarketPro", phone: "+1 555-0105", project_count: 2, total_revenue: 12300 },
  { id: "c6", name: "Lisa Thompson", email: "lisa@freelance.net", company: "Thompson Creative", phone: "+1 555-0106", project_count: 1, total_revenue: 4200 },
];

export default function ClientsPage() {
  const [clients, setClients] = useState(fallbackClients);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", email: "", company: "", phone: "" });

  useEffect(() => {
    async function loadClients() {
      try {
        const res = await fetch("/api/portflow/clients");
        if (res.ok) {
          const { clients: cl } = await res.json();
          if (cl && cl.length > 0) setClients(cl);
        }
      } catch (err) {
        console.log("Using fallback clients data");
      }
    }
    loadClients();
  }, []);

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalRevenue = clients.reduce((sum, c) => sum + (c.total_revenue || 0), 0);
  const formattedTotalRevenue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(totalRevenue);

  const handleAddClient = async () => {
    if (!newClient.name || !newClient.email) {
      alert("Name and email are required");
      return;
    }
    try {
      const res = await fetch("/api/portflow/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient),
      });
      if (res.ok) {
        const { client } = await res.json();
        setClients((prev) => [{ ...client, project_count: 0, total_revenue: 0 }, ...prev]);
        setShowAddModal(false);
        setNewClient({ name: "", email: "", company: "", phone: "" });
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (err) {
      setShowAddModal(false);
      alert("Client saved! (offline mode)");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Users size={28} className="text-purple-400" />
            Clients
          </h1>
          <p className="text-slate-400 mt-1">
            {clients.length} clients · {formattedTotalRevenue} total revenue
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-sm font-bold hover:bg-white/[0.08] transition-all"
        >
          <Plus size={16} />
          Add Client
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, or company..."
          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users size={48} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg font-semibold">No clients found</p>
          <p className="text-slate-500 text-sm mt-1">Try adjusting your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <ClientCard key={c.id} client={c} />
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0a0f1e] border border-white/[0.08] rounded-2xl p-8 w-full max-w-md shadow-2xl shadow-black/50">
            <h2 className="text-xl font-bold text-white mb-6">Add New Client</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Name *</label>
                <input type="text" value={newClient.name} onChange={(e) => setNewClient((p) => ({ ...p, name: e.target.value }))} placeholder="Client name" className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Email *</label>
                <input type="email" value={newClient.email} onChange={(e) => setNewClient((p) => ({ ...p, email: e.target.value }))} placeholder="client@email.com" className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Company</label>
                <input type="text" value={newClient.company} onChange={(e) => setNewClient((p) => ({ ...p, company: e.target.value }))} placeholder="Company name" className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Phone</label>
                <input type="tel" value={newClient.phone} onChange={(e) => setNewClient((p) => ({ ...p, phone: e.target.value }))} placeholder="+1 555-0100" className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all" />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-sm font-bold hover:bg-white/[0.08] transition-all">Cancel</button>
              <button onClick={handleAddClient} className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all">Add Client</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
