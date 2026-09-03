'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Headphones, Loader2, LockKeyhole } from 'lucide-react';
import Link from 'next/link';
import { Company } from '@/lib/db/schema';

export default function AgentLoginPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/overview')
      .then((res) => res.json())
      .then((data) => {
        if (data.companies) {
          setCompanies(data.companies);
          setSelectedCompanyId(data.companies[0]?.id || '');
        }
      })
      .catch(console.error);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/agent/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, companyId: selectedCompanyId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('echosphere_agent_id', data.agent.id);
      localStorage.setItem('echosphere_company_id', data.company.id);

      router.push('/agent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="soft-page flex items-center justify-center p-5">
      <div className="grid w-full max-w-5xl overflow-hidden soft-card animate-soft-rise lg:grid-cols-[0.92fr_1.08fr]">
        <aside className="border-b border-neutral-200 bg-white p-8 lg:border-b-0 lg:border-r">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-neutral-950">
            <ArrowLeft className="h-4 w-4" />
            Back to website
          </Link>

          <div className="mt-16 max-w-sm">
            <p className="soft-kicker">Support officer access</p>
            <h1 className="mt-4 font-display text-5xl leading-tight text-neutral-950">
              Open the queue only when you are assigned to the company.
            </h1>
            <p className="mt-5 text-base leading-7 text-neutral-500">
              Officers see escalated customer cases, Case DNA, confirmed facts, conflicts, and callback actions. Company setup stays with admins.
            </p>
          </div>
        </aside>

        <main className="bg-[#fbfbfa] p-8 sm:p-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white">
                <Headphones className="h-5 w-5 text-neutral-950" />
              </div>
              <h2 className="mt-5 font-display text-3xl leading-tight text-neutral-950">
                Officer sign in
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500">
                Use the email your Company Admin added to the support team.
              </p>
            </div>
            <Link href="/admin/login" className="hidden text-sm font-semibold text-neutral-950 underline underline-offset-4 sm:block">
              Admin login
            </Link>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            {error && (
              <div className="border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="soft-label">Company</label>
              <select
                value={selectedCompanyId}
                onChange={(e) => {
                  setSelectedCompanyId(e.target.value);
                }}
                className="soft-field"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="soft-label">Officer email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@company.com"
                className="soft-field font-mono"
              />
              <p className="mt-2 text-sm leading-6 text-neutral-500">
                Only officers created by the <span className="font-semibold text-neutral-950">Company Admin</span> can sign in here.
              </p>
            </div>

            <button type="submit" disabled={isLoading || !selectedCompanyId || !email} className="soft-action h-12 w-full disabled:opacity-50">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
              Continue to support desk
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
