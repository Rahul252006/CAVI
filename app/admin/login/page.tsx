'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Loader2, LockKeyhole, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid admin credentials');
      }

      localStorage.setItem('echosphere_admin_id', data.admin ? data.admin.adminId : 'admin-01');
      localStorage.setItem('echosphere_company_id', data.company.id);

      router.push(`/admin?companyId=${data.company.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="soft-page flex items-center justify-center p-5">
      <div className="grid w-full max-w-5xl overflow-hidden soft-card animate-soft-rise lg:grid-cols-[0.92fr_1.08fr]">
        <aside className="border-b border-neutral-200 bg-gradient-to-b from-blue-700 to-blue-900 p-8 text-white lg:border-b-0 lg:border-r lg:border-neutral-800">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-neutral-300 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to website
          </Link>

          <div className="mt-16 max-w-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">Company owner access</p>
            <h1 className="mt-4 font-display text-5xl leading-tight text-white">
              Sign in before onboarding your company.
            </h1>
            <p className="mt-5 text-base leading-7 text-blue-100">
              EchoSphere first verifies the company owner or admin. After this step, you can configure the Company Brain, hotline, policies, officers, and billing.
            </p>
          </div>

          <div className="mt-12 space-y-3 text-sm text-blue-100">
            {['Owner identity', 'Tenant isolation', 'Company setup'].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-white" />
                {item}
              </div>
            ))}
          </div>
        </aside>

        <main className="bg-white p-8 sm:p-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50">
                <Building2 className="h-5 w-5 text-neutral-950" />
              </div>
              <h2 className="mt-5 font-display text-3xl leading-tight text-neutral-950">
                Company admin sign in
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500">
                Use the owner/admin account connected to your company. New company? Create the owner account first.
              </p>
            </div>
            <Link href="/company/signup" className="hidden text-sm font-semibold text-neutral-950 underline underline-offset-4 sm:block">
              Create owner account
            </Link>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            {error && (
              <div className="border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="soft-label">Owner/admin work email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@company.com"
                className="soft-field font-mono"
              />
            </div>

            <div>
              <label className="soft-label">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="soft-field"
              />
            </div>

            <button type="submit" disabled={isLoading} className="soft-action h-12 w-full disabled:opacity-50">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
              Continue to admin console
            </button>
          </form>

          <div className="mt-6 grid gap-3 border-t border-neutral-200 pt-6 text-sm text-neutral-500 sm:grid-cols-2">
            <Link href="/company/signup" className="soft-card p-4 transition duration-300 hover:-translate-y-0.5 hover:border-blue-600">
              <span className="font-semibold text-neutral-950">First time here?</span>
              <span className="mt-1 block leading-6">Create the company owner account, then onboard the company.</span>
            </Link>
            <Link href="/agent/login" className="soft-card p-4 transition duration-300 hover:-translate-y-0.5 hover:border-blue-600">
              <span className="font-semibold text-neutral-950">Support officer?</span>
              <span className="mt-1 block leading-6">Go to the escalation desk sign-in instead.</span>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
