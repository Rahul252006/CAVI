'use client';

import React from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import {
  ArrowLeft,
  BookOpen,
  Cpu,
  Layers,
  PhoneCall,
  ShieldCheck,
  Terminal,
  Volume2,
  Workflow,
  Sparkles,
} from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-blue-500/30 flex flex-col justify-between">
      <div>
        {/* Top Navbar */}
        <header className="sticky top-0 z-40 border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-xl">
          <div className="soft-shell flex h-16 items-center justify-between">
            <Link href="/" className="group flex items-center gap-3 transition-opacity hover:opacity-80">
              <span className="font-display text-2xl font-bold tracking-tight text-white">CAVI</span>
              <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-400">
                DOCS v2.0
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/call"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs font-bold text-neutral-200 hover:border-neutral-700 hover:bg-neutral-800 transition-all"
              >
                <PhoneCall className="h-3.5 w-3.5 text-blue-400" />
                Live Demo Hotline
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

          <div className="soft-shell relative max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-400 mb-4">
              <Sparkles className="h-3.5 w-3.5" /> Platform Architecture & Developer Guide
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Developer Documentation
            </h1>
            <p className="mt-4 text-base leading-relaxed text-neutral-400 max-w-2xl">
              Customer Assistance through Voice Intelligence. Comprehensive reference for AI voice pipelines, dynamic Company Brain configuration, Case DNA context preservation, and telephony routing.
            </p>
          </div>
        </div>

        {/* Docs Content Grid */}
        <div className="soft-shell max-w-5xl py-12">
          <div className="grid gap-12 lg:grid-cols-[240px_1fr]">
            {/* Sidebar Nav */}
            <aside className="hidden space-y-6 lg:block">
              <div className="sticky top-24 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 backdrop-blur-md">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-3">Navigation</h3>
                <ul className="space-y-1 text-xs font-medium text-neutral-400">
                  <li><a href="#introduction" className="block rounded-lg px-3 py-2 hover:bg-neutral-800 hover:text-blue-400 transition-colors">1. Introduction</a></li>
                  <li><a href="#voice-architecture" className="block rounded-lg px-3 py-2 hover:bg-neutral-800 hover:text-blue-400 transition-colors">2. Voice Pipeline</a></li>
                  <li><a href="#company-brain" className="block rounded-lg px-3 py-2 hover:bg-neutral-800 hover:text-blue-400 transition-colors">3. Company Brain</a></li>
                  <li><a href="#case-dna" className="block rounded-lg px-3 py-2 hover:bg-neutral-800 hover:text-blue-400 transition-colors">4. Zero-Repeat Case DNA</a></li>
                  <li><a href="#safety" className="block rounded-lg px-3 py-2 hover:bg-neutral-800 hover:text-blue-400 transition-colors">5. Safety & Guardrails</a></li>
                  <li><a href="#api-reference" className="block rounded-lg px-3 py-2 hover:bg-neutral-800 hover:text-blue-400 transition-colors">6. Core API Endpoints</a></li>
                </ul>
              </div>
            </aside>

            {/* Main Docs Body */}
            <div className="space-y-12 text-sm leading-relaxed text-neutral-300">
              {/* Section 1: Introduction */}
              <section id="introduction" className="scroll-mt-24 space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur-md">
                <div className="flex items-center gap-2 text-blue-400">
                  <BookOpen className="h-5 w-5" />
                  <h2 className="font-display text-2xl font-bold text-white">1. Introduction to CAVI</h2>
                </div>
                <p>
                  <strong className="text-white">CAVI (Customer Assistance through Voice Intelligence)</strong> is an enterprise-grade multilingual voice resolution infrastructure built on top of <strong className="text-white">Agora Conversational AI Engine</strong>.
                </p>
                <p>
                  Unlike basic conversational bots that trap users in IVR loops, CAVI combines real-time acoustic voice activity detection, dynamic code-switching (e.g. Hindi $\leftrightarrow$ English), policy-aware tool execution, and zero-repeat human handoffs via <strong className="text-blue-400">Case DNA</strong>.
                </p>
              </section>

              {/* Section 2: Voice Pipeline */}
              <section id="voice-architecture" className="scroll-mt-24 space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur-md">
                <div className="flex items-center gap-2 text-blue-400">
                  <Volume2 className="h-5 w-5" />
                  <h2 className="font-display text-2xl font-bold text-white">2. Low-Latency Voice Pipeline</h2>
                </div>
                <p>
                  CAVI orchestrates an integrated sub-500ms voice pipeline:
                </p>
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 space-y-3 font-mono text-xs text-neutral-300">
                  <div className="flex items-center gap-2 text-blue-400 font-bold">
                    <Workflow className="h-4 w-4" /> Caller Audio $\to$ STT (Deepgram) $\to$ LLM Engine (OpenAI/Gemini) $\to$ TTS (MiniMax) $\to$ WebRTC (Agora)
                  </div>
                  <p className="text-neutral-400 font-sans text-xs">
                    • <strong>VAD Speech Threshold:</strong> 0.5<br />
                    • <strong>Natural Interruption Window:</strong> 160ms instant voice activity cutoff<br />
                    • <strong>Silence Turn Finalizer:</strong> 480ms end-of-turn detection
                  </p>
                </div>
              </section>

              {/* Section 3: Company Brain */}
              <section id="company-brain" className="scroll-mt-24 space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur-md">
                <div className="flex items-center gap-2 text-blue-400">
                  <Cpu className="h-5 w-5" />
                  <h2 className="font-display text-2xl font-bold text-white">3. Isolated Company Brain</h2>
                </div>
                <p>
                  Every tenant is strictly isolated in MongoDB (`echosphere`). The AI Voice Agent only knows what the company owner configures:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-xs text-neutral-400">
                  <li><strong className="text-white">Identity & Tone:</strong> Support hotline number, agent name, business hours, and language preferences.</li>
                  <li><strong className="text-white">Policy Boundaries:</strong> Whitelist of autonomous actions (e.g., checking status, updating email).</li>
                  <li><strong className="text-white">Confirmation Guardrails:</strong> Irreversible actions (refund approvals, cancellations) require dual-stage confirmation.</li>
                  <li><strong className="text-white">Live Knowledge Docs:</strong> Embedded product SOPs and return policies.</li>
                </ul>
              </section>

              {/* Section 4: Case DNA */}
              <section id="case-dna" className="scroll-mt-24 space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur-md">
                <div className="flex items-center gap-2 text-blue-400">
                  <Layers className="h-5 w-5" />
                  <h2 className="font-display text-2xl font-bold text-white">4. Zero-Repeat Case DNA</h2>
                </div>
                <p>
                  When a call is escalated to a human officer, CAVI generates a real-time structured <strong className="text-white">Case DNA</strong> brief containing:
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 space-y-1">
                    <h4 className="font-bold text-white text-xs">Customer Intent & Facts</h4>
                    <p className="text-xs text-neutral-400">Extracted Order IDs, dates, verified details, and caller emotional state.</p>
                  </div>
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 space-y-1">
                    <h4 className="font-bold text-white text-xs">Actions Taken & Next Steps</h4>
                    <p className="text-xs text-neutral-400">APIs executed during call, escalation reason, and recommended resolution action.</p>
                  </div>
                </div>
              </section>

              {/* Section 5: Safety */}
              <section id="safety" className="scroll-mt-24 space-y-4 rounded-2xl border border-red-500/30 bg-red-500/5 p-6 backdrop-blur-md">
                <div className="flex items-center gap-2 text-red-400">
                  <ShieldCheck className="h-5 w-5" />
                  <h2 className="font-display text-2xl font-bold text-white">5. Safety Boundaries & Guardrails</h2>
                </div>
                <div className="text-xs text-neutral-300 space-y-2">
                  <div className="font-bold text-red-300">Strict Platform Restrictions:</div>
                  <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
                    <li>No medical diagnoses or clinical triage.</li>
                    <li>Never replaces emergency services (112/911 police/ambulance).</li>
                    <li>No authoritative legal or binding financial advice.</li>
                    <li>Zero hallucinations: uncertain or unverified data is never presented as confirmed fact.</li>
                  </ul>
                </div>
              </section>

              {/* Section 6: API Reference */}
              <section id="api-reference" className="scroll-mt-24 space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur-md">
                <div className="flex items-center gap-2 text-blue-400">
                  <Terminal className="h-5 w-5" />
                  <h2 className="font-display text-2xl font-bold text-white">6. Core API Endpoints</h2>
                </div>
                <div className="space-y-3 font-mono text-xs">
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                    <span className="font-bold text-blue-400">POST</span> /api/calls/start
                    <p className="mt-1 font-sans text-neutral-400 text-xs">Matches dialed phone number in MongoDB, validates tenant, and generates Agora RTC/RTM tokens.</p>
                  </div>
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                    <span className="font-bold text-emerald-400">POST</span> /api/invite-agent
                    <p className="mt-1 font-sans text-neutral-400 text-xs">Starts the conversational AI agent in the Agora channel with company-specific Brain prompts.</p>
                  </div>
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                    <span className="font-bold text-purple-400">GET</span> /api/companies
                    <p className="mt-1 font-sans text-neutral-400 text-xs">Lists registered companies and their support phone hotlines.</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
