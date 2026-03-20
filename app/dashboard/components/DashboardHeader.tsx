'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut } from 'lucide-react';
import { logout } from '@/app/auth/actions';

export default function DashboardHeader() {
    const [isAvatarOpen, setIsAvatarOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsAvatarOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
    };

    return (
        <header className="h-20 px-8 flex items-center justify-between bg-[#030712]/50 backdrop-blur-xl border-b border-white/[0.05] sticky top-0 z-40 transition-all duration-300">
            {/* Left Spacer (replaces Search Bar) */}
            <div className="flex-1" />

            {/* Right Actions */}
            <div className="flex items-center gap-6">

                {/* User Avatar */}
                <div className="relative group cursor-pointer" ref={dropdownRef}>
                    <div 
                        className="flex items-center gap-3" 
                        onClick={() => setIsAvatarOpen(!isAvatarOpen)}
                    >
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity" />
                            <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 relative z-10 overflow-hidden flex items-center justify-center font-bold text-xs text-white">
                                AD
                            </div>
                        </div>
                    </div>

                    {/* Dropdown Menu */}
                    {isAvatarOpen && (
                        <div className="absolute right-0 mt-3 w-48 bg-[#0B0F19] border border-white/[0.05] rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden z-50">
                            <div className="p-1">
                                <a href="/dashboard/settings" className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors">
                                    <User size={16} />
                                    Profile
                                </a>
                                <a href="/dashboard/settings" className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors">
                                    <Settings size={16} />
                                    Settings
                                </a>
                                <div className="h-px bg-white/[0.05] my-1" />
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleLogout(); }} 
                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <LogOut size={16} />
                                    Log out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
