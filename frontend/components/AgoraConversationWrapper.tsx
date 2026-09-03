'use client';

import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import AgoraRTC, { AgoraRTCProvider, IAgoraRTCClient } from 'agora-rtc-react';
import type { ConversationComponentProps } from '@/types/conversation';
import ConversationComponent from './ConversationComponent';

function AgoraConversationInner(props: ConversationComponentProps) {
  const [client] = useState<IAgoraRTCClient>(() =>
    AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
  );

  return (
    <AgoraRTCProvider client={client}>
      <ConversationComponent {...props} />
    </AgoraRTCProvider>
  );
}

const AgoraConversationWrapper = dynamic(() => Promise.resolve(AgoraConversationInner), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 text-slate-700">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <p className="text-sm font-semibold">Initializing Agora RTC Session...</p>
      </div>
    </div>
  ),
});

export default AgoraConversationWrapper;
