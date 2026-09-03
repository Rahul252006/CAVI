'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  PhoneCall,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { AgoraRenewalTokens, ClientStartRequest, AgentResponse } from '@/types/conversation';
import type { RTMClient } from 'agora-rtm';

const AgoraConversationWrapper = dynamic(
  () => import('@/components/AgoraConversationWrapper'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 text-slate-700">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm font-semibold">Connecting to Voice Agent...</p>
        </div>
      </div>
    ),
  }
);

export default function CustomerCallInterfacePage() {
  const [supportPhone, setSupportPhone] = useState('');
  const [callerPhone, setCallerPhone] = useState('');
  const [registeredCompanies, setRegisteredCompanies] = useState<
    Array<{ id: string; name: string; supportPhone: string; industry: string }>
  >([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matchedCompany, setMatchedCompany] = useState<{
    id: string;
    name: string;
    supportPhone: string;
    industry: string;
  } | null>(null);

  const [showConversation, setShowConversation] = useState(false);
  const [agoraData, setAgoraData] = useState<{
    token: string;
    channel: string;
    uid: string;
    agentId?: string;
  } | null>(null);
  const [rtmClient, setRtmClient] = useState<RTMClient | null>(null);

  useEffect(() => {
    fetch('/api/companies')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.companies)) {
          setRegisteredCompanies(data.companies);
        }
      })
      .catch((err) => console.error('Failed to load registered companies:', err));
  }, []);

  const handleStartCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setMatchedCompany(null);

    try {
      // 1. Verify that the entered customer care number matches a registered company
      const startRes = await fetch('/api/calls/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supportPhone, callerPhone }),
      });

      const startData = await startRes.json();
      if (!startRes.ok || !startData.success) {
        throw new Error(startData.error || 'Customer care number not found');
      }

      setMatchedCompany(startData.company);

      // 2. Start Agora Voice AI agent and RTM
      const [agentData, rtm] = await Promise.all([
        fetch('/api/invite-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requester_id: startData.uid,
            channel_name: startData.channel,
            company_id: startData.company.id,
          } as ClientStartRequest),
        })
          .then(async (res) => {
            if (!res.ok) return null;
            return res.json() as Promise<AgentResponse>;
          })
          .catch((err) => {
            console.error('Agent invite error:', err);
            return null;
          }),

        (async () => {
          const { default: AgoraRTM } = await import('agora-rtm');
          const rtm: RTMClient = new AgoraRTM.RTM(
            process.env.NEXT_PUBLIC_AGORA_APP_ID!,
            startData.uid
          );
          await rtm.login({ token: startData.rtmToken || startData.token });
          await rtm.subscribe(startData.channel);
          return rtm;
        })(),
      ]);

      setRtmClient(rtm);
      setAgoraData({
        token: startData.token,
        channel: startData.channel,
        uid: startData.uid,
        agentId: agentData?.agent_id,
      });

      setShowConversation(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Customer care number not found or inactive');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenWillExpire = useCallback(
    async (uid: string): Promise<AgoraRenewalTokens> => {
      const channel = agoraData?.channel;
      if (!channel) throw new Error('Missing channel for token renewal');

      const [rtcToken, rtmToken] = await Promise.all([
        fetch(`/api/generate-agora-token?channel=${encodeURIComponent(channel)}&uid=${encodeURIComponent(uid)}`)
          .then((r) => r.json())
          .then((d: { token: string }) => d.token),

        fetch(`/api/generate-agora-rtm-token?channel=${encodeURIComponent(channel)}&uid=${encodeURIComponent(uid)}`)
          .then((r) => r.json())
          .then((d: { token: string }) => d.token),
      ]);

      return { rtcToken, rtmToken };
    },
    [agoraData?.channel]
  );

  const handleEndConversation = useCallback(async () => {
    setShowConversation(false);
    if (agoraData?.agentId && agoraData?.channel) {
      fetch('/api/stop-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: agoraData.agentId,
          channel_name: agoraData.channel,
        }),
      }).catch(console.error);
    }
    if (rtmClient) {
      await rtmClient.logout();
      setRtmClient(null);
    }
    setAgoraData(null);
  }, [agoraData, rtmClient]);

  // If in active call session, render full screen conversation view
  if (showConversation && agoraData && rtmClient) {
    return (
      <div className="flex h-screen w-full flex-col bg-slate-50 text-slate-900">
        <AgoraConversationWrapper
          agoraData={agoraData}
          rtmClient={rtmClient}
          onEndConversation={handleEndConversation}
          onTokenWillExpire={handleTokenWillExpire}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center p-6 selection:bg-blue-100">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl btn-primary-gradient shadow-md">
              <PhoneCall className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">CAVI Support Calling Line</h1>
              <p className="text-xs text-slate-500">Customer Assistance through Voice Intelligence</p>
            </div>
          </div>

          <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
        </div>

        <form onSubmit={handleStartCall} className="space-y-4 text-xs">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 font-medium flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Number Match Failed</div>
                <div className="text-[11px] text-red-600 mt-0.5">{error}</div>
              </div>
            </div>
          )}

          {matchedCompany && (
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-3.5 text-blue-900 flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
              <div>
                <div className="font-bold">{matchedCompany.name}</div>
                <div className="text-[11px] text-blue-700">{matchedCompany.industry} • Number Matched</div>
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Company Customer Care Number *
            </label>
            <input
              type="text"
              required
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              placeholder="e.g. +91 (800) 555-FAST"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono font-bold text-sm"
            />
            {registeredCompanies.length > 0 ? (
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-slate-500 font-medium">Registered companies:</span>
                {registeredCompanies.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSupportPhone(c.supportPhone);
                      setError(null);
                    }}
                    className={`rounded-lg px-2 py-0.5 font-mono text-[11px] font-semibold border transition-all ${
                      supportPhone === c.supportPhone
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {c.name} ({c.supportPhone})
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-[11px] text-slate-500">
                No companies registered yet. Onboard your company via{' '}
                <Link href="/admin/login?intent=onboard" className="text-blue-600 font-semibold hover:underline">
                  Admin Onboard
                </Link>
                .
              </p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Your Phone Number (Caller ID) *
            </label>
            <input
              type="tel"
              required
              value={callerPhone}
              onChange={(e) => setCallerPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono font-medium text-xs"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Attached to your live Case DNA for human specialist callbacks.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 rounded-xl btn-primary-gradient py-3.5 font-bold shadow-md flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Verifying Company & Connecting Voice Agent...</span>
              </>
            ) : (
              <>
                <PhoneCall className="h-4 w-4 text-white" />
                <span>CALL SUPPORT LINE</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Multilingual Voice AI</span>
          </div>
          <Link href="/admin/login" className="text-blue-600 font-semibold hover:underline">
            Company Admin Portal →
          </Link>
        </div>
      </div>
    </div>
  );
}
