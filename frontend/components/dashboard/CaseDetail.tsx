'use client';

import React, { useState } from 'react';
import { CaseDNA } from '@/types/echosphere';
import {
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Sparkles,
  PhoneCall,
  Lock,
} from 'lucide-react';

interface CaseDetailProps {
  caseData: CaseDNA;
  onTakeover: (caseId: string) => void;
}

export function CaseDetail({ caseData, onTakeover }: CaseDetailProps) {
  const [isTakenOver, setIsTakenOver] = useState(caseData.status === 'assigned');

  const handleTakeoverClick = () => {
    setIsTakenOver(true);
    onTakeover(caseData.caseId);
  };

  return (
    <div className="rounded-xl border border-border/70 bg-card/70 p-6 shadow-xl backdrop-blur-md space-y-5 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-foreground font-mono">{caseData.caseId}</span>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary border border-primary/20">
              {caseData.escalation.targetSpecialist}
            </span>
          </div>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">{caseData.customerGoal}</p>
        </div>

        {/* Takeover CTA */}
        <button
          onClick={handleTakeoverClick}
          disabled={isTakenOver}
          className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-bold uppercase tracking-wider shadow-lg transition-all ${
            isTakenOver
              ? 'bg-emerald-600 text-white cursor-default'
              : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white animate-pulse'
          }`}
        >
          {isTakenOver ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Specialist Connected & In Control
            </>
          ) : (
            <>
              <PhoneCall className="h-4 w-4" />
              Take Over Call
            </>
          )}
        </button>
      </div>

      {/* Zero-Repeat Context Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-lg bg-background/50 p-3 border border-border/40">
          <div className="text-[10px] font-bold uppercase text-muted-foreground">Languages Used</div>
          <div className="mt-1 font-semibold text-foreground">
            {caseData.language.languagesUsed.map(l => l.toUpperCase()).join(' ↔ ')}{' '}
            {caseData.language.codeSwitching && '(Code-switched)'}
          </div>
        </div>
        <div className="rounded-lg bg-background/50 p-3 border border-border/40">
          <div className="text-[10px] font-bold uppercase text-muted-foreground">Conversation Health</div>
          <div className="mt-1 font-semibold text-amber-400">{caseData.healthScore} / 100 (Risk: High)</div>
        </div>
        <div className="rounded-lg bg-background/50 p-3 border border-border/40">
          <div className="text-[10px] font-bold uppercase text-muted-foreground">Customer Frustration</div>
          <div className="mt-1 font-semibold text-rose-400">
            {Math.round(caseData.frustration * 100)}% (Empathetic tone required)
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-1">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Zero-Repeat AI Executive Briefing
        </div>
        <p className="text-foreground leading-relaxed text-xs">{caseData.summary}</p>
      </div>

      {/* Confirmed Details & Conflict Radar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Confirmed Facts */}
        <div className="rounded-lg border border-border/40 bg-background/40 p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Confirmed Customer Information
          </div>
          <div className="space-y-1.5">
            {caseData.facts.map((f, i) => (
              <div key={i} className="flex items-center justify-between border-b border-border/20 pb-1 text-[11px]">
                <span className="text-muted-foreground uppercase">{f.key}:</span>
                <span className="font-semibold text-foreground">{f.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Conflict Radar */}
        <div className="rounded-lg border border-border/40 bg-background/40 p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            Conflict Radar & Resolved Discrepancies
          </div>
          {caseData.conflicts.length === 0 ? (
            <div className="text-muted-foreground text-[11px] italic py-2">No conflicting values detected.</div>
          ) : (
            <div className="space-y-2">
              {caseData.conflicts.map((c, i) => (
                <div key={i} className="rounded border border-amber-500/30 bg-amber-500/5 p-2 text-[11px]">
                  <div className="font-semibold text-amber-300">{c.field.toUpperCase()} Discrepancy:</div>
                  <div className="text-muted-foreground">
                    Said &apos;{c.oldValue}&apos; then changed to &apos;{c.newValue}&apos;
                  </div>
                  {c.resolution && <div className="text-emerald-400 font-medium mt-0.5">✓ {c.resolution}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transcript Timeline */}
      {caseData.transcriptSnippet && caseData.transcriptSnippet.length > 0 && (
        <div className="rounded-lg border border-border/40 bg-background/30 p-4 space-y-2">
          <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
            Live Call Audio Transcript Context
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {caseData.transcriptSnippet.map((turn, i) => (
              <div
                key={i}
                className={`p-2 rounded-md text-[11px] leading-relaxed ${
                  turn.role === 'user' ? 'bg-primary/10 border-l-2 border-primary' : 'bg-muted/40 border-l-2 border-muted'
                }`}
              >
                <span className="font-bold uppercase text-[10px] text-muted-foreground block">
                  {turn.role === 'user' ? 'Caller' : 'EchoSphere AI'}
                </span>
                <span className="text-foreground">{turn.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Safety Policy Badge */}
      <div className="flex items-center gap-2 rounded-lg border border-border/30 bg-muted/20 px-3 py-2 text-[10px] text-muted-foreground">
        <Lock className="h-3.5 w-3.5 text-primary" />
        <span>Safety Boundary: Non-clinical voice support. Authoritative action requires specialist takeover.</span>
      </div>
    </div>
  );
}
