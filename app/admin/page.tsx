'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Company, CallRecord, KnowledgeDoc, BillingInvoice, HumanAgent } from '@/lib/db/schema';
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
} from 'lucide-react';
import Link from 'next/link';

export default function CompanyAdminPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'analytics' | 'calls' | 'telephony' | 'knowledge' | 'billing' | 'team'>('analytics');

  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [searchPhone, setSearchPhone] = useState('');
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);

  const [knowledge, setKnowledge] = useState<KnowledgeDoc[]>([]);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [agents, setAgents] = useState<HumanAgent[]>([]);

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
    { id: 'billing' as const, label: 'Billing', count: null, icon: CreditCard },
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
      const [compRes, callsRes, kbRes, billRes, agentRes] = await Promise.all([
        fetch(`/api/admin/overview?companyId=${selectedCompanyId}`),
        fetch(`/api/admin/calls?companyId=${selectedCompanyId}&phone=${encodeURIComponent(searchPhone)}`),
        fetch(`/api/admin/knowledge?companyId=${selectedCompanyId}`),
        fetch(`/api/admin/billing?companyId=${selectedCompanyId}`),
        fetch(`/api/agent/register?companyId=${selectedCompanyId}`),
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
  }, [fetchAdminData, isAuthChecked]);

  const selectedCompany = companies.find(c => c.id === selectedCompanyId) || companies[0];

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
    <div className="soft-page flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-[#f7f7f5]/90 px-6 py-3.5 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-[#2563eb] transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <div className="h-4 w-px bg-neutral-200" />
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563eb] text-white font-extrabold text-xs">
              {selectedCompany ? selectedCompany.name.charAt(0) : 'O'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg text-neutral-950">
                  {selectedCompany?.name || 'Company'} Management Console
                </span>
                <span className="border border-neutral-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                  Admin
                </span>
              </div>
              <div className="text-[11px] text-neutral-500">
                Hotline: <span className="font-mono font-semibold text-neutral-950">{selectedCompany?.supportPhone}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-700 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            Tenant Isolated
          </span>

          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 py-1.5 font-semibold text-neutral-700 transition duration-300 hover:border-[#2563eb] hover:text-[#2563eb]"
            title="Sign out of Admin Console"
          >
            <LogOut className="h-3.5 w-3.5 text-neutral-500" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="soft-shell flex-1 space-y-6 py-6 text-xs">
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

        {/* TAB 1: Analytics & Minutes */}
        {activeTab === 'analytics' && selectedCompany && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-border/60 bg-card/60 p-5 shadow-sm space-y-1">
                <div className="text-[11px] font-bold uppercase text-muted-foreground">Voice Minutes Consumed</div>
                <div className="text-2xl font-bold text-foreground font-mono">{selectedCompany.minutesUsed} min</div>
                <div className="text-[10px] text-muted-foreground">Rate: ${selectedCompany.pricePerMinute}/min</div>
              </div>

              <div className="rounded-xl border border-border/60 bg-card/60 p-5 shadow-sm space-y-1">
                <div className="text-[11px] font-bold uppercase text-muted-foreground">Total Inbound Calls</div>
                <div className="text-2xl font-bold text-foreground font-mono">{selectedCompany.totalCalls}</div>
                <div className="text-[10px] text-emerald-400">100% real-time Agora voice streaming</div>
              </div>

              <div className="rounded-xl border border-border/60 bg-card/60 p-5 shadow-sm space-y-1">
                <div className="text-[11px] font-bold uppercase text-muted-foreground">AI Resolution Rate</div>
                <div className="text-2xl font-bold text-emerald-400 font-mono">{selectedCompany.aiResolutionRate}%</div>
                <div className="text-[10px] text-muted-foreground">Resolved without human escalation</div>
              </div>

              <div className="rounded-xl border border-border/60 bg-card/60 p-5 shadow-sm space-y-1">
                <div className="text-[11px] font-bold uppercase text-muted-foreground">Human Escalation Rate</div>
                <div className="text-2xl font-bold text-amber-400 font-mono">{100 - selectedCompany.aiResolutionRate}%</div>
                <div className="text-[10px] text-muted-foreground">Transferred with Zero-Repeat Case DNA</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Call Logs & Transcripts Explorer */}
        {activeTab === 'calls' && (
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
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCall(c)}
                      className={`w-full text-left rounded-lg p-3 border transition-all text-xs ${
                        isSelected ? 'border-primary bg-primary/10 shadow-sm' : 'border-border/40 bg-card/50 hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold font-mono text-foreground">{c.callerPhone}</span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                            c.status === 'escalated_to_human'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {c.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{new Date(c.startedAt).toLocaleTimeString()} • {c.durationSeconds}s</span>
                        <span className="text-primary font-semibold">Health: {c.healthScore}/100</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Call Detail & Audio Transcript Timeline */}
            <div className="lg:col-span-7">
              {selectedCall ? (
                <div className="rounded-xl border border-border/70 bg-card/70 p-5 shadow-lg backdrop-blur-md space-y-4">
                  <div className="flex items-center justify-between border-b border-border/50 pb-3">
                    <div>
                      <div className="text-base font-bold text-foreground font-mono">{selectedCall.callerPhone}</div>
                      <div className="text-[11px] text-muted-foreground">Call ID: {selectedCall.id} • Language: {selectedCall.language}</div>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary font-semibold text-[11px] border border-primary/20">
                      Score: {selectedCall.healthScore}/100
                    </span>
                  </div>

                  {/* Case DNA if Escalated */}
                  {selectedCall.caseDna && (
                    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3.5 space-y-2">
                      <div className="flex items-center gap-1.5 font-bold uppercase text-primary text-[10px]">
                        <Sparkles className="h-3.5 w-3.5" /> Zero-Repeat Case DNA Snapshot
                      </div>
                      <p className="text-foreground leading-relaxed font-medium">{selectedCall.caseDna.summary}</p>
                    </div>
                  )}

                  {/* Full Audio Transcript */}
                  <div className="space-y-2">
                    <div className="font-bold uppercase text-[10px] text-muted-foreground">Recorded Audio Turns ({selectedCall.transcripts.length})</div>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {selectedCall.transcripts.map((t, idx) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-lg text-[11px] leading-relaxed ${
                            t.role === 'user' ? 'bg-primary/10 border-l-2 border-primary' : 'bg-background/80 border-l-2 border-muted-foreground/40'
                          }`}
                        >
                          <span className="font-bold uppercase text-[10px] text-muted-foreground block mb-0.5">
                            {t.role === 'user' ? `Caller (${selectedCall.callerPhone})` : 'EchoSphere AI'}
                          </span>
                          <span className="text-foreground">{t.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center rounded-xl border border-dashed border-border/60 p-12 text-muted-foreground">
                  Select a call from the log to view transcript.
                </div>
              )}
            </div>
          </div>
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
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-bold uppercase text-muted-foreground text-[11px]">Active Knowledge Documents ({knowledge.length})</h3>
              <div className="space-y-3">
                {knowledge.map((k) => (
                  <div key={k.id} className="rounded-xl border border-border/60 bg-card/60 p-4 space-y-2 relative group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">{k.title}</span>
                        <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{k.category}</span>
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
                ))}
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
            <div className="rounded-xl border border-border/70 bg-card/70 p-6 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase text-muted-foreground">Current Plan</div>
                <div className="text-xl font-bold text-foreground mt-0.5">{selectedCompany.plan} Plan</div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  Active usage meter: <span className="font-bold text-foreground font-mono">{selectedCompany.minutesUsed} minutes</span> (${selectedCompany.pricePerMinute}/min)
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-bold uppercase text-muted-foreground">Current Cycle Balance</div>
                <div className="text-2xl font-bold text-primary font-mono">${(selectedCompany.minutesUsed * selectedCompany.pricePerMinute).toFixed(2)}</div>
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
                <h3 className="font-bold text-slate-900 text-sm">Human Support Officers ({agents.length})</h3>
                <p className="text-xs text-slate-500">
                  Only the Company Admin can create and assign human specialists to handle live customer escalations.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* List of Officers */}
              <div className="lg:col-span-7 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {agents.map((a) => (
                    <div key={a.id} className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{a.name}</span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                            a.status === 'online'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          ● {a.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#2563eb] font-semibold">{a.department}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{a.email}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Phone: {a.phone}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Officer Form (Admin Only) */}
              <div className="lg:col-span-5">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Plus className="h-4 w-4 text-neutral-950" />
                    <h4 className="font-bold text-slate-900 text-xs">Create New Support Officer</h4>
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
                      <label className="block font-semibold text-slate-700 mb-1">Direct Outbound Calling Phone</label>
                      <input
                        name="officerPhone"
                        type="tel"
                        required
                        defaultValue="+91 98765 43210"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-mono"
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
      </main>
    </div>
  );
}
