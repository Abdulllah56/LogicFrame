import React from 'react';
import { ArrowRight, FileText, Image, DollarSign, PenTool, LayoutTemplate, Sparkles, ExternalLink, Bell } from 'lucide-react';
import Spotlight from './ui/Spotlight';

const ToolCard = ({
  title,
  desc,
  icon: Icon,
  status,
  href,
  features
}: {
  title: string;
  desc: string;
  icon: any;
  status: 'live' | 'coming-soon' | 'dev';
  href?: string;
  features: string[];
}) => {
  const isLive = status === 'live';

  return (
    <Spotlight className={`h-full group relative overflow-hidden bg-[#0f1729] border border-slate-800 transition-all duration-500 hover:border-cyan-500/30 ${!isLive ? 'opacity-80' : ''}`}>

      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      {/* Gradient Blob for Glow Effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

      <div className="relative z-10 p-8 flex flex-col h-full">
        {/* Header: Icon & Status */}
        <div className="flex justify-between items-start mb-6">
          <div className={`p-3 rounded-2xl border backdrop-blur-md transition-all duration-300 group-hover:scale-110 shadow-lg ${isLive
              ? 'bg-cyan-950/30 border-cyan-500/20 shadow-cyan-900/20'
              : 'bg-slate-800/50 border-slate-700 shadow-none'
            }`}>
            <Icon className={`w-8 h-8 ${isLive ? 'text-cyan-400' : 'text-slate-400'}`} />
          </div>

          {/* Status Indicators */}
          {status === 'live' && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/30 border border-emerald-500/20 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Live</span>
            </div>
          )}
          {status === 'coming-soon' && (
            <div className="px-3 py-1 rounded-full bg-amber-950/30 border border-amber-500/20 backdrop-blur-sm">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Coming Soon</span>
            </div>
          )}
          {status === 'dev' && (
            <div className="px-3 py-1 rounded-full bg-blue-950/30 border border-blue-500/20 backdrop-blur-sm">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">In Dev</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors duration-300 tracking-tight">{title}</h3>
          <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
        </div>

        {/* Feature Tags */}
        <div className="flex flex-wrap gap-2 mb-8 mt-auto">
          {features.map((feat, idx) => (
            <span key={idx} className="text-xs font-medium px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-slate-300 group-hover:bg-white/10 group-hover:border-white/10 transition-colors cursor-default">
              {feat}
            </span>
          ))}
        </div>

        {/* CTA / Footer */}
        <div className="pt-6 border-t border-slate-800 group-hover:border-slate-700 transition-colors flex items-center justify-between">
          {isLive ? (
            <a href={href} className="flex items-center gap-2 text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
              Launch Tool <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          ) : (
            <span className="text-sm font-medium text-slate-600 flex items-center gap-2 cursor-not-allowed">
              Notify Me <ArrowRight size={16} className="opacity-50" />
            </span>
          )}

          {isLive && (
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-cyan-500/10 group-hover:text-cyan-400 transition-all">
              <ExternalLink size={14} />
            </div>
          )}
        </div>
      </div>
    </Spotlight>
  );
};

const Tools = () => {
  return (
    <section id="tools" className="py-32 px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-24">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6">
          <Sparkles size={12} />
          <span>Complete Ecosystem</span>
        </div>
        <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-white">
          Your Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Toolkit</span>
        </h2>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Everything you need to run your freelance business efficiently. One platform, multiple solutions.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ToolCard
          title="Invoice Generator"
          desc="Create professional invoices in 60 seconds. Choose from beautiful templates, customize branding, and export to PDF instantly."
          icon={FileText}
          status="live"
          href="/invoicemaker"
          features={["PDF Export", "Auto-Math", "Custom Branding", "Multi-currency"]}
        />

        <ToolCard
          title="Screenshot Beautifier"
          desc="Transform boring screenshots into stunning social media assets. Add backgrounds, shadows, and device frames automatically."
          icon={Image}
          status="live"
          href="/screenshotbeautifier"
          features={["Gradient Backgrounds", "Device Frames", "4K Export", "Social Ready"]}
        />

        <ToolCard
          title="Finance Friend"
          desc="Complex personal finance dashboard. Track expenses, manage bills, and visualize your financial goals with interactive charts."
          icon={DollarSign}
          status="live"
          href="/FinanceFriend"
          features={["Expense Tracking", "Goal Setting", "Bill Management", "Data Viz"]}
        />

        <ToolCard
          title="Payment Chase"
          desc="Automated invoice tracking and reminder system. Never miss a payment date and keep your cash flow healthy."
          icon={Bell}
          status="live"
          href="/paymentchase"
          features={["Auto-Reminders", "Payment Tracking", "Client Management", "Reports"]}
        />

        <ToolCard
          title="AI Image Editor"
          desc="Advanced AI-powered editor for object detection, text extraction (OCR), and intelligent background removal."
          icon={Sparkles}
          status="live"
          href="/ImageEditor"
          features={["Object Detection", "Text OCR", "Background Removal", "AI Powered"]}
        />

        {/* Placeholder for future tools */}
        <div className="h-full min-h-[300px] p-8 rounded-xl border border-dashed border-slate-800 flex flex-col items-center justify-center text-center group hover:border-slate-700 hover:bg-slate-900/30 transition-all">
          <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Sparkles className="text-slate-600 group-hover:text-cyan-400 transition-colors" size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-300 mb-2">More Tools Coming</h3>
          <p className="text-slate-500 text-sm max-w-[200px]">
            We are constantly building new tools suggested by our community.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Tools;