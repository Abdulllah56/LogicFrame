
'use client';
import React from 'react';
import LightRays from './LightRays';

const Hero = () => {
  return (
    <section className="min-h-[90vh] flex items-center justify-center text-center px-[5%] py-16 relative">
      <div className="max-w-[1000px] z-[1]">
        <div className="inline-flex items-center gap-2 bg-[rgba(0,217,255,0.1)] border border-[rgba(0,217,255,0.15)] px-6 py-2 rounded-full text-sm mb-8 animate-fadeInUp text-[#00D9FF]">
          🚀 Built for Freelancers & Solopreneurs
        </div>
        <div className="relative">
          <div className="absolute -inset-12 -z-10">
            <LightRays
              raysOrigin="top-center"
              raysColor="#00ffff"
              raysSpeed={1.5}
              lightSpread={0.8}
              rayLength={1.2}
              followMouse={true}
              mouseInfluence={0.1}
              noiseAmount={0.1}
              distortion={0.05}
              className="custom-rays"
            />
          </div>
          <h1 className="text-6xl font-extrabold leading-tight mb-6 animate-[fadeInUp_0.8s_ease_0.2s_both]">
            The <span className="bg-gradient-to-r from-[#00D9FF] to-white bg-clip-text text-transparent">Logical Framework</span><br />
            for Your Business
          </h1>
        </div>
        <p className="text-xl text-[#94a3b8] mb-10 animate-[fadeInUp_0.8s_ease_0.4s_both] leading-relaxed">
          Professional tools to invoice clients, track expenses, and grow your business.<br />
          100% free to start. No credit card required.
        </p>
        <div className="flex gap-4 justify-center animate-[fadeInUp_0.8s_ease_0.6s_both] flex-wrap">
          <a href="#tools" className="bg-[#00D9FF] text-[#0f1729] px-8 py-3 rounded-lg font-bold no-underline hover:-translate-y-0.5 hover:shadow-[0_10px_40px_rgba(0,217,255,0.3)] hover:bg-[#00B8D9] transition-all">Explore All Tools</a>
          <a href="#pricing" className="bg-transparent border-2 border-[#00D9FF] text-[#00D9FF] px-8 py-3 rounded-lg font-bold no-underline hover:bg-[rgba(0,217,255,0.1)] hover:-translate-y-0.5 transition-all">View Pricing</a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
