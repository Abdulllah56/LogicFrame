"use client";

import React, { Suspense, lazy } from 'react';
import Navbar from './landingpage/components/Navbar';
import Hero from './landingpage/components/Hero';

// Lazy loading components below the fold for performance
const ValueGrid = lazy(() => import('./landingpage/components/ValueGrid'));
const WorkflowSteps = lazy(() => import('./landingpage/components/WorkflowSteps'));
const Features = lazy(() => import('./landingpage/components/Features'));
const Community = lazy(() => import('./landingpage/components/Community'));
const Tools = lazy(() => import('./landingpage/components/Tools'));
const Pricing = lazy(() => import('./landingpage/components/Pricing'));
const About = lazy(() => import('./landingpage/components/About'));
const FinalCTA = lazy(() => import('./landingpage/components/FinalCTA'));
const Footer = lazy(() => import('./landingpage/components/Footer'));

// Simple loading fallback for sections
const SectionLoader = () => (
    <div className="w-full h-64 flex items-center justify-center opacity-20">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
);

const LandingPage: React.FC = () => {
    return (
        <>
            <div className="min-h-screen bg-[#030712] text-slate-300 font-sans noise">
                <Navbar />
                <main className="relative">
                    <Hero />

                    {/* Subtle section separator with glow */}
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent"></div>

                    <Suspense fallback={<SectionLoader />}>
                        <ValueGrid />

                        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent"></div>

                        <WorkflowSteps />
                        <Features />
                        <Community />
                        <Tools />
                        <Pricing />
                        <About />
                        <FinalCTA />
                    </Suspense>
                </main>

                <Suspense fallback={null}>
                    <Footer />
                </Suspense>

                {/* Global Ambient Glows */}
                <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
                    <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/5 blur-[120px] rounded-full"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full"></div>
                </div>
            </div>

            <style jsx global>{`
        :root {
            --bg-main: #030712;
            --text-main: #f8fafc;
        }
        
        .noise::before {
            content: "";
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            opacity: 0.04;
            z-index: 9999;
            pointer-events: none;
            background-image: url("https://grainy-gradients.vercel.app/noise.svg");
        }

        .glass-panel {
            background: rgba(255, 255, 255, 0.01);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.05);
        }

        @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-100%); }
        }
        @keyframes marquee2 {
            0% { transform: translateX(100%); }
            100% { transform: translateX(0%); }
        }
        .animate-marquee { animation: marquee 40s linear infinite; }
        .animate-marquee2 { animation: marquee2 40s linear infinite; }

        ::selection { background: rgba(0, 217, 255, 0.3); color: #fff; }

        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: var(--bg-main); }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>
        </>
    );
};

export default LandingPage;
