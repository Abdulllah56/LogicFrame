import React from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const StatCard = ({ number, label, suffix = "" }: { number: string; label: string; suffix?: string }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.5 });

  return (
    <div 
      ref={ref}
      className={`p-8 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm text-center transition-all duration-700 hover:border-cyan-400/30 hover:bg-white/[0.04] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <div className="text-5xl font-extrabold text-cyan-400 mb-2 font-mono">
        {number}{suffix}
      </div>
      <div className="text-slate-400 font-medium tracking-wide text-sm uppercase">{label}</div>
    </div>
  );
};

const Stats = () => {
  return (
    <section className="py-20 px-6 relative z-20">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard number="5" suffix="+" label="Professional Tools" />
          <StatCard number="100" suffix="%" label="Free to Start" />
          <StatCard number="0" label="Setup Time" />
          <StatCard number="∞" label="Possibilities" />
        </div>
      </div>
    </section>
  );
};

export default Stats;