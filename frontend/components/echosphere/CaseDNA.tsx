'use client';

import React from 'react';
import { CaseDNA as CaseDNAType } from '@/types/echosphere';
import { Dna, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface CaseDNAProps {
  caseData: CaseDNAType;
}

export function CaseDNA({ caseData }: CaseDNAProps) {
  return (
    <div className="rounded-xl border border-border/70 bg-card/80 p-5 shadow-lg backdrop-blur-md space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Dna className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Case DNA: {caseData.caseId}</h3>
            <span className="text-[11px] text-muted-foreground">{caseData.intent}</span>
          </div>
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary border border-primary/20">
          Score: {caseData.healthScore}/100
        </span>
      </div>

      {/* Summary */}
      <div className="rounded-lg bg-background/60 p-3 border border-border/40">
        <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">
          Zero-Repeat Executive Summary
        </div>
        <p className="text-foreground leading-relaxed font-medium">{caseData.summary}</p>
      </div>

      {/* Confirmed Facts */}
      <div>
        <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-2 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Confirmed Case Facts
        </div>
        <div className="grid grid-cols-2 gap-2">
          {caseData.facts.map((f, i) => (
            <div key={i} className="rounded-md border border-border/40 bg-background/40 p-2">
              <span className="text-[10px] uppercase text-muted-foreground">{f.key}:</span>
              <span className="ml-1.5 font-semibold text-foreground">{f.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Conflict History */}
      {caseData.conflicts.length > 0 && (
        <div>
          <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-2 flex items-center gap-1 text-amber-400">
            <AlertTriangle className="h-3 w-3" /> Conflict Radar Resolution History
          </div>
          <div className="space-y-1.5">
            {caseData.conflicts.map((c, i) => (
              <div key={i} className="rounded-md border border-amber-500/30 bg-amber-500/5 p-2 text-amber-200">
                <span className="font-semibold">{c.field.toUpperCase()}:</span> Initial &apos;{c.oldValue}&apos; → Revised &apos;{c.newValue}&apos;
                {c.resolution && <div className="text-[10px] text-muted-foreground mt-0.5">{c.resolution}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Best Action */}
      {caseData.nextBestAction && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
          <div className="text-[10px] font-bold uppercase text-primary tracking-wider mb-1 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> Recommended Specialist Next Step
          </div>
          <p className="text-foreground font-medium">{caseData.nextBestAction}</p>
        </div>
      )}
    </div>
  );
}
