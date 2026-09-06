'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Company, CallRecord, KnowledgeDoc, KnowledgeGapRequest, BillingInvoice, HumanAgent } from '@/lib/db/schema';
import {
  BarChart3,
  BookOpen,
  CreditCard,
  Search,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  FileText,
  Sparkles,
  LogOut,
  Phone,
  RadioTower,
  Users,
  Edit,
  UserMinus,
  CheckCircle,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { formatCallDuration } from '@/lib/conversation';

export default function CompanyAdminPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'analytics' | 'calls' | 'telephony' | 'knowledge' | 'billing' | 'team'>('analytics');

  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [searchPhone, setSearchPhone] = useState('');
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);

  const [knowledge, setKnowledge] = useState<KnowledgeDoc[]>([]);
  const [knowledgeGaps, setKnowledgeGaps] = useState<KnowledgeGapRequest[]>([]);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [agents, setAgents] = useState<HumanAgent[]>([]);

  const [editingAgent, setEditingAgent] = useState<HumanAgent | null>(null);
  const [removingAgent, setRemovingAgent] = useState<HumanAgent | null>(null);
  const [removalReasonInput, setRemovalReasonInput] = useState('');
  const [showRemovedAgents, setShowRemovedAgents] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Payments');
  const [newContent, setNewContent] = useState('');
  const [isAddingDoc, setIsAddingDoc] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const tabs = [
    { id: 'analytics' as const, label: 'Analytics', count: null, icon: BarChart3 },
    { id: 'calls' as const, label: 'Call logs', count: calls.length, icon: Phone },
    { id: 'telephony' as const, label: 'Telephony', count: null, icon: RadioTower },
    { id: 'knowledge' as const, label: 'Knowledge', count: knowledge.length, icon: BookOpen },
    { id: 'billing' as const, label: 'Billing', count: invoices.length, icon: CreditCard },
    { id: 'team' as const, label: 'Team', count: agents.length, icon: Users },
  ];

  useEffect(() => {
    const storedAdminId = localStorage.getItem('echosphere_admin_id');
    const storedCompanyId = localStorage.getItem('echosphere_company_id');

    if (!storedAdminId) {
      router.replace('/admin/login');
      return;
    }

    if (storedCompanyId) {
      setSelectedCompanyId(storedCompanyId);
    }
    setIsAuthChecked(true);
  }, [router]);

  // Sync selectedCompanyId from URL search param if provided
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cid = params.get('companyId') || params.get('companyid');
      if (cid) {
        setSelectedCompanyId(cid);
      }
    }
  }, []);

  const fetchAdminData = useCallback(async () => {
    if (!isAuthChecked) return;

    try {
      setIsLoading(true);
      const [compRes, callsRes, kbRes, gapRes, billRes, agentRes] = await Promise.all([
        fetch(`/api/admin/overview?companyId=${selectedCompanyId}`),
        fetch(`/api/admin/calls?companyId=${selectedCompanyId}&phone=${encodeURIComponent(searchPhone)}`),
        fetch(`/api/admin/knowledge?companyId=${selectedCompanyId}`),
        fetch(`/api/admin/knowledge-gaps?companyId=${selectedCompanyId}`),
        fetch(`/api/admin/billing?companyId=${selectedCompanyId}`),
        fetch(`/api/agent/register?companyId=${selectedCompanyId}&includeRemoved=true`),
      ]);

      if (compRes.ok) {
        const d = await compRes.json();
        if (d.companies) setCompanies(d.companies);
      }
      if (callsRes.ok) {
        const d = await callsRes.json();
        setCalls(d.calls || []);
        if (d.calls?.length > 0 && !selectedCall) setSelectedCall(d.calls[0]);
      }
      if (kbRes.ok) {
        const d = await kbRes.json();
        setKnowledge(d.knowledge || []);
      }
      if (gapRes.ok) {
        const d = await gapRes.json();
        setKnowledgeGaps(d.gaps || d.knowledgeGaps || []);
      }
      if (billRes.ok) {
        const d = await billRes.json();
        setInvoices(d.invoices || []);
      }
      if (agentRes.ok) {
        const d = await agentRes.json();
        setAgents(d.agents || []);
      }
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthChecked, selectedCompanyId, searchPhone, selectedCall]);

  useEffect(() => {
    if (!isAuthChecked) return;

    fetchAdminData();
    const interval = setInterval(fetchAdminData, 3000);
    return () => clearInterval(interval);
  }, [fetchAdminData, isAuthChecked]);

  const selectedCompany = companies.find(c => c.id === selectedCompanyId) || companies[0];

  // 100% Dynamic Real-Time Calculations from Database Call Records:
  const realTotalCalls = calls.length;
  const realTotalMinutes = calls.reduce((acc, c) => acc + Math.max(1, Math.ceil((c.durationSeconds || 0) / 60)), 0);
  const realEscalatedCalls = calls.filter((c) =>
    (c.status as string) === 'escalated' ||
    (c.status as string) === 'escalated_to_human' ||
    Boolean(c.caseDna?.escalationReason)
  ).length;

  const aiResolutionRate = realTotalCalls > 0
    ? Math.max(0, Math.round(((realTotalCalls - realEscalatedCalls) / realTotalCalls) * 100))
    : 100;
  const escalationRate = realTotalCalls > 0 ? (100 - aiResolutionRate) : 0;
  const pricePerMinute = selectedCompany?.pricePerMinute ?? 0.15;
  const currentBalance = (realTotalMinutes * pricePerMinute).toFixed(2);

  const handleToggleActive = async () => {
    if (!selectedCompany) return;
    try {
      const nextActive = !selectedCompany.isActive;
      const res = await fetch('/api/admin/overview', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: selectedCompany.id, isActive: nextActive }),
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (e) {
      console.error('Active toggle failed:', e);
    }
  };

  const handleAddKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent || !selectedCompany) return;
    try {
      setIsAddingDoc(true);
      const res = await fetch('/api/admin/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: selectedCompany.id,
          title: newTitle,
          category: newCategory,
          content: newContent,
        }),
      });
      if (res.ok) {
        setNewTitle('');
        setNewContent('');
        fetchAdminData();
      }
    } catch (e) {
      console.error('Failed to add doc:', e);
    } finally {
      setIsAddingDoc(false);
    }
  };

  const handleDeleteKnowledge = async (id: string) => {
    try {
      await fetch(`/api/admin/knowledge?id=${id}`, { method: 'DELETE' });
      fetchAdminData();
    } catch (e) {
      console.error('Failed to delete doc:', e);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('echosphere_admin_id');
    localStorage.removeItem('echosphere_company_id');
    router.push('/admin/login');
  };

  if (!isAuthChecked || (isLoading && companies.length === 0)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#fbfbfa] flex flex-col font-sans text-neutral-900 selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-[#f7f7f5]/90 px-4 sm:px-6 lg:px-8 py-3.5 backdrop-blur-xl">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-[#2563eb] transition-colors font-medium"
            >
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
            <div className="h-4 w-px bg-neutral-200" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563eb] text-white font-extrabold text-xs shrink-0">
                {selectedCompany ? selectedCompany.name.charAt(0) : 'O'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg text-neutral-950 font-bold">
                    {selectedCompany?.name || 'Company'} Management Console
                  </span>
                  <span className="border border-neutral-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500 rounded">
                    Admin
                  </span>
                </div>
                <div className="text-[11px] text-neutral-500">
                  Hotline: <span className="font-mono font-semibold text-neutral-950">{selectedCompany?.supportPhone || 'Not configured'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-bold text-emerald-700 flex items-center gap-1.5 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              Tenant Isolated
            </span>

            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3.5 py-1.5 font-semibold text-neutral-700 transition duration-300 hover:border-[#2563eb] hover:text-[#2563eb] shadow-xs"
              title="Sign out of Admin Console"
            >
              <LogOut className="h-3.5 w-3.5 text-neutral-500" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container locked to max-w-7xl mx-auto */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-xs flex-1">
        {/* Company Overview & Active Toggle Banner */}
        {selectedCompany && (
          <div className="soft-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-soft-rise">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-display text-3xl text-neutral-950">{selectedCompany.name}</h1>
                <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-600 border border-neutral-200">
                  {selectedCompany.industry}
                </span>
                <span className="rounded-full border border-neutral-200 bg-white px-2 py-0.5 font-mono text-[11px] text-neutral-500">
                  Hotline: {selectedCompany.supportPhone}
                </span>
              </div>
              <p className="mt-1 text-sm text-neutral-500">{selectedCompany.tagline}</p>
            </div>

            {/* EchoSphere Activation Switch */}
            <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-border/50 pt-3 md:pt-0 md:pl-6">
              <div className="text-right">
                <div className="font-bold text-foreground">EchoSphere AI Status</div>
                <div className="text-[11px] text-muted-foreground">
                  {selectedCompany.isActive ? 'Actively Handling Voice Calls' : 'AI Assistant Disabled'}
                </div>
              </div>

              <button
                onClick={handleToggleActive}
                className={`flex items-center gap-1.5 rounded-full border px-4 py-2 font-bold uppercase tracking-[0.12em] transition duration-300 ${
                  selectedCompany.isActive ? 'border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800' : 'border-neutral-300 bg-white text-neutral-500'
                }`}
              >
                {selectedCompany.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                {selectedCompany.isActive ? 'Active' : 'Inactive'}
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-neutral-200 pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition duration-300 ${
                  isActive
                    ? 'border-[#2563eb] bg-[#2563eb] text-white'
                    : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:bg-white hover:text-[#2563eb]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.count !== null && <span className={isActive ? 'text-white/70' : 'text-neutral-400'}>{tab.count}</span>}
              </button>
            );
          })}
        </div>

        {/* TAB 1: Analytics & Real Minutes */}
        {activeTab === 'analytics' && selectedCompany && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-1">
                <div className="text-[11px] font-bold uppercase text-slate-500">Real Voice Minutes Consumed</div>
                <div className="text-2xl font-bold text-slate-900 font-mono">{realTotalMinutes} min</div>
                <div className="text-[10px] text-slate-500 font-mono">Rate: ${pricePerMinute}/min (${currentBalance} accrued)</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-1">
                <div className="text-[11px] font-bold uppercase text-slate-500">Real Inbound Call Count</div>
                <div className="text-2xl font-bold text-slate-900 font-mono">{realTotalCalls}</div>
                <div className="text-[10px] text-emerald-600 font-semibold">Live Agora voice sessions</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-1">
                <div className="text-[11px] font-bold uppercase text-slate-500">Real AI Resolution Rate</div>
                <div className="text-2xl font-bold text-emerald-600 font-mono">{aiResolutionRate}%</div>
                <div className="text-[10px] text-slate-500">{realTotalCalls - realEscalatedCalls} calls resolved autonomously by AI</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-1">
                <div className="text-[11px] font-bold uppercase text-slate-500">Human Escalation Rate</div>
                <div className="text-2xl font-bold text-amber-600 font-mono">{escalationRate}%</div>
                <div className="text-[10px] text-slate-500">{realEscalatedCalls} calls escalated with Zero-Repeat Case DNA</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Call Logs & Transcripts Explorer */}
        {activeTab === 'calls' && (
          calls.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mx-auto font-bold">
                <Phone className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">No Call Logs Recorded Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                No active or completed voice calls recorded for this company in the database. Incoming voice calls to your company support hotline will be transcribed and logged here in real-time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-background/80 px-3 py-2">
                  <Search className="h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    placeholder="Search by customer phone number..."
                    className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none w-full font-mono"
                  />
                </div>

                <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
                  {calls.map((c) => {
                    const isSelected = c.id === selectedCall?.id;
                    const phoneDisplay = c.callerPhone || (c as any).callerNumber || 'Unknown caller';
                    const statusVal = c.status || 'completed';
                    const healthVal = c.healthScore ?? 85;

                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCall(c)}
                        className={`w-full text-left rounded-lg p-3 border transition-all text-xs ${
                          isSelected ? 'border-primary bg-primary/10 shadow-sm' : 'border-border/40 bg-card/50 hover:border-primary/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold font-mono text-foreground">{phoneDisplay}</span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                              (statusVal as string) === 'escalated_to_human' || (statusVal as string) === 'escalated'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {String(statusVal).replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>{c.startedAt ? new Date(c.startedAt).toLocaleTimeString() : 'Recent'} • {formatCallDuration(c.durationSeconds)}</span>
                          <span className="text-primary font-semibold">Health: {healthVal}/100</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Call Detail & Audio Transcript Timeline */}
              <div className="lg:col-span-7">
              {selectedCall ? (() => {
                const selPhone = selectedCall.callerPhone || (selectedCall as any).callerNumber || 'Unknown caller';
                const selLang = selectedCall.language || (selectedCall as any).primaryLanguage || 'undetermined';
                const selHealth = selectedCall.healthScore ?? 85;
                const caseSummary = selectedCall.caseDna?.summary || (selectedCall as any).caseDNA?.summary;
                const caseDna = selectedCall.caseDna || (selectedCall as any).caseDNA;
                const adminNotification = caseDna?.adminNotification || (selectedCall as any).adminNotification;
                const transcriptTurns: Array<{ role?: string; speaker?: string; text: string }> =
                  Array.isArray((selectedCall as any).transcript)
                    ? (selectedCall as any).transcript
                    : Array.isArray(selectedCall.transcripts)
                    ? selectedCall.transcripts
                    : [];

                return (
                  <div className="rounded-xl border border-border/70 bg-card/70 p-5 shadow-lg backdrop-blur-md space-y-4">
                    <div className="flex items-center justify-between border-b border-border/50 pb-3">
                      <div>
                        <div className="text-base font-bold text-foreground font-mono">{selPhone}</div>
                        <div className="text-[11px] text-muted-foreground">Call ID: {selectedCall.id} • Duration: {formatCallDuration(selectedCall.durationSeconds)} • Language: {selLang}</div>
                        <div className="text-[11px] font-semibold text-primary mt-1">
                          Assigned Human Officer: {selectedCall.caseDna?.assignedOfficerName || (selectedCall as any).assignedOfficerName || (selectedCall as any).agentId || 'Not assigned yet'}
                        </div>
                      </div>
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary font-semibold text-[11px] border border-primary/20">
                        Score: {selHealth}/100
                      </span>
                    </div>

                    {/* Escalation Reason Banner */}
                    {(caseDna?.adminActionRequired || adminNotification) && (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-1 text-xs">
                        <div className="font-bold text-red-700 uppercase text-[10px]">
                          Admin Action Required
                        </div>
                        <p className="text-red-950 font-medium">
                          {adminNotification || 'No available matching officer is assigned for this case. Review the call log and assign a qualified officer.'}
                        </p>
                      </div>
                    )}

                    {(selectedCall.status === 'escalated_to_human' || (selectedCall.status as string) === 'escalated' || selectedCall.caseDna?.escalationReason) && (
                      <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 space-y-1 text-xs">
                        <div className="font-bold text-amber-900 uppercase text-[10px]">
                          ⚡ Escalation Reason
                        </div>
                        <p className="text-amber-950 font-medium">
                          {selectedCall.caseDna?.escalationReason || selectedCall.caseDna?.escalation?.reason || (selectedCall as any).escalationReason || 'Human Specialist Support Escalation'}
                        </p>
                      </div>
                    )}

                    {/* Case DNA if Escalated */}
                    {caseSummary && (
                      <div className="rounded-lg border border-primary/30 bg-primary/5 p-3.5 space-y-2">
                        <div className="flex items-center gap-1.5 font-bold uppercase text-primary text-[10px]">
                          <Sparkles className="h-3.5 w-3.5" /> Zero-Repeat Case DNA Snapshot
                        </div>
                        <p className="text-foreground leading-relaxed font-medium">{caseSummary}</p>
                      </div>
                    )}

                    {/* Full Audio Transcript */}
                    <div className="space-y-2">
                      <div className="font-bold uppercase text-[10px] text-muted-foreground">Recorded Audio Turns ({transcriptTurns.length})</div>
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {transcriptTurns.length === 0 ? (
                          <div className="text-muted-foreground text-[11px] italic py-2">No transcript turns recorded for this call.</div>
                        ) : (
                          transcriptTurns.map((t, idx) => {
                            const isUser = t.role === 'user' || t.speaker === 'customer';
                            return (
                              <div
                                key={idx}
                                className={`p-2.5 rounded-lg text-[11px] leading-relaxed ${
                                  isUser ? 'bg-primary/10 border-l-2 border-primary' : 'bg-background/80 border-l-2 border-muted-foreground/40'
                                }`}
                              >
                                <span className="font-bold uppercase text-[10px] text-muted-foreground block mb-0.5">
                                  {isUser ? `Caller (${selPhone})` : 'EchoSphere AI'}
                                </span>
                                <span className="text-foreground">{t.text}</span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                );
              })() : (
                <div className="h-full flex items-center justify-center rounded-xl border border-dashed border-border/60 p-12 text-muted-foreground">
                  Select a call from the log to view transcript.
                </div>
              )}
            </div>
          </div>
        )
      )}

        {/* TAB: Telephony & Inbound Numbers */}
        {activeTab === 'telephony' && selectedCompany && (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Company-Owned Customer Care Number</h2>
                  <p className="text-xs text-slate-500">
                    Incoming cellular mobile calls to this destination number automatically route to {selectedCompany.name}&apos;s isolated Company Brain.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                    ● Destination Number Mapped
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <div className="text-[11px] font-bold uppercase text-slate-500">Dedicated Company Hotline</div>
                  <div className="text-2xl font-bold font-mono text-slate-900">{selectedCompany.supportPhone}</div>
                  <div className="text-[11px] text-slate-500">
                    Tenant Routing Key: <span className="font-mono font-semibold text-[#2563eb]">{selectedCompany.id}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <div className="text-[11px] font-bold uppercase text-slate-500">Telephony Routing Mode</div>
                  <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>Inbound SIP / PSTN Gateway</span>
                    <span className="rounded-full bg-[#2563eb] text-white text-[10px] px-2 py-0.5 font-bold">ACTIVE</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Carrier / SIP Webhook: <span className="font-mono text-slate-700">/api/telephony/inbound</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Inbound Telephony Routing Architecture Guide */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">How Real Mobile Phone Calling Works in EchoSphere</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-1.5">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    <span className="flex h-5 w-5 rounded-full bg-[#2563eb] text-white text-[10px] items-center justify-center font-bold">1</span>
                    Customer Dials Mobile
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Customer calls <span className="font-mono font-bold text-slate-900">{selectedCompany.supportPhone}</span> from their normal cellular phone dialer.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-1.5">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    <span className="flex h-5 w-5 rounded-full bg-[#2563eb] text-white text-[10px] items-center justify-center font-bold">2</span>
                    Destination # Resolves Tenant
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    EchoSphere inspects the destination number, looks up <span className="font-semibold text-slate-900">{selectedCompany.name}</span>, and loads its isolated Company Brain.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-1.5">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    <span className="flex h-5 w-5 rounded-full bg-[#2563eb] text-white text-[10px] items-center justify-center font-bold">3</span>
                    Agora Real-Time Voice AI
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Agora Conversational AI answers the call, executes business APIs, and transfers Case DNA to human officers with zero repetition.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Knowledge Base & SOPs Editor */}
        {activeTab === 'knowledge' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-5">
              {/* Missing Knowledge Gap Alerts Requested by AI Voice Agent */}
              {knowledgeGaps.length > 0 && (
                <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-4 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-amber-900 text-xs flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-600" />
                      Missing Knowledge Base SOPs/Policies Requested by AI Voice Agent ({knowledgeGaps.length})
                    </div>
                    <span className="rounded bg-amber-200 text-amber-900 px-2 py-0.5 font-bold text-[10px]">
                      Action Required
                    </span>
                  </div>
                  <div className="space-y-2">
                    {knowledgeGaps.map((gap) => (
                      <div key={gap.id} className="rounded-lg border border-amber-200 bg-white p-3 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{gap.problemSummary}</span>
                          <span className="rounded bg-blue-50 text-blue-700 px-1.5 py-0.5 text-[10px] font-bold uppercase border border-blue-200">
                            {gap.suggestedCategory}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{gap.recommendedAction}</p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-slate-400 font-mono">Caller: {gap.callerPhone || 'Unknown caller'}</span>
                          <button
                            onClick={() => {
                              setNewTitle(`SOP: ${gap.problemSummary.slice(0, 30)}`);
                              setNewContent(gap.recommendedAction);
                              setNewCategory(gap.suggestedCategory === 'policy' ? 'General' : 'Payments');
                            }}
                            className="rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] px-2.5 py-1 transition-all"
                          >
                            Fill & Publish SOP →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h3 className="font-bold uppercase text-muted-foreground text-[11px]">Active Knowledge Documents ({knowledge.length})</h3>
              <div className="space-y-3">
                {knowledge.map((k) => {
                  const isAiGenerated = k.aiGenerated || (k as any).source === 'ai_generated';
                  return (
                    <div key={k.id} className="rounded-xl border border-border/60 bg-card/60 p-4 space-y-2 relative group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-sm">{k.title}</span>
                          <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{k.category}</span>
                          {isAiGenerated && (
                            <span className="rounded bg-purple-100 border border-purple-200 px-2 py-0.5 text-[10px] font-bold text-purple-700 flex items-center gap-1">
                              ⚡ AI Generated Policy / SOP
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteKnowledge(k.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                          title="Delete Document"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{k.content}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add Knowledge Form */}
            <div className="lg:col-span-5">
              <div className="rounded-xl border border-border/70 bg-card/70 p-5 shadow-lg space-y-4">
                <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                  <Plus className="h-4 w-4 text-primary" />
                  <h3 className="font-bold text-foreground">Add New Company SOP / Policy</h3>
                </div>

                <form onSubmit={handleAddKnowledge} className="space-y-3">
                  <div>
                    <label className="block font-semibold text-muted-foreground mb-1">Document Title</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. UPI Refund Policy"
                      className="w-full rounded-lg border border-border/80 bg-background/80 px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-muted-foreground mb-1">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full rounded-lg border border-border/80 bg-background/80 px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                    >
                      <option value="Payments">Payments</option>
                      <option value="Refunds">Refunds</option>
                      <option value="Account">Account Security</option>
                      <option value="General">General / Policies</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-muted-foreground mb-1">Content & Guidelines</label>
                    <textarea
                      required
                      rows={5}
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="Define the exact rules and instructions for the voice AI..."
                      className="w-full rounded-lg border border-border/80 bg-background/80 p-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isAddingDoc}
                    className="w-full rounded-xl bg-primary py-2.5 font-bold text-primary-foreground hover:bg-primary/90 shadow transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isAddingDoc ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                    Save to Company Brain
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Billing & Invoices */}
        {activeTab === 'billing' && selectedCompany && (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase text-slate-500">Current Plan</div>
                <div className="text-xl font-bold text-slate-900 capitalize mt-0.5">{selectedCompany.plan || 'Growth'} Plan</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Active usage meter: <span className="font-bold text-slate-900 font-mono">{realTotalMinutes} minutes</span> (${pricePerMinute}/min)
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-bold uppercase text-slate-500">Current Cycle Balance</div>
                <div className="text-2xl font-bold text-blue-600 font-mono">${currentBalance}</div>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-card/60 p-5 shadow-sm space-y-3">
              <h3 className="font-bold uppercase text-muted-foreground text-[11px]">Invoice History</h3>
              <div className="space-y-2">
                {invoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-3.5 rounded-lg border border-border/40 bg-background/50">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-primary" />
                      <div>
                        <div className="font-bold text-foreground font-mono">{inv.invoiceNumber}</div>
                        <div className="text-[10px] text-muted-foreground">{inv.billingPeriod} • {inv.minutesUsed} minutes</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-foreground font-mono">${inv.totalAmount.toFixed(2)}</div>
                      <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-bold uppercase text-emerald-300">
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Support Team Management (Admin Only) */}
        {activeTab === 'team' && selectedCompany && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Human Support Officers ({agents.filter((a) => a.status !== 'removed').length} Active)
                </h3>
                <p className="text-xs text-slate-500">
                  Manage human specialists assigned to handle escalated customer cases. Every field is stored and synced with the database.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRemovedAgents(!showRemovedAgents)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-400 hover:text-slate-900 transition"
                >
                  {showRemovedAgents ? 'Hide Removed Officers' : 'View Removed Officers Archive'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* List of Officers */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {agents
                    .filter((a) => (showRemovedAgents ? true : a.status !== 'removed'))
                    .map((a) => {
                      const isRemoved = a.status === 'removed';
                      return (
                        <div
                          key={a.id}
                          className={`rounded-xl border p-4 space-y-2.5 shadow-xs transition-all relative ${
                            isRemoved ? 'border-red-200 bg-red-50/40 opacity-75' : 'border-slate-200 bg-white hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="font-bold text-slate-900 text-sm block">{a.name}</span>
                              <span className="text-[11px] text-blue-600 font-semibold">{a.department}</span>
                            </div>
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase shrink-0 ${
                                isRemoved
                                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                  : a.status === 'online' || a.status === 'available'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              ● {isRemoved ? 'Removed' : a.status}
                            </span>
                          </div>

                          <div className="space-y-1 text-[11px]">
                            <div className="text-slate-600 flex items-center gap-1.5">
                              <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="font-mono text-slate-800">{a.email}</span>
                            </div>
                            <div className="text-slate-600 flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                              <span className="font-mono font-bold text-slate-900">
                                {a.phone || a.mobile || 'Not captured'}
                              </span>
                            </div>
                          </div>

                          {isRemoved && (a as any).removalReason && (
                            <div className="rounded-lg bg-rose-100/60 p-2 text-[10px] text-rose-800 border border-rose-200">
                              <span className="font-bold">Reason for Removal:</span> {(a as any).removalReason}
                            </div>
                          )}

                          {!isRemoved && (
                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                              <button
                                onClick={() => setEditingAgent(a)}
                                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition"
                              >
                                <Edit className="h-3 w-3" /> Edit
                              </button>
                              <button
                                onClick={() => {
                                  setRemovingAgent(a);
                                  setRemovalReasonInput('');
                                }}
                                className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-100 transition"
                              >
                                <UserMinus className="h-3 w-3" /> Remove
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>

                {agents.filter((a) => (showRemovedAgents ? true : a.status !== 'removed')).length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500 text-xs">
                    No team members found. Create a new support officer using the form.
                  </div>
                )}
              </div>

              {/* Add New Officer Form (Admin Only) */}
              <div className="lg:col-span-5">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Plus className="h-4 w-4 text-blue-600" />
                    <h4 className="font-bold text-slate-900 text-xs">Add New Support Officer</h4>
                  </div>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const formData = new FormData(form);
                      const name = formData.get('officerName') as string;
                      const email = formData.get('officerEmail') as string;
                      const phone = formData.get('officerPhone') as string;
                      const department = formData.get('officerDepartment') as string;

                      try {
                        const res = await fetch('/api/agent/register', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            name,
                            email,
                            phone,
                            department,
                            companyId: selectedCompany.id,
                          }),
                        });
                        if (res.ok) {
                          form.reset();
                          fetchAdminData();
                        }
                      } catch (err) {
                        console.error('Failed to create officer:', err);
                      }
                    }}
                    className="space-y-3 text-xs"
                  >
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Officer Full Name</label>
                      <input
                        name="officerName"
                        type="text"
                        required
                        placeholder="e.g. Vikram Malhotra"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Officer Official Email</label>
                      <input
                        name="officerEmail"
                        type="email"
                        required
                        placeholder="e.g. vikram@payfast.demo"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Mobile / Direct Phone Number</label>
                      <input
                        name="officerPhone"
                        type="tel"
                        required
                        placeholder="e.g. +91 98765 43210"
                        defaultValue=""
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-mono font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Assigned Department</label>
                      <select
                        name="officerDepartment"
                        defaultValue="Payments & Refunds"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-semibold"
                      >
                        <option value="Payments & Refunds">Payments & Refunds Specialist</option>
                        <option value="Account Security">Account Security & KYC Specialist</option>
                        <option value="Technical Support">Technical Support Specialist</option>
                        <option value="General Customer Care">General Customer Care</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="soft-action w-full py-2.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Officer to {selectedCompany.name}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EDIT OFFICER MODAL */}
        {editingAgent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Edit className="h-4 w-4 text-blue-600" /> Edit Support Officer Details
                </h3>
                <button
                  onClick={() => setEditingAgent(null)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const formData = new FormData(form);
                  const name = formData.get('name') as string;
                  const email = formData.get('email') as string;
                  const phone = formData.get('phone') as string;
                  const department = formData.get('department') as string;

                  try {
                    const res = await fetch(`/api/agent/${editingAgent.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        id: editingAgent.id,
                        companyId: editingAgent.companyId,
                        name,
                        email,
                        phone,
                        mobile: phone,
                        department,
                      }),
                    });
                    if (res.ok) {
                      setEditingAgent(null);
                      fetchAdminData();
                    }
                  } catch (err) {
                    console.error('Failed to update officer:', err);
                  }
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    name="name"
                    type="text"
                    required
                    defaultValue={editingAgent.name}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    required
                    defaultValue={editingAgent.email}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile / Direct Calling Phone</label>
                  <input
                    name="phone"
                    type="tel"
                    required
                    defaultValue={editingAgent.phone || editingAgent.mobile || ''}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Department</label>
                  <select
                    name="department"
                    defaultValue={editingAgent.department}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                  >
                    <option value="Payments & Refunds">Payments & Refunds Specialist</option>
                    <option value="Account Security">Account Security & KYC Specialist</option>
                    <option value="Technical Support">Technical Support Specialist</option>
                    <option value="General Customer Care">General Customer Care</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingAgent(null)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 shadow"
                  >
                    Save Changes to DB
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* REMOVE OFFICER MODAL (WITH REASON) */}
        {removingAgent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-rose-100 pb-3">
                <h3 className="font-bold text-rose-700 text-sm flex items-center gap-2">
                  <UserMinus className="h-4 w-4 text-rose-600" /> Remove Officer: {removingAgent.name}
                </h3>
                <button
                  onClick={() => setRemovingAgent(null)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  Removing <span className="font-bold text-slate-900">{removingAgent.name}</span> will revoke access and archive their profile in the database. Please specify the reason for removal.
                </p>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reason for Removal (Required)</label>
                  <textarea
                    rows={3}
                    required
                    value={removalReasonInput}
                    onChange={(e) => setRemovalReasonInput(e.target.value)}
                    placeholder="e.g. Resigned from position / Department re-assignment / Policy non-compliance..."
                    className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setRemovingAgent(null)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!removalReasonInput.trim()) return;
                      try {
                        const res = await fetch(`/api/agent/${removingAgent.id}/remove`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            id: removingAgent.id,
                            removalReason: removalReasonInput.trim(),
                          }),
                        });
                        if (res.ok) {
                          setRemovingAgent(null);
                          setRemovalReasonInput('');
                          fetchAdminData();
                        }
                      } catch (err) {
                        console.error('Failed to remove officer:', err);
                      }
                    }}
                    disabled={!removalReasonInput.trim()}
                    className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 shadow disabled:opacity-50"
                  >
                    Confirm & Store Removal in DB
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
