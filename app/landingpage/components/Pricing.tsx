import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const PricingItem = ({ text }: { text: string }) => (
  <li className="flex items-center gap-3 text-slate-300 py-2">
    <CheckCircle2 size={20} className="text-cyan-400 shrink-0" />
    <span>{text}</span>
  </li>
);

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 px-6 bg-gradient-to-b from-[#0f1729] to-[#0a0f1e]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-slate-400 text-lg">Start for free, upgrade as you grow.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-[#131b2e] border border-slate-800 rounded-3xl p-10 hover:border-slate-600 transition-colors">
            <div className="text-slate-400 font-semibold uppercase tracking-wider text-sm mb-4">Starter</div>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-5xl font-extrabold text-white">$0</span>
              <span className="text-slate-400">/month</span>
            </div>
            <p className="text-slate-400 mb-8 pb-8 border-b border-slate-800">Perfect for freelancers just starting out.</p>
            
            <ul className="space-y-2 mb-10">
              <PricingItem text="3 Invoices per month" />
              <PricingItem text="50 Expense entries" />
              <PricingItem text="Basic Export formats" />
              <PricingItem text="Community Support" />
            </ul>

            <button className="w-full py-4 rounded-xl border border-cyan-400 text-cyan-400 font-bold hover:bg-cyan-400/10 transition-colors">
              Start for Free
            </button>
          </div>

          {/* Pro Plan */}
          <div className="relative bg-[#131b2e] border border-cyan-500 rounded-3xl p-10 shadow-[0_0_40px_rgba(0,217,255,0.1)] transform md:scale-105 z-10">
            <div className="absolute top-0 right-0 bg-cyan-500 text-[#0f1729] text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">POPULAR</div>
            <div className="text-cyan-400 font-semibold uppercase tracking-wider text-sm mb-4">Pro Bundle</div>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-5xl font-extrabold text-white">$9</span>
              <span className="text-slate-400">/month</span>
            </div>
            <p className="text-slate-300 mb-8 pb-8 border-b border-slate-800">Unlimited access to every current and future tool.</p>
            
            <ul className="space-y-2 mb-10">
              <PricingItem text="Unlimited Invoices" />
              <PricingItem text="Unlimited Expense Tracking" />
              <PricingItem text="Pro Screenshot Templates" />
              <PricingItem text="Remove Watermarks" />
              <PricingItem text="Priority Support" />
              <PricingItem text="Early Access to New Tools" />
            </ul>

            <button className="w-full py-4 rounded-xl bg-cyan-400 text-[#0f1729] font-bold hover:bg-cyan-300 shadow-lg hover:shadow-cyan-400/25 transition-all">
              Get Pro Access
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;