import React from 'react';
import { Star, TrendingUp, User } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah Jenkins",
    role: "UX Designer",
    content: "I used to spend 3 hours a week on invoices. LogicFrame cut that to 10 minutes. My clients actually compliment my invoices now.",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    impact: "Saved 12hrs/mo"
  },
  {
    name: "Marcus Chen",
    role: "Full Stack Dev",
    content: "The expense tracker is a lifesaver. I just snap a photo of my receipt and forget about it. Tax season was actually... easy?",
    avatar: "https://i.pravatar.cc/150?u=marcus",
    impact: "Tax Ready"
  },
  {
    name: "Elena Rodriguez",
    role: "Freelance Writer",
    content: "The proposal tool helped me close a $5k contract. It made me look like an agency, not just a solo writer.",
    avatar: "https://i.pravatar.cc/150?u=elena",
    impact: "Won $5k Deal"
  },
  {
    name: "David Smith",
    role: "Video Editor",
    content: "Finally, a tool that doesn't feel like a spreadsheet from 1999. The dark mode is beautiful and the UX is snappy.",
    avatar: "https://i.pravatar.cc/150?u=david",
    impact: "Happy User"
  },
  {
    name: "Priya Patel",
    role: "Social Media Mgr",
    content: "I love the screenshot beautifier! I use it for all my client reports. It adds that extra layer of polish.",
    avatar: "https://i.pravatar.cc/150?u=priya",
    impact: "Better Reports"
  }
];

type Testimonial = typeof testimonials[0];

const ReviewCard: React.FC<{ t: Testimonial }> = ({ t }) => (
  <div className="w-[350px] p-6 rounded-2xl bg-[#131b2e] border border-slate-800 shrink-0 mx-4 hover:border-cyan-500/30 transition-colors group">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden border border-slate-600">
           <img src={t.avatar} alt={t.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
        </div>
        <div>
          <div className="text-white font-bold text-sm">{t.name}</div>
          <div className="text-slate-500 text-xs">{t.role}</div>
        </div>
      </div>
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(i => (
          <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
        ))}
      </div>
    </div>
    
    <p className="text-slate-300 text-sm leading-relaxed mb-4">"{t.content}"</p>
    
    <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full w-fit">
      <TrendingUp size={12} />
      {t.impact}
    </div>
  </div>
);

const Community = () => {
  return (
    <section className="py-24 bg-[#0a0f1e] overflow-hidden relative border-y border-slate-800">
      
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1e] via-transparent to-[#0a0f1e] z-10 pointer-events-none"></div>

      <div className="text-center mb-12 relative z-20">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Join the <span className="text-cyan-400">Movement</span>
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto px-6">
          Thousands of freelancers have ditched the chaos and switched to LogicFrame.
        </p>
      </div>

      {/* Row 1: Left to Right */}
      <div className="flex mb-8 relative">
        <div className="flex animate-marquee">
          {[...testimonials, ...testimonials].map((t, i) => (
            <ReviewCard key={`r1-${i}`} t={t} />
          ))}
        </div>
        <div className="flex animate-marquee absolute top-0 left-full">
           {[...testimonials, ...testimonials].map((t, i) => (
            <ReviewCard key={`r1-d-${i}`} t={t} />
          ))}
        </div>
      </div>

      {/* Row 2: Right to Left (Slightly different visual rhythm) */}
      <div className="flex relative">
        <div className="flex animate-marquee2">
           {[...testimonials, ...testimonials].reverse().map((t, i) => (
            <ReviewCard key={`r2-${i}`} t={t} />
          ))}
        </div>
         <div className="flex animate-marquee2 absolute top-0 left-full">
           {[...testimonials, ...testimonials].reverse().map((t, i) => (
            <ReviewCard key={`r2-d-${i}`} t={t} />
          ))}
        </div>
      </div>

    </section>
  );
};

export default Community;