'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AgoraRTC, {
  useRTCClient,
  useLocalMicrophoneTrack,
  useRemoteUsers,
  useClientEvent,
  useJoin,
  usePublish,
  RemoteUser,
  UID,
} from 'agora-rtc-react';
import {
  AgoraVoiceAI,
  AgoraVoiceAIEvents,
  AgentState,
  MessageSalStatus,
  TranscriptHelperMode,
  type TranscriptHelperItem,
  type UserTranscription,
  type AgentTranscription,
} from 'agora-agent-client-toolkit';
import * as AgentUIKit from 'agora-agent-uikit';
import * as AgentUIKitRtc from 'agora-agent-uikit/rtc';
import { DEFAULT_AGENT_UID } from '@/lib/agora';

const RawVisualizer = (AgentUIKit as any)?.AgentVisualizer || (AgentUIKit as any)?.default?.AgentVisualizer || (AgentUIKit as any)?.default;
const RawMicButton = (AgentUIKitRtc as any)?.MicButtonWithVisualizer || (AgentUIKitRtc as any)?.default?.MicButtonWithVisualizer || (AgentUIKitRtc as any)?.default;

const SafeAgentVisualizer: any = typeof RawVisualizer === 'function' ? RawVisualizer : (({ state }: { state?: any }) => (
  <div className="flex flex-col items-center justify-center gap-3 p-6 rounded-full bg-blue-600/20 border-2 border-blue-500/40 animate-pulse">
    <div className="h-24 w-24 rounded-full bg-blue-500/30 flex items-center justify-center text-blue-300 font-bold text-xs uppercase tracking-wider">
      {String(state || 'Active')}
    </div>
  </div>
));

const SafeMicButtonWithVisualizer: any = typeof RawMicButton === 'function' ? RawMicButton : (({ isEnabled, onToggle }: any) => (
  <button
    type="button"
    onClick={onToggle}
    className={`rounded-full px-4 py-2 font-bold text-xs shadow-md transition-all ${isEnabled ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'}`}
  >
    {isEnabled ? 'Mute Mic' : 'Unmute Mic'}
  </button>
));
import { speakWithElevenLabs, stopCurrentAudio, playDirectBase64Audio, ELEVENLABS_MALE_VOICES } from '@/lib/elevenlabs';
import {
  getCurrentInProgressMessage,
  getMessageList,
  mapAgentVisualizerState,
  normalizeTimestampMs,
  normalizeTranscript,
} from '@/lib/conversation';
import { MicrophoneSelector } from './MicrophoneSelector';
import {
  getConversationIssueSeverity,
  type ConnectionIssue,
} from './ConversationErrorCard';
import { ConnectionStatusPanel } from './ConnectionStatusPanel';
import { QuickstartConversationLayout } from './QuickstartConversationLayout';
import {
  QuickstartPipelineMetrics,
  type QuickstartAgentMetric,
} from './QuickstartPipelineMetrics';
import { QuickstartTranscriptPanel } from './QuickstartTranscriptPanel';
import type { ConversationComponentProps } from '@/types/conversation';
import { ConversationState } from '@/types/echosphere';
import { createInitialState, processConversationTurn } from '@/lib/echosphere/state';
import { generateAIResponse, generateAIResponseWithAudio } from '@/lib/echosphere/llm';
import { generateCaseDNA } from '@/lib/echosphere/case-dna';
import { ConversationHealth } from './echosphere/ConversationHealth';
import { LanguageIndicator } from './echosphere/LanguageIndicator';
import { LiveFacts } from './echosphere/LiveFacts';
import { EscalationBanner } from './echosphere/EscalationBanner';

// Cap the displayed issues list to avoid overwhelming the UI during a cascade of errors.
const MAX_CONNECTION_ISSUES = 6;

type AgoraRtcWithParameters = typeof AgoraRTC & {
  setParameter?: (key: string, value: unknown) => void;
};

// Payload shape for signaling-level errors forwarded by the agent over RTM.
// The `module` field identifies which backend subsystem (LLM / ASR / TTS) raised the error.
type RtmMessageErrorPayload = {
  object: 'message.error';
  module?: string;
  code?: number;
  message?: string;
  send_ts?: number;
};

// Payload shape for SAL (Session Abstraction Layer) registration status messages.
// VP_REGISTER_FAIL and VP_REGISTER_DUPLICATE indicate RTM channel subscription problems.
type RtmSalStatusPayload = {
  object: 'message.sal_status';
  status?: string;
  timestamp?: number;
};

// Type guard for RTM signaling-level error payloads (object: 'message.error').
function isRtmMessageErrorPayload(
  value: unknown,
): value is RtmMessageErrorPayload {
  return (
    !!value &&
    typeof value === 'object' &&
    (value as { object?: unknown }).object === 'message.error'
  );
}

// Type guard for RTM SAL status payloads (object: 'message.sal_status').
function isRtmSalStatusPayload(value: unknown): value is RtmSalStatusPayload {
  return (
    !!value &&
    typeof value === 'object' &&
    (value as { object?: unknown }).object === 'message.sal_status'
  );
}

export default function ConversationComponent({
  agoraData,
  rtmClient,
  onTokenWillExpire,
  onEndConversation,
}: ConversationComponentProps) {
  const client = useRTCClient();
  const remoteUsers = useRemoteUsers();
  const [isEnabled, setIsEnabled] = useState(true);
  const [isAgentConnected, setIsAgentConnected] = useState(false);
  const [isConnectionDetailsOpen, setIsConnectionDetailsOpen] = useState(false);

  // Tracks granular RTC connection state for the status dot.
  // Agora states: DISCONNECTED | CONNECTING | CONNECTED | DISCONNECTING | RECONNECTING
  const [connectionState, setConnectionState] = useState<string>('CONNECTING');
  const agentUID = String(DEFAULT_AGENT_UID);
  const [joinedUID, setJoinedUID] = useState<UID>(0);

  // Transcript + agent state — managed with AgoraVoiceAI (see effect below).
  const [rawTranscript, setRawTranscript] = useState<
    TranscriptHelperItem<Partial<UserTranscription | AgentTranscription>>[]
  >([]);
  const [agentState, setAgentState] = useState<AgentState | null>(null);
  const [agentMetrics, setAgentMetrics] = useState<QuickstartAgentMetric[]>([]);
  const [connectionIssues, setConnectionIssues] = useState<ConnectionIssue[]>(
    [],
  );
  const addConnectionIssue = useCallback((issue: ConnectionIssue) => {
    setConnectionIssues((prev) => {
      const isDuplicate = prev.some(
        (x) =>
          x.agentUserId === issue.agentUserId &&
          x.code === issue.code &&
          x.message === issue.message &&
          Math.abs(x.timestamp - issue.timestamp) < 1500,
      );
      if (isDuplicate) return prev;
      return [issue, ...prev].slice(0, MAX_CONNECTION_ISSUES);
    });
  }, []);

  // EchoSphere canonical state
  const [echoState, setEchoState] = useState<ConversationState>(() =>
    createInitialState(`sess-${Date.now()}`)
  );

  const isProcessingTurnRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const lastProcessedTextRef = useRef('');
  const lastProcessTimeRef = useRef(0);
  const lastSpokenTextRef = useRef('');
  const rawTranscriptRef = useRef(rawTranscript);
  rawTranscriptRef.current = rawTranscript;

  const echoStateRef = useRef(echoState);
  echoStateRef.current = echoState;

  const agoraDataRef = useRef(agoraData);
  agoraDataRef.current = agoraData;

  const clientRef = useRef(client);
  clientRef.current = client;

  const hasPlayedGreetingRef = useRef(false);

  // Speak helper for ElevenLabs AI Male Voice Assistant (English, Hindi, Telugu, Tamil compatible)
  const speakText = useCallback((text: string, langCode: 'en' | 'hi' | 'te' | 'ta' = 'en') => {
    isSpeakingRef.current = true;
    isProcessingTurnRef.current = true;
    lastSpokenTextRef.current = text.trim().toLowerCase();
    setAgentState(AgentState.SPEAKING);

    speakWithElevenLabs(
      text,
      langCode,
      () => {
        setAgentState(AgentState.SPEAKING);
        isSpeakingRef.current = true;
        isProcessingTurnRef.current = true;
      },
      () => {
        setAgentState(AgentState.LISTENING);
        // Cooldown window to prevent mic from hearing the speaker tail
        setTimeout(() => {
          isSpeakingRef.current = false;
          isProcessingTurnRef.current = false;
        }, 1200);
      }
    );
  }, []);

  const processUserUtterance = useCallback(async (text: string) => {
    const trimmed = text.trim();
    const now = Date.now();
    if (!trimmed || trimmed.length < 2) return;
    if (isProcessingTurnRef.current || isSpeakingRef.current) return;
    if (lastProcessedTextRef.current === trimmed && (now - lastProcessTimeRef.current) < 5000) return;

    // Self-echo detection: ignore if input is identical to or substring of AI output
    const lowerTrimmed = trimmed.toLowerCase();
    if (
      lastSpokenTextRef.current &&
      (lastSpokenTextRef.current.includes(lowerTrimmed) || lowerTrimmed.includes(lastSpokenTextRef.current.slice(0, 30)))
    ) {
      return;
    }

    isProcessingTurnRef.current = true;
    lastProcessedTextRef.current = trimmed;
    lastProcessTimeRef.current = now;

    const currentUid = String(clientRef.current?.uid || agoraDataRef.current?.uid || 0);

    // Add user turn to transcript
    const userItem: any = {
      turn_id: `turn_user_${Date.now()}`,
      uid: currentUid,
      role: 'user',
      speaker: 'customer',
      text: trimmed,
      status: 'END',
      _time: Date.now(),
    };

    setRawTranscript((prev) => [...prev, userItem]);

    const currentEchoState = echoStateRef.current;
    const { updatedState: nextEcho } = processConversationTurn(currentEchoState, trimmed, 'user');
    setEchoState(nextEcho);

    const historyList = [...rawTranscriptRef.current, userItem].slice(-8).map((item: any) => ({
      role: String(item.uid) === String(DEFAULT_AGENT_UID) || item.role === 'agent' ? 'assistant' : 'user',
      text: typeof item.text === 'string' ? item.text : '',
    }));

    const ctxSummary = `Extracted Facts: ${JSON.stringify(nextEcho.facts)}, Primary Category: ${nextEcho.intent.category || 'general'}, Active Conflicts: ${JSON.stringify(nextEcho.conflicts)}`;
    const storedCompanyId = typeof window !== 'undefined' ? localStorage.getItem('echosphere_company_id') : null;
    const currentAgoraData = agoraDataRef.current;
    const effectiveCompanyId = (currentAgoraData as any)?.companyId || storedCompanyId;
    const callerPhone = (currentAgoraData as any)?.callerPhone || (currentAgoraData as any)?.customerPhone || '';

    try {
      const aiPayload = await generateAIResponseWithAudio(trimmed, historyList, ctxSummary, effectiveCompanyId);
      const fallbackText = nextEcho.resolution?.nextBestQuestion ||
        "I have noted your details. How else can I assist you with your account today?";
      const finalAiText = aiPayload?.text || fallbackText;

      const aiItem: any = {
        turn_id: `turn_agent_${Date.now()}`,
        uid: String(DEFAULT_AGENT_UID),
        role: 'agent',
        speaker: 'agent',
        text: finalAiText,
        status: 'END',
        _time: Date.now(),
      };

      setRawTranscript((prev) => [...prev, aiItem]);

      // Play audio response with 0ms latency using pre-synthesized audio if present
      if (aiPayload?.audioBase64) {
        isSpeakingRef.current = true;
        isProcessingTurnRef.current = true;
        lastSpokenTextRef.current = finalAiText.trim().toLowerCase();
        setAgentState(AgentState.SPEAKING);

        playDirectBase64Audio(
          aiPayload.audioBase64,
          () => {
            setAgentState(AgentState.SPEAKING);
            isSpeakingRef.current = true;
            isProcessingTurnRef.current = true;
          },
          () => {
            setAgentState(AgentState.LISTENING);
            setTimeout(() => {
              isSpeakingRef.current = false;
              isProcessingTurnRef.current = false;
            }, 1200);
          }
        );
      } else {
        speakText(finalAiText);
      }

      // Update active in-flight call transcript without creating case spam
      const updatedTranscript = [...rawTranscriptRef.current, aiItem];
      const formattedTranscripts = updatedTranscript.map((t: any) => ({
        role: String(t.uid) === String(DEFAULT_AGENT_UID) || t.role === 'agent' ? 'agent' : 'user',
        speaker: String(t.uid) === String(DEFAULT_AGENT_UID) || t.role === 'agent' ? 'agent' : 'customer',
        text: typeof t.text === 'string' ? t.text : '',
        timestamp: t._time || Date.now(),
      }));

      const callId = (currentAgoraData as any)?.callId;
      if (callId || currentAgoraData?.channel) {
        fetch(`/api/calls/${callId || 'active'}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callId: callId,
            channel: currentAgoraData?.channel,
            transcripts: formattedTranscripts,
            transcript: formattedTranscripts,
            callerPhone,
            callerNumber: callerPhone,
          }),
        }).catch(console.warn);
      }
    } catch (err) {
      console.warn('[Turn Processing Error]', err);
      isProcessingTurnRef.current = false;
      isSpeakingRef.current = false;
    }
  }, [speakText]);

  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const id = setTimeout(() => {
      if (!cancelled) setIsReady(true);
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(id);
      setIsReady(false);
    };
  }, []);

  const { isConnected: joinSuccess } = useJoin(
    {
      appid: process.env.NEXT_PUBLIC_AGORA_APP_ID || '4849add8a86849f098b0523bedea6cba',
      channel: agoraData?.channel || '',
      token: agoraData?.token || null,
      uid: parseInt(String(agoraData?.uid || 0), 10),
    },
    isReady && !!agoraData?.channel,
  );

  // Initial spoken greeting once connected - executed EXACTLY ONCE
  useEffect(() => {
    if (!joinSuccess || !isReady) return;
    if (hasPlayedGreetingRef.current) return;
    hasPlayedGreetingRef.current = true;

    const companyName = (agoraDataRef.current as any)?.companyName || 'Customer Support';
    const greetingText = `Hello, thank you for calling ${companyName}. How may I help you with your account or order today?`;

    const initialItem: any = {
      turn_id: `turn_greeting_${Date.now()}`,
      uid: String(DEFAULT_AGENT_UID),
      role: 'agent',
      speaker: 'agent',
      text: greetingText,
      status: 'END',
      _time: Date.now(),
    };

    setRawTranscript((prev) => (prev.length === 0 ? [initialItem] : prev));
    speakText(greetingText);
  }, [joinSuccess, isReady, speakText]);

  // Speech recognition lifecycle for incoming user mic turns
  useEffect(() => {
    if (!joinSuccess || !isReady) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    let recognition: any = null;
    let isUnmounted = false;
    let interimSilenceTimer: any = null;
    let pendingInterimText = '';

    try {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        if (isUnmounted) return;
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0]?.transcript?.trim();
          if (!text) continue;

          // Instant Phone Call Barge-In: interrupt assistant speech as soon as user starts speaking
          if (isSpeakingRef.current && text.length >= 2) {
            stopCurrentAudio();
            isSpeakingRef.current = false;
            isProcessingTurnRef.current = false;
            setAgentState(AgentState.LISTENING);
          }

          if (result.isFinal) {
            if (interimSilenceTimer) {
              clearTimeout(interimSilenceTimer);
              interimSilenceTimer = null;
            }
            pendingInterimText = '';
            if (text.length >= 2) {
              processUserUtterance(text);
            }
          } else {
            // Fast Speech Endpointing: Trigger on 400ms pause after speech rather than waiting 1.5s for browser's sluggish isFinal
            pendingInterimText = text;
            if (interimSilenceTimer) clearTimeout(interimSilenceTimer);
            interimSilenceTimer = setTimeout(() => {
              if (
                !isUnmounted &&
                pendingInterimText &&
                pendingInterimText.length >= 2 &&
                !isProcessingTurnRef.current &&
                !isSpeakingRef.current
              ) {
                const sendText = pendingInterimText;
                pendingInterimText = '';
                processUserUtterance(sendText);
              }
            }, 400);
          }
        }
      };

      recognition.onerror = (err: any) => {
        if (err.error !== 'no-speech' && err.error !== 'aborted') {
          console.warn('Speech recognition notice:', err.error);
        }
      };

      recognition.onend = () => {
        if (!isUnmounted) {
          try {
            recognition.start();
          } catch {}
        }
      };

      recognition.start();
    } catch (e) {
      console.warn('Speech recognition init error:', e);
    }

    return () => {
      isUnmounted = true;
      if (interimSilenceTimer) {
        clearTimeout(interimSilenceTimer);
      }
      if (recognition) {
        try {
          recognition.abort();
        } catch {}
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [joinSuccess, isReady, processUserUtterance]);

  // Create mic track only after the StrictMode fake-unmount cycle completes (isReady).
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(isReady);

  // Publish local microphone track directly to Agora RTC channel
  useEffect(() => {
    if (localMicrophoneTrack && joinSuccess && client) {
      localMicrophoneTrack.setEnabled(true);
      client.publish([localMicrophoneTrack]).catch((err) => {
        console.warn('[Agora RTC] Explicit publish info:', err);
      });
    }
  }, [localMicrophoneTrack, joinSuccess, client]);

  // ENABLE_AUDIO_PTS is a module-level SDK parameter (not on the client instance).
  // It must be set before publishing audio for transcript timing to be accurate.
  useEffect(() => {
    if (!client) return;
    try {
      (AgoraRTC as AgoraRtcWithParameters).setParameter?.(
        'ENABLE_AUDIO_PTS',
        true,
      );
    } catch (error) {
      console.warn('Could not set ENABLE_AUDIO_PTS:', error);
    }
  }, [client]);

  // Track the auto-assigned RTC UID for token renewal and agent invite.
  useEffect(() => {
    if (joinSuccess && client) {
      const uid = client.uid;
      if (uid !== null && uid !== undefined) {
        setJoinedUID(uid);
      }
    }
  }, [joinSuccess, client]);

  // Initialize AgoraVoiceAI once the channel is joined.
  //
  // Gating on `isReady && joinSuccess` is critical for StrictMode safety:
  //   - `isReady` ensures we are past the initial fake-unmount cycle, so this
  //     effect only runs on the real mount (not the discarded fake one).
  //   - Once `isReady` is true, React does NOT double-invoke this effect for
  //     subsequent state changes (`joinSuccess` becoming true). That means
  //     AgoraVoiceAI.init() is called exactly once.
  useEffect(() => {
    if (!isReady || !joinSuccess) return;

    let cancelled = false;

    (async () => {
      try {
        const ai = await AgoraVoiceAI.init({
          rtcEngine: client,
          ...(rtmClient ? { rtmConfig: { rtmEngine: rtmClient } } : {}),
          renderMode: TranscriptHelperMode.TEXT,
          enableLog: true,
        });

        if (cancelled) {
          try {
            if (AgoraVoiceAI.getInstance() === ai) {
              // Tear down only the instance created by this effect run.
              ai.unsubscribe();
              ai.destroy();
            }
          } catch {}
          return;
        }

        ai.on(AgoraVoiceAIEvents.TRANSCRIPT_UPDATED, (t) => {
          setRawTranscript([...t]);
        });
        // Agent state drives the visualizer, independent of RTC audio presence.
        ai.on(AgoraVoiceAIEvents.AGENT_STATE_CHANGED, (_, event) =>
          setAgentState(event.state),
        );
        ai.on(AgoraVoiceAIEvents.AGENT_METRICS, (_, metrics) => {
          setAgentMetrics((prev) => [...prev, metrics].slice(-8));
        });
        ai.on(AgoraVoiceAIEvents.MESSAGE_ERROR, (agentUserId, error) => {
          addConnectionIssue({
            id: `${Date.now()}-${agentUserId}-message-error-${error.code}`,
            source: 'rtm',
            agentUserId,
            code: error.code,
            message: error.message,
            timestamp: normalizeTimestampMs(error.timestamp),
          });
        });
        // SAL status: capture raw RTM messages so message.sal_status surfaces even if higher-level events don't.
        ai.on(
          AgoraVoiceAIEvents.MESSAGE_SAL_STATUS,
          (agentUserId, salStatus) => {
            if (
              salStatus.status === MessageSalStatus.VP_REGISTER_FAIL ||
              salStatus.status === MessageSalStatus.VP_REGISTER_DUPLICATE
            ) {
              addConnectionIssue({
                id: `${Date.now()}-${agentUserId}-sal-${salStatus.status}`,
                source: 'rtm',
                agentUserId,
                code: salStatus.status,
                message: `SAL status: ${salStatus.status}`,
                timestamp: normalizeTimestampMs(salStatus.timestamp),
              });
            }
          },
        );
        // Agent error: capture raw RTM messages so message.error surfaces even if higher-level events don't.
        ai.on(AgoraVoiceAIEvents.AGENT_ERROR, (agentUserId, error) => {
          addConnectionIssue({
            id: `${Date.now()}-${agentUserId}-agent-error-${error.code}`,
            source: 'agent',
            agentUserId,
            code: error.code,
            message: `${error.type}: ${error.message}`,
            timestamp: normalizeTimestampMs(error.timestamp),
          });
        });
        // subscribeMessage binds the toolkit to both RTC stream messages and RTM payloads.
        ai.subscribeMessage(agoraData.channel);
      } catch (error) {
        if (!cancelled) {
          console.error('[AgoraVoiceAI] init failed:', error);
        }
      }
    })();

    return () => {
      cancelled = true;
      try {
        const ai = AgoraVoiceAI.getInstance();
        if (ai) {
          ai.unsubscribe();
          ai.destroy();
        }
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, joinSuccess]);

  // Raw RTM parsing is kept as a fallback for signaling-level errors and SAL status.
  useEffect(() => {
    const handleRtmMessage = (event: {
      message: string | Uint8Array;
      publisher: string;
    }) => {
      const payloadText =
        typeof event.message === 'string'
          ? event.message
          : new TextDecoder().decode(event.message);

      let parsed: unknown;
      try {
        parsed = JSON.parse(payloadText);
      } catch {
        return;
      }

      if (isRtmMessageErrorPayload(parsed)) {
        const p = parsed;
        addConnectionIssue({
          id: `${Date.now()}-${event.publisher}-rtm-msg-error-${p.code ?? 'unknown'}`,
          source: 'rtm-signaling',
          agentUserId: event.publisher,
          code: p.code ?? 'unknown',
          message: `${p.module ?? 'unknown'}: ${p.message ?? 'Unknown signaling error'}`,
          timestamp: normalizeTimestampMs(p.send_ts ?? Date.now()),
        });
        return;
      }

      if (isRtmSalStatusPayload(parsed)) {
        const p = parsed;
        if (
          p.status === 'VP_REGISTER_FAIL' ||
          p.status === 'VP_REGISTER_DUPLICATE'
        ) {
          addConnectionIssue({
            id: `${Date.now()}-${event.publisher}-rtm-sal-${p.status}`,
            source: 'rtm-signaling',
            agentUserId: event.publisher,
            code: p.status,
            message: `SAL status: ${p.status}`,
            timestamp: normalizeTimestampMs(p.timestamp ?? Date.now()),
          });
        }
      }
    };

    if (!rtmClient) return;
    rtmClient.addEventListener('message', handleRtmMessage);
    return () => {
      rtmClient.removeEventListener('message', handleRtmMessage);
    };
  }, [rtmClient, addConnectionIssue]);

  // The toolkit uses uid="0" for local user speech — remap to actual RTC UID
  // so the transcript panel renders user messages on the correct side.
  // Also normalize punctuation spacing for display when upstream text arrives compacted.
  const transcript = useMemo(() => {
    return normalizeTranscript(rawTranscript, String(client.uid));
  }, [rawTranscript, client.uid]);

  // Completed (END + INTERRUPTED) messages shown as history.
  // INTERRUPTED must be included — if the agent's first turn is cut off,
  // messageList stays empty and the first interrupted turn is never shown.
  const messageList = useMemo(() => getMessageList(transcript), [transcript]);

  const currentInProgressMessage = useMemo(() => {
    // The live partial turn renders separately from the completed history list.
    return getCurrentInProgressMessage(transcript);
  }, [transcript]);

  // Publish local mic once the track exists; usePublish waits for RTC connection.
  usePublish([localMicrophoneTrack]);

  useClientEvent(client, 'user-joined', () => {
    setIsAgentConnected(true);
  });

  useClientEvent(client, 'user-left', () => {
    if (remoteUsers.length <= 1) setIsAgentConnected(false);
  });

  // Sync isAgentConnected with remoteUsers, agentState, or successful join
  useEffect(() => {
    const isAgentPresent = remoteUsers.length > 0 || agentState !== null || (joinSuccess && isReady);
    setIsAgentConnected(isAgentPresent);
  }, [remoteUsers, agentState, joinSuccess, isReady]);

  useClientEvent(client, 'connection-state-change', (curState) => {
    setConnectionState(curState);
  });

  const connectionSeverity = useMemo<'normal' | 'warning' | 'error'>(() => {
    // RTC transport problems take precedence; otherwise derive severity from captured issues.
    if (
      connectionState === 'DISCONNECTED' ||
      connectionState === 'DISCONNECTING'
    ) {
      return 'error';
    }
    if (
      connectionState === 'CONNECTING' ||
      connectionState === 'RECONNECTING'
    ) {
      return 'warning';
    }
    if (connectionIssues.length === 0) {
      return 'normal';
    }
    return connectionIssues.some(
      (issue) => getConversationIssueSeverity(issue) === 'error',
    )
      ? 'error'
      : 'warning';
  }, [connectionState, connectionIssues]);

  const visualizerState = useMemo(
    () =>
      mapAgentVisualizerState(agentState, isAgentConnected, connectionState),
    [agentState, isAgentConnected, connectionState],
  );

  /**
   * Mute/unmute via track.setEnabled() only — usePublish owns publish state.
   * If we also unpublish in the toggle, usePublish and the button fight each other
   * and break the MicButtonWithVisualizer Web Audio graph.
   */
  const handleMicToggle = useCallback(async () => {
    const next = !isEnabled;
    const track = localMicrophoneTrack;
    if (!track) {
      setIsEnabled(next);
      return;
    }
    try {
      await track.setEnabled(next);
      setIsEnabled(next);
    } catch (error) {
      console.error('Failed to toggle microphone:', error);
    }
  }, [isEnabled, localMicrophoneTrack]);

  const handleTokenWillExpire = useCallback(async () => {
    if (!onTokenWillExpire || !joinedUID) return;
    try {
      // RTC and RTM renew independently, but the quickstart fetches both in one request.
      const { rtcToken, rtmToken } = await onTokenWillExpire(
        joinedUID.toString(),
      );
      await client?.renewToken(rtcToken);
      if (rtmClient) {
        await rtmClient.renewToken(rtmToken);
      }
    } catch (error) {
      console.error('Failed to renew Agora token:', error);
    }
  }, [client, onTokenWillExpire, joinedUID, rtmClient]);

  useClientEvent(client, 'token-privilege-will-expire', handleTokenWillExpire);

  const handleEndConversation = useCallback(async () => {
    try {
      const storedCompanyId = typeof window !== 'undefined' ? localStorage.getItem('echosphere_company_id') : null;
      const currentAgoraData = agoraDataRef.current;
      const effectiveCompanyId = (currentAgoraData as any)?.companyId || storedCompanyId;
      const callerPhone = (currentAgoraData as any)?.callerPhone || (currentAgoraData as any)?.customerPhone || '';

      let caseData: any = null;
      if (echoState.escalation.required) {
        caseData = generateCaseDNA(
          echoState,
          echoState.escalation.reason || 'High Risk / Escalation Required',
          echoState.escalation.targetSpecialist || 'Customer Resolution Officer'
        );
        await fetch('/api/case/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...caseData,
            companyId: effectiveCompanyId,
            callId: agoraData.callId,
            customerPhone: callerPhone,
            callerPhone: callerPhone,
            channel: agoraData.channel,
          }),
        }).catch((err) => console.warn('Case create error:', err));
      }

      const rawList = rawTranscriptRef.current || [];
      const formattedTranscripts = rawList.map((t: any) => ({
        role: t.role || (String(t.uid) === '1000' ? 'agent' : 'user'),
        speaker: t.role || (String(t.uid) === '1000' ? 'agent' : 'customer'),
        text: typeof t.text === 'string' ? t.text : '',
        timestamp: t.timestamp || t._time || Date.now(),
      }));

      const durationSeconds = Math.max(
        1,
        Math.round((Date.now() - (echoState.startedAt || Date.now())) / 1000)
      );

      await fetch('/api/calls/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callId: agoraData.callId,
          channel: agoraData.channel,
          sessionId: echoState.sessionId,
          status: echoState.escalation.required ? 'escalated' : 'completed',
          caseId: caseData?.caseId || undefined,
          caseDna: caseData || undefined,
          transcripts: formattedTranscripts,
          transcript: formattedTranscripts,
          callerPhone,
          callerNumber: callerPhone,
          durationSeconds,
        }),
      }).catch((err) => console.warn('Calls end error:', err));
    } catch (e) {
      console.warn('Failed to save call & case logs:', e);
    }
    onEndConversation();
  }, [echoState, agoraData.channel, agoraData.callId, onEndConversation]);

  // Real-time EchoSphere turn analyzer
  useEffect(() => {
    if (messageList.length === 0) return;
    const latest = messageList[messageList.length - 1];
    const isAgent = String(latest.uid) === String(agentUID);
    const userUtterance = !isAgent ? latest.text : undefined;
    const agentUtterance = isAgent ? latest.text : undefined;

    setEchoState((prev) => {
      const { updatedState } = processConversationTurn(prev, userUtterance, agentUtterance);
      return updatedState;
    });
  }, [messageList, agentUID]);

  return (
    <QuickstartConversationLayout
      languageBadge={<LanguageIndicator language={echoState.language} />}
      healthPanel={<ConversationHealth health={echoState.conversationHealth} />}
      liveFacts={<LiveFacts facts={echoState.facts} conflicts={echoState.conflicts} />}
      escalationBanner={<EscalationBanner state={echoState} />}
      statusPanel={
        <ConnectionStatusPanel
          connectionState={connectionState}
          connectionSeverity={connectionSeverity}
          connectionIssues={connectionIssues}
          isOpen={isConnectionDetailsOpen}
          onToggle={() => setIsConnectionDetailsOpen((open) => !open)}
        />
      }
      pipelineMetrics={<QuickstartPipelineMetrics metrics={agentMetrics} />}
      transcriptPanel={
        <div className="flex flex-col gap-2 h-full">
          <QuickstartTranscriptPanel
            messageList={messageList}
            currentInProgressMessage={currentInProgressMessage}
            agentUID={agentUID}
          />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const inputEl = form.elements.namedItem('userInput') as HTMLInputElement;
              const text = inputEl?.value?.trim();
              if (!text) return;
              inputEl.value = '';
              processUserUtterance(text);
            }}
            className="flex gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 mt-1"
          >
            <input
              name="userInput"
              type="text"
              placeholder="Speak or type turn (e.g. 'Mera payment fail ho gaya ₹2499 deducted')..."
              className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs transition-colors shrink-0 shadow-xs"
            >
              Send Voice Turn
            </button>
          </form>
        </div>
      }
      visualizer={
        <div
          className="relative flex h-full min-h-[16rem] w-full max-w-4xl items-center justify-center"
          role="region"
          aria-label="AI agent status visualization"
        >
          <SafeAgentVisualizer state={visualizerState} size="lg" />
          {remoteUsers.map((user) => (
            <div key={user.uid} className="hidden">
              <RemoteUser user={user} />
            </div>
          ))}
        </div>
      }
      controls={
        <div
          className="mx-auto flex w-fit items-center gap-3 rounded-full border border-border bg-card/80 px-4 py-2 backdrop-blur-md"
          role="group"
          aria-label="Audio controls"
        >
          <div className="conversation-mic-host flex items-center justify-center">
            <SafeMicButtonWithVisualizer
              isEnabled={isEnabled}
              setIsEnabled={setIsEnabled}
              track={localMicrophoneTrack}
              onToggle={handleMicToggle}
              className="overflow-visible"
              aria-label={isEnabled ? 'Mute microphone' : 'Unmute microphone'}
              enabledColor="hsl(var(--primary))"
              disabledColor="hsl(var(--destructive))"
            />
          </div>
          <MicrophoneSelector localMicrophoneTrack={localMicrophoneTrack} />
        </div>
      }
      onEndConversation={handleEndConversation}
    />
  );
}
