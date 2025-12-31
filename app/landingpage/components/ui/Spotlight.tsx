import React, { useRef, useState } from 'react';

interface SpotlightProps {
  children: React.ReactNode;
  className?: string;
}

export const Spotlight: React.FC<SpotlightProps> = ({ children, className = '' }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;

    const div = divRef.current;
    const rect = div.getBoundingClientRect();

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-2xl border border-white/[0.05] bg-[#0b101b] transition-colors duration-500 hover:border-white/[0.12] ${className}`}
    >
      {/* Primary Glow */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-700 ease-out"
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(0, 217, 255, 0.08), transparent 80%)`,
        }}
      />
      
      {/* Secondary Soft Ambient Light */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-1000 ease-out"
        style={{
          opacity: opacity * 0.5,
          background: `radial-gradient(800px circle at ${position.x}px ${position.y}px, rgba(255, 255, 255, 0.02), transparent 60%)`,
        }}
      />

      <div className="relative h-full z-10">{children}</div>
    </div>
  );
};

export default Spotlight;