'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Building2,
  Check,
  Minus,
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

const workflow = [
  ['Hear', 'Customer speaks naturally in Hindi, English, Tamil, or mixed language.'],
  ['Verify', 'CAVI checks intent, identity, facts, and conflicting information.'],
  ['Resolve', 'Approved actions run through company systems and policies.'],
  ['Escalate', 'Human officers receive the full case brief when AI should stop.'],
];

export default function LandingPage() {
  const [showFloatingNav, setShowFloatingNav] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Reveal floating navbar only after scrolling past the hero section
      if (window.scrollY > 280) {
        setShowFloatingNav(true);
      } else {
        setShowFloatingNav(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="soft-page flex flex-col">
      {/* Floating Liquid Glass Island Navbar (Visible ONLY after scrolling past Hero section) */}
      <header
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-4xl transition-all duration-500 ease-out ${
          showFloatingNav
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-8 pointer-events-none'
        }`}
      >
        <div className="flex h-14 items-center justify-between rounded-full border border-white/80 bg-white/92 px-6 py-2 shadow-[0_16px_40px_rgba(0,0,0,0.12),0_2px_10px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,1)] backdrop-blur-3xl">
          {/* 1. Left: Brand Logo (No 'C' Icon) */}
          <Link
            href="/"
            onClick={handleScrollToTop}
            className="group flex items-center gap-2 transition-opacity hover:opacity-80"
            aria-label="CAVI home"
          >
            <span className="font-display text-xl font-bold tracking-tight text-neutral-950">CAVI</span>
          </Link>

          {/* 2. Center: Navigation Options with Even Spacing */}
          <nav className="hidden items-center justify-center gap-1.5 sm:flex">
            <a
              href="#how-it-works"
              onClick={(e) => handleScrollToSection(e, 'how-it-works')}
              className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-100/90 hover:text-neutral-950"
            >
              How it works
            </a>
            <a
              href="#company-brain"
              onClick={(e) => handleScrollToSection(e, 'company-brain')}
              className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-100/90 hover:text-neutral-950"
            >
              Company Brain
            </a>
            <a
              href="#demo"
              onClick={(e) => handleScrollToSection(e, 'demo')}
              className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-100/90 hover:text-neutral-950"
            >
              Demo
            </a>
            <a
              href="#pricing"
              onClick={(e) => handleScrollToSection(e, 'pricing')}
              className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-100/90 hover:text-neutral-950"
            >
              Pricing
            </a>
          </nav>

          {/* 3. Right: Action Controls with Even Spacing */}
          <div className="flex items-center gap-2">
            <Link
              href="/call"
              className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50/90 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-all hover:bg-blue-100"
            >
              <PhoneCall className="h-3 w-3 text-blue-600" />
              Call Line
            </Link>
            <Link
              href="/admin/login?intent=onboard"
              className="soft-action px-3.5 py-1.5 text-xs"
            >
              Onboard
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section: with hero-gb.png Background */}
        <section
          className="relative min-h-screen flex flex-col justify-center items-center py-12 lg:py-16 bg-cover bg-center bg-no-repeat overflow-hidden border-b border-neutral-200/80"
          style={{ backgroundImage: "url('/images/hero-gb.png')" }}
        >
          <div className="soft-shell relative z-10 w-full">
            {/* Hero Main Content */}
            <div className="grid items-center gap-10 my-auto py-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="max-w-2xl animate-soft-rise">
                <div className="font-display text-3xl font-extrabold tracking-tight text-neutral-950 mb-2">CAVI</div>
                <p className="soft-kicker text-blue-700 font-bold tracking-wide">Voice resolution infrastructure</p>
                <h1 className="mt-4 max-w-2xl text-4xl font-extrabold leading-[1.08] text-neutral-950 sm:text-5xl lg:text-6xl drop-shadow-xs">
                  Customer calls should end in <span className="font-extrabold text-blue-600 underline decoration-blue-200 underline-offset-4">resolved cases</span>, not repeated stories.
                </h1>
                <p className="mt-5 max-w-xl text-base font-medium leading-7 text-neutral-800">
                  CAVI (Customer Assistance through Voice Intelligence) connects to a company&apos;s support number, knowledge, policies, and approved APIs. It listens, verifies, resolves safe requests, and hands off the rest with complete context.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/admin/login?intent=onboard" className="soft-action shadow-md">
                    <Building2 className="h-4 w-4" />
                    Continue onboarding
                  </Link>
                  <Link href="/call" className="soft-action-secondary bg-white/95 text-neutral-900 border border-neutral-300 hover:bg-white shadow-sm font-semibold">
                    <PhoneCall className="h-4 w-4 text-blue-600" />
                    Call Customer Support
                  </Link>
                </div>

                <p className="mt-4 max-w-xl text-xs font-semibold leading-5 text-neutral-600">
                  Clicking <span className="font-bold text-blue-700">Onboard company</span> starts by creating or signing in as the company owner. The company setup comes immediately after that.
                </p>
              </div>

              <div className="animate-soft-rise soft-delay-2">
                <div className="rounded-2xl border border-neutral-200/90 bg-white/95 shadow-xl backdrop-blur-xl overflow-hidden">
                  <div className="border-b border-neutral-200/80 bg-neutral-50/90 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="soft-kicker text-blue-700 font-bold">Live case path</p>
                        <h2 className="mt-1 text-xl font-bold text-neutral-950">Customer voice support call</h2>
                      </div>
                      <span className="rounded-full border border-blue-300 bg-blue-100/90 px-3 py-1 text-xs font-bold text-blue-800 shadow-xs">
                        Live
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-neutral-100">
                    {workflow.map(([title, text], index) => (
                      <div key={title} className="grid grid-cols-[3.5rem_1fr] p-4 transition-colors hover:bg-blue-50/30">
                        <div className="font-mono text-xs font-bold text-blue-600">0{index + 1}</div>
                        <div>
                          <h3 className="font-bold text-neutral-950 text-sm">{title}</h3>
                          <p className="mt-0.5 text-xs font-medium leading-5 text-neutral-600">{text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="demo" className="border-y border-blue-100 bg-blue-50/40">
          <div className="soft-shell grid gap-8 py-12 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="animate-soft-rise">
              <p className="soft-kicker text-blue-600">Customer calling</p>
              <h2 className="mt-3 max-w-2xl text-4xl leading-tight text-neutral-950">
                Let customers connect directly to the registered voice agent.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-500">
                The customer call line connects only when a registered company phone number is dialed. Everything operational stays private: call records, billing, Company Brain settings, officers, and escalation queues.
              </p>
            </div>
            <Link href="/call" className="soft-action h-12 justify-self-start lg:justify-self-end">
              <PhoneCall className="h-4 w-4" />
              Open Customer Call Line
            </Link>
          </div>
        </section>

        <section id="how-it-works" className="soft-shell py-20">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="soft-kicker text-blue-600">How it works</p>
              <h2 className="mt-3 text-4xl leading-tight text-neutral-950">
                One support number. One company brain. One clean handoff.
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['Customer dials', 'A customer calls the company support number from a normal phone.'],
                ['Tenant loads', 'The destination number selects the correct company configuration.'],
                ['AI resolves', 'CAVI checks policies and executes only approved actions.'],
                ['Officer receives', 'If a human is needed, the support desk gets a structured Case DNA brief.'],
              ].map(([title, text]) => (
                <div key={title} className="soft-card p-5 transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
                  <h3 className="font-semibold text-neutral-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-500">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="company-brain" className="border-y border-neutral-200 bg-white">
          <div className="soft-shell grid gap-10 py-20 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <p className="soft-kicker text-blue-600">Company Brain</p>
              <h2 className="mt-3 text-4xl leading-tight text-neutral-950">
                The AI only knows what the company owner configures.
              </h2>
              <p className="mt-4 text-base leading-7 text-neutral-500">
                Each tenant defines identity, tone, allowed tools, confirmation thresholds, and escalation rules.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
              {[
                ['Identity & Voice', 'Agent name, tone, primary language, and automatic code-switching.'],
                ['Policy Boundaries', 'What the AI can do on its own vs. what requires human confirmation.'],
                ['Live SOPs', 'Company documents and support runbooks embedded directly into the prompt.'],
                ['Human Escalation', 'Structured handoff brief sent directly to the online officer.'],
              ].map(([title, text]) => (
                <div key={title} className="soft-card p-6">
                  <h3 className="text-lg font-semibold text-neutral-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-500">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing">
          {/* 1. Upper Pricing Cards with bg3 Background */}
          <div
            className="relative py-20 bg-cover bg-center bg-no-repeat border-t border-neutral-200"
            style={{ backgroundImage: "url('/images/bg3.png')" }}
          >
            <div className="soft-shell relative z-10">
              <div className="max-w-3xl">
                <p className="soft-kicker text-blue-400 font-semibold">Transparent billing</p>
                <h2 className="mt-3 text-4xl leading-tight text-white font-bold">
                  Pay per conversation minute. No hidden platform overhead.
                </h2>
              </div>

              {/* Pricing Cards */}
              <div className="mt-10 grid gap-6 md:grid-cols-3">
                {[
                  {
                    name: 'Starter',
                    price: '$0.18',
                    unit: 'conversation min',
                    desc: '1 support phone line, standard Company Brain, Case DNA, transcripts, and multilingual voice.',
                    highlight: false,
                    features: ['1 Support Phone Line', 'Real-time AI Voice Agent', 'Multilingual & Code-Switching', 'Case DNA Briefs', 'Call Transcripts & Records'],
                  },
                  {
                    name: 'Growth',
                    price: '$0.15',
                    unit: 'conversation min',
                    desc: '3 support lines, advanced Company Brain, API voice actions, conflict detection, real-time officer portal.',
                    highlight: true,
                    badge: 'Recommended for Growing Teams',
                    features: ['3 Support Phone Lines', 'Advanced Company Brain & SOPs', 'Voice Actions & Tool APIs', 'Conflict & Uncertainty Detection', 'Real-Time Officer Portal', 'Predictive Escalation'],
                  },
                  {
                    name: 'Enterprise',
                    price: '$0.12',
                    unit: 'conversation min',
                    desc: 'Unlimited phone lines, custom voice fine-tuning, custom integrations, dedicated SLA guarantee.',
                    highlight: false,
                    features: ['Unlimited Phone Lines', 'Custom Voice Fine-Tuning', 'Custom CRM / ERP Integrations', 'Dedicated Account Manager', '24/7 SLA Guarantee'],
                  },
                ].map((plan) => (
                  <div
                    key={plan.name}
                    className={`soft-card flex flex-col justify-between p-8 relative transition-all duration-300 ${
                      plan.highlight
                        ? 'border-blue-600 shadow-[0_16px_36px_rgba(37,99,235,0.12)] ring-1 ring-blue-600'
                        : 'hover:border-neutral-300'
                    }`}
                  >
                    {plan.badge && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-md">
                        {plan.badge}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-neutral-950">{plan.name}</h3>
                        {plan.highlight && <Sparkles className="h-4 w-4 text-blue-600" />}
                      </div>
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-neutral-950">{plan.price}</span>
                        <span className="text-xs font-medium text-neutral-500">/{plan.unit}</span>
                      </div>
                      <p className="mt-3 text-xs leading-5 text-neutral-500">{plan.desc}</p>

                      <div className="mt-6 space-y-2 border-t border-neutral-100 pt-5">
                        {plan.features.map((f) => (
                          <div key={f} className="flex items-center gap-2 text-xs font-medium text-neutral-700">
                            <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Link
                      href="/admin/login?intent=onboard"
                      className={plan.highlight ? 'soft-action mt-8 w-full justify-center' : 'soft-action-secondary mt-8 w-full justify-center'}
                    >
                      Choose {plan.name}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Lower Feature Comparison Table on Clean Background */}
          <div className="bg-slate-50/70 py-16 border-b border-neutral-200">
            <div className="soft-shell">
              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs">
                <div className="border-b border-neutral-200 bg-neutral-50/80 px-6 py-4">
                  <h3 className="font-display text-lg font-bold text-neutral-950">Detailed Tier Feature Comparison</h3>
                  <p className="text-xs text-neutral-500">Everything you need to deliver seamless, context-preserving voice support.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-50/40 text-neutral-500">
                        <th className="py-3.5 pl-6 pr-4 font-semibold">Feature</th>
                        <th className="px-4 py-3.5 text-center font-semibold text-neutral-900">Starter ($0.18/min)</th>
                        <th className="px-4 py-3.5 text-center font-bold text-blue-600">Growth ($0.15/min)</th>
                        <th className="py-3.5 pl-4 pr-6 text-center font-semibold text-neutral-900">Enterprise ($0.12/min)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-neutral-700">
                      {[
                        { name: 'Support phone lines', starter: '1 line', growth: '3 lines', enterprise: 'Unlimited' },
                        { name: 'Real-time AI voice agent', starter: true, growth: true, enterprise: true },
                        { name: 'Multilingual & Code-switching', starter: true, growth: true, enterprise: true },
                        { name: 'Natural interruption handling & noise resilience', starter: true, growth: true, enterprise: true },
                        { name: 'Smart confirmation of critical details', starter: true, growth: true, enterprise: true },
                        { name: 'Company Brain / Knowledge Base', starter: 'Standard', growth: 'Advanced', enterprise: 'Custom' },
                        { name: 'Call transcripts, sentiment & records', starter: true, growth: true, enterprise: true },
                        { name: 'Customer intent & fact detection', starter: true, growth: true, enterprise: true },
                        { name: 'Voice-based actions & tool APIs', starter: false, growth: true, enterprise: true },
                        { name: 'Conflict & uncertainty detection', starter: false, growth: true, enterprise: true },
                        { name: 'Case DNA (automated context brief)', starter: true, growth: true, enterprise: true },
                        { name: 'Intelligent officer routing', starter: false, growth: true, enterprise: true },
                        { name: 'Real-time officer portal', starter: false, growth: true, enterprise: true },
                        { name: 'Predictive escalation', starter: false, growth: true, enterprise: true },
                        { name: 'Custom voice fine-tuning', starter: false, growth: false, enterprise: true },
                        { name: 'Custom integrations (CRM / ERP)', starter: false, growth: false, enterprise: true },
                        { name: 'SLA guarantee', starter: false, growth: false, enterprise: true },
                      ].map((row) => (
                        <tr key={row.name} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="py-3 pl-6 pr-4 font-medium text-neutral-900">{row.name}</td>
                          <td className="px-4 py-3 text-center">
                            {typeof row.starter === 'boolean' ? (
                              row.starter ? <Check className="mx-auto h-4 w-4 text-blue-600" /> : <Minus className="mx-auto h-4 w-4 text-neutral-300" />
                            ) : (
                              <span className="font-semibold text-neutral-900">{row.starter}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center bg-blue-50/20">
                            {typeof row.growth === 'boolean' ? (
                              row.growth ? <Check className="mx-auto h-4 w-4 text-blue-600" /> : <Minus className="mx-auto h-4 w-4 text-neutral-300" />
                            ) : (
                              <span className="font-bold text-blue-700">{row.growth}</span>
                            )}
                          </td>
                          <td className="py-3 pl-4 pr-6 text-center">
                            {typeof row.enterprise === 'boolean' ? (
                              row.enterprise ? <Check className="mx-auto h-4 w-4 text-blue-600" /> : <Minus className="mx-auto h-4 w-4 text-neutral-300" />
                            ) : (
                              <span className="font-semibold text-neutral-900">{row.enterprise}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-neutral-950 py-16 text-white">
          <div className="soft-shell flex flex-col items-center justify-between gap-8 text-center md:flex-row md:text-left">
            <div>
              <h2 className="text-3xl font-semibold">Ready to resolve customer calls with CAVI?</h2>
              <p className="mt-2 text-sm text-neutral-400">
                Customer Assistance through Voice Intelligence. Onboard in under 5 minutes.
              </p>
            </div>
            <Link href="/admin/login?intent=onboard" className="soft-action bg-white text-neutral-950 hover:bg-neutral-100">
              Onboard Company Now
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-900 bg-neutral-950 text-white pt-16 pb-6 overflow-hidden">
        <div className="soft-shell grid grid-cols-2 gap-10 md:grid-cols-5 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href="/" onClick={handleScrollToTop} className="group flex items-center transition-opacity hover:opacity-80">
              <span className="font-display text-2xl font-bold tracking-tight text-white">CAVI</span>
            </Link>
            <p className="text-xs italic text-neutral-400 leading-relaxed">
              AI-powered customer assistance, built for every conversation.
            </p>
          </div>

          {/* Platform Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">Platform</h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li><a href="#demo" onClick={(e) => handleScrollToSection(e, 'demo')} className="hover:text-white transition-colors">AI Voice Agents</a></li>
              <li><Link href="/call" className="hover:text-white transition-colors">Customer Assistance</Link></li>
              <li><a href="#company-brain" onClick={(e) => handleScrollToSection(e, 'company-brain')} className="hover:text-white transition-colors">Company Brain</a></li>
              <li><a href="#how-it-works" onClick={(e) => handleScrollToSection(e, 'how-it-works')} className="hover:text-white transition-colors">Voice Actions & APIs</a></li>
              <li><a href="#how-it-works" onClick={(e) => handleScrollToSection(e, 'how-it-works')} className="hover:text-white transition-colors">Case DNA</a></li>
              <li><Link href="/agent/login" className="hover:text-white transition-colors">Officer Portal</Link></li>
            </ul>
          </div>

          {/* Solutions Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">Solutions</h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li><Link href="/call" className="hover:text-white transition-colors">Customer Support</Link></li>
              <li><a href="#demo" onClick={(e) => handleScrollToSection(e, 'demo')} className="hover:text-white transition-colors">Multilingual Assistance</a></li>
              <li><a href="#how-it-works" onClick={(e) => handleScrollToSection(e, 'how-it-works')} className="hover:text-white transition-colors">Intelligent Resolution</a></li>
              <li><Link href="/agent/login" className="hover:text-white transition-colors">Human Support Routing</Link></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">Resources</h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
              <li><a href="#pricing" onClick={(e) => handleScrollToSection(e, 'pricing')} className="hover:text-white transition-colors">Pricing</a></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/support" className="hover:text-white transition-colors">Help Center</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">Company</h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/security" className="hover:text-white transition-colors">Security</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Rights & Tagline */}
        <div className="soft-shell mt-12 border-t border-neutral-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>© 2026 CAVI. All rights reserved.</div>
          <div className="font-medium text-neutral-400">Built for conversations. Designed for resolution.</div>
        </div>

        {/* Massive full-width CAVI watermark text with clean letter spacing */}
        <div className="w-full select-none pointer-events-none text-center mt-6 pt-4 border-t border-neutral-900/60 overflow-hidden">
          <span className="block w-full font-sans font-black tracking-[0.06em] text-[26vw] sm:text-[27vw] leading-[0.75] bg-gradient-to-b from-neutral-600 via-neutral-800 to-neutral-950 bg-clip-text text-transparent">
            CAVI
          </span>
        </div>
      </footer>
    </div>
  );
}
