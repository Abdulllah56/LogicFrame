import React, { useRef, useState, useEffect } from 'react';
import { Clock, CheckCircle, ArrowRight, Sparkles, CreditCard, Pause, Play } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: "Capture",
    subtitle: "Everything starts with a lead.",
    description: "Don't let ideas or clients slip away. Quickly jot down project details, estimate costs, and send professional proposals in seconds.",
    color: "bg-blue-500",
    icon: Sparkles
  },
  {
    id: 2,
    title: "Track",
    subtitle: "Every minute counts.",
    description: "Log your hours effortlessly. Our smart timer detects when you're working and categorizes your time automatically.",
    color: "bg-amber-500",
    icon: Clock
  },
  {
    id: 3,
    title: "Monetize",
    subtitle: "Get paid what you're worth.",
    description: "Turn tracked time into invoices with one click. Send them out, track views, and accept payments instantly via Stripe or PayPal.",
    color: "bg-emerald-500",
    icon: CreditCard
  }
];

const StepVisual = ({ step, index }: { step: typeof steps[0], index: number }) => {
  // Timer State for 'Track' Step (index 1)
  const [timeInSeconds, setTimeInSeconds] = useState(8075); // Start at 02:14:35
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    // Only run logic for the 'Track' step
    if (index !== 1) return;

    let interval: number;
    if (isRunning) {
      interval = window.setInterval(() => {
        setTimeInSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [index, isRunning]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="h-full w-full bg-[#131b2e]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col shadow-2xl overflow-hidden relative group transition-all hover:border-white/20">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className={`p-3 rounded-xl bg-slate-800 ${step.color.replace('bg-', 'text-')} bg-opacity-20`}>
          <step.icon size={24} />
        </div>
        <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">Step 0{step.id}</div>
      </div>

      {/* Dynamic Body Content based on Step */}
      <div className="flex-1 relative z-10">
        {index === 0 && (
          <div className="space-y-4">
            <div className="bg-[#0f1729] p-4 rounded-xl border border-slate-800 transform transition-transform group-hover:scale-105 duration-300 hover:border-blue-500/30 cursor-pointer">
              <div className="text-xs text-slate-500 mb-1">Project Name</div>
              <div className="text-slate-200 font-medium">Website Redesign</div>
            </div>
            <div className="bg-[#0f1729] p-4 rounded-xl border border-slate-800 transform transition-transform group-hover:scale-105 duration-300 delay-75 hover:border-blue-500/30 cursor-pointer">
              <div className="text-xs text-slate-500 mb-1">Client</div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-400"></div>
                <span className="text-slate-200">Acme Corp.</span>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-500 hover:text-white transition-colors">
                Create Project <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {index === 1 && (
          <div className="flex flex-col items-center justify-center h-full py-4">
            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full border-4 border-slate-800 flex items-center justify-center relative mb-8 group-hover:border-amber-500/30 transition-colors">
              {isRunning && (
                <div className="absolute inset-0 border-4 border-amber-500 rounded-full border-t-transparent animate-spin" style={{ animationDuration: '3s' }}></div>
              )}
              {!isRunning && (
                 <div className="absolute inset-0 border-4 border-slate-700/30 rounded-full border-t-amber-500/50 transform rotate-12"></div>
              )}
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-mono font-bold text-white tabular-nums">
                  {formatTime(timeInSeconds)}
                </div>
                <div className="text-xs text-slate-500 uppercase mt-1">
                  {isRunning ? 'Tracking' : 'Paused'}
                </div>
              </div>
            </div>
            <div className="w-full bg-[#0f1729] p-3 rounded-lg flex items-center justify-between border border-slate-800 group-hover:border-amber-500/30 transition-colors">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full bg-amber-500 ${isRunning ? 'animate-pulse' : ''}`}></div>
                <span className="text-sm text-slate-300">Active Session</span>
              </div>
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsRunning(!isRunning); }}
                className={`${isRunning ? 'text-amber-500 hover:text-white hover:bg-amber-500' : 'text-emerald-400 hover:text-white hover:bg-emerald-500'} px-3 py-1 rounded text-xs uppercase tracking-wide font-bold transition-colors flex items-center gap-1`}
              >
                {isRunning ? (
                  <><Pause size={12} fill="currentColor" /> Stop</>
                ) : (
                  <><Play size={12} fill="currentColor" /> Resume</>
                )}
              </button>
            </div>
          </div>
        )}

        {index === 2 && (
          <div className="space-y-6 pt-4">
            <div className="bg-white text-slate-900 p-6 rounded-xl shadow-lg transform rotate-[-2deg] transition-all duration-500 group-hover:rotate-0 group-hover:scale-105 group-hover:shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div className="font-bold text-lg tracking-tight">INVOICE</div>
                <div className="text-sm text-slate-500">#1024</div>
              </div>
              <div className="space-y-2 mb-6">
                <div className="h-2 bg-slate-200 rounded w-1/2"></div>
                <div className="h-2 bg-slate-200 rounded w-3/4"></div>
              </div>
              <div className="flex justify-between items-end border-t border-slate-200 pt-4">
                <div className="text-xs text-slate-500">Total Due</div>
                <div className="text-2xl font-bold text-slate-900">$2,450.00</div>
              </div>
            </div>
            
            <div className="flex justify-center transition-all duration-500">
              <button className="bg-emerald-500 text-white px-6 py-3 rounded-full font-bold shadow-[0_10px_20px_rgba(16,185,129,0.3)] flex items-center gap-2 hover:scale-105 hover:bg-emerald-400 transition-all">
                <CheckCircle size={18} /> Mark Paid
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-white/5 to-transparent rounded-full pointer-events-none"></div>
    </div>
  );
};

const WorkflowSteps = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Use the vertical center of the viewport as the trigger line
      const triggerPoint = window.innerHeight * 0.5;
      
      let newActiveStep = activeStep;
      let minDistance = Infinity;

      stepRefs.current.forEach((ref, index) => {
        if (!ref) return;
        
        const rect = ref.getBoundingClientRect();
        // Calculate the distance from the element's center to the trigger point
        const elementCenter = rect.top + (rect.height / 2);
        const distance = Math.abs(elementCenter - triggerPoint);
        
        // Find the step closest to the center
        if (distance < minDistance) {
            minDistance = distance;
            newActiveStep = index;
        }
      });
      
      if (newActiveStep !== activeStep) {
        setActiveStep(newActiveStep);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeStep]);

  return (
    <section ref={containerRef} className="relative bg-[#0f1729] py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-24 md:mb-32">
          <h2 className="text-4xl md:text-7xl font-serif text-white mb-6 tracking-tight">
            From chaos to <span className="italic text-cyan-400">clarity.</span>
          </h2>
          <p className="text-slate-400 text-lg md:text-xl max-w-xl leading-relaxed">
            A seamless flow designed to match how modern freelancers actually work. Not just tools, but a process.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          {/* Left Column: Text Steps */}
          <div className="lg:w-1/2 space-y-24 lg:space-y-[50vh] lg:pb-[20vh]">
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                ref={el => { stepRefs.current[index] = el }}
                className={`transition-all duration-700 ${index === activeStep ? 'opacity-100 lg:translate-x-0' : 'opacity-100 lg:opacity-30 lg:-translate-x-4'}`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-sm font-mono text-cyan-400">0{step.id}</span>
                  <div className={`h-px w-12 ${index === activeStep ? 'bg-cyan-400' : 'bg-slate-700'}`}></div>
                </div>
                <h3 className="text-3xl md:text-5xl font-bold text-white mb-4">{step.title}</h3>
                <h4 className="text-xl md:text-2xl text-slate-300 font-medium mb-6 font-serif italic">{step.subtitle}</h4>
                <p className="text-slate-400 leading-relaxed text-lg max-w-md mb-8">{step.description}</p>
                
                {/* Mobile Visual Card (Inline) - Only visible on small screens */}
                <div className="block lg:hidden w-full max-w-md mx-auto transform hover:scale-[1.02] transition-transform duration-300 mt-8">
                  <StepVisual step={step} index={index} />
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Sticky Visuals (Desktop) */}
          {/* Important: min-h-full ensures the container stretches to match the left column's height */}
          <div className="lg:w-1/2 hidden lg:block relative min-h-full">
            <div className="sticky top-32 h-[calc(100vh-8rem)] flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-[4/5]">
                {/* Background Glow */}
                <div className={`absolute inset-0 blur-3xl transition-colors duration-1000 opacity-20 ${steps[activeStep].color}`}></div>
                
                {/* Stacked Cards */}
                {steps.map((step, index) => {
                  const isActive = index === activeStep;
                  const isPast = index < activeStep;
                  
                  // Animation logic
                  let transform = 'scale(1) translateY(0)';
                  let opacity = 0;
                  let zIndex = 0;
                  let blur = 'blur(0px)';

                  if (isActive) {
                    transform = 'scale(1) translateY(0)';
                    opacity = 1;
                    zIndex = 10;
                    blur = 'blur(0px)';
                  } else if (isPast) {
                    transform = 'scale(0.9) translateY(-60px)';
                    opacity = 0; 
                    zIndex = 5;
                    blur = 'blur(10px)';
                  } else {
                    // Future cards
                    transform = 'scale(1.1) translateY(100px)';
                    opacity = 0;
                    zIndex = 1;
                    blur = 'blur(20px)';
                  }

                  return (
                    <div 
                      key={step.id}
                      className="absolute inset-0 transition-all duration-700 ease-out"
                      style={{ transform, opacity, zIndex, filter: blur }}
                    >
                      <StepVisual step={step} index={index} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkflowSteps;