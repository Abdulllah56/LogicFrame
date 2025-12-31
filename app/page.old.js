
"use client";

import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Tools from './components/Tools';
import Pricing from './components/Pricing';
import About from './components/About';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';

const Home = () => {
  return (
    <>
      <div className="fixed inset-0 bg-gradient-radial from-[rgba(0,217,255,0.08)] from-0% to-transparent to-50% via-[rgba(0,217,255,0.06)] via-80% z-[-1]"></div>
      <div className="fixed w-[300px] h-[300px] bg-[rgba(0,217,255,0.3)] rounded-full blur-[80px] opacity-30 top-[10%] left-[10%] animate-float z-[-1]"></div>
      <div className="fixed w-[400px] h-[400px] bg-[rgba(0,217,255,0.2)] rounded-full blur-[80px] opacity-30 bottom-[10%] right-[10%] animate-float animation-delay-7000 z-[-1]"></div>

      <Navbar />
      <Hero />
      <Stats />
      <Tools />
      <Pricing />
      <About />
      <FinalCTA />
      <Footer />

      <style jsx global>{`
        :root {
          --primary: #00D9FF;
          --primary-dark: #00B8D9;
          --bg-dark: #0f1729;
          --bg-darker: #0a0f1e;
          --bg-card: rgba(255, 255, 255, 0.03);
          --text-primary: #ffffff;
          --text-secondary: #94a3b8;
          --border: rgba(0, 217, 255, 0.15);
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: var(--bg-dark);
          color: var(--text-primary);
          overflow-x: hidden;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-float {
          animation: float 20s infinite ease-in-out;
        }

        .animate-shimmer {
          animation: shimmer 3s infinite;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease;
        }

        .animation-delay-7000 {
          animation-delay: 7s;
        }
      `}</style>
    </>
  );
};

export default Home;