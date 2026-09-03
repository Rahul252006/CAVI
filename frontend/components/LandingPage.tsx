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

export default function LandingPage() {
  const [showFloatingNav, setShowFloatingNav] = useState(false);
  const [isDarkNavbar, setIsDarkNavbar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 280) {
        setShowFloatingNav(true);
      } else {
        setShowFloatingNav(false);
      }

      // Check if floating navbar is currently over a dark background section
      const darkSections = document.querySelectorAll('[data-dark-section="true"]');
      let overDark = false;
      const navY = scrollY + 45;

      darkSections.forEach((sec) => {
        const el = sec as HTMLElement;
        const top = el.offsetTop;
        const bottom = top + el.offsetHeight;
        if (navY >= top && navY <= bottom) {
          overDark = true;
        }
      });

      setIsDarkNavbar(overDark);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
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
      {/* Floating Liquid Glass Island Navbar (Dynamically adapts text & glass color over dark backgrounds) */}
      <header
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-4xl transition-all duration-500 ease-out ${
          showFloatingNav
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-8 pointer-events-none'
        }`}
      >
        <div
          className={`flex h-14 items-center justify-between rounded-full px-6 py-2 transition-all duration-300 backdrop-blur-3xl ${
            isDarkNavbar
              ? 'border border-white/20 bg-neutral-950/85 text-white shadow-[0_16px_40px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.15)]'
              : 'border border-white/80 bg-white/92 text-neutral-950 shadow-[0_16px_40px_rgba(0,0,0,0.12),0_2px_10px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,1)]'
          }`}
        >
          {/* 1. Left: Brand Logo */}
          <Link
            href="/"
            onClick={handleScrollToTop}
            className="group flex items-center gap-2 transition-opacity hover:opacity-80"
            aria-label="CAVI home"
          >
            <span
              className={`font-display text-xl font-bold tracking-tight transition-colors duration-300 ${
                isDarkNavbar ? 'text-white' : 'text-neutral-950'
              }`}
            >
              CAVI
            </span>
          </Link>

          {/* 2. Center: Navigation Options with Even Spacing */}
          <nav className="hidden items-center justify-center gap-1.5 sm:flex">
            <a
              href="#how-it-works"
              onClick={(e) => handleScrollToSection(e, 'how-it-works')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-300 ${
                isDarkNavbar
                  ? 'text-neutral-300 hover:bg-white/10 hover:text-white'
                  : 'text-neutral-600 hover:bg-neutral-100/90 hover:text-neutral-950'
              }`}
            >
              How it works
            </a>
            <a
              href="#company-brain"
              onClick={(e) => handleScrollToSection(e, 'company-brain')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-300 ${
                isDarkNavbar
                  ? 'text-neutral-300 hover:bg-white/10 hover:text-white'
                  : 'text-neutral-600 hover:bg-neutral-100/90 hover:text-neutral-950'
              }`}
            >
              Company Brain
            </a>
            <a
              href="#demo"
              onClick={(e) => handleScrollToSection(e, 'demo')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-300 ${
                isDarkNavbar
                  ? 'text-neutral-300 hover:bg-white/10 hover:text-white'
                  : 'text-neutral-600 hover:bg-neutral-100/90 hover:text-neutral-950'
              }`}
            >
              Demo
            </a>
            <a
              href="#showcase"
              onClick={(e) => handleScrollToSection(e, 'showcase')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-300 ${
                isDarkNavbar
                  ? 'text-neutral-300 hover:bg-white/10 hover:text-white'
                  : 'text-neutral-600 hover:bg-neutral-100/90 hover:text-neutral-950'
              }`}
            >
              Showcase
            </a>
          </nav>

          {/* 3. Right: Action Controls with Even Spacing */}
          <div className="flex items-center gap-2">
            <Link
              href="/call"
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-300 ${
                isDarkNavbar
                  ? 'border border-blue-400/30 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                  : 'border border-blue-200 bg-blue-50/90 text-blue-600 hover:bg-blue-100'
              }`}
            >
              <PhoneCall className="h-3 w-3 text-blue-500" />
              Call Line
            </Link>
            <Link
              href="/admin/login?intent=onboard"
              className={`px-3.5 py-1.5 text-xs rounded-full font-semibold inline-flex items-center gap-1 transition-all duration-300 shadow-sm ${
                isDarkNavbar
                  ? 'bg-white text-neutral-950 hover:bg-neutral-100'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Onboard
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section: Full Viewport Height with hero-gb.png Background */}
        <section
          className="relative h-screen min-h-screen flex flex-col justify-center items-center bg-cover bg-center bg-no-repeat overflow-hidden border-b border-neutral-200/80"
          style={{ backgroundImage: "url('/images/hero-gb.png')" }}
        >
          <div className="soft-shell relative z-10 w-full flex flex-col items-center justify-center text-center my-auto">
            <div className="max-w-3xl mx-auto flex flex-col items-center justify-center text-center animate-soft-rise py-6">
              
              {/* CAVI Title — Ultra Bold Single Word with Tiny Letter Gap (matching footer) */}
              <h1 className="font-display text-8xl sm:text-[13vw] lg:text-[16vw] font-black tracking-[0.04em] bg-gradient-to-b from-neutral-600 via-neutral-900 to-neutral-950 bg-clip-text text-transparent mb-6 leading-none drop-shadow-xs select-none">
                CAVI
              </h1>

              {/* Minimized 2-Line Problem-Solving Description */}
              <div className="max-w-2xl text-base sm:text-lg font-medium leading-relaxed text-neutral-700 mb-10 space-y-1.5">
                <p>CAVI connects support phone lines to your knowledge base and tools to resolve customer calls autonomously in English, Hindi, and Tamil.</p>
                <p>When complex requests occur, human officers receive the complete context brief with zero repeated stories.</p>
              </div>

              {/* Redesigned Rounded-Full Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                <Link
                  href="/admin/login?intent=onboard"
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 text-sm sm:text-base font-semibold rounded-full bg-neutral-950 text-white hover:bg-neutral-800 border border-neutral-900 shadow-md hover:shadow-lg transition-all duration-200 min-w-[200px]"
                >
                  <Building2 className="h-4 w-4" />
                  Onboard Company
                </Link>

                <Link
                  href="/call"
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 text-sm sm:text-base font-semibold rounded-full bg-white/95 text-neutral-950 border border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 shadow-xs hover:shadow-md transition-all duration-200 min-w-[200px]"
                >
                  <PhoneCall className="h-4 w-4 text-blue-600" />
                  Call Support Line
                </Link>
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

        {/* Minimal Showcase & Highlighted 3D Liquid Button Section */}
        <section id="showcase" data-dark-section="true" className="relative py-20 bg-cover bg-center bg-no-repeat overflow-hidden border-t border-neutral-900" style={{ backgroundImage: "url('/images/bg3.png')" }}>
          <div className="soft-shell relative z-10 flex flex-col items-center justify-center text-center">
            
            <h2 className="max-w-2xl text-3xl sm:text-4xl font-extrabold text-white leading-tight drop-shadow-md">
              Ready to resolve customer calls with CAVI?
            </h2>
            <p className="mt-3 max-w-lg text-sm sm:text-base text-neutral-300 font-medium">
              Customer Assistance through Voice Intelligence — Onboard in under 5 minutes.
            </p>

            {/* HIGHLIGHTED 3D LIQUID GLASS BUTTON */}
            <div className="mt-10 relative group">
              {/* Outer 3D Ambient Glow */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600 opacity-75 blur-xl group-hover:opacity-100 group-hover:blur-2xl transition duration-500 animate-pulse" />
              
              {/* Main 3D Liquid Button */}
              <Link
                href="/admin/login?intent=onboard"
                className="relative inline-flex items-center justify-center gap-3 rounded-full px-9 py-4 text-base sm:text-lg font-extrabold text-white transition-all duration-300 transform active:scale-95 group-hover:-translate-y-1
                           bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 
                           border-2 border-white/40 shadow-[0_20px_50px_rgba(37,99,235,0.5),inset_0_2px_4px_rgba(255,255,255,0.6),inset_0_-4px_6px_rgba(0,0,0,0.4)]
                           backdrop-blur-2xl overflow-hidden select-none"
              >
                {/* Liquid Glass Highlight Shimmer Effect */}
                <span className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/35 to-transparent rounded-t-full pointer-events-none" />
                <span className="absolute -left-10 top-0 w-12 h-full bg-white/30 rotate-12 blur-xs group-hover:translate-x-[400px] transition-transform duration-1000 ease-in-out pointer-events-none" />

                <Building2 className="h-5 w-5 text-white drop-shadow-md" />
                <span className="drop-shadow-md tracking-wide">Launch CAVI Engine</span>
                <ArrowRight className="h-5 w-5 text-white drop-shadow-md group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>
        </section>

        {/* Clean White Gap Section (Separating Showcase from Footer) */}
        <section className="bg-slate-50/80 py-12 border-b border-neutral-200">
          <div className="soft-shell flex flex-col items-center justify-center text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
              Enterprise Voice Resolution Infrastructure
            </p>
          </div>
        </section>

        <section data-dark-section="true" className="bg-neutral-950 py-16 text-white">
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

      <footer data-dark-section="true" className="border-t border-neutral-900 bg-neutral-950 text-white pt-16 pb-6 overflow-hidden">
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
