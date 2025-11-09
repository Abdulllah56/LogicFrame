import React from 'react'

const Features = () => {
  const features = [
    { title: "AI Assistance", desc: "Boost productivity with smart automation and insights." },
    { title: "Fast Deploy", desc: "One-click deployment with high scalability and speed." },
    { title: "Team Analytics", desc: "Track performance and improve collaboration." },
    { title: "Screenshot Beautifier", desc: "Polish and enhance screenshots quickly.", href: "/screenshortbeautifier" },
  ]

  return (
    <section id="features" className="mt-20 max-w-5xl grid md:grid-cols-3 gap-8">
      {features.map((f, i) => (
        f.href ? (
          <a key={i} href={f.href} className="no-underline">
            <div className="p-6 bg-[#101218] rounded-2xl shadow-lg hover:shadow-xl transition">
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-400">{f.desc}</p>
            </div>
          </a>
        ) : (
          <div key={i} className="p-6 bg-[#101218] rounded-2xl shadow-lg hover:shadow-xl transition">
            <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
            <p className="text-gray-400">{f.desc}</p>
          </div>
        )
      ))}
    </section>
  )
}

export default Features
