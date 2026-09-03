import { ConversationState, Decision } from '@/types/echosphere';
import { generateCaseDNA, routeSpecialist } from './case-dna';
import { addOrUpdateCase } from '@/lib/storage/cases';

export function handleEscalationTrigger(
  state: ConversationState,
  decision: Decision
): { state: ConversationState; shouldHandoff: boolean } {
  if (decision.type !== 'escalate') {
    return { state, shouldHandoff: false };
  }

  const specialist = decision.targetSpecialist || routeSpecialist(state.intent.category, state.facts.issue?.value);
  const now = new Date().toISOString();

  const updatedState: ConversationState = {
    ...state,
    status: 'preparing_handoff',
    escalation: {
      required: true,
      reason: decision.reason,
      priority: decision.priority,
      targetSpecialist: specialist,
      preparedAt: now,
    },
    resolution: {
      ...state.resolution,
      status: 'escalating',
    },
  };

  // Generate Case DNA and store into in-memory case database
  const caseDNA = generateCaseDNA(updatedState, decision.reason, specialist);
  addOrUpdateCase(caseDNA);

  return { state: updatedState, shouldHandoff: true };
}
