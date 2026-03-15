import React, { useState, useRef, useEffect } from 'react';
import { MoveHorizontal, ShieldCheck, CreditCard, FileText, Check } from 'lucide-react';
import Logo from './ui/Logo';

const TransformationSection = () => {
   const [sliderPosition, setSliderPosition] = useState(50);
   const [isDragging, setIsDragging] = useState(false);
   const containerRef = useRef<HTMLDivElement>(null);

   const handleMove = (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;
      setSliderPosition(percentage);
   };

   const handleMouseDown = () => setIsDragging(true);
   const handleTouchStart = () => setIsDragging(true);

   useEffect(() => {
      const handleMouseUp = () => setIsDragging(false);
      const handleMouseMove = (e: MouseEvent) => {
         if (isDragging) handleMove(e.clientX);
      };
      const handleTouchMove = (e: TouchEvent) => {
         if (isDragging) handleMove(e.touches[0].clientX);
      };

      if (isDragging) {
         window.addEventListener('mousemove', handleMouseMove);
         window.addEventListener('mouseup', handleMouseUp);
         window.addEventListener('touchmove', handleTouchMove);
         window.addEventListener('touchend', handleMouseUp);
      }

      return () => {
         window.removeEventListener('mousemove', handleMouseMove);
         window.removeEventListener('mouseup', handleMouseUp);
         window.removeEventListener('touchmove', handleTouchMove);
         window.removeEventListener('touchend', handleMouseUp);
      };
   }, [isDragging]);

   return (
      <section className="py-24 px-6 max-w-7xl mx-auto overflow-hidden">
         <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
               Upgrade Your <span className="text-cyan-400">Professionalism</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
               Clients judge you by your paperwork. See the difference between manual chaos and automated clarity.
            </p>
         </div>

         <div
            ref={containerRef}
            className="relative w-full max-w-5xl mx-auto h-[600px] md:h-[650px] rounded-3xl overflow-hidden border border-slate-700 shadow-2xl select-none cursor-ew-resize group"
            onMouseDown={(e) => { handleMouseDown(); handleMove(e.clientX); }}
            onTouchStart={(e) => { handleTouchStart(); handleMove(e.touches[0].clientX); }}
         >
            {/* =========================================================
            RIGHT SIDE: PROFESSIONAL (LogicFrame)
            Theme: Dark, Glassmorphism, Neon Accents, Structured
            Z-INDEX: 10 (Bottom Layer)
           ========================================================= */}
            <div className="absolute inset-0 bg-[#0b101b] flex items-center justify-center z-10">
               {/* Background Grid & Glow */}
               <div className="absolute inset-0 bg-[linear-gradient(rgba(19,27,46,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(19,27,46,0.5)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]"></div>

               {/* Professional Invoice UI */}
               <div className="relative w-[340px] md:w-[420px] bg-[#131b2e]/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden transform transition-transform duration-500 hover:scale-[1.02]">

                  {/* Status Bar */}
                  <div className="bg-emerald-500/10 border-b border-emerald-500/20 p-3 flex justify-between items-center px-6">
                     <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold tracking-wider uppercase">
                        <Check size={14} />
                        <span>Automated & Error-Free</span>
                     </div>
                     <div className="text-xs text-slate-400 font-mono">ID: #LF-8821</div>
                  </div>

                  <div className="p-8">
                     {/* Header / Branding */}
                     <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-3">
                           <Logo size={40} />
                           <div>
                              <div className="text-white font-bold text-base">LogicFrame Design</div>
                              <div className="text-slate-400 text-xs">billing@logicframe.com</div>
                           </div>
                        </div>
                        <div className="text-right">
                           <div className="text-slate-400 text-xs uppercase mb-1">Due Date</div>
                           <div className="text-white font-medium text-sm">Oct 24, 2025</div>
                        </div>
                     </div>

                     {/* Client Section */}
                     <div className="flex justify-between mb-8 pb-8 border-b border-slate-800">
                        <div>
                           <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Bill To</div>
                           <div className="text-white font-medium">Acme Corporation</div>
                           <div className="text-slate-500 text-xs">100 Innovation Dr.</div>
                        </div>
                        <div className="text-right">
                           <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300">
                              <ShieldCheck size={10} className="text-emerald-400" /> Verified Merchant
                           </div>
                        </div>
                     </div>

                     {/* Structured Line Items */}
                     <div className="space-y-4 mb-8">
                        {/* Header Row */}
                        <div className="grid grid-cols-4 text-[10px] text-slate-500 uppercase tracking-widest pb-2">
                           <div className="col-span-2">Description</div>
                           <div className="text-right">Hrs</div>
                           <div className="text-right">Amount</div>
                        </div>

                        {/* Item 1 */}
                        <div className="grid grid-cols-4 items-center py-2 border-b border-slate-800/50">
                           <div className="col-span-2">
                              <div className="text-white text-sm font-medium">UI/UX Design Phase 1</div>
                              <div className="text-slate-500 text-[10px]">Figma Prototyping</div>
                           </div>
                           <div className="text-right text-slate-300 text-sm">20</div>
                           <div className="text-right text-white font-mono text-sm">$2,500.00</div>
                        </div>

                        {/* Total */}
                        <div className="flex justify-between items-center pt-2">
                           <span className="text-slate-400 text-sm">Total Due</span>
                           <span className="text-2xl text-cyan-400 font-bold font-mono">$2,500.00</span>
                        </div>
                     </div>

                     {/* Action */}
                     <button className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                        <CreditCard size={18} /> Pay Securely Online
                     </button>

                     <div className="mt-4 text-center text-[10px] text-slate-600">
                        Accepts Visa, Mastercard, AMEX • 256-bit SSL Encrypted
                     </div>
                  </div>
               </div>

               {/* Label */}
               <div className="absolute top-1/2 right-10 translate-x-1/2 -translate-y-1/2 rotate-90 text-slate-800 font-bold text-8xl opacity-10 pointer-events-none hidden md:block">
                  PRO
               </div>
            </div>


            {/* =========================================================
            LEFT SIDE: AMATEUR (The "Word Doc")
            Theme: Times New Roman, Text Editor UI, Formatting Errors
            Z-INDEX: 20 (Top Layer, clipped)
           ========================================================= */}
            <div
               className="absolute inset-0 bg-[#e5e7eb] overflow-hidden z-20"
               style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
               <div className="absolute inset-0 flex items-center justify-center bg-[#e5e7eb]">
                  {/* Simple Header */}
                  <div className="absolute top-0 left-0 right-0 h-10 bg-white border-b border-gray-200 flex items-center px-4 shadow-sm z-10">
                     <div className="text-xs text-gray-500">Invoice - Created on Google Docs</div>
                  </div>

                  {/* The "Document" */}
                  <div className="relative w-[340px] md:w-[420px] h-[500px] bg-white text-black shadow-xl mt-8 p-8">

                     {/* Content */}
                     <div className="mb-6">
                        <h1 className="text-xl font-bold mb-4">INVOICE</h1>
                        <div className="space-y-1 text-sm mb-4">
                           <p><span className="font-bold">From:</span> Alex Johnson</p>
                           <p><span className="font-bold">Email:</span> alex@example.com</p>
                           <p><span className="font-bold">Date:</span> March 10, 2026</p>
                        </div>
                        <div className="border-t border-gray-300 pt-4 space-y-1 text-sm">
                           <p><span className="font-bold">Bill To:</span></p>
                           <p>John Smith</p>
                           <p className="text-gray-500 text-xs">(No company details recorded)</p>
                        </div>
                     </div>

                     {/* Line Items - More realistic but vague */}
                     <div className="border border-gray-300 mb-6">
                        <div className="flex border-b border-gray-300 bg-gray-50 text-xs font-bold">
                           <div className="flex-1 p-2">Description</div>
                           <div className="w-20 p-2 text-right">Amount</div>
                        </div>
                        <div className="flex border-b border-gray-300 p-2 text-sm">
                           <div className="flex-1">
                              <div>Website Project</div>
                              <div className="text-xs text-gray-500">Design & Development</div>
                           </div>
                           <div className="w-20 text-right">$3,500.00</div>
                        </div>
                        <div className="flex border-b border-gray-300 p-2 text-sm">
                           <div className="flex-1">
                              <div>Revisions</div>
                              <div className="text-xs text-gray-500">Additional changes</div>
                           </div>
                           <div className="w-20 text-right">$800.00</div>
                        </div>
                     </div>

                     <div className="text-right font-bold mb-6">
                        <span className="text-lg">Total: $4,300.00</span>
                     </div>

                     {/* Generic Payment Instructions */}
                     <div className="bg-gray-50 p-3 rounded text-sm border border-gray-200 mb-4">
                        <p className="font-bold mb-2">Payment Due: April 10, 2026</p>
                        <p className="text-xs text-gray-600">
                           Please send payment via bank transfer to the account details to be provided separately.
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                           No invoice tracking or payment reminders set up.
                        </p>
                     </div>

                     {/* Missing elements callout */}
                     <div className="text-xs text-gray-500 border-t border-gray-200 pt-3">
                        <p>❌ No payment portal</p>
                        <p>❌ No automatic reminders</p>
                        <p>❌ Manual follow-up required</p>
                     </div>
                  </div>

                  {/* Label */}
                  <div className="absolute bottom-20 left-10 text-gray-400 hidden md:block">
                     <div className="text-5xl font-extrabold text-slate-400/20 mb-2 uppercase">Basic</div>
                  </div>
               </div>
            </div>

            {/* SLIDER HANDLE */}
            <div
               className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-30 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]"
               style={{ left: `${sliderPosition}%` }}
            >
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform border-4 border-gray-100">
                  <MoveHorizontal className="text-slate-900" size={24} />
               </div>
               {/* Slider Line Gradient */}
               <div className="absolute inset-y-0 -left-px w-[2px] bg-gradient-to-b from-transparent via-cyan-400 to-transparent"></div>
            </div>

         </div>
      </section>
   );
};

export default TransformationSection;