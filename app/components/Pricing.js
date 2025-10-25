
import React from 'react';

const Pricing = () => {
  return (
    <section className="px-[5%] py-24 bg-black/20" id="pricing">
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-[#94a3b8]">One plan. All tools. Forever.</p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8 mt-12">
          <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(0,217,255,0.15)] rounded-2xl p-10 text-center hover:-translate-y-2 transition-all">
            <div className="text-lg text-[#94a3b8] mb-4 uppercase tracking-wide">Free</div>
            <div className="text-5xl font-extrabold text-[#00D9FF] mb-2">$0<span className="text-lg text-[#94a3b8]">/month</span></div>
            <div className="text-[#94a3b8] mb-8">Perfect to get started</div>
            <ul className="list-none my-8 text-left">
              <li className="py-3 text-[#94a3b8] flex items-center gap-2 before:content-['✓'] before:text-[#00D9FF] before:font-bold before:text-lg">3 invoices per month</li>
              <li className="py-3 text-[#94a3b8] flex items-center gap-2 before:content-['✓'] before:text-[#00D9FF] before:font-bold before:text-lg">50 expense entries</li>
              <li className="py-3 text-[#94a3b8] flex items-center gap-2 before:content-['✓'] before:text-[#00D9FF] before:font-bold before:text-lg">5 background removals</li>
              <li className="py-3 text-[#94a3b8] flex items-center gap-2 before:content-['✓'] before:text-[#00D9FF] before:font-bold before:text-lg">Basic templates</li>
              <li className="py-3 text-[#94a3b8] flex items-center gap-2 before:content-['✓'] before:text-[#00D9FF] before:font-bold before:text-lg">Small watermark</li>
              <li className="py-3 text-[#94a3b8] flex items-center gap-2 before:content-['✓'] before:text-[#00D9FF] before:font-bold before:text-lg">Community support</li>
            </ul>
            <a href="#tools" className="bg-[#00D9FF] text-[#0f1729] px-8 py-3 rounded-lg font-bold no-underline hover:-translate-y-0.5 hover:shadow-[0_10px_40px_rgba(0,217,255,0.3)] hover:bg-[#00B8D9] transition-all">Start Free</a>
          </div>

          <div className="bg-[rgba(255,255,255,0.03)] border-2 border-[#00D9FF] rounded-2xl p-10 text-center scale-105 hover:-translate-y-2 hover:scale-105 transition-all shadow-[0_20px_60px_rgba(0,217,255,0.15)]">
            <div className="text-lg text-[#94a3b8] mb-4 uppercase tracking-wide">Pro</div>
            <div className="text-5xl font-extrabold text-[#00D9FF] mb-2">$9<span className="text-lg text-[#94a3b8]">/month</span></div>
            <div className="text-[#94a3b8] mb-8">Everything you need to scale</div>
            <ul className="list-none my-8 text-left">
              <li className="py-3 text-[#94a3b8] flex items-center gap-2 before:content-['✓'] before:text-[#00D9FF] before:font-bold before:text-lg">Unlimited invoices</li>
              <li className="py-3 text-[#94a3b8] flex items-center gap-2 before:content-['✓'] before:text-[#00D9FF] before:font-bold before:text-lg">Unlimited expenses</li>
              <li className="py-3 text-[#94a3b8] flex items-center gap-2 before:content-['✓'] before:text-[#00D9FF] before:font-bold before:text-lg">Unlimited background removal</li>
              <li className="py-3 text-[#94a3b8] flex items-center gap-2 before:content-['✓'] before:text-[#00D9FF] before:font-bold before:text-lg">All premium templates</li>
              <li className="py-3 text-[#94a3b8] flex items-center gap-2 before:content-['✓'] before:text-[#00D9FF] before:font-bold before:text-lg">No watermarks</li>
              <li className="py-3 text-[#94a3b8] flex items-center gap-2 before:content-['✓'] before:text-[#00D9FF] before:font-bold before:text-lg">Custom branding</li>
              <li className="py-3 text-[#94a3b8] flex items-center gap-2 before:content-['✓'] before:text-[#00D9FF] before:font-bold before:text-lg">Priority support</li>
              <li className="py-3 text-[#94a3b8] flex items-center gap-2 before:content-['✓'] before:text-[#00D9FF] before:font-bold before:text-lg">Early access to new tools</li>
            </ul>
            <a href="#tools" className="bg-[#00D9FF] text-[#0f1729] px-8 py-3 rounded-lg font-bold no-underline hover:-translate-y-0.5 hover:shadow-[0_10px_40px_rgba(0,217,255,0.3)] hover:bg-[#00B8D9] transition-all">Upgrade to Pro</a>
          </div>
        </div>

        <div className="text-center mt-12 text-[#94a3b8]">
          <p>✨ Pro tip: One Pro account unlocks ALL tools - now and future ones!</p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
