import React, { useEffect, useState, useRef } from 'react';
import LightRays from './LightRays';
import DashboardPreview from './DashboardPreview';
import { ChevronRight, TrendingUp, Users, Activity, Sparkles } from 'lucide-react';

const MagneticButton: React.FC<{ children: React.ReactNode; href: string; className?: string; primary?: boolean }> = ({ children, href, className, primary }) => {
  const btnRef = useRef<HTMLAnchorElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!btnRef.current) return;
    const { left, top, width, height } = btnRef.current.getBoundingClientRect();
    const x = (e.clientX - (left + width / 2)) * 0.25;
    const y = (e.clientY - (top + height / 2)) * 0.25;
    setPos({ x, y });
  };

  const handleMouseLeave = () => setPos({ x: 0, y: 0 });

  return (
    <a
      ref={btnRef}
      href={href}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
      className={`relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ease-out group ${primary
          ? 'bg-cyan-400 text-[#030712] hover:shadow-[0_0_40px_rgba(0,217,255,0.4)]'
          : 'text-slate-300 border border-slate-800 hover:border-slate-600 hover:bg-white/5'
        } ${className}`}
    >
      {children}
    </a>
  );
};

const Hero = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative pt-32 pb-20 overflow-hidden min-h-screen flex flex-col items-center selection:bg-cyan-500/30"
    >
      {/* Dynamic Light Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* <LightRays
          raysOrigin="top-center"
          raysColor="#00d9ff"
          raysSpeed={0.3}
          lightSpread={0.8}
          rayLength={1.2}
          followMouse={true}
          mouseInfluence={0.15}
          noiseAmount={0.05}
          distortion={0.05}
        /> */}
        {/* Secondary ambient glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-radial-gradient from-cyan-500/5 to-transparent opacity-50 blur-[120px]"
          style={{ transform: `translate(${mousePos.x * 50}px, ${mousePos.y * 50}px) translate(-50%, -50%)` }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        {/* Premium Badge */}
        <div className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] px-4 py-2 rounded-full text-xs font-semibold mb-10 animate-fade-in-up backdrop-blur-md hover:bg-white/[0.06] transition-all cursor-default group">
          <Sparkles size={14} className="text-cyan-400 group-hover:rotate-12 transition-transform" />
          <span className="text-slate-300 tracking-wide uppercase">V2.0 Now Live — Better, Faster, Stronger</span>
        </div>

        {/* Hero Title with Reactive Gradient */}
        <h1 className="text-5xl md:text-8xl font-black leading-[1.1] mb-8 tracking-tighter text-white">
          Manage your business<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 group relative">
            with elegance.
            <span className="absolute -inset-x-4 inset-y-0 bg-cyan-400/10 blur-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></span>
          </span>
        </h1>

        <p className="text-lg md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
          The all-in-one suite for the elite freelancer.
          <span className="text-white"> Beautifully simple, powerfully functional.</span>
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-24">
          <MagneticButton href="#tools" primary>
            Get Started Free
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </MagneticButton>

          <MagneticButton href="#pricing">
            View Pricing
          </MagneticButton>
        </div>

        {/* Trusted By / Social Proof Preview */}
        <div className="flex flex-col items-center gap-4 opacity-40 hover:opacity-100 transition-opacity duration-500">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500">Crafted for modern creatives at</span>
          <div className="flex gap-8 items-center filter grayscale contrast-125">
            <span className="font-black text-xl italic">STRIPE</span>
            <span className="font-black text-xl">FIGMA</span>
            <span className="font-black text-xl">VERCEL</span>
            <span className="font-black text-xl">LINEAR</span>
          </div>
        </div>
      </div>

      {/* Main Preview */}
      <div
        className="w-full relative z-20 mt-12 transition-all duration-1000 ease-out translate-y-0"
        style={{
          transform: `translateY(${Math.max(0, scrollY * 0.1)}px)`,
          opacity: Math.max(0, 1 - scrollY / 1200)
        }}
      >
        <DashboardPreview />
      </div>

      {/* Background Decorative Blobs */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[150px] -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
    </section>
  );
};

export default Hero;