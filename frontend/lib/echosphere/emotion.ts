import { EmotionState } from '@/types/echosphere';

const FRUSTRATION_KEYWORDS = [
  'already told you',
  'told you twice',
  'told you before',
  'human',
  'agent',
  'person',
  'representative',
  'useless',
  'ridiculous',
  'angry',
  'stop asking',
  'bakwas',
  'kya kar rahe ho',
  'pareshan',
  'bhai agent se',
  'connect me',
  'waste of time',
  'fed up',
];

const URGENCY_KEYWORDS = [
  'urgent',
  'immediately',
  'emergency',
  'right now',
  'fast',
  'asap',
  'turant',
  'jaldi',
];

const POSITIVE_KEYWORDS = [
  'thank you',
  'thanks',
  'great',
  'good',
  'shukriya',
  'dhanyawad',
  'perfect',
  'helpful',
];

export function analyzeEmotion(
  text: string,
  previousEmotion: EmotionState = {
    sentiment: 'neutral',
    frustration: 0.1,
    urgency: 0.2,
    confidence: 0.8,
    repetitionCount: 0,
    silenceCount: 0,
  }
): EmotionState {
  if (!text) return previousEmotion;

  const lower = text.toLowerCase();
  let frustration = previousEmotion.frustration;
  let urgency = previousEmotion.urgency;
  let repetitionCount = previousEmotion.repetitionCount;
  let sentiment: 'positive' | 'neutral' | 'negative' = previousEmotion.sentiment;

  // Check repetition phrasing
  if (lower.includes('already told') || lower.includes('repeated') || lower.includes('twice') || lower.includes('phir se') || lower.includes('dobara')) {
    repetitionCount += 1;
    frustration = Math.min(1.0, frustration + 0.35);
  }

  // Check frustration keywords
  let frustrationHits = 0;
  for (const kw of FRUSTRATION_KEYWORDS) {
    if (lower.includes(kw)) {
      frustrationHits++;
    }
  }

  if (frustrationHits > 0) {
    frustration = Math.min(1.0, frustration + 0.25 * frustrationHits);
    sentiment = 'negative';
  }

  // Check urgency keywords
  let urgencyHits = 0;
  for (const kw of URGENCY_KEYWORDS) {
    if (lower.includes(kw)) urgencyHits++;
  }
  if (urgencyHits > 0) {
    urgency = Math.min(1.0, urgency + 0.3 * urgencyHits);
  }

  // Check positive keywords
  for (const kw of POSITIVE_KEYWORDS) {
    if (lower.includes(kw)) {
      sentiment = 'positive';
      frustration = Math.max(0.05, frustration - 0.2);
    }
  }

  // Natural gradual decay if calm turns
  if (frustrationHits === 0 && repetitionCount === previousEmotion.repetitionCount) {
    frustration = Math.max(0.1, frustration * 0.9);
  }

  return {
    sentiment,
    frustration: Number(frustration.toFixed(2)),
    urgency: Number(urgency.toFixed(2)),
    confidence: 0.85,
    repetitionCount,
    silenceCount: previousEmotion.silenceCount,
  };
}
