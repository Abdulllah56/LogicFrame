'use client';

import React from 'react';
import { Bell, Search, Command } from 'lucide-react';

export default function DashboardHeader() {
    return (
        <header className="h-20 px-8 flex items-center justify-between bg-[#030712]/50 backdrop-blur-xl border-b border-white/[0.05] sticky top-0 z-40 transition-all duration-300">
            {/* Search Bar */}
            <div className="flex items-center bg-white/[0.03] rounded-xl px-4 py-2 border border-white/[0.08] w-80 group focus-within:border-cyan-400/50 focus-within:bg-white/[0.05] transition-all duration-300">
                <Search size={16} className="text-slate-500 mr-3 group-focus-within:text-cyan-400 transition-colors" />
                <input
                    type="text"
                    placeholder="Search anything..."
                    className="bg-transparent border-none outline-none text-sm text-slate-200 placeholder:text-slate-600 w-full font-medium"
                />
                <div className="flex items-center gap-1 ml-2 text-[10px] font-black text-slate-600 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                    <Command size={10} />
                    <span>K</span>
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6">
                <button className="relative p-2.5 text-slate-400 hover:text-cyan-400 transition-all rounded-xl hover:bg-white/[0.05] group">
                    <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-cyan-400 rounded-full border-2 border-[#030712] shadow-[0_0_8px_rgba(34,211,238,0.5)]"></span>
                </button>

                <div className="h-8 w-px bg-white/[0.05]" />

                {/* User Avatar */}
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity" />
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 relative z-10 overflow-hidden flex items-center justify-center font-bold text-xs text-white">
                            AD
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
