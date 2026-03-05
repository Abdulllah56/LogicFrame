"use client";
import React from "react";
import Link from "next/link";

interface GuestLimitModalProps {
    open: boolean;
    onClose: () => void;
    toolName: string;
    usesLeft: number;
    limit: number;
    authOnlyFeature?: string | null;
}

export function GuestLimitModal({ open, onClose, toolName, usesLeft, limit, authOnlyFeature }: GuestLimitModalProps) {
    if (!open) return null;

    const used = limit - usesLeft;
    const pct = Math.round((used / limit) * 100);

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={authOnlyFeature ? "Account required" : "Free usage limit reached"}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Card */}
            <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-[#0a0f1e] shadow-2xl shadow-black/60 overflow-hidden">
                {/* Glow accent - purple if auth feature, blue if usage limit */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 blur-[60px] pointer-events-none ${authOnlyFeature ? 'bg-purple-500/20' : 'bg-[#00D9FF]/20'}`} />

                <div className="relative p-7 flex flex-col gap-6">
                    {/* Header */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2.5 mb-1">
                            <span className="text-2xl">{authOnlyFeature ? '✨' : '🔓'}</span>
                            <h2 className="text-lg font-black text-white tracking-tight">
                                {authOnlyFeature ? 'Account Required' : 'Free limit reached'}
                            </h2>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            {authOnlyFeature ? (
                                <>Create a free account to use <span className="text-white font-semibold">{authOnlyFeature}</span> and unlock unlimited access.{' '} {toolName && `This is a premium feature of ${toolName}.`}</>
                            ) : (
                                <>You&apos;ve used your <span className="text-white font-semibold">{limit} free {toolName} actions</span>. Create a free account to keep going — no credit card needed.</>
                            )}
                        </p>
                    </div>

                    {/* Usage bar - only show if NOT a hard-gated feature */}
                    {!authOnlyFeature && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-[11px] uppercase tracking-widest font-black">
                                <span className="text-slate-500">Usage</span>
                                <span className="text-[#00D9FF]">{used} / {limit}</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-[#00D9FF] to-blue-500 transition-all duration-700"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* CTA buttons */}
                    <div className="flex flex-col gap-2.5">
                        <Link
                            href="/auth/login?mode=signup"
                            className="w-full py-3.5 rounded-2xl bg-[#00D9FF] text-black font-black text-sm uppercase tracking-widest text-center hover:bg-white transition-colors shadow-lg shadow-[#00D9FF]/20"
                            onClick={onClose}
                        >
                            Sign up free — unlimited access
                        </Link>
                        <Link
                            href="/auth/login"
                            className="w-full py-3 rounded-2xl bg-white/5 text-slate-300 font-semibold text-sm text-center border border-white/10 hover:bg-white/10 transition-colors"
                            onClick={onClose}
                        >
                            Already have an account? Log in
                        </Link>
                    </div>

                    {/* Dismiss */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-600 hover:text-slate-400 transition-colors p-1"
                        aria-label="Close"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}


/** Subtle banner shown while uses remain — appears at the bottom of tool pages */
export function GuestUsageBanner({
    isGuest,
    usesLeft,
    limit,
    toolName,
}: {
    isGuest: boolean;
    usesLeft: number;
    limit: number;
    toolName: string;
}) {
    if (!isGuest || usesLeft >= limit) return null; // hide until at least one use is consumed

    const pct = Math.round(((limit - usesLeft) / limit) * 100);

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#0a0f1e]/90 backdrop-blur border border-white/10 shadow-xl text-sm whitespace-nowrap">
            <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                    className="h-full rounded-full bg-[#00D9FF] transition-all duration-500"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-slate-400 text-[12px]">
                <span className="text-white font-bold">{usesLeft}</span> free {toolName} {usesLeft === 1 ? "use" : "uses"} left
            </span>
            <Link
                href="/auth/login?mode=signup"
                className="text-[#00D9FF] text-[12px] font-bold hover:underline"
            >
                Sign up →
            </Link>
        </div>
    );
}
