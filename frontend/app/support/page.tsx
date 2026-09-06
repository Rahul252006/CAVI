'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  HelpCircle,
  PhoneCall,
  Search,
  BookOpen,
  Headphones,
  ShieldCheck,
  Zap,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      q: 'How does CAVI zero-repeat human escalation work?',
      a: 'When an AI voice call reaches policy limits or requires a human officer, CAVI generates a Case DNA summary with confirmed facts, caller goal, and order details. The officer receives full context on their dashboard so the customer never repeats their story.',
    },
    {
      q: 'What languages does CAVI support during live phone calls?',
      a: 'CAVI supports code-switching across English, Hindi, Tamil, Spanish, and over 30 global languages with instant real-time speech-to-text and acoustic voice synthesis.',
    },
    {
      q: 'How do I onboard my company and configure support hotlines?',
      a: 'Sign up through the Admin Portal, assign your company support phone number, set refund limits, upload SOP runbooks, and invite support officers to your team.',
    },
    {
      q: 'How is caller privacy and data isolated?',
      a: 'Every registered company operates in isolated database collections. Transcripts and customer records are protected with TLS 1.3 encryption and enterprise RBAC controls.',
    },
    {
      q: 'What happens if a customer asks a question outside company policies?',
      a: 'CAVI stays strictly within configured company runbooks. For off-topic or high-risk requests, it politely declines or transfers the call to a human specialist.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-blue-500/30">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-xl">
        <div className="soft-shell flex h-16 items-center justify-between">
          <Link href="/" className="group flex items-center gap-3 transition-opacity hover:opacity-80">
            <span className="font-display text-2xl font-bold tracking-tight text-white">CAVI</span>
            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-400">
              HELP CENTER
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/call"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs font-bold text-neutral-200 hover:border-neutral-700 hover:bg-neutral-800 transition-all"
            >
              <PhoneCall className="h-3.5 w-3.5 text-blue-400" />
              Test Voice Hotline
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 px-4 py-2 text-xs font-bold text-white shadow-lg border border-blue-500/30 transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-neutral-800 bg-neutral-950 py-16">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]" />

        <div className="soft-shell relative max-w-3xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-400">
            <HelpCircle className="h-3.5 w-3.5" /> 24/7 Support & Documentation
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            How can we help you today?
          </h1>
          <p className="text-base text-neutral-400">
            Search our knowledge base or browse common topics about CAVI AI voice assistance, officer handoffs, and company integration.
          </p>

          {/* Search Bar */}
          <div className="pt-4 max-w-xl mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-4 w-4 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, setup guides, telephony..."
                className="w-full rounded-full border border-neutral-800 bg-neutral-900/90 pl-11 pr-5 py-3 text-xs text-white placeholder:text-neutral-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Support Categories Grid */}
      <div className="soft-shell max-w-5xl py-12 space-y-12">
        <div className="grid gap-6 sm:grid-cols-3">
          <Link
            href="/docs"
            className="group rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur-md hover:border-blue-500/40 hover:bg-neutral-900/80 transition-all space-y-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Documentation</h3>
              <ChevronRight className="h-4 w-4 text-neutral-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Complete architectural specs, API references, STT/TTS models, and WebRTC integration guides.
            </p>
          </Link>

          <Link
            href="/agent/login"
            className="group rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur-md hover:border-blue-500/40 hover:bg-neutral-900/80 transition-all space-y-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
              <Headphones className="h-5 w-5" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Officer Portal</h3>
              <ChevronRight className="h-4 w-4 text-neutral-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Support officer console to receive live escalated calls, review Case DNA briefs, and dial customers.
            </p>
          </Link>

          <Link
            href="/admin/login"
            className="group rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur-md hover:border-blue-500/40 hover:bg-neutral-900/80 transition-all space-y-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
              <Zap className="h-5 w-5" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Company Admin</h3>
              <ChevronRight className="h-4 w-4 text-neutral-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Configure voice agent identity, company SOP runbooks, knowledge base documents, and view call analytics.
            </p>
          </Link>
        </div>

        {/* FAQs */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-blue-400 font-bold uppercase text-xs tracking-wider">
            <Sparkles className="h-4 w-4" /> Frequently Asked Questions
          </div>
          <div className="space-y-4">
            {filteredFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur-md space-y-2 hover:border-neutral-700 transition-all"
              >
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="text-blue-400 font-mono">Q:</span> {faq.q}
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
