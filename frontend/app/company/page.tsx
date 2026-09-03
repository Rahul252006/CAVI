'use client';

import React, { useState, useEffect } from 'react';
import { CompanyConfig, ToolPermission } from '@/lib/company/types';
import {
  Building2,
  BookOpen,
  Server,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  Play,
  Save,
  Loader2,
  LayoutDashboard,
} from 'lucide-react';
import Link from 'next/link';

export default function CompanySetupPage() {
  const [config, setConfig] = useState<CompanyConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Live tool testing sandbox state
  const [selectedTool, setSelectedTool] = useState<string>('lookup_transaction');
  const [toolResult, setToolResult] = useState<unknown>(null);
  const [isToolRunning, setIsToolRunning] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/company/config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (e) {
      console.error('Failed to load company config:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePermission = (key: string) => {
    if (!config) return;
    const current = config.permissions[key];
    if (!current) return;

    const updatedPermissions: Record<string, ToolPermission> = {
      ...config.permissions,
      [key]: {
        ...current,
        aiAllowed: !current.aiAllowed,
        humanApprovalRequired: current.aiAllowed ? true : false,
      },
    };

    setConfig({
      ...config,
      permissions: updatedPermissions,
    });
  };

  const handleSaveConfig = async () => {
    if (!config) return;
    try {
      setIsSaving(true);
      const res = await fetch('/api/company/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error('Save failed:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestTool = async () => {
    try {
      setIsToolRunning(true);
      setToolResult(null);
      const res = await fetch('/api/company/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: selectedTool,
          params: { transactionId: 'TXN8392', amount: 2499, customerId: 'CUS-1001' },
        }),
      });
      const data = await res.json();
      setToolResult(data);
    } catch (e) {
      setToolResult({ error: String(e) });
    } finally {
      setIsToolRunning(false);
    }
  };

  if (isLoading || !config) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-card/30 to-background text-foreground flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-border/50 bg-card/60 backdrop-blur-md sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Caller Interface
          </Link>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              <Building2 className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm tracking-tight">EchoSphere Company Brain Setup</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/support"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/60 px-3 py-1.5 text-xs font-semibold hover:bg-muted transition-colors"
          >
            <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
            Support Operations
          </Link>
          <button
            onClick={handleSaveConfig}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 shadow transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saveSuccess ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            {saveSuccess ? 'Saved' : 'Save Changes'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6 text-xs">
        {/* Company Header Card */}
        <div className="rounded-2xl border border-border/70 bg-card/70 p-6 shadow-lg backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground tracking-tight">{config.company.name}</h1>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary border border-primary/20">
                  {config.company.industry}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{config.company.tagline}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-muted-foreground font-semibold uppercase">Supported Languages:</span>
              {config.languages.map((l) => (
                <span
                  key={l.code}
                  className="rounded-md border border-border/60 bg-background/60 px-2 py-1 text-[11px] font-medium text-foreground"
                >
                  ✓ {l.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 2-Column Grid: Knowledge & Operations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Knowledge Base & SOPs */}
          <div className="lg:col-span-6 space-y-6">
            {/* Knowledge Base */}
            <div className="rounded-xl border border-border/60 bg-card/60 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Company Knowledge & SOPs ({config.knowledge.length})
                  </h3>
                </div>
              </div>

              <div className="space-y-3">
                {config.knowledge.map((k) => (
                  <div key={k.id} className="rounded-lg border border-border/40 bg-background/50 p-3.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{k.title}</span>
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                        {k.category}
                      </span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-[11px]">{k.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Connected Business Systems */}
            <div className="rounded-xl border border-border/60 bg-card/60 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                <Server className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Connected Business Systems ({config.connectedSystems.length})
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {config.connectedSystems.map((sys, idx) => (
                  <div key={idx} className="rounded-lg border border-border/40 bg-background/50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground truncate">{sys.name}</span>
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{sys.type}</span>
                      <span className="font-mono">{sys.latencyMs}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: AI Permissions & Policy Sandbox */}
          <div className="lg:col-span-6 space-y-6">
            {/* AI Permissions Policy */}
            <div className="rounded-xl border border-border/60 bg-card/60 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    AI Permissions & Action Boundaries
                  </h3>
                </div>
                <span className="text-[10px] text-muted-foreground">Click to toggle permission</span>
              </div>

              <div className="space-y-2.5">
                {Object.entries(config.permissions).map(([key, perm]) => (
                  <div
                    key={key}
                    onClick={() => handleTogglePermission(key)}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                      perm.aiAllowed
                        ? 'border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10'
                        : 'border-rose-500/40 bg-rose-500/5 hover:bg-rose-500/10'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-foreground flex items-center gap-1.5">
                        {perm.aiAllowed ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
                        )}
                        {perm.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">tool: {key}</div>
                    </div>

                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        perm.aiAllowed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {perm.aiAllowed ? 'AI Allowed' : 'Human Only'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Integration Test Sandbox */}
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-primary/20 pb-2.5">
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4 text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                    Company Systems Test Sandbox
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedTool}
                  onChange={(e) => setSelectedTool(e.target.value)}
                  className="flex-1 rounded-lg border border-border/80 bg-background/80 px-3 py-2 text-xs font-semibold text-foreground focus:outline-none"
                >
                  <option value="lookup_transaction">lookup_transaction (TXN8392)</option>
                  <option value="create_ticket">create_ticket (Payment Failure)</option>
                  <option value="get_refund_status">get_refund_status (TXN8392)</option>
                  <option value="schedule_callback">schedule_callback (CUS-1001)</option>
                  <option value="lookup_customer">lookup_customer (CUS-1001)</option>
                </select>

                <button
                  onClick={handleTestTool}
                  disabled={isToolRunning}
                  className="rounded-lg bg-primary px-4 py-2 font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  {isToolRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                  Execute
                </button>
              </div>

              {toolResult !== null && (
                <div className="rounded-lg bg-background/90 p-3 border border-border/40 font-mono text-[11px] overflow-x-auto">
                  <pre className="text-foreground">{JSON.stringify(toolResult, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
