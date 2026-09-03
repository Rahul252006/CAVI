import React from 'react';
import { CaseDNA } from '@/types/echosphere';

interface CaseQueueProps {
  cases: CaseDNA[];
  selectedCaseId: string | null;
  onSelectCase: (caseId: string) => void;
}

export function CaseQueue({ cases, selectedCaseId, onSelectCase }: CaseQueueProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-4 shadow-md backdrop-blur-md space-y-3">
      <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Live Escalated Queue ({cases.length})
        </h3>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
        {cases.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No active escalations. All conversations healthy.
          </div>
        ) : (
          cases.map(c => {
            const isSelected = c.caseId === selectedCaseId;
            return (
              <button
                key={c.caseId}
                onClick={() => onSelectCase(c.caseId)}
                className={`w-full text-left rounded-lg p-3 border transition-all text-xs ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-border/40 bg-background/50 hover:border-primary/40 hover:bg-card/80'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-foreground font-mono">{c.caseId}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                      c.escalation.priority === 'critical'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : c.escalation.priority === 'high'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    {c.escalation.priority}
                  </span>
                </div>

                <div className="mt-1 font-semibold text-foreground truncate">{c.intent}</div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{c.language.languagesUsed.map(l => l.toUpperCase()).join(' + ')}</span>
                  <span className="font-medium text-primary">Health: {c.healthScore}</span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
