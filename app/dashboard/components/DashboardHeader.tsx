'use client';

import React from 'react';
import { Bell, Search } from 'lucide-react';

export default function DashboardHeader() {
    return (
        <header className="h-16 px-6 flex items-center justify-between bg-neutral-900/60 backdrop-blur-md border-b border-white/5 sticky top-0 z-40">
            {/* Search Bar (Visual Only for now) */}
            <div className="flex items-center bg-white/5 rounded-full px-4 py-1.5 border border-white/10 w-64 focus-within:border-blue-500/50 transition-colors">
                <Search size={16} className="text-neutral-500 mr-2" />
                <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent border-none outline-none text-sm text-neutral-200 placeholder:text-neutral-600 w-full"
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                <button className="relative p-2 text-neutral-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-neutral-900"></span>
                </button>

                {/* User Avatar Placeholder */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 ring-2 ring-white/10 cursor-pointer" />
            </div>
        </header>
    );
}
