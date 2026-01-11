"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPolicy() {
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
                        <Shield className="w-5 h-5 text-cyan-400" />
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
                            Privacy <span className="text-cyan-400">Policy</span>
                        </h1>
                        <p className="text-slate-400">
                            Last Updated: <span className="text-cyan-400 font-medium">11/1/2026</span>
                        </p>
                    </div>

                    <div className="space-y-12">

                        {/* Introduction */}
                        <section className="bg-slate-900/40 border border-slate-800/60 p-8 rounded-2xl backdrop-blur-sm">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                Introduction
                            </h2>
                            <p className="leading-relaxed">
                                Welcome to <span className="text-slate-100 font-medium">LogicFrame</span> (available at <a href="https://logicframe.vercel.app" className="text-cyan-400 hover:underline">https://logicframe.vercel.app</a>). We value your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our suite of tools, including our Invoice Maker, AI Image Editor, and Finance Friend.
                            </p>
                        </section>

                        {/* Section 1 */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                <span className="bg-cyan-500/10 text-cyan-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm mr-3 border border-cyan-500/20">1</span>
                                Information We Collect
                            </h2>
                            <div className="pl-11 space-y-6">
                                <p className="leading-relaxed">We only collect information that is necessary to provide you with our services:</p>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-700/30">
                                        <h3 className="font-bold text-slate-100 mb-2">Account Information</h3>
                                        <p className="text-sm text-slate-400">When you sign up, we collect your email address and name.</p>
                                    </div>
                                    <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-700/30">
                                        <h3 className="font-bold text-slate-100 mb-2">User-Generated Content</h3>
                                        <p className="text-sm text-slate-400">Information you input into our tools, such as invoice details (client names, amounts) and expense logs.</p>
                                    </div>
                                    <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-700/30 md:col-span-2">
                                        <h3 className="font-bold text-slate-100 mb-2">AI Tool Data</h3>
                                        <p className="text-sm text-slate-400">For our AI Image Editor, images are processed in real-time. <span className="text-cyan-400">We do not store your uploaded images on our servers.</span> Once the processing is complete and you download the result, the data is cleared.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 2 */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                <span className="bg-cyan-500/10 text-cyan-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm mr-3 border border-cyan-500/20">2</span>
                                How We Use Your Information
                            </h2>
                            <div className="pl-11">
                                <p className="mb-4">We use the collected data to:</p>
                                <ul className="space-y-3 list-disc list-inside text-slate-400 marker:text-cyan-500">
                                    <li>Maintain and provide the LogicFrame services.</li>
                                    <li>Allow you to save and manage your invoices and financial records.</li>
                                    <li>Communicate with you regarding account updates or support.</li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 3 & 4 */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <section>
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                                    <span className="bg-cyan-500/10 text-cyan-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm mr-3 border border-cyan-500/20">3</span>
                                    Data Retention
                                </h2>
                                <div className="pl-11">
                                    <p className="leading-relaxed text-sm">
                                        Your data (invoices, expenses, and profile info) is stored securely. We retain this data until you choose to delete your account. Once an account is deleted, all associated data is removed from our active databases.
                                    </p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                                    <span className="bg-cyan-500/10 text-cyan-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm mr-3 border border-cyan-500/20">4</span>
                                    Third-Party Services
                                </h2>
                                <div className="pl-11">
                                    <p className="leading-relaxed text-sm">
                                        Currently, LogicFrame does not use third-party tracking cookies (like Google Analytics). However, we reserve the right to implement these in the future to improve user experience. We will update this policy accordingly if we do.
                                    </p>
                                </div>
                            </section>
                        </div>

                        {/* Section 5 & 6 */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <section>
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                                    <span className="bg-cyan-500/10 text-cyan-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm mr-3 border border-cyan-500/20">5</span>
                                    Security
                                </h2>
                                <div className="pl-11">
                                    <p className="leading-relaxed text-sm">
                                        We implement industry-standard security measures to protect your financial and personal data. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                                    </p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                                    <span className="bg-cyan-500/10 text-cyan-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm mr-3 border border-cyan-500/20">6</span>
                                    Children’s Privacy
                                </h2>
                                <div className="pl-11">
                                    <p className="leading-relaxed text-sm">
                                        LogicFrame is a general-audience website and can be used by individuals of all ages. We do not knowingly collect personal data from children without the intent of providing a professional tool service.
                                    </p>
                                </div>
                            </section>
                        </div>

                        {/* Section 7 - Contact */}
                        <section className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 p-8 rounded-2xl mt-8">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                <span className="bg-cyan-500/10 text-cyan-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm mr-3 border border-cyan-500/20">7</span>
                                Contact Us
                            </h2>
                            <div className="pl-11">
                                <p className="mb-6 text-slate-300">If you have questions about this Privacy Policy, please contact us at:</p>
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-slate-950 p-2 rounded-lg border border-slate-700">
                                            <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Email</p>
                                            <a href="mailto:logicframe.dev@gmail.com" className="text-white hover:text-cyan-400 transition-colors font-medium">logicframe.dev@gmail.com</a>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="bg-slate-950 p-2 rounded-lg border border-slate-700">
                                            <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Location</p>
                                            <span className="text-white font-medium">Sindh, Pakistan</span>
                                        </div>
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
