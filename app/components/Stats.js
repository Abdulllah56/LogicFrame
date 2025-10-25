
import React from 'react';

const Stats = () => {
  return (
    <section className="px-[5%] py-16 max-w-[1200px] mx-auto">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-8">
        <div className="text-center p-8 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,217,255,0.15)] rounded-xl hover:-translate-y-1 hover:border-[#00D9FF] hover:bg-[rgba(0,217,255,0.05)] transition-all">
          <div className="text-5xl font-extrabold text-[#00D9FF] mb-2">3+</div>
          <div className="text-[#94a3b8] text-[0.95rem]">Professional Tools</div>
        </div>
        <div className="text-center p-8 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,217,255,0.15)] rounded-xl hover:-translate-y-1 hover:border-[#00D9FF] hover:bg-[rgba(0,217,255,0.05)] transition-all">
          <div className="text-5xl font-extrabold text-[#00D9FF] mb-2">100%</div>
          <div className="text-[#94a3b8] text-[0.95rem]">Free to Start</div>
        </div>
        <div className="text-center p-8 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,217,255,0.15)] rounded-xl hover:-translate-y-1 hover:border-[#00D9FF] hover:bg-[rgba(0,217,255,0.05)] transition-all">
          <div className="text-5xl font-extrabold text-[#00D9FF] mb-2">0</div>
          <div className="text-[#94a3b8] text-[0.95rem]">Setup Required</div>
        </div>
        <div className="text-center p-8 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,217,255,0.15)] rounded-xl hover:-translate-y-1 hover:border-[#00D9FF] hover:bg-[rgba(0,217,255,0.05)] transition-all">
          <div className="text-5xl font-extrabold text-[#00D9FF] mb-2">∞</div>
          <div className="text-[#94a3b8] text-[0.95rem]">Possibilities</div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
