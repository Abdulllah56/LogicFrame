"use client";

import React from "react";
import { Send } from "lucide-react";

export default function PortalHeader({ brandName = "Portflow", subtitle }) {
  return (
    <header className="border-b border-white/[0.06] bg-[#030712]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-[#030712] shadow-lg shadow-cyan-500/20">
            <Send size={16} />
          </div>
          <div>
            <span className="text-lg font-black text-white tracking-tight">
              {brandName}
            </span>
            {subtitle && (
              <p className="text-[11px] text-slate-500 font-medium">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Powered by{" "}
          <span className="text-cyan-400 font-bold">LogicFrame</span>
        </div>
      </div>
    </header>
  );
}
