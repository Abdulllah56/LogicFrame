import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 32, showText = false }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`} role="img" aria-label="LogicFrame Logo">
      <div className="relative group transition-transform duration-500 hover:scale-110">
        {/* Glow behind logo */}
        <div className="absolute inset-0 bg-cyan-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 40 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
          aria-hidden="true"
        >
          {/* Main Structural Path (The Frame) */}
          <path 
            d="M32 8V32H8V20" 
            stroke="url(#logic-frame-grad)" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="transition-all duration-700 group-hover:stroke-[5]"
          />
          
          {/* Secondary Floating Path (The Logic) */}
          <path 
            d="M8 12V8H20" 
            stroke="url(#logic-frame-grad)" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            opacity="0.5"
            className="transition-all duration-700 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1"
          />
          
          {/* The Nexus (The Core) */}
          <rect 
            x="14" 
            y="14" 
            width="6" 
            height="6" 
            rx="1.5" 
            fill="url(#logic-frame-grad)"
            className="animate-pulse"
          />
          
          <defs>
            <linearGradient id="logic-frame-grad" x1="8" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#22d3ee" />
              <stop offset="1" stopColor="#2563eb" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {showText && (
        <span className="text-xl font-bold tracking-tight text-white">
          Logic<span className="text-cyan-400">Frame</span>
        </span>
      )}
    </div>
  );
};

export default Logo;