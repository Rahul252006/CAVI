'use client';

import React from 'react';
import { ExtractedFact, FactConflict } from '@/types/echosphere';
import { CheckCircle2, AlertTriangle, Database } from 'lucide-react';

interface LiveFactsProps {
  facts: Record<string, ExtractedFact>;
  conflicts: FactConflict[];
}

export function LiveFacts({ facts, conflicts }: LiveFactsProps) {
  const factEntries = Object.entries(facts);
  const unresolvedConflicts = conflicts.filter(c => !c.resolved);

  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-4 shadow-sm backdrop-blur-md space-y-3">
      <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Live Memory & Extracted Facts
          </h4>
        </div>
        <span className="text-[11px] text-muted-foreground font-mono">
          {factEntries.length} recorded
        </span>
      </div>

      {/* Conflict Radar Alert */}
      {unresolvedConflicts.length > 0 && (
        <div className="space-y-2">
          {unresolvedConflicts.map((c, i) => (
            <div
              key={i}
              className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-2.5 text-xs text-amber-200 animate-pulse"
            >
              <div className="flex items-center gap-1.5 font-semibold text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                Conflict Radar Detected: {c.field.toUpperCase()}
              </div>
              <div className="mt-1 text-[11px] text-amber-300/90 leading-relaxed">
                Earlier: <span className="font-semibold underline">{c.oldValue}</span> ↔ Later:{' '}
                <span className="font-semibold underline">{c.newValue}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Facts Grid */}
      {factEntries.length === 0 ? (
        <div className="py-4 text-center text-xs text-muted-foreground italic">
          Listening for details (amounts, IDs, dates, issue categories)...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {factEntries.map(([key, fact]) => {
            const hasConflict = conflicts.some(c => c.field === key && !c.resolved);
            return (
              <div
                key={key}
                className={`rounded-lg border p-2.5 text-xs transition-all ${
                  hasConflict
                    ? 'border-amber-500/40 bg-amber-500/5'
                    : fact.confirmed
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-border/40 bg-background/50'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] uppercase font-semibold text-muted-foreground">
                  <span>{key}</span>
                  {fact.confirmed ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="h-2.5 w-2.5" /> Confirmed
                    </span>
                  ) : (
                    <span className="text-muted-foreground font-mono">
                      {Math.round(fact.confidence * 100)}% conf
                    </span>
                  )}
                </div>
                <div className="mt-1 font-semibold text-foreground truncate text-sm">
                  {fact.value}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
