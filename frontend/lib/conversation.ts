import {
  type AgentState,
  type AgentTranscription,
  TurnStatus,
  type TranscriptHelperItem,
  type UserTranscription,
} from 'agora-agent-client-toolkit';
import {
  type AgentVisualizerState,
  type IMessageListItem,
} from 'agora-agent-uikit';

// Fixes compacted punctuation emitted by some TTS/ASR providers where sentence-ending
// characters run directly into the next word (e.g. "Hello.World" → "Hello. World").
export function normalizeTranscriptSpacing(text: string): string {
  return text
    .replace(/([.!?])([A-Za-z])/g, '$1 $2')
    .replace(/,([A-Za-z])/g, ', $1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// Agora timestamps vary by source: some RTM payloads use Unix-seconds while
// RTC events use milliseconds. Values already above 1e12 are milliseconds; others need scaling.
export function normalizeTimestampMs(timestamp: number): number {
  return timestamp > 1e12 ? timestamp : timestamp * 1000;
}

// Maps the combined (agentState + RTC connection + agent presence) signal to the
// AgentVisualizer's display states. RTC transport problems take priority over
// agent-level state to avoid showing "listening" or "talking" during a reconnect.
export function mapAgentVisualizerState(
  agentState: AgentState | null,
  isAgentConnected: boolean,
  connectionState: string,
): AgentVisualizerState {
  if (
    connectionState === 'DISCONNECTED' ||
    connectionState === 'DISCONNECTING'
  ) {
    return 'disconnected';
  }

  if (
    connectionState === 'CONNECTING' ||
    connectionState === 'RECONNECTING'
  ) {
    return 'joining';
  }

  if (!isAgentConnected) {
    return 'not-joined';
  }

  switch (agentState) {
    case 'listening':
      return 'listening';
    case 'thinking':
      return 'analyzing';
    case 'speaking':
      return 'talking';
    case 'idle':
    case 'silent':
    default:
      return 'ambient';
  }
}

// Adapts a toolkit TranscriptHelperItem to the shape expected by agora-agent-uikit.
// `status` is cast via `unknown` because the two packages define structurally
// equivalent TurnStatus enums that TypeScript won't narrow across package boundaries.
// `_time` may arrive in seconds or milliseconds depending on the event source.
export function toMessageListItem(
  item: TranscriptHelperItem<Partial<UserTranscription | AgentTranscription>>,
): IMessageListItem {
  return {
    turn_id: item.turn_id,
    uid: Number(item.uid) || 0,
    text: typeof item.text === 'string' ? item.text : '',
    status: item.status as unknown as IMessageListItem['status'],
    createdAt:
      typeof item._time === 'number'
        ? normalizeTimestampMs(item._time)
        : undefined,
  };
}

// uid="0" is the toolkit's sentinel for local-user speech. Without remapping it to
// the actual RTC UID, the transcript panel renders the user's speech on the agent's side.
// Also normalises punctuation spacing so all turns display consistently.
export function normalizeTranscript(
  transcript: TranscriptHelperItem<Partial<UserTranscription | AgentTranscription>>[],
  localUID: string,
) {
  return transcript.map((item) => {
    const remappedUID = item.uid === '0' ? localUID : item.uid;
    const normalizedText =
      typeof item.text === 'string'
        ? normalizeTranscriptSpacing(item.text)
        : item.text;
    return { ...item, uid: remappedUID, text: normalizedText };
  });
}

// Returns completed and interrupted turns for the message history list.
// IN_PROGRESS turns are intentionally excluded — they are rendered separately
// as a streaming partial bubble via getCurrentInProgressMessage.
// INTERRUPTED turns must be included: if the agent's first turn is cut off and
// omitted, messageList stays empty and the first interrupted turn is never shown.
export function getMessageList(
  transcript: TranscriptHelperItem<Partial<UserTranscription | AgentTranscription>>[],
) {
  const seen = new Set<string>();
  const list: IMessageListItem[] = [];

  for (const raw of transcript) {
    if (raw.status === TurnStatus.IN_PROGRESS) continue;
    const item = toMessageListItem(raw);
    const textClean = (item.text || '').trim();
    if (!textClean) continue;

    // Deduplicate exact same text from same speaker within a 5-second window
    const timeBucket = Math.floor((item.createdAt || Date.now()) / 5000);
    const contentKey = `${item.uid}_${textClean}_${timeBucket}`;
    const idKey = raw.turn_id ? `id_${raw.turn_id}` : null;

    if (idKey && seen.has(idKey)) continue;
    if (seen.has(contentKey)) continue;

    if (idKey) seen.add(idKey);
    seen.add(contentKey);
    list.push(item);
  }

  return list;
}

// Returns the single active in-progress turn, or null when none exists.
// At most one turn is in-progress at a time. The transcript panel renders this
// as a live streaming bubble, distinct from the static message history.
export function getCurrentInProgressMessage(
  transcript: TranscriptHelperItem<Partial<UserTranscription | AgentTranscription>>[],
) {
  const item = transcript.find((entry) => entry.status === TurnStatus.IN_PROGRESS);
  return item ? toMessageListItem(item) : null;
}

/**
 * Formats duration in seconds into human-readable string:
 * - < 60s: "45s"
 * - >= 60s & < 3600s: "2m 15s" (or "3m" if 0s)
 * - >= 3600s: "1h 14m" (or "2h" if 0m)
 */
export function formatCallDuration(seconds: number | undefined | null): string {
  const totalSec = Math.max(0, Math.round(Number(seconds) || 0));
  if (totalSec < 60) {
    return `${totalSec}s`;
  }
  const mins = Math.floor(totalSec / 60);
  const remainingSecs = totalSec % 60;
  if (mins < 60) {
    return remainingSecs > 0 ? `${mins}m ${remainingSecs}s` : `${mins}m`;
  }
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
}
