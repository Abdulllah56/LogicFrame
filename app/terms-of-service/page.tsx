"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ScrollText } from 'lucide-react';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-[#0B1120] text-slate-300 font-sans selection:bg-cyan-500/30">
            {/* Header / Nav */}
            <header className="fixed top-0 w-full bg-[#0B1120]/80 backdrop-blur-md border-b border-slate-800/60 z-50">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-slate-100 hover:text-cyan-400 transition-colors group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium text-sm">Back to Home</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <ScrollText className="w-5 h-5 text-cyan-400" />
                        <span className="font-bold text-slate-100 tracking-tight">LogicFrame</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-32 pb-20 px-6">
                <div className="max-w-3xl mx-auto">

                    {/* Page Title */}
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                            Terms of <span className="text-cyan-400">Service</span>
                        </h1>
                        <p className="text-slate-400">
                            Last Updated: <span className="text-cyan-400 font-medium">11/1/2026</span>
                        </p>
                    </div>

                    <div className="space-y-12">

                        {/* Section 1 */}
                        <section className="bg-slate-900/40 border border-slate-800/60 p-8 rounded-2xl backdrop-blur-sm">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                                <span className="bg-cyan-500/10 text-cyan-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm mr-3 border border-cyan-500/20">1</span>
                                Agreement to Terms
                            </h2>
                            <p className="leading-relaxed pl-11">
                                By accessing or using <span className="text-slate-100 font-medium">LogicFrame</span>, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
                            </p>
                        </section>

                        {/* Section 2 */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                <span className="bg-cyan-500/10 text-cyan-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm mr-3 border border-cyan-500/20">2</span>
                                Description of Service
                            </h2>
                            <div className="pl-11">
                                <p className="mb-4">LogicFrame provides a suite of freelance and business tools, including but not limited to:</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {['Invoice Generation', 'AI-powered Image Editing', 'Financial Expense Tracking', 'Payment Chasing tools'].map((item, i) => (
                                        <div key={i} className="flex items-center p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 text-sm font-medium text-slate-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-2"></div>
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Section 3 */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                <span className="bg-cyan-500/10 text-cyan-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm mr-3 border border-cyan-500/20">3</span>
                                Subscriptions and Free Trials
                            </h2>
                            <div className="pl-11 grid gap-4 md:grid-cols-2">
                                <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-700/30">
                                    <h3 className="font-bold text-slate-100 mb-2 flex items-center gap-2"><div className="w-2 h-2 bg-green-400 rounded-full"></div>6-Day Free Trial</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">We offer a 6-day free trial for our Pro plans. You may cancel your subscription at any time within these 6 days without any charge.</p>
                                </div>
                                <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-700/30">
                                    <h3 className="font-bold text-slate-100 mb-2 flex items-center gap-2"><div className="w-2 h-2 bg-red-400 rounded-full"></div>No Refunds</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">Once the 6-day trial ends and a payment is processed, <span className="text-slate-200 font-medium">all sales are final.</span> We do not offer refunds for partial months or unused services. It is the user's responsibility to cancel before the trial period expires.</p>
                                </div>
                            </div>
                        </section>

                        {/* Section 4 & 5 */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <section>
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                                    <span className="bg-cyan-500/10 text-cyan-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm mr-3 border border-cyan-500/20">4</span>
                                    User Responsibilities
                                </h2>
                                <div className="pl-11">
                                    <p className="leading-relaxed text-sm">
                                        You agree not to use LogicFrame for any illegal purposes. You are responsible for the accuracy of the data you input (e.g., tax information on invoices). LogicFrame is not responsible for legal or financial errors resulting from incorrect user input.
                                    </p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                                    <span className="bg-cyan-500/10 text-cyan-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm mr-3 border border-cyan-500/20">5</span>
                                    Intellectual Property
                                </h2>
                                <div className="pl-11">
                                    <p className="leading-relaxed text-sm">
                                        The design, code, and "LogicFrame" branding are the intellectual property of the site owner. You may not copy, redistribute, or sell any part of our service without written permission.
                                    </p>
                                </div>
                            </section>
                        </div>

                        {/* Section 6 & 7 */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <section>
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                                    <span className="bg-cyan-500/10 text-cyan-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm mr-3 border border-cyan-500/20">6</span>
                                    AI Tool Usage
                                </h2>
                                <div className="pl-11">
                                    <p className="leading-relaxed text-sm">
                                        Our AI tools are provided "as is." While we strive for high accuracy in object detection and background removal, we do not guarantee perfect results every time.
                                    </p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                                    <span className="bg-cyan-500/10 text-cyan-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm mr-3 border border-cyan-500/20">7</span>
                                    Limitation of Liability
                                </h2>
                                <div className="pl-11">
                                    <p className="leading-relaxed text-sm">
                                        LogicFrame and its owner shall not be liable for any indirect, incidental, or consequential damages resulting from your use of the service, including but not limited to loss of profits or data.
                                    </p>
                                </div>
                            </section>
                        </div>

                        {/* Section 8 & 9 */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <section>
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                                    <span className="bg-cyan-500/10 text-cyan-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm mr-3 border border-cyan-500/20">8</span>
                                    Governing Law
                                </h2>
                                <div className="pl-11">
                                    <p className="leading-relaxed text-sm">
                                        These terms are governed by the laws of Sindh, Pakistan, without regard to its conflict of law principles.
                                    </p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                                    <span className="bg-cyan-500/10 text-cyan-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm mr-3 border border-cyan-500/20">9</span>
                                    Changes to Terms
                                </h2>
                                <div className="pl-11">
                                    <p className="leading-relaxed text-sm">
                                        We reserve the right to modify these terms at any time. Continued use of the site after changes are posted constitutes your acceptance of the new terms.
                                    </p>
                                </div>
                            </section>
                        </div>

                        {/* Section 10 - Contact */}
                        <section className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 p-8 rounded-2xl mt-8">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                <span className="bg-cyan-500/10 text-cyan-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm mr-3 border border-cyan-500/20">10</span>
                                Contact Information
                            </h2>
                            <div className="pl-11">
                                <p className="mb-6 text-slate-300">For legal inquiries, please contact:</p>
                                <div className="flex items-start gap-3">
                                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-700">
                                        <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Email</p>
                                        <a href="mailto:logicframe.dev@gmail.com" className="text-white hover:text-cyan-400 transition-colors font-medium">logicframe.dev@gmail.com</a>
                                    </div>
                                </div>
                            </div>
                        </section>

                    </div>

                    {/* Footer */}
                    <div className="mt-20 pt-8 border-t border-slate-800/60 text-center text-slate-500 text-sm">
                        <p>&copy; {new Date().getFullYear()} LogicFrame. All rights reserved.</p>
                    </div>

                </div>
            </main>
        </div>
    );
}
