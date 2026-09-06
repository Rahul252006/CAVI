'use client';

import React from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { ArrowLeft, PhoneCall, Sparkles, Target, Shield, Building2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-blue-500/30 flex flex-col justify-between">
      <div>
        {/* Header */}
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

        {/* Hero */}
        <div className="relative overflow-hidden border-b border-neutral-800 bg-neutral-950 py-16">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]" />

          <div className="soft-shell relative max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-400 mb-4">
              <Sparkles className="h-3.5 w-3.5" /> Intelligent Voice Handoff Architecture
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Customer calls should end in resolved cases, not repeated stories.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-neutral-400">
              <strong className="text-white">CAVI (Customer Assistance through Voice Intelligence)</strong> was created with a clear objective: eliminate repetitive support loops and replace them with context-preserving multilingual voice assistance.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="soft-shell max-w-4xl py-16 space-y-12">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur-md hover:border-blue-500/30 transition-all space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-white text-sm">Our Mission</h3>
              <p className="text-xs leading-relaxed text-neutral-400">
                Empower businesses with voice AI that speaks every customer language, respects policy boundaries, and preserves full context.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur-md hover:border-blue-500/30 transition-all space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-white text-sm">Zero-Repeat Technology</h3>
              <p className="text-xs leading-relaxed text-neutral-400">
                Through proprietary Case DNA architecture, customers never repeat their issue when escalating from AI to a human support officer.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur-md hover:border-blue-500/30 transition-all space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-white text-sm">Trust & Security</h3>
              <p className="text-xs leading-relaxed text-neutral-400">
                Enterprise-grade isolation in MongoDB, policy confirmation thresholds, and zero unverified hallucinated claims.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-b from-blue-950/40 to-neutral-900/60 p-8 text-center backdrop-blur-md space-y-4">
            <h2 className="text-xl font-bold text-white">Experience CAVI in action</h2>
            <p className="text-xs text-neutral-300 max-w-lg mx-auto leading-relaxed">
              Test the live real-time voice intelligence on any company support hotline.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Link
                href="/call"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 px-5 py-2.5 text-xs font-bold text-white shadow-lg border border-blue-500/30 transition-all"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                Try Live Calling Line
              </Link>
              <Link
                href="/admin/login?intent=onboard"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-5 py-2.5 text-xs font-bold text-neutral-200 hover:bg-neutral-800 transition-all"
              >
                <Building2 className="h-3.5 w-3.5 text-blue-400" />
                Onboard Company
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
