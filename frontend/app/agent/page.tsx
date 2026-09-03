'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { HumanAgent, Company } from '@/lib/db/schema';
import { CaseDNA } from '@/types/echosphere';
import {
  PhoneCall,
  PhoneOff,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Loader2,
  LogOut,
  Headphones,
} from 'lucide-react';
import Link from 'next/link';

export default function AgentDashboardPage() {
  const router = useRouter();
  const [agent, setAgent] = useState<HumanAgent | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [cases, setCases] = useState<CaseDNA[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [agentStatus, setAgentStatus] = useState<'online' | 'busy' | 'offline'>('online');
  const [callingState, setCallingState] = useState<{
    isCalling: boolean;
    customerPhone?: string;
    channel?: string;
    message?: string;
  }>({ isCalling: false });

  const fetchAgentAndCases = useCallback(async () => {
    try {
      const storedAgentId = typeof window !== 'undefined' ? localStorage.getItem('echosphere_agent_id') : null;
      const storedCompanyId = typeof window !== 'undefined' ? localStorage.getItem('echosphere_company_id') : null;

      if (!storedAgentId) {
        setIsLoading(false);
        return;
      }

      const [agentRes, caseRes, compRes] = await Promise.all([
        fetch(`/api/agent/register?companyId=${storedCompanyId || ''}`),
        fetch(`/api/case/list?companyId=${storedCompanyId || ''}`),
        fetch(`/api/admin/overview?companyId=${storedCompanyId || ''}`),
      ]);

      if (agentRes.ok) {
        const agentData = await agentRes.json();
        const found = agentData.agents.find((a: HumanAgent) => a.id === storedAgentId);
        if (found) {
          setAgent(found);
          setAgentStatus(found.status);
        }
      }

      if (compRes.ok) {
        const compData = await compRes.json();
        if (compData.selectedCompany) setCompany(compData.selectedCompany);
      }

      if (caseRes.ok) {
        const caseData = await caseRes.json();
        setCases(caseData.cases || []);
        if (caseData.cases?.length > 0 && !selectedCaseId) {
          setSelectedCaseId(caseData.cases[0].caseId);
        }
      }
    } catch (e) {
      console.error('Failed to load agent portal data:', e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCaseId]);

  useEffect(() => {
    fetchAgentAndCases();
    const interval = setInterval(fetchAgentAndCases, 4000);
    return () => clearInterval(interval);
  }, [fetchAgentAndCases]);

  const handleToggleStatus = async (newStatus: 'online' | 'busy' | 'offline') => {
    setAgentStatus(newStatus);
    if (!agent) return;
    try {
      await fetch('/api/agent/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: agent.id, status: newStatus }),
      });
    } catch {
      // Ignored
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('echosphere_agent_id');
    localStorage.removeItem('echosphere_company_id');
    router.push('/agent/login');
  };

  const handleOutboundCall = async (customerPhone: string, caseId: string) => {
    try {
      setCallingState({ isCalling: true, customerPhone, message: `Dialing customer ${customerPhone}...` });

      const res = await fetch('/api/telephony/outbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerPhone,
          caseId,
          agentId: agent?.id,
          companyId: agent?.companyId,
          companySupportPhone: company?.supportPhone || '+91 (800) 555-FAST',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCallingState({
          isCalling: true,
          customerPhone,
          channel: data.channel,
          message: data.message || `Outbound cellular call dispatched to ${customerPhone}`,
        });
      }
    } catch {
      setCallingState({ isCalling: false, message: 'Outbound call failed.' });
    }
  };

  const handleEndOutboundCall = () => {
    setCallingState({ isCalling: false });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // If not signed in, show Sign In prompt
  if (!agent) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-900">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl text-center space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mx-auto">
            <Headphones className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Support Officer Authentication Required</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Please sign in with your company support credentials assigned by your Company Administrator.
          </p>
          <Link
            href="/agent/login"
            className="block w-full rounded-xl btn-primary-gradient py-3 font-bold text-white text-xs shadow-md transition-all"
          >
            Sign In to Support Desk →
          </Link>
        </div>
      </div>
    );
  }

  const selectedCase = cases.find(c => c.caseId === selectedCaseId) || cases[0];
  const callerPhone = '+91 98765 43210';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-50">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg btn-primary-gradient text-white font-bold text-xs shadow-sm">
            <Headphones className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-slate-900">
                {company?.name || 'Company'} Support Desk
              </span>
              <span className="rounded bg-blue-50 border border-blue-200 px-1.5 py-0.2 text-[10px] font-semibold text-blue-700">
                Officer Console
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Hotline: <span className="font-mono font-semibold text-slate-700">{company?.supportPhone}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {/* Status Selector */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              onClick={() => handleToggleStatus('online')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                agentStatus === 'online' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ● Online
            </button>
            <button
              onClick={() => handleToggleStatus('busy')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                agentStatus === 'busy' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Busy
            </button>
            <button
              onClick={() => handleToggleStatus('offline')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                agentStatus === 'offline' ? 'bg-slate-400 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Offline
            </button>
          </div>

          <div className="hidden sm:flex flex-col text-right">
            <span className="font-bold text-slate-900">{agent.name}</span>
            <span className="text-[10px] text-slate-500">{agent.department}</span>
          </div>

          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            title="Sign out of Support Desk"
          >
            <LogOut className="h-3.5 w-3.5 text-slate-500" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Active Outbound Call Banner */}
      {callingState.isCalling && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 flex items-center justify-between text-xs animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 animate-pulse">
              <PhoneCall className="h-4 w-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span>Active Outbound Voice Link: {callingState.customerPhone}</span>
                <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 font-bold">
                  Cellular Carrier Dialing
                </span>
              </div>
              <div className="text-slate-600 text-[11px]">{callingState.message}</div>
            </div>
          </div>

          <button
            onClick={handleEndOutboundCall}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-700 px-3.5 py-1.5 font-semibold text-white shadow transition-colors"
          >
            <PhoneOff className="h-3.5 w-3.5" />
            End Call
          </button>
        </div>
      )}

      {/* Main Content Layout */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        {/* Left: Officer Profile & Case Queue */}
        <div className="lg:col-span-4 space-y-6">
          {/* Officer Identity Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-700 font-bold">
                  {agent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{agent.name}</h3>
                  <div className="text-[11px] text-blue-600 font-semibold">{agent.department}</div>
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                  agentStatus === 'online'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                ● {agentStatus}
              </span>
            </div>

            <div className="text-[11px] space-y-1 text-slate-600">
              <div>Email: <span className="text-slate-900 font-mono font-medium">{agent.email}</span></div>
              <div>Company: <span className="text-slate-900 font-semibold">{company?.name || 'PayFast'}</span></div>
            </div>
          </div>

          {/* Live Escalated Queue */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-bold uppercase text-[11px] text-slate-500">
                Escalated Queue ({cases.length})
              </h3>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>

            <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
              {cases.map((c) => {
                const isSelected = c.caseId === selectedCaseId;
                return (
                  <button
                    key={c.caseId}
                    onClick={() => setSelectedCaseId(c.caseId)}
                    className={`w-full text-left rounded-lg p-3 border transition-all text-xs ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-600'
                        : 'border-slate-200 bg-slate-50 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold font-mono text-slate-900">{c.caseId}</span>
                      <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-blue-700 border border-blue-200">
                        {c.escalation.priority}
                      </span>
                    </div>
                    <div className="mt-1 font-semibold text-slate-900 truncate">{c.intent}</div>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-mono text-slate-900">{callerPhone}</span>
                      <span className="text-blue-600 font-semibold">Health: {c.healthScore}/100</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Selected Case Details & Outbound Calling */}
        <div className="lg:col-span-8">
          {selectedCase ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              {/* Header with Call Customer CTA */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-slate-900 font-mono">{selectedCase.caseId}</span>
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200">
                      {selectedCase.escalation.targetSpecialist}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-sm">
                    <span className="font-bold text-slate-900 font-mono">Caller: {callerPhone}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 font-medium">{selectedCase.customerGoal}</span>
                  </div>
                </div>

                {/* Direct Outbound Calling CTA */}
                <button
                  onClick={() => handleOutboundCall(callerPhone, selectedCase.caseId)}
                  className="inline-flex items-center gap-2 rounded-xl btn-primary-gradient px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all"
                >
                  <PhoneCall className="h-4 w-4" />
                  Call Customer ({callerPhone})
                </button>
              </div>

              {/* Zero-Repeat Context Summary */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase text-blue-700">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  Zero-Repeat Case Briefing
                </div>
                <p className="text-slate-800 leading-relaxed font-medium">{selectedCase.summary}</p>
              </div>

              {/* Confirmed Information & Conflict Radar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Confirmed Information
                  </div>
                  <div className="space-y-1.5">
                    {selectedCase.facts.map((f, i) => (
                      <div key={i} className="flex items-center justify-between border-b border-slate-200/60 pb-1 text-[11px]">
                        <span className="text-slate-500 uppercase">{f.key}:</span>
                        <span className="font-semibold text-slate-900">{f.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] text-amber-700">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Conflict Radar Resolution History
                  </div>
                  {selectedCase.conflicts.length === 0 ? (
                    <div className="text-slate-500 text-[11px] italic py-2">No conflicting values reported.</div>
                  ) : (
                    <div className="space-y-2">
                      {selectedCase.conflicts.map((c, i) => (
                        <div key={i} className="rounded border border-amber-200 bg-amber-50/60 p-2 text-[11px]">
                          <div className="font-semibold text-amber-900">{c.field.toUpperCase()} Discrepancy:</div>
                          <div className="text-slate-600">
                            Initially &apos;{c.oldValue}&apos; → Changed to &apos;{c.newValue}&apos;
                          </div>
                          {c.resolution && <div className="text-emerald-700 font-medium mt-0.5">✓ {c.resolution}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Specialist Action Guide */}
              {selectedCase.nextBestAction && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="font-bold text-[10px] uppercase text-slate-500">Recommended Next Action</div>
                    <div className="font-semibold text-slate-900">{selectedCase.nextBestAction}</div>
                  </div>
                  <button className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                    Mark Resolved
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center rounded-xl border border-dashed border-slate-300 p-12 text-slate-500">
              Select an escalated case from the queue to view caller details.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
