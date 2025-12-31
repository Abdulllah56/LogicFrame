import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import Logo from './ui/Logo';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full top-0 z-[100] transition-all duration-500 ${
      scrolled 
        ? 'py-3 bg-[#030712]/80 backdrop-blur-xl border-b border-white/[0.08]' 
        : 'py-6 bg-transparent border-b border-transparent'
    }`}>
      {/* Scroll Progress Line */}
      <div 
        className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent transition-all duration-150 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center">
          <a href="#" className="flex items-center">
            <Logo showText size={36} />
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-10">
            <ul className="flex gap-8 list-none m-0 p-0">
              <li><a href="#features" className="text-slate-400 text-sm font-semibold hover:text-white transition-colors">Features</a></li>
              <li><a href="#tools" className="text-slate-400 text-sm font-semibold hover:text-white transition-colors">Tools</a></li>
              <li><a href="#pricing" className="text-slate-400 text-sm font-semibold hover:text-white transition-colors">Pricing</a></li>
            </ul>
            <div className="h-4 w-px bg-slate-800"></div>
            <a href="#tools" className="group flex items-center gap-2 bg-white text-[#030712] px-5 py-2 rounded-full font-bold text-sm hover:bg-cyan-400 transition-all hover:shadow-[0_0_20px_rgba(0,217,255,0.2)]">
              Get Started
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden text-slate-300 p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-6 space-y-4 animate-fade-in">
            <a href="#features" className="block text-slate-400 hover:text-white py-2 font-medium" onClick={() => setIsMenuOpen(false)}>Features</a>
            <a href="#tools" className="block text-slate-400 hover:text-white py-2 font-medium" onClick={() => setIsMenuOpen(false)}>Tools</a>
            <a href="#pricing" className="block text-slate-400 hover:text-white py-2 font-medium" onClick={() => setIsMenuOpen(false)}>Pricing</a>
            <div className="pt-4">
              <a href="#tools" className="block w-full text-center bg-cyan-400 text-[#030712] px-6 py-3 rounded-xl font-bold" onClick={() => setIsMenuOpen(false)}>
                Get Started Free
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;