
import React from 'react';

const Footer = () => {
  return (
    <footer className="px-[5%] py-12 bg-[#0a0f1e] border-t border-[rgba(0,217,255,0.15)]">
      <div className="max-w-[1200px] mx-auto grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-8">
        <div className="footer-section">
          <h3 className="text-[#00D9FF] mb-4">LogicFrame</h3>
          <p className="text-[#94a3b8] mt-2">
            Smart tools for smart businesses. Built with ❤️ for freelancers worldwide.
          </p>
          <div className="flex gap-4 mt-4 justify-center">
            <a href="https://instagram.com/logicframe.dev" className="w-10 h-10 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,217,255,0.15)] rounded-lg flex items-center justify-center text-[#94a3b8] no-underline hover:bg-[rgba(0,217,255,0.1)] hover:border-[#00D9FF] hover:text-[#00D9FF] hover:-translate-y-1 transition-all" target="_blank">📷</a>
            <a href="https://twitter.com/logicframe" className="w-10 h-10 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,217,255,0.15)] rounded-lg flex items-center justify-center text-[#94a3b8] no-underline hover:bg-[rgba(0,217,255,0.1)] hover:border-[#00D9FF] hover:text-[#00D9FF] hover:-translate-y-1 transition-all" target="_blank">🐦</a>
            <a href="https://github.com/logicframe" className="w-10 h-10 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,217,255,0.15)] rounded-lg flex items-center justify-center text-[#94a3b8] no-underline hover:bg-[rgba(0,217,255,0.1)] hover:border-[#00D9FF] hover:text-[#00D9FF] hover:-translate-y-1 transition-all" target="_blank">💻</a>
          </div>
        </div>

        <div className="footer-section">
          <h3 className="text-[#00D9FF] mb-4">Tools</h3>
          <ul className="list-none">
            <li className="py-2"><a href="/invoice" className="text-[#94a3b8] no-underline hover:text-[#00D9FF] transition-colors">Invoice Generator</a></li>
            <li className="py-2"><a href="/expenses" className="text-[#94a3b8] no-underline hover:text-[#00D9FF] transition-colors">Expense Tracker</a></li>
            <li className="py-2"><a href="/background-remover" className="text-[#94a3b8] no-underline hover:text-[#00D9FF] transition-colors">Background Remover</a></li>
            <li className="py-2"><a href="#tools" className="text-[#94a3b8] no-underline hover:text-[#00D9FF] transition-colors">View All</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="text-[#00D9FF] mb-4">Company</h3>
          <ul className="list-none">
            <li className="py-2"><a href="#about" className="text-[#94a3b8] no-underline hover:text-[#00D9FF] transition-colors">About</a></li>
            <li className="py-2"><a href="#pricing" className="text-[#94a3b8] no-underline hover:text-[#00D9FF] transition-colors">Pricing</a></li>
            <li className="py-2"><a href="mailto:logicframe@gmail.com" className="text-[#94a3b8] no-underline hover:text-[#00D9FF] transition-colors">Contact</a></li>
            <li className="py-2"><a href="/blog" className="text-[#94a3b8] no-underline hover:text-[#00D9FF] transition-colors">Blog</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="text-[#00D9FF] mb-4">Legal</h3>
          <ul className="list-none">
            <li className="py-2"><a href="/privacy" className="text-[#94a3b8] no-underline hover:text-[#00D9FF] transition-colors">Privacy Policy</a></li>
            <li className="py-2"><a href="/terms" className="text-[#94a3b8] no-underline hover:text-[#00D9FF] transition-colors">Terms of Service</a></li>
            <li className="py-2"><a href="/refunds" className="text-[#94a3b8] no-underline hover:text-[#00D9FF] transition-colors">Refund Policy</a></li>
          </ul>
        </div>
      </div>

      <div className="text-center mt-12 pt-8 border-t border-[rgba(0,217,255,0.15)] text-[#94a3b8]">
        <p>© 2025 LogicFrame.</p>
      </div>
    </footer>
  );
};

export default Footer;
