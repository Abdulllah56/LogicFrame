import React, { useRef, useState } from 'react';
import { BarChart3, Users, DollarSign, TrendingUp, MoreHorizontal, Bell, Search } from 'lucide-react';

const DashboardPreview = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -5; // Invert for natural feel
    const rotateY = ((x - centerX) / centerX) * 5;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  return (
    <div 
      className="perspective-1000 w-full max-w-5xl mx-auto mt-16 px-4"
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      ref={containerRef}
    >
      <div 
        className="relative bg-[#0f1729] border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden transition-transform duration-200 ease-out"
        style={{ 
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Fake Browser Toolbar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-[#131b2e]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
          </div>
          <div className="flex-1 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#0f1729] border border-slate-800 text-[10px] text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              app.logicframe.com/dashboard
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex h-[400px] md:h-[500px]">
          {/* Sidebar */}
          <div className="w-16 md:w-64 border-r border-slate-800 bg-[#131b2e]/50 p-4 hidden sm:block">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-2 w-3/4 bg-slate-800 rounded animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
              ))}
            </div>
            <div className="mt-8 space-y-4">
              <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <div className="h-2 w-1/2 bg-cyan-500/30 rounded mb-2"></div>
                <div className="h-2 w-3/4 bg-slate-700 rounded"></div>
              </div>
            </div>
          </div>

          {/* Main Area */}
          <div className="flex-1 p-6 overflow-hidden relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Overview</h3>
                <p className="text-slate-500 text-sm">Welcome back, Alex</p>
              </div>
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-slate-800 text-slate-400"><Search size={16}/></div>
                <div className="p-2 rounded-lg bg-slate-800 text-slate-400"><Bell size={16}/></div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: "Revenue", val: "$12,450", change: "+12%", color: "text-emerald-400" },
                { label: "Invoices", val: "45", change: "+5", color: "text-blue-400" },
                { label: "Pending", val: "$3,200", change: "-2%", color: "text-amber-400" },
              ].map((stat, i) => (
                <div key={i} className="p-4 rounded-xl bg-[#131b2e] border border-slate-800 group hover:border-slate-700 transition-colors">
                  <div className="text-slate-500 text-xs uppercase tracking-wider mb-2">{stat.label}</div>
                  <div className="text-xl font-bold text-white mb-1">{stat.val}</div>
                  <div className={`text-xs ${stat.color}`}>{stat.change} vs last month</div>
                </div>
              ))}
            </div>

            {/* Chart Area */}
            <div className="p-4 rounded-xl bg-[#131b2e] border border-slate-800 h-48 relative overflow-hidden group">
               <div className="flex justify-between items-center mb-4">
                 <div className="text-sm font-semibold text-slate-300">Revenue Flow</div>
                 <MoreHorizontal size={16} className="text-slate-500" />
               </div>
               
               {/* CSS Only Chart */}
               <div className="flex items-end justify-between h-32 gap-2 px-2">
                 {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                   <div key={i} className="w-full bg-cyan-500/10 rounded-t-sm relative overflow-hidden group-hover:bg-cyan-500/20 transition-colors duration-500" style={{ height: `${h}%` }}>
                      <div className="absolute bottom-0 left-0 right-0 top-0 bg-gradient-to-t from-cyan-500/40 to-transparent opacity-50"></div>
                      {/* Animated Bar Top */}
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_10px_rgba(0,217,255,0.5)]"></div>
                   </div>
                 ))}
               </div>
            </div>

            {/* Floating Notification */}
            <div className="absolute bottom-6 right-6 p-4 rounded-lg bg-slate-900/90 border border-slate-700 shadow-xl backdrop-blur-md flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
               <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                 <DollarSign size={16} />
               </div>
               <div>
                 <div className="text-sm font-bold text-white">Invoice Paid</div>
                 <div className="text-xs text-slate-400">$850.00 from Acme Corp</div>
               </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Glow Effect under the dashboard */}
      <div className="absolute -inset-4 bg-cyan-500/20 blur-3xl -z-10 rounded-[3rem] opacity-30"></div>
    </div>
  );
};

export default DashboardPreview;