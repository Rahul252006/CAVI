'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { ArrowLeft, Mail, PhoneCall, Send, CheckCircle2, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

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
          <div className="soft-shell max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">
              <MessageSquare className="h-3.5 w-3.5" /> Enterprise Inquiries
            </div>
            <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">
              Contact CAVI Support & Sales
            </h1>
            <p className="mt-4 text-base leading-relaxed text-neutral-400">
              Have questions about enterprise deployment, custom voice models, or volume pricing? We are here to help.
            </p>
          </div>
        </div>

        <div className="soft-shell max-w-2xl py-12">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-8 backdrop-blur-md shadow-xl">
            {submitted ? (
              <div className="text-center py-10 space-y-3">
                <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-bold text-white">Message Received!</h2>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  Thank you for contacting CAVI. An enterprise support specialist will get back to you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 rounded-full border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs font-bold text-neutral-200 hover:bg-neutral-800 transition-all"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Jane Doe"
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="jane@company.com"
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="How can CAVI help your support team?"
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 py-3 text-xs font-bold text-white shadow-lg border border-blue-500/30 transition-all"
                >
                  <Send className="h-3.5 w-3.5" />
                  Submit Inquiry
                </button>
              </form>
            )}

            <div className="mt-8 border-t border-neutral-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-400" />
                <span>contact@cavi.ai</span>
              </div>
              <Link href="/call" className="flex items-center gap-1.5 font-semibold text-blue-400 hover:underline">
                <PhoneCall className="h-3.5 w-3.5" />
                Dial Customer Support Line
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
