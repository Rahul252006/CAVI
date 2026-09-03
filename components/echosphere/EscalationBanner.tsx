'use client';

import React from 'react';
import { ConversationState } from '@/types/echosphere';
import { UserCheck, ShieldAlert, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface EscalationBannerProps {
  state: ConversationState;
}

export function EscalationBanner({ state }: EscalationBannerProps) {
  if (!state.escalation.required) return null;

  return (
    <div className="rounded-xl border border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-card/80 to-rose-950/40 p-4 shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 flex-shrink-0 mt-0.5">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-rose-200">Zero-Repeat Human Handoff Prepared</h4>
              <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-rose-300 border border-rose-500/30">
                {state.escalation.priority || 'High'} Priority
              </span>
            </div>
            <p className="mt-1 text-xs text-rose-300/80 leading-relaxed">
              {state.escalation.reason || 'Case context, confirmed facts, and conflict history transferred.'}
            </p>
            <div className="mt-1.5 text-[11px] font-medium text-muted-foreground">
              Routed to:{' '}
              <span className="text-foreground font-semibold">
                {state.escalation.targetSpecialist || 'Customer Support Specialist'}
              </span>
            </div>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 px-3.5 py-2 text-xs font-semibold text-white shadow transition-colors flex-shrink-0"
        >
          <UserCheck className="h-3.5 w-3.5" />
          Open Control Room
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
