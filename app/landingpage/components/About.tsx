import React from 'react';

const About = () => {
  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#131b2e] to-[#0f1729] p-8 md:p-12 rounded-3xl border border-slate-800 relative overflow-hidden">
        {/* Decorative Quote */}
        <div className="absolute top-8 left-8 text-8xl text-cyan-500/10 font-serif">"</div>

        <div className="relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Built by Freelancers, for Freelancers</h2>
          
          <div className="space-y-6 text-lg text-slate-300 leading-relaxed">
            <p>
              LogicFrame started from a simple frustration: existing tools were too complex, too expensive, or just didn't work right.
            </p>
            <p>
              As a freelancer myself, I needed tools that were <span className="text-cyan-400 font-semibold">simple</span>, <span className="text-cyan-400 font-semibold">fast</span>, and <span className="text-cyan-400 font-semibold">actually useful</span>. 
              So I built them. No bloat. No BS. Just tools that work.
            </p>
            <p className="text-slate-400 italic">
              Every tool is designed with one goal: help you focus on your work, not your admin tasks.
            </p>
          </div>

          <div className="mt-10">
            <a href="mailto:logicframe@gmail.com" className="inline-block border-b-2 border-cyan-400 text-cyan-400 font-bold hover:text-white hover:border-white transition-colors pb-1">
              Read our full story →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;