'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Radio, LayoutDashboard, Building2 } from 'lucide-react';
import Link from 'next/link';

type QuickstartConversationLayoutProps = {
  statusPanel: ReactNode;
  pipelineMetrics: ReactNode;
  transcriptPanel: ReactNode;
  visualizer: ReactNode;
  controls: ReactNode;
  healthPanel?: ReactNode;
  languageBadge?: ReactNode;
  liveFacts?: ReactNode;
  escalationBanner?: ReactNode;
  onEndConversation: () => void;
};

export function QuickstartConversationLayout({
  statusPanel,
  pipelineMetrics,
  transcriptPanel,
  visualizer,
  controls,
  healthPanel,
  languageBadge,
  liveFacts,
  escalationBanner,
  onEndConversation,
}: QuickstartConversationLayoutProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#f7f7f5] text-left text-neutral-950">
      {/* Top Header */}
      <header className="flex shrink-0 flex-col gap-3 border-b border-neutral-200 bg-[#f7f7f5]/90 px-4 py-3 backdrop-blur-xl md:h-[76px] md:flex-row md:items-center md:justify-between md:px-6 md:py-0">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-950">
            <Radio className="h-5 w-5" />
          </div>
          <div className="flex min-w-0 flex-col justify-center">
            <div className="flex items-center gap-2">
              <span className="font-display truncate text-xl text-neutral-950">
                CAVI Voice Assistant
              </span>
              {languageBadge}
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span>Real-Time Inbound Voice Line</span>
              <span>•</span>
              {pipelineMetrics}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:pr-1">
          <Link
            href="/admin/login"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-600 transition-colors hover:border-blue-600 hover:text-blue-600"
          >
            <Building2 className="h-3.5 w-3.5 text-primary" />
            Admin Login
          </Link>
          <Link
            href="/agent/login"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-600 transition-colors hover:border-blue-600 hover:text-blue-600"
          >
            <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
            Officer Login
          </Link>
          {statusPanel}
          <Button
            variant="destructive"
            size="sm"
            className="h-8 rounded-full border border-red-200 bg-white px-3 text-xs font-medium text-red-700 hover:bg-red-50"
            onClick={onEndConversation}
            aria-label="End conversation with AI agent"
            title="End conversation"
          >
            End Call
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex min-h-0 w-full flex-1 flex-col gap-4 p-4 md:p-6 lg:flex-row lg:gap-6 overflow-y-auto">
        {/* Left: Transcript & Intelligence Panel */}
        <aside className="order-2 lg:order-1 flex flex-col gap-4 w-full shrink-0 lg:h-full lg:w-[28rem]">
          {escalationBanner}
          <div className="min-h-[260px] flex-1">
            {transcriptPanel}
          </div>
        </aside>

        {/* Center/Right: Voice Visualizer & Live Memory */}
        <main className="order-1 lg:order-2 flex min-h-0 flex-1 flex-col gap-4 lg:border-l lg:border-border/60 lg:pl-6">
          {/* Visualizer & Controls */}
          <div className="soft-card relative flex min-h-[220px] flex-1 flex-col items-center justify-center p-6">
            <div className="flex min-h-0 flex-1 items-center justify-center">
              {visualizer}
            </div>
            <div className="shrink-0 pt-4">{controls}</div>
          </div>

          {/* Bottom Grid: Health Score & Live Facts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {healthPanel}
            {liveFacts}
          </div>
        </main>
      </div>
    </div>
  );
}
