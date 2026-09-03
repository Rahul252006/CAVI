'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock, ShieldCheck, Database, Key } from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="soft-page min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="soft-shell flex h-16 items-center justify-between">
          <Link href="/" className="group flex items-center transition-opacity hover:opacity-80">
            <span className="font-display text-2xl font-bold tracking-tight text-neutral-950">CAVI</span>
            <span className="ml-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
              SECURITY & COMPLIANCE
            </span>
          </Link>

          <Link href="/" className="soft-action px-3.5 py-1.5 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Link>
        </div>
      </header>

      <div className="border-b border-slate-200 bg-white py-14">
        <div className="soft-shell max-w-4xl">
          <p className="soft-kicker text-blue-600">Enterprise Trust</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-slate-900 sm:text-5xl">
            Security, Privacy & Data Isolation
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            How CAVI protects voice streams, customer data, and tenant knowledge bases with strict enterprise security boundaries.
          </p>
        </div>
      </div>

      <div className="soft-shell max-w-4xl py-12 space-y-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Tenant Data Isolation</h3>
            <p className="text-xs leading-5 text-slate-500">
              Every company registered on CAVI operates in dedicated, isolated collections in MongoDB. Tenant SOPs and customer records are never shared or cross-trained.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">End-to-End Encryption</h3>
            <p className="text-xs leading-5 text-slate-500">
              Real-time WebRTC audio streams and Agora data channels are secured with TLS 1.3 and DTLS-SRTP encryption in transit.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Action Permission Guardrails</h3>
            <p className="text-xs leading-5 text-slate-500">
              Irreversible actions such as refunds, cancellations, and profile changes strictly require user confirmation or human officer authorization.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Key className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Token-Authenticated Access</h3>
            <p className="text-xs leading-5 text-slate-500">
              Dynamic short-lived RTC and RTM tokens with 1-hour expiration prevent unauthorized session hijacking or channel eavesdropping.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
