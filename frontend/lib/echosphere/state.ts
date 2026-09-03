import { ConversationState, Decision } from '@/types/echosphere';
import { detectLanguages } from './language';
import { extractFactsFromText } from './extraction';
import { detectConflicts, resolveConflict } from './conflicts';
import { analyzeEmotion } from './emotion';
import { calculateHealthScore } from './health-score';
import { evaluateDecision } from './decision-engine';
import { handleEscalationTrigger } from './escalation';

export function createInitialState(sessionId: string = `sess-${Date.now()}`): ConversationState {
  return {
    sessionId,
    status: 'idle',
    startedAt: Date.now(),
    language: {
      primary: 'en',
      detected: ['en'],
      confidence: 0.9,
      codeSwitching: false,
    },
    intent: {
      value: null,
      confidence: 0.5,
      category: 'general',
    },
    customer: {},
    issue: {
      status: 'unclear',
    },
    facts: {},
    conflicts: [],
    emotion: {
      sentiment: 'neutral',
      frustration: 0.1,
      urgency: 0.2,
      confidence: 0.8,
      repetitionCount: 0,
      silenceCount: 0,
    },
    conversationHealth: {
      score: 85,
      understanding: 0.8,
      completeness: 0.7,
      confidence: 0.85,
      resolutionProgress: 0.5,
      frustration: 0.1,
      escalationRisk: 'Low',
      resolutionLikelihood: 'High',
    },
    resolution: {
      status: 'in_progress',
    },
    escalation: {
      required: false,
    },
    actionsAttempted: [],
  };
}

export function processConversationTurn(
  currentState: ConversationState,
  userUtterance?: string,
  _agentUtterance?: string
): { updatedState: ConversationState; decision: Decision } {
  let state = { ...currentState };

  if (userUtterance && userUtterance.trim().length > 0) {
    // 1. Language detection & code-switching update
    const langResult = detectLanguages(userUtterance);
    const existingLangs = new Set(state.language.detected);
    langResult.detected.forEach(l => existingLangs.add(l));

    state.language = {
      primary: langResult.primary,
      detected: Array.from(existingLangs),
      confidence: langResult.confidence,
      codeSwitching: existingLangs.size > 1,
    };

    // 2. Emotion analysis
    state.emotion = analyzeEmotion(userUtterance, state.emotion);

    // 3. Extract facts from user utterance
    const newExtractedFacts = extractFactsFromText(userUtterance, state.facts);

    // Check if user is resolving an existing conflict (e.g. "2499 is correct", "haan 2499")
    const unresolved = state.conflicts.find(c => !c.resolved);
    if (unresolved) {
      const lower = userUtterance.toLowerCase();
      if (lower.includes(unresolved.oldValue.replace(/[^0-9]/g, '')) || lower.includes('earlier') || lower.includes('pehle')) {
        const resolved = resolveConflict(state.conflicts, unresolved.field, unresolved.oldValue, state.facts);
        state.conflicts = resolved.conflicts;
        state.facts = resolved.facts;
      } else if (lower.includes(unresolved.newValue.replace(/[^0-9]/g, '')) || lower.includes('later') || lower.includes('actually') || lower.includes('new')) {
        const resolved = resolveConflict(state.conflicts, unresolved.field, unresolved.newValue, state.facts);
        state.conflicts = resolved.conflicts;
        state.facts = resolved.facts;
      }
    }

    // 4. Conflict detection
    const conflictResult = detectConflicts(state.facts, newExtractedFacts, state.conflicts);
    state.facts = conflictResult.updatedFacts;
    state.conflicts = conflictResult.updatedConflicts;

    // 5. Intent update
    if (state.facts.issue && !state.intent.value) {
      state.intent.value = state.facts.issue.value;
      if (state.facts.issue.value.toLowerCase().includes('refund')) state.intent.category = 'refund';
      else if (state.facts.issue.value.toLowerCase().includes('payment')) state.intent.category = 'payment';
      else if (state.facts.issue.value.toLowerCase().includes('account')) state.intent.category = 'account';
    }

    // 6. Recalculate health score
    state.conversationHealth = calculateHealthScore(
      state.facts,
      state.conflicts,
      state.emotion,
      state.resolution.status
    );
  }

  // 7. Decision engine
  const decision = evaluateDecision(state, userUtterance || '');

  // 8. Handle escalation trigger if decision is escalate
  if (decision.type === 'escalate') {
    const escalationRes = handleEscalationTrigger(state, decision);
    state = escalationRes.state;
  }

  return { updatedState: state, decision };
}
