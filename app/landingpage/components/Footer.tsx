import React from 'react';
import { Twitter, Github, Instagram, Heart } from 'lucide-react';
import Logo from './ui/Logo';

const Footer = () => {
  return (
    <footer className="bg-[#050914] border-t border-slate-800 pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div>
            <div className="mb-4">
              <Logo showText size={32} />
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Smart tools for smart businesses. Helping freelancers succeed one tool at a time.
            </p>
            <div className="flex gap-4">
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-cyan-400 transition-colors"><Twitter size={20} /></a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-cyan-400 transition-colors"><Github size={20} /></a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-cyan-400 transition-colors"><Instagram size={20} /></a>
            </div>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-white font-bold mb-4">Popular Tools</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="/invoicemaker" className="hover:text-cyan-400 transition-colors">Invoice Generator</a></li>
              <li><a href="/screenshotbeautifier" className="hover:text-cyan-400 transition-colors">Screenshot Beautifier</a></li>
              <li><a href="/expenses" className="hover:text-cyan-400 transition-colors">Expense Tracker</a></li>
              <li><a href="#tools" className="hover:text-cyan-400 transition-colors">View All</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-bold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#about" className="hover:text-cyan-400 transition-colors">About Us</a></li>
              <li><a href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Blog</a></li>
              <li><a href="mailto:contact@logicframe.com" className="hover:text-cyan-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-bold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="/privacy-policy" className="hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
              <li><a href="/terms-of-service" className="hover:text-cyan-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">© 2025 LogicFrame. All rights reserved.</p>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <span>Made with</span>
            <Heart size={14} className="text-red-500 fill-red-500" />
            <span>by Freelancers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;