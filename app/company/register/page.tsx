'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CompanyRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('Fintech & Banking');
  const [supportPhone, setSupportPhone] = useState('+91 (800) 555-');
  const [tagline, setTagline] = useState('');
  const [plan, setPlan] = useState<'Starter' | 'Growth' | 'Enterprise'>('Enterprise');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/company/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, industry, supportPhone, tagline, plan }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to onboard company');
      }

      router.push(`/admin?companyId=${data.company.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563eb] text-white font-bold shadow-md shadow-red-500/15">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Onboard Company to EchoSphere</h1>
              <p className="text-xs text-slate-500">Deploy an isolated Voice AI customer support line</p>
            </div>
          </div>

          <Link href="/" className="text-xs font-semibold text-[#2563eb] hover:underline">
            Home
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {error && <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-600 font-medium">{error}</div>}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company / Organization Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Financial Services"
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-semibold"
              >
                <option value="Fintech & Banking">Fintech & Banking</option>
                <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                <option value="Healthcare & Insurance">Healthcare & Insurance</option>
                <option value="Logistics & Delivery">Logistics & Delivery</option>
                <option value="Telecommunications">Telecommunications</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dedicated Support Number</label>
              <input
                type="text"
                required
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                placeholder="+91 (800) 555-0100"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-mono font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company Tagline / Brief Description</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Next-generation merchant payment processing"
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select EchoSphere Plan</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Starter', 'Growth', 'Enterprise'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlan(p)}
                  className={`rounded-xl p-3 border text-left transition-all ${
                    plan === p
                      ? 'border-[#2563eb] bg-red-50/50 shadow-sm ring-1 ring-[#2563eb]'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="font-bold text-slate-900">{p}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {p === 'Starter' ? '$0.20/min' : p === 'Growth' ? '$0.15/min' : '$0.12/min'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-3 rounded-xl btn-primary-gradient py-3 font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Building2 className="h-4 w-4" />}
            Create Company & Launch Portal
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          <Link href="/admin/login" className="hover:underline text-[#2563eb] font-semibold">
            Already registered? Open Company Admin Portal →
          </Link>
        </div>
      </div>
    </div>
  );
}
