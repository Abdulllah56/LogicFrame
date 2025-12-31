import React from 'react';

const LogoTicker = () => {
  const companies = [
    { name: "Freelancer", color: "from-blue-400" },
    { name: "Upwork", color: "from-green-400" },
    { name: "Fiverr", color: "from-green-500" },
    { name: "Toptal", color: "from-blue-500" },
    { name: "Dribbble", color: "from-pink-500" },
    { name: "Behance", color: "from-blue-600" },
    { name: "IndieHackers", color: "from-indigo-500" },
    { name: "ProductHunt", color: "from-orange-500" },
  ];

  return (
    <div className="w-full py-10 border-y border-slate-800 bg-[#0a0f1e]/50 overflow-hidden">
      <div className="text-center text-slate-500 text-sm mb-6 uppercase tracking-widest font-medium">Trusted by independents from</div>
      <div className="relative flex overflow-x-hidden group">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-16 px-8">
          {[...companies, ...companies, ...companies].map((company, idx) => (
            <div key={idx} className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity cursor-default">
              <div className={`w-6 h-6 rounded bg-gradient-to-br ${company.color} to-slate-600`}></div>
              <span className="text-xl font-bold text-slate-300">{company.name}</span>
            </div>
          ))}
        </div>
        
        <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex items-center gap-16 px-8">
           {[...companies, ...companies, ...companies].map((company, idx) => (
            <div key={`${idx}-2`} className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity cursor-default">
               <div className={`w-6 h-6 rounded bg-gradient-to-br ${company.color} to-slate-600`}></div>
              <span className="text-xl font-bold text-slate-300">{company.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LogoTicker;