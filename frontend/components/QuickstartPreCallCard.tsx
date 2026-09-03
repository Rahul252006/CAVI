'use client';

import { useEffect, useState } from 'react';
import { Loader2, PhoneCall, Globe, ShieldCheck, Building2, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Company } from '@/lib/db/schema';

type QuickstartPreCallCardProps = {
  isLoading: boolean;
  error: string | null;
  onStartConversation: (companyId: string, callerPhone: string) => void;
};

export function QuickstartPreCallCard({
  isLoading,
  error,
  onStartConversation,
}: QuickstartPreCallCardProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [callerPhone, setCallerPhone] = useState('');

  useEffect(() => {
    fetch('/api/admin/overview')
      .then((res) => res.json())
      .then((data) => {
        const loadedCompanies: Company[] = data.companies || [];
        setCompanies(loadedCompanies);
        setSelectedCompanyId(loadedCompanies[0]?.id || '');
      })
      .catch(() => setCompanies([]));
  }, []);

  const handleDial = () => {
    if (!selectedCompanyId || !callerPhone) return;
    onStartConversation(selectedCompanyId, callerPhone);
  };

  return (
    <div className="soft-card mx-auto flex w-[min(94vw,32rem)] animate-soft-rise flex-col items-center p-8 text-center">
      {/* Top Brand & Telephony Icon */}
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-neutral-950">
        <PhoneCall className="h-6 w-6" />
      </div>

      <h1 className="font-display text-3xl leading-tight text-neutral-950">
        CAVI Support Calling Line
      </h1>
      <p className="mt-3 text-sm font-medium leading-6 text-neutral-500">
        CAVI (Customer Assistance through Voice Intelligence). Calls connect to the company&apos;s isolated setup with <span className="font-semibold text-neutral-950">zero-repeat</span> human handoff.
      </p>

      {/* Dialer Controls */}
      <div className="mt-5 w-full text-left space-y-3">
        <div>
          <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">
            1. Select Support Hotline / Company
          </label>
          <select
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="soft-field text-xs font-semibold"
          >
            {companies.length === 0 ? (
              <option value="">No companies onboarded yet</option>
            ) : (
              companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name} ({company.supportPhone})
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">
            2. Customer Calling Phone Number (Caller ID)
          </label>
          <input
            type="tel"
            required
            value={callerPhone}
            onChange={(e) => setCallerPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="soft-field text-xs font-mono font-bold"
          />
        </div>
      </div>

      {/* Feature Badges */}
      <div className="mt-4 grid grid-cols-2 gap-2 w-full text-left text-[11px]">
        <div className="flex items-center gap-2 rounded-lg bg-neutral-50 p-2 border border-neutral-200">
          <Globe className="h-3.5 w-3.5 text-neutral-950 shrink-0" />
          <span className="text-neutral-700">Hindi, English & Tamil</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-neutral-50 p-2 border border-neutral-200">
          <ShieldCheck className="h-3.5 w-3.5 text-neutral-950 shrink-0" />
          <span className="text-neutral-700">Conflict Radar & Memory</span>
        </div>
      </div>

      {/* Dial Action */}
      <Button
        onClick={handleDial}
        disabled={isLoading || companies.length === 0 || !callerPhone}
        className="soft-action mt-5 h-12 w-full disabled:opacity-50"
        aria-label="Dial Hotline"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Connecting Call to EchoSphere...
          </>
        ) : (
          <>
            <PhoneCall className="h-4 w-4" />
            Dial Hotline Now
          </>
        )}
      </Button>
      {companies.length === 0 && (
        <p className="mt-3 text-xs leading-5 text-neutral-500">
          No company is connected yet. A company owner must finish onboarding before customers can place calls.
        </p>
      )}

      {/* Platform Portal Quick Links */}
      <div className="mt-5 pt-3 border-t border-neutral-200 w-full grid grid-cols-2 gap-2 text-xs">
        <Link
          href="/admin/login"
          className="flex items-center justify-center gap-1.5 rounded-full border border-neutral-200 bg-white p-2 font-semibold text-neutral-500 hover:border-blue-600 hover:text-blue-600 transition-colors"
        >
          <Building2 className="h-3.5 w-3.5" />
          Admin Login
        </Link>
        <Link
          href="/agent/login"
          className="flex items-center justify-center gap-1.5 rounded-full border border-neutral-200 bg-white p-2 font-semibold text-neutral-500 hover:border-blue-600 hover:text-blue-600 transition-colors"
        >
          <Headphones className="h-3.5 w-3.5" />
          Officer Login
        </Link>
      </div>

      {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
    </div>
  );
}
