'use client';

import React from 'react';
import Link from 'next/link';
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
} from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="soft-page min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="soft-shell flex h-16 items-center justify-between">
          <Link href="/" className="group flex items-center transition-opacity hover:opacity-80">
            <span className="font-display text-2xl font-bold tracking-tight text-neutral-950">CAVI</span>
            <span className="ml-2 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
              DOCS v2.0
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/call" className="soft-action-secondary px-3.5 py-1.5 text-xs">
              <PhoneCall className="h-3.5 w-3.5 text-blue-600" />
              Live Demo Line
            </Link>
            <Link href="/" className="soft-action px-3.5 py-1.5 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <div className="border-b border-slate-200 bg-white py-14">
        <div className="soft-shell max-w-4xl">
          <p className="soft-kicker text-blue-600">Official Documentation</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-slate-900 sm:text-5xl">
            CAVI Platform Architecture & Developer Guide
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Customer Assistance through Voice Intelligence. Comprehensive reference for AI voice pipelines, Company Brain configuration, Case DNA context preservation, and telephony routing.
          </p>
        </div>
      </div>

      {/* Docs Content Grid */}
      <div className="soft-shell max-w-5xl py-12">
        <div className="grid gap-12 lg:grid-cols-[240px_1fr]">
          {/* Sidebar Nav */}
          <aside className="hidden space-y-6 lg:block">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Overview</h3>
              <ul className="mt-2 space-y-1.5 text-xs font-medium text-slate-600">
                <li><a href="#introduction" className="block rounded-lg px-2.5 py-1.5 hover:bg-slate-100 hover:text-blue-600">Introduction</a></li>
                <li><a href="#voice-architecture" className="block rounded-lg px-2.5 py-1.5 hover:bg-slate-100 hover:text-blue-600">Voice Pipeline</a></li>
                <li><a href="#company-brain" className="block rounded-lg px-2.5 py-1.5 hover:bg-slate-100 hover:text-blue-600">Company Brain</a></li>
                <li><a href="#case-dna" className="block rounded-lg px-2.5 py-1.5 hover:bg-slate-100 hover:text-blue-600">Case DNA Context</a></li>
                <li><a href="#safety" className="block rounded-lg px-2.5 py-1.5 hover:bg-slate-100 hover:text-blue-600">Safety & Guardrails</a></li>
                <li><a href="#api-reference" className="block rounded-lg px-2.5 py-1.5 hover:bg-slate-100 hover:text-blue-600">API Reference</a></li>
              </ul>
            </div>
          </aside>

          {/* Main Docs Body */}
          <div className="space-y-12 text-sm leading-relaxed text-slate-700">
            {/* Section 1: Introduction */}
            <section id="introduction" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <BookOpen className="h-5 w-5" />
                <h2 className="font-display text-2xl font-bold text-slate-900">1. Introduction to CAVI</h2>
              </div>
              <p>
                <strong>CAVI (Customer Assistance through Voice Intelligence)</strong> is an enterprise-grade multilingual voice resolution infrastructure built on top of <strong>Agora Conversational AI Engine</strong>.
              </p>
              <p>
                Unlike basic conversational bots that trap users in IVR loops or generic chatbots, CAVI combines real-time acoustic voice activity detection, dynamic code-switching (e.g. Hindi $\leftrightarrow$ English), policy-aware tool execution, and zero-repeat human handoffs via <strong>Case DNA</strong>.
              </p>
            </section>

            {/* Section 2: Voice Pipeline */}
            <section id="voice-architecture" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <Volume2 className="h-5 w-5" />
                <h2 className="font-display text-2xl font-bold text-slate-900">2. Low-Latency Voice Pipeline</h2>
              </div>
              <p>
                CAVI orchestrates an integrated sub-500ms voice pipeline:
              </p>
              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 font-mono text-xs">
                <div className="flex items-center gap-2 text-blue-600 font-bold">
                  <Workflow className="h-4 w-4" /> Caller Audio $\to$ STT (Deepgram) $\to$ LLM Engine (OpenAI/Gemini) $\to$ TTS (MiniMax) $\to$ WebRTC (Agora)
                </div>
                <p className="text-slate-600 font-sans text-xs">
                  - <strong>VAD Speech Threshold:</strong> 0.5<br />
                  - <strong>Natural Interruption Window:</strong> 160ms instant voice activity cutoff<br />
                  - <strong>Silence Turn Finalizer:</strong> 480ms end-of-turn detection
                </p>
              </div>
            </section>

            {/* Section 3: Company Brain */}
            <section id="company-brain" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <Cpu className="h-5 w-5" />
                <h2 className="font-display text-2xl font-bold text-slate-900">3. Isolated Company Brain</h2>
              </div>
              <p>
                Every tenant is strictly isolated in MongoDB (`echosphere`). The AI Voice Agent only knows what the company owner configures:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
                <li><strong>Identity & Tone:</strong> Support hotline number, agent name, business hours, and language preferences.</li>
                <li><strong>Policy Boundaries:</strong> Whitelist of autonomous actions (e.g., checking status, updating email).</li>
                <li><strong>Confirmation Guardrails:</strong> Irreversible actions (refund approvals, cancellations) require dual-stage confirmation.</li>
                <li><strong>Live Knowledge Docs:</strong> Embedded product SOPs and return policies.</li>
              </ul>
            </section>

            {/* Section 4: Case DNA */}
            <section id="case-dna" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <Layers className="h-5 w-5" />
                <h2 className="font-display text-2xl font-bold text-slate-900">4. Zero-Repeat Case DNA</h2>
              </div>
              <p>
                When a call is escalated to a human officer, CAVI generates a real-time structured <strong>Case DNA</strong> brief containing:
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <h4 className="font-bold text-slate-900 text-xs">Customer Intent & Facts</h4>
                  <p className="mt-1 text-xs text-slate-500">Extracted Order IDs, dates, verified details, and caller emotional state.</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <h4 className="font-bold text-slate-900 text-xs">Actions Taken & Next Steps</h4>
                  <p className="mt-1 text-xs text-slate-500">APIs executed during call, escalation reason, and recommended resolution action.</p>
                </div>
              </div>
            </section>

            {/* Section 5: Safety */}
            <section id="safety" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <ShieldCheck className="h-5 w-5" />
                <h2 className="font-display text-2xl font-bold text-slate-900">5. Safety Boundaries & Guardrails</h2>
              </div>
              <div className="rounded-xl border border-red-200 bg-red-50/60 p-5 text-xs text-red-900 space-y-2">
                <div className="font-bold">Strict Platform Restrictions:</div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>No medical diagnoses or clinical triage.</li>
                  <li>Never replaces emergency services (112/911 police/ambulance).</li>
                  <li>No authoritative legal or binding financial advice.</li>
                  <li>Zero hallucinations: uncertain or unverified data is never presented as confirmed fact.</li>
                </ul>
              </div>
            </section>

            {/* Section 6: API Reference */}
            <section id="api-reference" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <Terminal className="h-5 w-5" />
                <h2 className="font-display text-2xl font-bold text-slate-900">6. Core API Endpoints</h2>
              </div>
              <div className="space-y-3 font-mono text-xs">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <span className="font-bold text-blue-600">POST</span> /api/calls/start
                  <p className="mt-1 font-sans text-slate-600 text-xs">Matches dialed phone number in MongoDB, validates tenant, and generates Agora RTC/RTM tokens.</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <span className="font-bold text-emerald-600">POST</span> /api/invite-agent
                  <p className="mt-1 font-sans text-slate-600 text-xs">Starts the conversational AI agent in the Agora channel with company-specific Brain prompts.</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <span className="font-bold text-purple-600">GET</span> /api/companies
                  <p className="mt-1 font-sans text-slate-600 text-xs">Lists registered companies and their support phone hotlines.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
