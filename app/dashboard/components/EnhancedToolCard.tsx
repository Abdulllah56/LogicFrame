'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface EnhancedToolCardProps {
    title: string;
    description: string;
    href: string;
    currentPlan: string;
    slug: string;
    index?: number;
}

export default function EnhancedToolCard({ title, description, href, currentPlan, slug, index = 0 }: EnhancedToolCardProps) {
    const isFree = currentPlan.toLowerCase() === 'free';
    const isPro = currentPlan.toLowerCase().includes('pro') || currentPlan.toLowerCase().includes('agency');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="group relative h-full"
        >
            <div className={`relative h-full bg-[#0B0F19]/80 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 group-hover:border-cyan-500/30 group-hover:shadow-[0_0_40px_rgba(0,217,255,0.1)]`}>

                {/* Subtle Gradient Overlay - ensuring it doesn't block clicks */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Top Glow Bar */}
                <div className={`h-1 w-full bg-gradient-to-r ${isPro ? 'from-cyan-400 via-blue-500 to-purple-600' : 'from-slate-700 to-slate-800'}`} />

                <div className="p-6 flex flex-col h-full relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-white/5 ${isPro ? 'bg-cyan-500/10 text-cyan-400 shadow-lg shadow-cyan-500/20' : 'bg-white/5 text-slate-400'}`}>
                            {isPro ? <Sparkles size={24} /> : <Zap size={24} />}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${isPro
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(0,217,255,0.2)]'
                            : 'bg-white/5 text-slate-500 border border-white/5'
                            }`}>
                            {currentPlan}
                        </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                        {title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-8 line-clamp-2">
                        {description}
                    </p>

                    <div className="mt-auto flex gap-3">
                        <Link
                            href={href}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300
                                ${isPro
                                    ? 'bg-cyan-400 text-black hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(0,217,255,0.4)]'
                                    : 'bg-white text-black hover:bg-slate-200'
                                }
                            `}
                        >
                            Launch
                            <ArrowRight size={16} className="group-hover/btn:translate-x-0.5 transition-transform" />
                        </Link>
                        <Link
                            href={`/dashboard/tools/${slug.toLowerCase()}`}
                            className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all font-semibold"
                        >
                            {isPro ? 'Manage' : 'Upgrade'}
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
