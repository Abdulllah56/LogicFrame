import React from 'react';

const FinalCTA = () => {
  return (
    <section className="py-32 px-6 text-center" aria-labelledby="cta-heading">
      <div className="max-w-3xl mx-auto">
        <h2 id="cta-heading" className="text-5xl font-extrabold mb-6">Ready to Get Organized?</h2>
        <p className="text-xl text-slate-400 mb-10">
          Join thousands of freelancers who have simplified their business with LogicFrame.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="#tools" 
            className="bg-cyan-400 text-[#0f1729] px-10 py-4 rounded-xl font-bold text-lg hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-400/20 transition-all focus:ring-2 focus:ring-cyan-400 focus:outline-none"
            aria-label="Start using LogicFrame tools for free"
          >
            Start Using Tools for Free
          </a>
          <a 
            href="#features" 
            className="px-10 py-4 rounded-xl font-bold text-lg text-white border border-slate-700 hover:bg-slate-800 transition-all focus:ring-2 focus:ring-slate-400 focus:outline-none"
            aria-label="View LogicFrame features"
          >
            View Features
          </a>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;