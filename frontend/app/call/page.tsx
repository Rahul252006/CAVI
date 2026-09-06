'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  PhoneCall,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Building2,
  ShieldCheck,
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
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-blue-400/20 animate-ping" />
          </div>
          <p className="text-sm font-semibold tracking-wide text-blue-200">Connecting to Voice Agent...</p>
        </div>
      </div>
    ),
  }
);

export default function CustomerCallInterfacePage() {
  const [supportCountryCode, setSupportCountryCode] = useState('+91');
  const [supportPhoneDigits, setSupportPhoneDigits] = useState('');

  const [callerCountryCode, setCallerCountryCode] = useState('+91');
  const [callerPhoneDigits, setCallerPhoneDigits] = useState('');

  const [registeredCompanies, setRegisteredCompanies] = useState<
    Array<{ id: string; name: string; supportPhone: string; industry: string }>
  >([]);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
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
          if (data.companies[0]?.supportPhone) {
            const digits = data.companies[0].supportPhone.replace(/\D/g, '').slice(-10);
            if (digits) setSupportPhoneDigits(digits);
          }
        }
      })
      .catch((err) => console.error('Failed to load registered companies:', err));
  }, []);

  const handleStartCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanSupport = supportPhoneDigits.replace(/\D/g, '').slice(0, 10);
    const cleanCaller = callerPhoneDigits.replace(/\D/g, '').slice(0, 10);
    if (cleanSupport.length < 6 || cleanCaller.length < 6) {
      setError('Enter the registered company hotline and the real caller phone number to start.');
      return;
    }

    const fullSupportPhone = `${supportCountryCode}${cleanSupport}`;
    const fullCallerPhone = `${callerCountryCode}${cleanCaller}`;

    setIsLoading(true);
    setLoadingStep('Verifying support number...');
    setMatchedCompany(null);

    try {
      // 1. Verify support number matches a registered company
      const startRes = await fetch('/api/calls/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supportPhone: fullSupportPhone,
          phone: fullSupportPhone,
          callerPhone: fullCallerPhone,
          callerNumber: fullCallerPhone,
        }),
      });

      const startData = await startRes.json();
      if (!startRes.ok || !startData.success) {
        throw new Error(startData.error || 'Support number not found or company not onboarded');
      }

      setMatchedCompany(startData.company);
      setLoadingStep('Connecting to AI Voice Assistant...');

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
          try {
            const { default: AgoraRTM } = await import('agora-rtm');
            const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || '4849add8a86849f098b0523bedea6cba';
            const rtmUserId = String(startData.rtmUserId || `user_${startData.uid || Math.floor(Math.random() * 899999 + 100000)}`);
            const rtm: RTMClient = new AgoraRTM.RTM(appId, rtmUserId);
            if (startData.rtmToken) {
              await rtm.login({ token: startData.rtmToken }).catch((err) => console.warn('RTM login warning:', err));
            } else {
              await rtm.login().catch((err) => console.warn('RTM login warning:', err));
            }
            if (startData.channel) {
              await rtm.subscribe(startData.channel).catch((err) => console.warn('RTM subscribe warning:', err));
            }
            return rtm;
          } catch (rtmErr) {
            console.warn('RTM initialization warning (voice RTC active):', rtmErr);
            return null;
          }
        })(),
      ]);

      const resolvedCompanyId = startData.companyId || startData.company?.id || '';
      if (typeof window !== 'undefined') {
        if (resolvedCompanyId) localStorage.setItem('echosphere_company_id', resolvedCompanyId);
        if (fullCallerPhone) localStorage.setItem('echosphere_caller_phone', fullCallerPhone);
      }

      setRtmClient(rtm);
      setAgoraData({
        token: startData.token,
        channel: startData.channel,
        uid: String(startData.uid),
        agentId: agentData?.agent_id,
        companyId: resolvedCompanyId,
        callId: startData.callId,
        callerPhone: fullCallerPhone,
        callerNumber: fullCallerPhone,
        customerPhone: fullCallerPhone,
        companyName: startData.company?.name || 'Customer Support',
      } as any);

      setShowConversation(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Customer care number not found or inactive');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
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

  // Active call view
  if (showConversation && agoraData) {
    return (
      <div className="flex h-screen w-full flex-col bg-slate-950 text-white">
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
    <div className="min-h-screen w-full bg-slate-100/90 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-10 font-sans selection:bg-blue-600 selection:text-white animate-in fade-in duration-500">
      
      {/* FLOATING CONTAINER CARD WITH BRIGHT THICK WHITE BORDER */}
      <div className="max-w-5xl w-full rounded-[2.5rem] border-[5px] border-white bg-white shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[580px] my-auto">
        
        {/* LEFT BLUE PANEL (Refined dot pattern opacity, simple title, 2 white buttons) */}
        <div className="w-full lg:w-5/12 bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 text-white relative flex flex-col justify-between p-8 sm:p-10 border-b lg:border-b-0 lg:border-r border-blue-800/40">
          
          {/* Spaced Dot Pattern with Refined Opacity */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.25)_1.5px,transparent_1.5px)] [background-size:26px_26px] pointer-events-none opacity-45" />

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/20 px-3.5 py-1 backdrop-blur-md shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-blue-300 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200">Customer Support</span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                Start a Call to Customer Care
              </h1>
              <p className="mt-2 text-xs sm:text-sm font-medium text-blue-200 leading-relaxed">
                Connect directly to your company&apos;s AI support assistant for instant voice help.
              </p>
            </div>
          </div>

          {/* 2 WHITE BUTTONS AT BOTTOM OF LEFT BLUE PANEL */}
          <div className="relative z-10 pt-8 mt-8 border-t border-blue-800/60 flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/admin/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white text-neutral-950 font-bold text-xs sm:text-sm px-5 py-2.5 hover:bg-neutral-100 transition-all duration-200 shadow-md"
            >
              <Building2 className="h-4 w-4 text-neutral-950" />
              <span>Admin Portal</span>
            </Link>

            <Link
              href="/agent/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white/10 backdrop-blur-md text-white font-bold text-xs sm:text-sm px-5 py-2.5 hover:bg-white/20 border border-white/30 transition-all duration-200 shadow-xs"
            >
              <ShieldCheck className="h-4 w-4 text-white" />
              <span>Officer Portal</span>
            </Link>
          </div>
        </div>

        {/* RIGHT WHITE PANEL (Light blue gradient from top, clean form, loading state) */}
        <div className="w-full lg:w-7/12 bg-white relative flex flex-col justify-between p-8 sm:p-10">
          
          {/* Subtle light blue gradient overlay coming from top */}
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-blue-50/90 via-blue-50/30 to-transparent pointer-events-none" />

          {/* Top Bar Navigation */}
          <div className="relative z-10 flex items-center justify-between pb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
              <span>Direct Support Call</span>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-slate-500" />
              <span>Home</span>
            </Link>
          </div>

          {/* Form Container */}
          <div className="relative z-10 max-w-md w-full mx-auto my-auto space-y-5">
            
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                Enter Phone Details
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
                Enter the customer care number and your phone number to start.
              </p>
            </div>

            <form onSubmit={handleStartCall} className="space-y-4 text-xs">
              
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-red-700 font-medium flex items-start gap-2.5 shadow-xs animate-in fade-in">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-red-600 font-semibold">{error}</div>
                </div>
              )}

              {matchedCompany && (
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-3.5 text-blue-900 flex items-center gap-2.5 shadow-xs animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                  <div>
                    <div className="font-bold text-xs sm:text-sm">{matchedCompany.name}</div>
                    <div className="text-[11px] text-blue-700">{matchedCompany.industry} • Number Verified</div>
                  </div>
                </div>
              )}

              {/* Input 1: Company Customer Care Number (Country Code + 10 Digits) */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-800 text-xs">
                  Company Customer Care Phone Number <span className="text-blue-600">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={supportCountryCode}
                    onChange={(e) => setSupportCountryCode(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-mono font-bold text-xs sm:text-sm focus:outline-none focus:border-blue-600 shrink-0"
                  >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+971">🇦🇪 +971</option>
                  </select>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={supportPhoneDigits}
                    onChange={(e) => setSupportPhoneDigits(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit hotline (e.g. 8005006001)"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 font-mono font-bold text-xs sm:text-sm shadow-xs transition-colors tracking-wider"
                  />
                </div>

                {registeredCompanies.filter((c, idx, self) => self.findIndex(t => t.id === c.id || t.name === c.name) === idx).length > 0 ? (
                  <div className="mt-2 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500">Registered Onboarded Companies:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {registeredCompanies
                        .filter((c, idx, self) => self.findIndex(t => t.id === c.id || t.name === c.name) === idx)
                        .map((c) => {
                          const cleanDigits = c.supportPhone.replace(/\D/g, '').slice(-10);
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setSupportPhoneDigits(cleanDigits);
                                setError(null);
                              }}
                              className={`rounded-lg px-2.5 py-1 font-mono text-[11px] font-bold border transition-all ${
                                supportPhoneDigits === cleanDigits
                                  ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {c.name} ({c.supportPhone})
                            </button>
                          );
                        })}
                    </div>
                  </div>
                ) : (
                  <p className="mt-1 text-[11px] text-slate-500">
                    No companies registered yet. Onboard your company via{' '}
                    <Link href="/admin/login?intent=onboard" className="text-blue-600 font-bold hover:underline">
                      Admin Onboard
                    </Link>
                    .
                  </p>
                )}
              </div>

              {/* Input 2: Your Mobile Number (Country Code + 10 Digits) */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-800 text-xs">
                  Your Personal Mobile Phone Number (Caller ID) <span className="text-blue-600">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={callerCountryCode}
                    onChange={(e) => setCallerCountryCode(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-mono font-bold text-xs sm:text-sm focus:outline-none focus:border-blue-600 shrink-0"
                  >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+971">🇦🇪 +971</option>
                  </select>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={callerPhoneDigits}
                    onChange={(e) => setCallerPhoneDigits(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile (e.g. 9876543210)"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 font-mono font-semibold text-xs sm:text-sm shadow-xs transition-colors tracking-wider"
                  />
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Strictly 10 digits required (no gaps). Used for verification and human officer callbacks.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 rounded-full bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold py-3.5 text-xs sm:text-sm shadow-md transition-colors duration-300 flex items-center justify-center gap-2.5 disabled:opacity-80 border border-blue-600/40"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2.5">
                    <div className="relative flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      <span className="absolute h-5 w-5 rounded-full border-2 border-white/40 animate-ping pointer-events-none" />
                    </div>
                    <span className="font-bold tracking-wide">{loadingStep || 'Connecting...'}</span>
                  </div>
                ) : (
                  <>
                    <PhoneCall className="h-4 w-4 text-white" />
                    <span className="tracking-wide">START CALL NOW</span>
                  </>
                )}
              </button>
            </form>

          </div>

          {/* Footer inside right white panel */}
          <div className="relative z-10 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">CAVI Voice Resolution Line</span>
            <Link href="/admin/login" className="text-blue-600 font-bold hover:underline">
              Admin Portal →
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
