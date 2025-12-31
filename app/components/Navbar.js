
import React from 'react';

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center px-[5%] py-6 bg-[rgba(15,23,41,0.9)] backdrop-blur-md border-b border-[rgba(0,217,255,0.15)] sticky top-0 z-[100]">
      <div className="flex items-center gap-3 text-2xl font-bold">
        <a href="/" className="flex items-center gap-3 no-underline">
          <img src="/Logic%20Frame.png" alt="LogicFrame" className="w-[42px] h-[42px] object-contain rounded-[8px]" />
          <span>LogicFrame</span>
        </a>
      </div>
      <ul className="flex gap-10 items-center list-none max-md:hidden">
        <li><a href="#tools" className="text-[#94a3b8] no-underline text-[0.95rem] font-medium hover:text-[#00D9FF] transition-colors">Tools</a></li>
        <li><a href="#pricing" className="text-[#94a3b8] no-underline text-[0.95rem] font-medium hover:text-[#00D9FF] transition-colors">Pricing</a></li>
        <li><a href="#about" className="text-[#94a3b8] no-underline text-[0.95rem] font-medium hover:text-[#00D9FF] transition-colors">About</a></li>
      </ul>
      <a href="#tools" className="bg-[#00D9FF] text-[#0f1729] px-8 py-3 rounded-lg font-bold no-underline hover:-translate-y-0.5 hover:shadow-[0_10px_40px_rgba(0,217,255,0.3)] hover:bg-[#00B8D9] transition-all">Get Started Free</a>
    </nav>
  );
};

export default Navbar;