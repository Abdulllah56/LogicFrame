"use client";

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "../components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../components/ui/accordion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../components/ui/carousel";
import { motion } from "framer-motion";
import {
  BarChart3Icon,
  CalendarClockIcon,
  TargetIcon,
  PieChartIcon,
  Wand2Icon,
  WalletIcon,
  ShieldIcon,
  SparklesIcon,
  ChevronRight,
} from "lucide-react";

export default function LandingPage() {
  const { text: typed, blink } = useTypedText([
    "Track. Plan. Grow.",
    "Make budgeting effortless.",
    "See your money clearly.",
  ]);

  return (
    <div className="min-h-screen bg-[#0B1020] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,rgba(99,102,241,0.25),transparent_35%),radial-gradient(circle_at_80%_0,rgba(59,130,246,0.2),transparent_30%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-14 relative">
          <motion.div
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
              <span className="h-2 w-2 rounded-full bg-indigo-400" />
              Budgeting made simple
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-indigo-300 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
                FinanceFriend
              </span>
              <span className="block text-white mt-2">
                {typed}
                <span
                  className={`ml-1 inline-block h-6 w-0.5 align-middle bg-white ${
                    blink ? "opacity-100" : "opacity-0"
                  }`}
                />
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/70">
              Capture expenses in seconds, visualize where your money goes, stay
              ahead of bills, and hit your goals.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/FinanceFriend/dashboard">
                <Button className="h-11 px-6 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-900/30 hover:from-indigo-400 hover:to-fuchsia-400 transition-transform will-change-transform hover:-translate-y-0.5 active:translate-y-0">
                  Get started
                </Button>
              </Link>
              <a href="#features">
                <Button
                  variant="outline"
                  className="h-11 px-6 border-white/20 text-white hover:bg-white/10 transition-colors"
                >
                  See features
                </Button>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Trust bar */}
        <div className="relative">
          <div className="max-w-6xl mx-auto px-4 pb-16">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 opacity-70">
              {[
                "Secure",
                "Realtime",
                "Analytics",
                "Reminders",
                "Zod-validated",
                "Drizzle ORM",
              ].map((label) => (
                <div
                  key={label}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center text-xs"
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature highlights */}
      <section id="features" className="relative py-16 sm:py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B1020] to-[#0B1020]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <Feature
              icon={<Wand2Icon className="h-6 w-6" />}
              title="Smart expense input"
              desc="Paste a sentence — we extract amount, date and category automatically."
            />
            <Feature
              icon={<BarChart3Icon className="h-6 w-6" />}
              title="Real-time analytics"
              desc="Trends, charts and breakdowns update instantly as you log expenses."
            />
            <Feature
              icon={<CalendarClockIcon className="h-6 w-6" />}
              title="Bill reminders"
              desc="See upcoming bills by due date so nothing slips through the cracks."
            />
            <Feature
              icon={<TargetIcon className="h-6 w-6" />}
              title="Savings goals"
              desc="Create targets, track progress and celebrate milestones."
            />
            <Feature
              icon={<PieChartIcon className="h-6 w-6" />}
              title="Category breakdown"
              desc="Understand where your money goes across dynamic categories."
            />
            <Feature
              icon={<WalletIcon className="h-6 w-6" />}
              title="Budgets that stick"
              desc="Set monthly limits and get a clear view of remaining spend."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Add expenses instantly",
                desc: "Use the smart input or quick add to log expenses in seconds.",
              },
              {
                step: "02",
                title: "Review insights",
                desc: "See trends, category splits and bill timelines at a glance.",
              },
              {
                step: "03",
                title: "Hit your goals",
                desc: "Create savings goals and track progress automatically.",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="group rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/0 p-6 transition hover:border-indigo-400/40 hover:shadow-[0_0_0_1px_rgba(99,102,241,0.25)]"
              >
                <div className="text-xs text-white/50">{s.step}</div>
                <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-white/70">{s.desc}</p>
                <div className="mt-4 inline-flex items-center text-indigo-300 text-sm">
                  Learn more <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live preview mock */}
      <section className="py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#121838] to-[#1a1040] p-6 sm:p-10">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-semibold">
                  A dashboard that feels alive
                </h2>
                <p className="mt-3 text-white/70">
                  Interactive charts, smooth micro-animations and instant
                  updates powered by React Query.
                </p>
                <div className="mt-6 flex gap-3">
                  <Link href="/dashboard">
                    <Button className="bg-gradient-to-r from-indigo-500 to-fuchsia-500">
                      Open dashboard
                    </Button>
                  </Link>
                  <a href="#pricing">
                    <Button
                      variant="outline"
                      className="border-white/20 text-white"
                    >
                      View pricing
                    </Button>
                  </a>
                </div>
                <ul className="mt-6 space-y-2 text-sm text-white/75">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />{" "}
                    Secure and private by default
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" />{" "}
                    Works great on mobile
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-400" /> No
                    setup required
                  </li>
                </ul>
              </div>
              <div className="relative">
                <motion.div
                  className="rounded-xl border border-white/10 bg-[#0E142B] p-4 shadow-2xl"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="flex gap-1 pb-3">
                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Widget
                      title="Spending"
                      subtitle="This month"
                      tint="from-indigo-500/30 to-sky-500/20"
                    />
                    <Widget
                      title="Bills"
                      subtitle="Due soon"
                      tint="from-fuchsia-500/30 to-indigo-500/20"
                    />
                    <Widget
                      title="Goals"
                      subtitle="Progress"
                      tint="from-sky-500/30 to-fuchsia-500/20"
                    />
                    <Widget
                      title="Budgets"
                      subtitle="Status"
                      tint="from-indigo-500/30 to-violet-500/20"
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold">Simple pricing</h2>
            <p className="mt-2 text-white/70">
              Start free. Upgrade when you need more.
            </p>
          </div>
          <div className="mt-8">
            <Tabs defaultValue="monthly" className="w-full">
              <div className="flex justify-center">
                <TabsList className="bg-white/10">
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="annual">Annual</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="monthly">
                <div className="grid md:grid-cols-3 gap-6 mt-6">
                  <PricingCard
                    name="Free"
                    price="$0"
                    features={["Smart input", "Charts", "Bill reminders"]}
                    cta="Get started"
                  />
                  <PricingCard
                    highlighted
                    name="Pro"
                    price="$7/mo"
                    features={[
                      "Budgets",
                      "Unlimited goals",
                      "Priority support",
                    ]}
                    cta="Upgrade"
                  />
                  <PricingCard
                    name="Team"
                    price="$12/mo"
                    features={["Shared budgets", "Collaboration", "Export"]}
                    cta="Contact us"
                  />
                </div>
              </TabsContent>
              <TabsContent value="annual">
                <div className="grid md:grid-cols-3 gap-6 mt-6">
                  <PricingCard
                    name="Free"
                    price="$0"
                    features={["Smart input", "Charts", "Bill reminders"]}
                    cta="Get started"
                  />
                  <PricingCard
                    highlighted
                    name="Pro"
                    price="$79/yr"
                    features={[
                      "Budgets",
                      "Unlimited goals",
                      "Priority support",
                    ]}
                    cta="Upgrade"
                  />
                  <PricingCard
                    name="Team"
                    price="$129/yr"
                    features={["Shared budgets", "Collaboration", "Export"]}
                    cta="Contact us"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="rounded-2xl border border-white/10 bg-white/5 p-6"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Carousel opts={{ loop: true }}>
              <CarouselContent>
                {testimonials.map((t) => (
                  <CarouselItem
                    key={t.name}
                    className="md:basis-1/2 lg:basis-1/3"
                  >
                    <Testimonial {...t} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="bg-white/10 border-white/10" />
              <CarouselNext className="bg-white/10 border-white/10" />
            </Carousel>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-center text-3xl font-semibold">
            Frequently asked questions
          </h2>
          <Accordion
            type="single"
            collapsible
            className="mt-6 divide-y divide-white/10 border border-white/10 rounded-xl"
          >
            {faqs.map((f, i) => (
              <AccordionItem value={`item-${i}`} key={i}>
                <AccordionTrigger className="px-4 text-left">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="px-4 text-white/70">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA band */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#121838] to-[#1a1040] p-8 sm:p-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold">
              Ready to take control of your finances?
            </h2>
            <p className="mt-3 text-white/70">
              Jump straight into your dashboard and start tracking in seconds.
            </p>
            <div className="mt-8">
              <Link href="/dashboard">
                <Button className="h-11 px-6 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-900/30 hover:from-indigo-400 hover:to-fuchsia-400">
                  Go to dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-white/60">
        <div className="max-w-7xl mx-auto px-4">
          FinanceFriend • Built for clarity, powered by insight
        </div>
      </footer>
    </div>
  );
}

// Helper Components
function Feature({ icon, title, desc }) {
  return (
    <motion.div
      className="rounded-xl border border-white/10 bg-white/5 p-6"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      whileHover={{
        y: -6,
        boxShadow: "0 10px 30px rgba(99,102,241,0.15)",
      }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="flex items-center gap-3 text-indigo-300">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <p className="mt-3 text-sm text-white/70">{desc}</p>
    </motion.div>
  );
}

function PricingCard({ name, price, features, cta, highlighted }) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={`rounded-2xl p-6 border ${
        highlighted
          ? "border-indigo-400/40 bg-white/[0.07]"
          : "border-white/10 bg-white/5"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="mt-1 text-3xl font-bold">{price}</p>
        </div>
        <ShieldIcon className="h-5 w-5 text-white/60" />
      </div>
      <ul className="mt-4 space-y-2 text-sm text-white/75">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" /> {f}
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <Link href="/dashboard">
          <Button
            className={`${
              highlighted
                ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500"
                : "bg-white/10 hover:bg-white/15 border border-white/10 text-white"
            } transition-transform hover:-translate-y-0.5`}
          >
            {cta}
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

function Widget({ title, subtitle, tint }) {
  return (
    <motion.div
      className={`rounded-lg border border-white/10 bg-gradient-to-br ${tint} p-4`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="text-xs text-white/60">{subtitle}</div>
      <div className="mt-1 font-semibold">{title}</div>
      <div className="mt-4 h-16 rounded bg-white/10 overflow-hidden">
        <AnimatedBars />
      </div>
    </motion.div>
  );
}

const testimonials = [
  {
    name: "Jamie S.",
    role: "Product Manager",
    quote:
      "I finally know where my money goes each week — the smart input is magic.",
  },
  {
    name: "Alex R.",
    role: "Engineer",
    quote: "Charts are instant and the UI feels buttery smooth on mobile.",
  },
  {
    name: "Priya K.",
    role: "Designer",
    quote: "Goals make saving tangible. I hit my laptop fund a month early!",
  },
  {
    name: "Dan M.",
    role: "Founder",
    quote: "Budgets + reminders pair perfectly. No more missed bills.",
  },
];

function Testimonial({ name, role, quote }) {
  return (
    <motion.div
      className="h-full rounded-xl border border-white/10 bg-white/5 p-5"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="text-white/80">“{quote}”</div>
      <div className="mt-4 text-sm text-white/60">
        {name} • {role}
      </div>
    </motion.div>
  );
}

const faqs = [
  {
    q: "Is there a free plan?",
    a: "Yes. You can use the Free plan forever and upgrade anytime.",
  },
  {
    q: "Do I need to connect a bank?",
    a: "No. You can manually log expenses or paste text to auto-parse details.",
  },
  {
    q: "Does it work on mobile?",
    a: "Absolutely. FinanceFriend is responsive and touch-friendly across devices.",
  },
  {
    q: "How do reminders work?",
    a: "Add bills with due dates and we’ll surface what’s next so you won’t miss a payment.",
  },
];

function useTypedText(phrases) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    if (subIndex === phrases[index].length + 1 && !deleting) {
      const t = setTimeout(() => setDeleting(true), 900);
      return () => clearTimeout(t);
    }
    if (subIndex === 0 && deleting) {
      setDeleting(false);
      setIndex((prev) => (prev + 1) % phrases.length);
      return;
    }
    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (deleting ? -1 : 1));
    }, deleting ? 40 : 85);
    return () => clearTimeout(timeout);
  }, [subIndex, index, deleting, phrases]);

  useEffect(() => {
    const t = setTimeout(() => setBlink((v) => !v), 500);
    return () => clearTimeout(t);
  }, [blink]);

  return { text: phrases[index].substring(0, subIndex), blink };
}

function AnimatedBars() {
  return (
    <div className="flex h-full items-end gap-1 px-1">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded bg-white/20"
          initial={{ height: Math.random() * 60 + 10 }}
          animate={{ height: [10, 45, 20, 60, 25, 50][i % 6] }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.05,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}