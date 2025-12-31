import React from 'react';
import { Zap, Shield, Users, BarChart3, Globe, Lock, Command } from 'lucide-react';
import Spotlight from './ui/Spotlight';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const Features = () => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section id="features" className="py-24 px-6 bg-[#0a0f1e]" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Engineered for Growth</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            A suite of powerful features designed to help you scale from day one.
          </p>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          
          {/* Large Card 1 */}
          <Spotlight className="md:col-span-2 p-8 flex flex-col justify-between h-80 group">
             <div className="relative z-10">
               <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4 group-hover:bg-cyan-500/20 transition-colors">
                  <BarChart3 size={20} />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">Real-time Analytics</h3>
               <p className="text-slate-400 text-sm max-w-md">Track your income, expenses, and tax obligations with live-updating charts and reports that make sense.</p>
             </div>
             {/* Mini Visual: Animated Graph */}
             <div className="h-32 w-full mt-4 flex items-end gap-1 overflow-hidden mask-gradient-b">
                {[30, 45, 35, 60, 50, 75, 65, 90, 80, 55, 70, 40, 55, 30].map((h, i) => (
                   <div key={i} className="flex-1 bg-cyan-500/20 rounded-t-sm relative group-hover:bg-cyan-500/30 transition-colors" style={{ height: `${h}%` }}>
                     <div className="absolute top-0 w-full h-1 bg-cyan-400 opacity-50"></div>
                   </div>
                ))}
             </div>
          </Spotlight>

          {/* Small Card 2 */}
          <Spotlight className="p-8 h-80 group">
             <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 group-hover:bg-emerald-500/20 transition-colors">
                  <Shield size={20} />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">Bank-Grade Security</h3>
             <p className="text-slate-400 text-sm mb-6">Your financial data is encrypted at rest and in transit.</p>
             
             {/* Mini Visual: Lock Animation */}
             <div className="flex justify-center items-center mt-4">
                <div className="relative">
                  <Lock size={48} className="text-slate-700 group-hover:text-emerald-500 transition-colors duration-500" />
                  <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
                </div>
             </div>
          </Spotlight>

          {/* Small Card 3 */}
          <Spotlight className="p-8 h-80 group">
             <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 mb-4 group-hover:bg-violet-500/20 transition-colors">
                  <Globe size={20} />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">Work from Anywhere</h3>
             <p className="text-slate-400 text-sm">Cloud-synced data means your office is wherever you are.</p>

             {/* Mini Visual: Map Dots */}
             <div className="grid grid-cols-6 gap-2 mt-8 opacity-30 group-hover:opacity-60 transition-opacity">
                {[...Array(18)].map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${Math.random() > 0.7 ? 'bg-violet-400 animate-pulse' : 'bg-slate-600'}`}></div>
                ))}
             </div>
          </Spotlight>

          {/* Large Card 4 */}
          <Spotlight className="md:col-span-2 p-8 flex flex-col md:flex-row gap-6 md:items-center h-auto md:h-80 group">
             <div className="flex-1 relative z-10">
               <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 group-hover:bg-amber-500/20 transition-colors">
                  <Zap size={20} />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">Instant Invoicing</h3>
               <p className="text-slate-400 text-sm">Create and send professional invoices in seconds. No account required for basic tools.</p>
             </div>
             
             {/* Mini Visual: Invoice Preview */}
             <div className="w-full md:w-1/2 bg-[#0f1729] border border-slate-700 rounded-lg p-4 rotate-3 group-hover:rotate-0 transition-transform duration-500 shadow-xl">
                <div className="flex justify-between mb-4">
                  <div className="w-8 h-8 bg-slate-800 rounded"></div>
                  <div className="text-right">
                    <div className="w-16 h-2 bg-slate-800 rounded mb-1 ml-auto"></div>
                    <div className="w-10 h-2 bg-slate-800 rounded ml-auto"></div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                   <div className="w-full h-2 bg-slate-800/50 rounded"></div>
                   <div className="w-full h-2 bg-slate-800/50 rounded"></div>
                   <div className="w-2/3 h-2 bg-slate-800/50 rounded"></div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                   <div className="w-12 h-2 bg-slate-800 rounded"></div>
                   <div className="w-16 h-4 bg-amber-500/20 rounded"></div>
                </div>
             </div>
          </Spotlight>

        </div>
      </div>
    </section>
  );
};

export default Features;