'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const handleScrollToTop = (e: React.MouseEvent) => {
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer data-dark-section="true" className="border-t border-neutral-900 bg-neutral-950 text-white pt-16 pb-6 overflow-hidden">
      <div className="soft-shell grid grid-cols-2 gap-10 md:grid-cols-5 lg:gap-12">
        {/* Brand Column */}
        <div className="col-span-2 md:col-span-1 space-y-4">
          <Link href="/" onClick={handleScrollToTop} className="group flex items-center transition-opacity hover:opacity-80">
            <span className="font-display text-2xl font-bold tracking-tight text-white">CAVI</span>
          </Link>
          <p className="text-xs italic text-neutral-400 leading-relaxed">
            AI-powered customer assistance, built for every conversation.
          </p>
        </div>

        {/* Platform Column */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">Platform</h4>
          <ul className="space-y-2 text-xs text-neutral-400">
            <li><Link href="/#demo" className="hover:text-white transition-colors">AI Voice Agents</Link></li>
            <li><Link href="/call" className="hover:text-white transition-colors">Customer Assistance</Link></li>
            <li><Link href="/#company-brain" className="hover:text-white transition-colors">Company Brain</Link></li>
            <li><Link href="/#how-it-works" className="hover:text-white transition-colors">Voice Actions & APIs</Link></li>
            <li><Link href="/#how-it-works" className="hover:text-white transition-colors">Case DNA</Link></li>
            <li><Link href="/agent/login" className="hover:text-white transition-colors">Officer Portal</Link></li>
          </ul>
        </div>

        {/* Solutions Column */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">Solutions</h4>
          <ul className="space-y-2 text-xs text-neutral-400">
            <li><Link href="/call" className="hover:text-white transition-colors">Customer Support</Link></li>
            <li><Link href="/#demo" className="hover:text-white transition-colors">Multilingual Assistance</Link></li>
            <li><Link href="/#how-it-works" className="hover:text-white transition-colors">Intelligent Resolution</Link></li>
            <li><Link href="/agent/login" className="hover:text-white transition-colors">Human Support Routing</Link></li>
          </ul>
        </div>

        {/* Resources Column */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">Resources</h4>
          <ul className="space-y-2 text-xs text-neutral-400">
            <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
            <li><Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            <li><Link href="/support" className="hover:text-white transition-colors">Help Center</Link></li>
          </ul>
        </div>

        {/* Company Column */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">Company</h4>
          <ul className="space-y-2 text-xs text-neutral-400">
            <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
            <li><Link href="/security" className="hover:text-white transition-colors">Security</Link></li>
            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
            <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom Rights & Tagline */}
      <div className="soft-shell mt-12 border-t border-neutral-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
        <div>© 2026 CAVI. All rights reserved.</div>
        <div className="font-medium text-neutral-400">Built for conversations. Designed for resolution.</div>
      </div>

      {/* Watermark text */}
      <div className="w-full select-none pointer-events-none text-center mt-6 pt-4 border-t border-neutral-900/60 overflow-hidden">
        <span className="block w-full font-sans font-black tracking-[0.06em] text-[26vw] sm:text-[27vw] leading-[0.75] bg-gradient-to-b from-neutral-600 via-neutral-800 to-neutral-950 bg-clip-text text-transparent">
          CAVI
        </span>
      </div>
    </footer>
  );
}
