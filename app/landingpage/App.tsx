import React, { Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';

// Lazy loading components below the fold for performance
const ValueGrid = lazy(() => import('./components/ValueGrid'));
const WorkflowSteps = lazy(() => import('./components/WorkflowSteps'));
const Features = lazy(() => import('./components/Features'));
const Community = lazy(() => import('./components/Community'));
const Tools = lazy(() => import('./components/Tools'));
const Pricing = lazy(() => import('./components/Pricing'));
const About = lazy(() => import('./components/About'));
const FinalCTA = lazy(() => import('./components/FinalCTA'));
const Footer = lazy(() => import('./components/Footer'));

// Simple loading fallback for sections
const SectionLoader = () => (
  <div className="w-full h-64 flex items-center justify-center opacity-20">
    <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-300">
      <Navbar />
      <main className="relative">
        <Hero />
        
        {/* Subtle section separator with glow */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent"></div>
        
        <Suspense fallback={<SectionLoader />}>
          <ValueGrid />
          
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent"></div>
          
          <WorkflowSteps />
          <Features />
          <Community />
          <Tools />
          <Pricing />
          <About />
          <FinalCTA />
        </Suspense>
      </main>
      
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      
      {/* Global Ambient Glows */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full"></div>
      </div>
    </div>
  );
};

export default App;