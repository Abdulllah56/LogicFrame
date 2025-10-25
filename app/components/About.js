
import React from 'react';

const About = () => {
  return (
    <section className="px-[5%] py-24 max-w-[1400px] mx-auto" id="about">
      <div className="text-center mb-16">
        <h2 className="text-5xl mb-4">Built by Freelancers, for Freelancers</h2>
        <p className="text-lg text-[#94a3b8]">LogicFrame started from a simple frustration: existing tools were too complex, too expensive, or just didn't work right.</p>
      </div>

      <div className="max-w-[800px] mx-auto text-center">
        <p className="text-lg leading-loose text-[#94a3b8] mb-8">
          As a freelancer myself, I needed tools that were <strong className="text-[#00D9FF]">simple</strong>, 
          <strong className="text-[#00D9FF]">fast</strong>, and 
          <strong className="text-[#00D9FF]">actually useful</strong>. 
          So I built them. No bloat. No BS. Just tools that work.
        </p>
        <p className="text-[#94a3b8] mb-8">
          Every tool is designed with one goal: help you focus on your work, not your admin tasks.
        </p>
        <div className="mt-8">
          <a href="mailto:logicframe@gmail.com" className="bg-transparent border-2 border-[#00D9FF] text-[#00D9FF] px-8 py-3 rounded-lg font-bold no-underline hover:bg-[rgba(0,217,255,0.1)] hover:-translate-y-0.5 transition-all">Get in Touch</a>
        </div>
      </div>
    </section>
  );
};

export default About;
