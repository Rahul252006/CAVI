'use client';

import React from 'react';
import { HealthScore } from '@/types/echosphere';
import { Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface ConversationHealthProps {
  health: HealthScore;
}

export function ConversationHealth({ health }: ConversationHealthProps) {
  const getRiskBadge = (risk: HealthScore['escalationRisk']) => {
    switch (risk) {
      case 'Critical':
        return <span className="inline-flex items-center gap-1 rounded bg-rose-500/20 px-2 py-0.5 text-[11px] font-semibold text-rose-300 border border-rose-500/30"><ShieldAlert className="w-3 h-3" /> Critical</span>;
      case 'High':
        return <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-300 border border-amber-500/30">High</span>;
      case 'Medium':
        return <span className="inline-flex items-center gap-1 rounded bg-blue-500/20 px-2 py-0.5 text-[11px] font-semibold text-blue-300 border border-blue-500/30">Medium</span>;
      default:
        return <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-500/30"><CheckCircle2 className="w-3 h-3" /> Low</span>;
    }
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-4 shadow-sm backdrop-blur-md">
      <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Conversation Health</h4>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold tracking-tight ${health.score >= 70 ? 'text-emerald-400' : health.score >= 45 ? 'text-amber-400' : 'text-rose-400'}`}>
                {health.score}
              </span>
              <span className="text-[11px] text-muted-foreground">/ 100</span>
            </div>
          </div>
        </div>

        <div className="text-right space-y-1">
          <div className="text-[10px] uppercase font-semibold text-muted-foreground">Escalation Risk</div>
          {getRiskBadge(health.escalationRisk)}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-3 text-[11px]">
        <div className="rounded-lg bg-background/50 p-2 border border-border/30">
          <div className="text-muted-foreground text-[10px]">Understanding</div>
          <div className="font-semibold text-foreground mt-0.5">{Math.round(health.understanding * 100)}%</div>
        </div>
        <div className="rounded-lg bg-background/50 p-2 border border-border/30">
          <div className="text-muted-foreground text-[10px]">Resolution</div>
          <div className="font-semibold text-foreground mt-0.5">{health.resolutionLikelihood}</div>
        </div>
        <div className="rounded-lg bg-background/50 p-2 border border-border/30">
          <div className="text-muted-foreground text-[10px]">Frustration</div>
          <div className="font-semibold text-foreground mt-0.5">{Math.round(health.frustration * 100)}%</div>
        </div>
      </div>
    </div>
  );
}
