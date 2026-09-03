'use client';

import React, { useState, useEffect } from 'react';
import { CaseDNA } from '@/types/echosphere';
import { CaseQueue } from '@/components/dashboard/CaseQueue';
import { CaseDetail } from '@/components/dashboard/CaseDetail';
import { Headphones, ShieldCheck, ArrowLeft, RefreshCw, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [cases, setCases] = useState<CaseDNA[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCases = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/case/list');
      if (res.ok) {
        const data = await res.json();
        setCases(data.cases || []);
        if (data.cases && data.cases.length > 0 && !selectedCaseId) {
          setSelectedCaseId(data.cases[0].caseId);
        }
      }
    } catch (e) {
      console.error('Failed to load cases:', e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCaseId]);

  useEffect(() => {
    fetchCases();
    const interval = setInterval(fetchCases, 4000);
    return () => clearInterval(interval);
  }, [fetchCases]);

  const handleTakeover = async (caseId: string) => {
    try {
      await fetch(`/api/case/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'assigned' }),
      });
      fetchCases();
    } catch (e) {
      console.error('Takeover failed:', e);
    }
  };

  const selectedCase = cases.find(c => c.caseId === selectedCaseId) || cases[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-card/30 to-background text-foreground flex flex-col">
      {/* Top Header */}
      <header className="border-b border-border/50 bg-card/60 backdrop-blur-md sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Caller Interface
          </Link>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              <Headphones className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm tracking-tight">EchoSphere Operations Center</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <Link
            href="/company"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-semibold"
          >
            <Building2 className="h-3.5 w-3.5 text-primary" /> Company Brain
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Zero-Repeat Human Routing Active
          </div>
          <button
            onClick={fetchCases}
            className="flex items-center gap-1 rounded-md border border-border/60 bg-background/50 p-1.5 text-xs text-muted-foreground hover:text-foreground"
            title="Refresh queue"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <CaseQueue
            cases={cases}
            selectedCaseId={selectedCaseId}
            onSelectCase={id => setSelectedCaseId(id)}
          />
        </div>

        <div className="lg:col-span-8">
          {selectedCase ? (
            <CaseDetail caseData={selectedCase} onTakeover={handleTakeover} />
          ) : (
            <div className="h-full flex items-center justify-center rounded-xl border border-dashed border-border/60 p-12 text-center text-xs text-muted-foreground">
              No case selected. Choose an item from the queue to review context.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
