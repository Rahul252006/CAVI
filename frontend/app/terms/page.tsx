'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
          <p className="soft-kicker text-blue-600">Legal Agreement</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-slate-900 sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-3 text-xs text-slate-500">Effective Date: September 2026</p>
        </div>
      </div>

      <div className="soft-shell max-w-3xl py-12 space-y-8 text-xs leading-relaxed text-slate-700">
        <section className="space-y-3">
          <h2 className="font-bold text-slate-900 text-base">1. Acceptance of Terms</h2>
          <p>
            By accessing or using CAVI (Customer Assistance through Voice Intelligence), you agree to be bound by these Terms of Service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-slate-900 text-base">2. Telephony & Minute Billing</h2>
          <p>
            Charges are billed per conversation minute in accordance with the selected tier (Starter, Growth, or Enterprise).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-slate-900 text-base">3. Acceptable Use & Safety</h2>
          <p>
            You agree not to use the voice platform for fraudulent emergency calls, harassment, or unauthorized automated robocalls. CAVI strictly disclaims authoritative medical, emergency, or binding legal advice.
          </p>
        </section>
      </div>
    </div>
  );
}
