'use client';

import React from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { ArrowLeft, Scale } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-blue-500/30 flex flex-col justify-between">
      <div>
        <header className="sticky top-0 z-40 border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-xl">
          <div className="soft-shell flex h-16 items-center justify-between">
            <Link href="/" className="group flex items-center gap-3 transition-opacity hover:opacity-80">
              <span className="font-display text-2xl font-bold tracking-tight text-white">CAVI</span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 px-4 py-2 text-xs font-bold text-white shadow-lg border border-blue-500/30 transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Home
            </Link>
          </div>
        </header>

        <div className="relative overflow-hidden border-b border-neutral-800 bg-neutral-950 py-14">
          <div className="soft-shell max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">
              <Scale className="h-3.5 w-3.5" /> Legal Agreement
            </div>
            <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">
              Terms of Service
            </h1>
            <p className="mt-2 text-xs text-neutral-400">Effective Date: September 2026</p>
          </div>
        </div>

        <div className="soft-shell max-w-3xl py-12 space-y-8 text-xs leading-relaxed text-neutral-300">
          <section className="space-y-3 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur-md">
            <h2 className="font-bold text-white text-base">1. Acceptance of Terms</h2>
            <p>
              By accessing or using CAVI (Customer Assistance through Voice Intelligence), you agree to be bound by these Terms of Service.
            </p>
          </section>

          <section className="space-y-3 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur-md">
            <h2 className="font-bold text-white text-base">2. Telephony & Minute Billing</h2>
            <p>
              Charges are billed per conversation minute in accordance with the selected tier (Starter, Growth, or Enterprise).
            </p>
          </section>

          <section className="space-y-3 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur-md">
            <h2 className="font-bold text-white text-base">3. Acceptable Use & Safety</h2>
            <p>
              You agree not to use the voice platform for fraudulent emergency calls, harassment, or unauthorized automated robocalls. CAVI strictly disclaims authoritative medical, emergency, or binding legal advice.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
