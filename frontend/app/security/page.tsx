'use client';

import React from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { ArrowLeft, Lock, ShieldCheck, Database, Key, Shield } from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-blue-500/30 flex flex-col justify-between">
      <div>
        <header className="sticky top-0 z-40 border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-xl">
          <div className="soft-shell flex h-16 items-center justify-between">
            <Link href="/" className="group flex items-center gap-3 transition-opacity hover:opacity-80">
              <span className="font-display text-2xl font-bold tracking-tight text-white">CAVI</span>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                SECURITY & COMPLIANCE
              </span>
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
          <div className="soft-shell max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
              <Shield className="h-3.5 w-3.5" /> Enterprise Trust Infrastructure
            </div>
            <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">
              Security, Privacy & Data Isolation
            </h1>
            <p className="mt-4 text-base leading-relaxed text-neutral-400">
              How CAVI protects voice streams, customer data, and tenant knowledge bases with strict enterprise security boundaries.
            </p>
          </div>
        </div>

        <div className="soft-shell max-w-4xl py-12 space-y-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur-md hover:border-blue-500/30 transition-all space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Database className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-white text-sm">Tenant Data Isolation</h3>
              <p className="text-xs leading-relaxed text-neutral-400">
                Every company registered on CAVI operates in dedicated, isolated collections in MongoDB. Tenant SOPs and customer records are never shared or cross-trained.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur-md hover:border-blue-500/30 transition-all space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-white text-sm">End-to-End Encryption</h3>
              <p className="text-xs leading-relaxed text-neutral-400">
                Real-time WebRTC audio streams and Agora data channels are secured with TLS 1.3 and DTLS-SRTP encryption in transit.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur-md hover:border-blue-500/30 transition-all space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-white text-sm">Action Permission Guardrails</h3>
              <p className="text-xs leading-relaxed text-neutral-400">
                Irreversible actions such as refunds, cancellations, and profile changes strictly require user confirmation or human officer authorization.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur-md hover:border-blue-500/30 transition-all space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Key className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-white text-sm">Token-Authenticated Access</h3>
              <p className="text-xs leading-relaxed text-neutral-400">
                Dynamic short-lived RTC and RTM tokens with 1-hour expiration prevent unauthorized session hijacking or channel eavesdropping.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
