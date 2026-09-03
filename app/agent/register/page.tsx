'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Headphones, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Company, HumanAgent } from '@/lib/db/schema';

export default function AgentRegisterPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [department, setDepartment] = useState<HumanAgent['department']>('Payments & Refunds');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/overview')
      .then(res => res.json())
      .then(data => {
        if (data.companies) {
          setCompanies(data.companies);
          setCompanyId(data.companies[0]?.id || '');
        }
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/agent/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, companyId, department }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to register agent');
      }

      // Store current agent ID in localStorage for persistence
      localStorage.setItem('echosphere_agent_id', data.agent.id);
      localStorage.setItem('echosphere_company_id', companyId);

      router.push('/agent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-card/30 to-background text-foreground flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-border/70 bg-card/80 p-8 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20">
              <Headphones className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">Officer Onboarding</h1>
              <p className="text-[11px] text-muted-foreground">Register as a human support specialist</p>
            </div>
          </div>

          <Link href="/agent/login" className="text-xs text-muted-foreground hover:text-foreground">
            Sign In →
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {error && <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-rose-300">{error}</div>}

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Simhadri"
              className="w-full rounded-lg border border-border/80 bg-background/80 px-3.5 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">Official Support Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full rounded-lg border border-border/80 bg-background/80 px-3.5 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">Direct Calling Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full rounded-lg border border-border/80 bg-background/80 px-3.5 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">Company / Organization</label>
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="w-full rounded-lg border border-border/80 bg-background/80 px-3.5 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.supportPhone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">Specialist Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value as HumanAgent['department'])}
              className="w-full rounded-lg border border-border/80 bg-background/80 px-3.5 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
            >
              <option value="Payments & Refunds">Payments & Refunds Specialist</option>
              <option value="Account Security">Account Security & KYC Specialist</option>
              <option value="Technical Support">Technical Support Specialist</option>
              <option value="General Customer Care">General Customer Care</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 rounded-xl bg-primary py-3 font-bold text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Register & Enter Dashboard
          </button>
        </form>

        <div className="pt-2 text-center text-[11px] text-muted-foreground">
          <Link href="/" className="hover:underline flex items-center justify-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Back to Inbound Customer Line
          </Link>
        </div>
      </div>
    </div>
  );
}
