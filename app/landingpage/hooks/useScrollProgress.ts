import { useState, useEffect, RefObject } from 'react';

export const useScrollProgress = (ref: RefObject<HTMLElement>) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      
      const rect = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementHeight = rect.height;
      
      // Calculate how much of the element has been scrolled past the top of the viewport
      const start = windowHeight;
      const end = -elementHeight;
      
      const rawProgress = (windowHeight - rect.top) / (windowHeight + elementHeight);
      
      setProgress(Math.max(0, Math.min(1, rawProgress)));
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [ref]);

  return progress;
};