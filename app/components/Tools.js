
import React from 'react';
// import InvoiceMaker from "../invoicemaker"

const Tools = () => {
  return (
    <section className="px-[5%] py-24 max-w-[1400px] mx-auto" id="tools">
      <div className="text-center mb-16">
        <h2 className="text-5xl mb-4">Your Complete Toolkit</h2>
        <p className="text-lg text-[#94a3b8]">Everything you need to run your freelance business efficiently</p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-8">
        {/* Invoice Generator */}
        <div className="relative bg-[rgba(255,255,255,0.03)] border border-[rgba(0,217,255,0.15)] rounded-2xl p-10 hover:-translate-y-2 hover:border-[#00D9FF] hover:bg-[rgba(0,217,255,0.05)] hover:shadow-[0_20px_60px_rgba(0,217,255,0.15)] transition-all overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-[#00D9FF] before:transform before:scale-x-0 before:transition-transform hover:before:scale-x-100">
          <div className="w-[70px] h-[70px] bg-gradient-to-br from-[rgba(0,217,255,0.15)] to-[rgba(0,217,255,0.05)] border-2 border-[rgba(0,217,255,0.3)] rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden before:content-[''] before:absolute before:top-[-50%] before:left-[-50%] before:w-[200%] before:h-[200%] before:bg-gradient-to-br before:from-transparent before:via-[rgba(0,217,255,0.1)] before:to-transparent before:transform before:rotate-45 before:animate-shimmer">
            <svg viewBox="0 0 24 24" className="w-[35px] h-[35px] stroke-[#00D9FF] fill-none stroke-2 stroke-linecap-round stroke-linejoin-round relative z-[1]">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[rgba(16,185,129,0.15)] text-[#10B981] border border-[rgba(16,185,129,0.3)] mb-4">● LIVE</span>
          <h3 className="text-2xl mb-4">Invoice Generator</h3>
          <p className="text-[#94a3b8] leading-relaxed mb-6">Create professional invoices in 60 seconds. Choose from 5+ beautiful templates, add your logo, and get paid faster.</p>
          <ul className="list-none mb-6">
            <li className="py-2 text-[#94a3b8] text-sm flex items-center gap-2 before:content-['✓'] before:text-[#00D9FF] before:font-bold">5+ Professional Templates</li>
            <li className="py-2 text-[#94a3b8] text-sm flex items-center gap-2 before:content-['✓'] before:text-[#00D9FF] before:font-bold">Automatic Calculations</li>
            <li className="py-2 text-[#94a3b8] text-sm flex items-center gap-2 before:content-['✓'] before:text-[#00D9FF] before:font-bold">PDF Download</li>
            <li className="py-2 text-[#94a3b8] text-sm flex items-center gap-2 before:content-['✓'] before:text-[#00D9FF] before:font-bold">No Signup Required</li>
          </ul>
          <a href="/invoicemaker" className="inline-flex items-center gap-2 text-[#00D9FF] no-underline font-semibold hover:gap-3 transition-all after:content-['→']">Try Invoice Generator</a>
        </div>

        {/* Screenshot Beautifier */}
        <div className="relative bg-[rgba(255,255,255,0.03)] border border-[rgba(0,217,255,0.15)] rounded-2xl p-10 hover:-translate-y-2 hover:border-[#00D9FF] hover:bg-[rgba(0,217,255,0.05)] hover:shadow-[0_20px_60px_rgba(0,217,255,0.15)] transition-all overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-[#00D9FF] before:transform before:scale-x-0 before:transition-transform hover:before:scale-x-100">
          <div className="w-[70px] h-[70px] bg-gradient-to-br from-[rgba(0,217,255,0.15)] to-[rgba(0,217,255,0.05)] border-2 border-[rgba(0,217,255,0.3)] rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden before:content-[''] before:absolute before:top-[-50%] before:left-[-50%] before:w-[200%] before:h-[200%] before:bg-gradient-to-br before:from-transparent before:via-[rgba(0,217,255,0.1)] before:to-transparent before:transform before:rotate-45 before:animate-shimmer">
            <svg viewBox="0 0 24 24" className="w-[35px] h-[35px] stroke-[#00D9FF] fill-none stroke-2 stroke-linecap-round stroke-linejoin-round relative z-[1]">
              <rect x="3" y="3" width="18" height="18" rx="2"></rect>
              <path d="M3 15l5-5c.928-.893 2.072-.893 3 0l3 3"></path>
              <path d="M14 14l1-1c.928-.893 2.072-.893 3 0l3 3"></path>
              <circle cx="7.5" cy="7.5" r="1.5"></circle>
            </svg>
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[rgba(16,185,129,0.15)] text-[#10B981] border border-[rgba(16,185,129,0.3)] mb-4">● LIVE</span>
          <h3 className="text-2xl mb-4">Screenshot Beautifier</h3>
          <p className="text-[#94a3b8] leading-relaxed mb-6">Transform your screenshots into beautiful presentations. Add gradients, shadows, and frames with one click.</p>
          <ul className="list-none mb-6">
            <li className="py-2 text-[#94a3b8] text-sm flex items-center gap-2 before:content-['✓'] before:text-[#00D9FF] before:font-bold">Beautiful Frames</li>
            <li className="py-2 text-[#94a3b8] text-sm flex items-center gap-2 before:content-['✓'] before:text-[#00D9FF] before:font-bold">Custom Gradients</li>
            <li className="py-2 text-[#94a3b8] text-sm flex items-center gap-2 before:content-['✓'] before:text-[#00D9FF] before:font-bold">Shadow Effects</li>
            <li className="py-2 text-[#94a3b8] text-sm flex items-center gap-2 before:content-['✓'] before:text-[#00D9FF] before:font-bold">Instant Download</li>
          </ul>
          <a href="/ScreenshotBeautifier" className="inline-flex items-center gap-2 text-[#00D9FF] no-underline font-semibold hover:gap-3 transition-all after:content-['→']">Try Screenshot Beautifier</a>
        </div>

        {/* Expense Tracker */}
        <div className="relative bg-[rgba(255,255,255,0.03)] border border-[rgba(0,217,255,0.15)] rounded-2xl p-10 hover:-translate-y-2 hover:border-[#00D9FF] hover:bg-[rgba(0,217,255,0.05)] hover:shadow-[0_20px_60px_rgba(0,217,255,0.15)] transition-all overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-[#00D9FF] before:transform before:scale-x-0 before:transition-transform hover:before:scale-x-100">
          <div className="w-[70px] h-[70px] bg-gradient-to-br from-[rgba(0,217,255,0.15)] to-[rgba(0,217,255,0.05)] border-2 border-[rgba(0,217,255,0.3)] rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden before:content-[''] before:absolute before:top-[-50%] before:left-[-50%] before:w-[200%] before:h-[200%] before:bg-gradient-to-br before:from-transparent before:via-[rgba(0,217,255,0.1)] before:to-transparent before:transform before:rotate-45 before:animate-shimmer">
            <svg viewBox="0 0 24 24" className="w-[35px] h-[35px] stroke-[#00D9FF] fill-none stroke-2 stroke-linecap-round stroke-linejoin-round relative z-[1]">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[rgba(16,185,129,0.15)] text-[#10B981] border border-[rgba(16,185,129,0.3)] mb-4">● LIVE</span>
          <h3 className="text-2xl mb-4">Expense Tracker</h3>
          <p className="text-[#94a3b8] leading-relaxed mb-6">Track every dollar you spend. Categorize expenses, generate reports, and never lose a receipt again.</p>
          <ul className="list-none mb-6">
            <li className="py-2 text-[#94a3b8] text-sm flex items-center gap-2 before:content-['✓'] before:text-[#00D9FF] before:font-bold">Smart Categorization</li>
            <li className="py-2 text-[#94a3b8] text-sm flex items-center gap-2 before:content-['✓'] before:text-[#00D9FF] before:font-bold">Monthly Reports</li>
            <li className="py-2 text-[#94a3b8] text-sm flex items-center gap-2 before:content-['✓'] before:text-[#00D9FF] before:font-bold">Tax-Ready Exports</li>
            <li className="py-2 text-[#94a3b8] text-sm flex items-center gap-2 before:content-['✓'] before:text-[#00D9FF] before:font-bold">Receipt Storage</li>
          </ul>
          <a href="/FinanceFriend" className="inline-flex items-center gap-2 text-[#00D9FF] no-underline font-semibold hover:gap-3 transition-all after:content-['→']">Try Expense Tracker</a>
        </div>

        {/* Background Remover */}
        <div className="relative bg-[rgba(255,255,255,0.03)] border border-[rgba(0,217,255,0.15)] rounded-2xl p-10 hover:-translate-y-2 hover:border-[#00D9FF] hover:bg-[rgba(0,217,255,0.05)] hover:shadow-[0_20px_60px_rgba(0,217,255,0.15)] transition-all overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-[#00D9FF] before:transform before:scale-x-0 before:transition-transform hover:before:scale-x-100">
          <div className="w-[70px] h-[70px] bg-gradient-to-br from-[rgba(0,217,255,0.15)] to-[rgba(0,217,255,0.05)] border-2 border-[rgba(0,217,255,0.3)] rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden before:content-[''] before:absolute before:top-[-50%] before:left-[-50%] before:w-[200%] before:h-[200%] before:bg-gradient-to-br before:from-transparent before:via-[rgba(0,217,255,0.1)] before:to-transparent before:transform before:rotate-45 before:animate-shimmer">
            <svg viewBox="0 0 24 24" className="w-[35px] h-[35px] stroke-[#00D9FF] fill-none stroke-2 stroke-linecap-round stroke-linejoin-round relative z-[1]">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[rgba(251,191,36,0.15)] text-[#FBBF24] border border-[rgba(251,191,36,0.3)] mb-4">⏳ COMING SOON</span>
          <h3 className="text-2xl mb-4">Background Remover</h3>
          <p className="text-[#94a3b8] leading-relaxed mb-6">Remove backgrounds from product photos instantly. Perfect for e-commerce, portfolios, and social media.</p>
          <ul className="list-none mb-6">
            <li className="py-2 text-[#94a3b8] text-sm flex items-center gap-2 before:content-['✓'] before:text-[#00D9FF] before:font-bold">AI-Powered Removal</li>
            <li className="py-2 text-[#94a3b8] text-sm flex items-center gap-2 before:content-['✓'] before:text-[#00D9FF] before:font-bold">Batch Processing</li>
            <li className="py-2 text-[#94a3b8] text-sm flex items-center gap-2 before:content-['✓'] before:text-[#00D9FF] before:font-bold">HD Quality Output</li>
            <li className="py-2 text-[#94a3b8] text-sm flex items-center gap-2 before:content-['✓'] before:text-[#00D9FF] before:font-bold">Multiple Formats</li>
          </ul>
          <a href="#" className="inline-flex items-center gap-2 text-[#00D9FF] no-underline font-semibold hover:gap-3 transition-all after:content-['→']">Get Notified</a>
        </div>

        {/* More Coming */}
        <div className="relative bg-[rgba(255,255,255,0.03)] border border-[rgba(0,217,255,0.15)] rounded-2xl p-10 hover:-translate-y-2 hover:border-[#00D9FF] hover:bg-[rgba(0,217,255,0.05)] hover:shadow-[0_20px_60px_rgba(0,217,255,0.15)] transition-all overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-[#00D9FF] before:transform before:scale-x-0 before:transition-transform hover:before:scale-x-100">
          <div className="w-[70px] h-[70px] bg-gradient-to-br from-[rgba(0,217,255,0.15)] to-[rgba(0,217,255,0.05)] border-2 border-[rgba(0,217,255,0.3)] rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden before:content-[''] before:absolute before:top-[-50%] before:left-[-50%] before:w-[200%] before:h-[200%] before:bg-gradient-to-br before:from-transparent before:via-[rgba(0,217,255,0.1)] before:to-transparent before:transform before:rotate-45 before:animate-shimmer">
            <svg viewBox="0 0 24 24" className="w-[35px] h-[35px] stroke-[#00D9FF] fill-none stroke-2 stroke-linecap-round stroke-linejoin-round relative z-[1]">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="16 12 12 8 8 12"></polyline>
              <line x1="12" y1="16" x2="12" y2="8"></line>
            </svg>
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[rgba(251,191,36,0.15)] text-[#FBBF24] border border-[rgba(251,191,36,0.3)] mb-4">⏳ IN DEVELOPMENT</span>
          <h3 className="text-2xl mb-4">More Tools Coming</h3>
          <p className="text-[#94a3b8] leading-relaxed mb-6">We're building more tools to help you succeed. Contract templates, time tracking, client management, and more.</p>
          <ul className="list-none mb-6">
            <li className="py-2 text-[#94a3b8] text-sm flex items-center gap-2 before:content-['✓'] before:text-[#00D9FF] before:font-bold">Contract Generator</li>
            <li className="py-2 text-[#94a3b8] text-sm flex items-center gap-2 before:content-['✓'] before:text-[#00D9FF] before:font-bold">Time Tracker</li>
            <li className="py-2 text-[#94a3b8] text-sm flex items-center gap-2 before:content-['✓'] before:text-[#00D9FF] before:font-bold">Client Portal</li>
            <li className="py-2 text-[#94a3b8] text-sm flex items-center gap-2 before:content-['✓'] before:text-[#00D9FF] before:font-bold">Your Suggestions?</li>
          </ul>
          <a href="mailto:logicframe@gmail.com" className="inline-flex items-center gap-2 text-[#00D9FF] no-underline font-semibold hover:gap-3 transition-all after:content-['→']">Request a Feature</a>
        </div>
      </div>
    </section>
  );
};

export default Tools;
