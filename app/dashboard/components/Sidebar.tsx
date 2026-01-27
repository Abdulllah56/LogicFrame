'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    LayoutGrid,
    CreditCard,
    Settings,
    LogOut,
    Box,
    TrendingUp,
    Zap
} from 'lucide-react';
import { logout } from '@/app/auth/actions';

const menuItems = [
    { name: 'Overview', icon: Home, href: '/dashboard' },
    { name: 'My Tools', icon: LayoutGrid, href: '/dashboard#tools' },
    { name: 'Billing', icon: CreditCard, href: '/dashboard#billing' },
    { name: 'Settings', icon: Settings, href: '/dashboard/settings' }, // Placeholder
];

export default function Sidebar() {
    const pathname = usePathname();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <div className="flex flex-col h-full bg-neutral-900/80 backdrop-blur-xl border-r border-white/5">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 h-16 border-b border-white/5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/20">
                    LF
                </div>
                <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">
                    LogicFrame
                </span>
            </div>

            {/* Menu */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4 px-2">
                    Menu
                </div>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                                ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                                }
                            `}
                        >
                            <item.icon size={18} className={isActive ? 'text-white' : 'text-neutral-500 group-hover:text-white transition-colors'} />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-white/5">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut size={18} />
                    Log Out
                </button>
            </div>
        </div>
    );
}
