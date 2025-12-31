"use client";
import React, { useRef, useEffect, useState } from "react";
import CanvasArea from "./components/CanvasArea";
import ControlsPanel from "./components/ControlsPanel";
import { initBeautifier } from "./lib/beautifier";

export default function Page() {
  const canvasRef = useRef(null);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    initBeautifier(canvasRef);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className={theme}>
      <div className="fixed inset-0 bg-[#f8fafc] dark:bg-[#0f1729] transition-colors duration-300 z-[-2]"></div>

      <div className="fixed inset-0 bg-gradient-radial from-[rgba(0,217,255,0.05)] from-0% to-transparent to-50% opacity-100 dark:from-[rgba(0,217,255,0.08)] dark:via-[rgba(0,217,255,0.06)] z-[-1]"></div>
      <div className="fixed w-[300px] h-[300px] bg-[rgba(0,217,255,0.2)] dark:bg-[rgba(0,217,255,0.3)] rounded-full blur-[80px] opacity-20 dark:opacity-30 top-[10%] left-[10%] animate-float z-[-1]"></div>
      <div className="fixed w-[400px] h-[400px] bg-[rgba(0,217,255,0.15)] dark:bg-[rgba(0,217,255,0.2)] rounded-full blur-[80px] opacity-20 dark:opacity-30 bottom-[10%] right-[10%] animate-float animation-delay-7000 z-[-1]"></div>

      <main className="flex flex-col md:flex-row gap-4 h-screen p-6 text-slate-800 dark:text-white overflow-hidden transition-colors duration-300">
        <section className="flex-1 flex justify-center items-center relative z-10">
          <CanvasArea canvasRef={canvasRef} />
        </section>
        <aside className="w-full md:w-[320px] bg-white/80 dark:bg-[#0f1729]/80 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2rem] shadow-2xl flex flex-col relative z-10 transition-all duration-300 overflow-hidden">
          <div className="p-4 py-3 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-black/20">
            <h1 className="text-sm font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 uppercase tracking-tighter">
              LogicFrame <span className="text-[#00D9FF]">UI</span>
            </h1>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all shadow-sm active:scale-90"
              title="Toggle Theme"
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
              )}
            </button>
          </div>
          <ControlsPanel />
        </aside>
      </main>

      <style jsx global>{`
        :root {
          --primary: #00D9FF;
          --primary-dark: #00B8D9;
        }
        
        .dark {
          --bg-dark: #0f1729;
          --bg-card: rgba(255, 255, 255, 0.03);
          --text-primary: #ffffff;
          --border: rgba(0, 217, 255, 0.15);
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        .animate-float {
          animation: float 20s infinite ease-in-out;
        }

        .animation-delay-7000 {
          animation-delay: 7s;
        }
      `}</style>
    </div>
  );
}
