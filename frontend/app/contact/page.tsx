'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, PhoneCall, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

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
        <div className="soft-shell max-w-3xl text-center">
          <p className="soft-kicker text-blue-600">Contact CAVI</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-slate-900 sm:text-5xl">
            Get in Touch with our Team
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Have questions about enterprise deployment, custom voice models, or volume pricing? We are here to help.
          </p>
        </div>
      </div>

      <div className="soft-shell max-w-2xl py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
          {submitted ? (
            <div className="text-center py-10 space-y-3">
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Message Received!</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Thank you for contacting CAVI. An enterprise support specialist will get back to you shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="soft-action-secondary mt-4 px-4 py-2 text-xs"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jane Doe"
                  className="soft-field text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="jane@company.com"
                  className="soft-field text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="How can CAVI help your support team?"
                  className="soft-field text-xs resize-none"
                />
              </div>

              <button type="submit" className="soft-action w-full justify-center py-2.5 text-xs">
                <Send className="h-3.5 w-3.5" />
                Submit Inquiry
              </button>
            </form>
          )}

          <div className="mt-8 border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-600" />
              <span>contact@cavi.ai</span>
            </div>
            <Link href="/call" className="flex items-center gap-1.5 font-semibold text-blue-600 hover:underline">
              <PhoneCall className="h-3.5 w-3.5" />
              Dial Customer Support Line
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
