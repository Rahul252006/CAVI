'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="soft-page min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="soft-shell flex h-16 items-center justify-between">
          <Link href="/" className="group flex items-center transition-opacity hover:opacity-80">
            <span className="font-display text-2xl font-bold tracking-tight text-neutral-950">CAVI</span>
          </Link>

          <Link href="/" className="soft-action px-3.5 py-1.5 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Link>
        </div>
      </header>

      <div className="border-b border-slate-200 bg-white py-14">
        <div className="soft-shell max-w-3xl">
          <p className="soft-kicker text-blue-600">Legal & Transparency</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-slate-900 sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-xs text-slate-500">Effective Date: September 2026</p>
        </div>
      </div>

      <div className="soft-shell max-w-3xl py-12 space-y-8 text-xs leading-relaxed text-slate-700">
        <section className="space-y-3">
          <h2 className="font-bold text-slate-900 text-base">1. Information We Collect</h2>
          <p>
            CAVI processes real-time voice audio, caller phone numbers, conversational transcripts, and extracted facts solely for the purpose of resolving customer support requests and providing context-preserving handoffs.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-slate-900 text-base">2. How We Use Voice Data</h2>
          <p>
            Voice streams are processed in real-time through Agora WebRTC and supported transcription pipelines. Raw audio streams are not sold, leased, or utilized to train general-purpose public models.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-slate-900 text-base">3. Tenant Isolation & Data Rights</h2>
          <p>
            Company data, customer records, and knowledge runbooks are partitioned by tenant ID within MongoDB and are accessible only to verified administrators of that tenant.
          </p>
        </section>
      </div>
    </div>
  );
}
