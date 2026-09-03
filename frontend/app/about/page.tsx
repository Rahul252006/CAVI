'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, PhoneCall, Sparkles, Target, Shield } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="soft-page min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100">
      {/* Header */}
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

      {/* Hero */}
      <div className="border-b border-slate-200 bg-white py-16">
        <div className="soft-shell max-w-3xl text-center">
          <p className="soft-kicker text-blue-600">About CAVI</p>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Customer calls should end in resolved cases, not repeated stories.
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-600">
            <strong>CAVI (Customer Assistance through Voice Intelligence)</strong> was founded with a single mission: to eliminate the frustrating customer support loops and replace them with intelligent, context-preserving multilingual voice assistance.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="soft-shell max-w-4xl py-16 space-y-12">
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4">
              <Target className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Our Mission</h3>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Empower businesses with voice AI that speaks every customer language, respects company policy boundaries, and preserves full context.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Zero-Repeat Technology</h3>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Through proprietary Case DNA architecture, customers never have to repeat their issue when escalating from AI to a human officer.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Trust & Security</h3>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Enterprise-grade isolation in MongoDB, policy confirmation thresholds, and zero unverified hallucinated claims.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-8 text-center">
          <h2 className="text-xl font-bold text-blue-950">Experience CAVI in action</h2>
          <p className="mt-2 text-xs text-blue-700 max-w-lg mx-auto">
            Test the live real-time voice intelligence on any company support hotline.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/call" className="soft-action px-5 py-2 text-xs">
              <PhoneCall className="h-3.5 w-3.5" />
              Try Live Calling Line
            </Link>
            <Link href="/admin/login?intent=onboard" className="soft-action-secondary px-5 py-2 text-xs">
              Onboard Company
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
