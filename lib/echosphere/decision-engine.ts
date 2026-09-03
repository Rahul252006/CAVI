import { Decision, ConversationState } from '@/types/echosphere';
import { routeSpecialist } from './case-dna';

export function evaluateDecision(state: ConversationState, latestUserUtterance: string = ''): Decision {
  const lower = latestUserUtterance.toLowerCase();

  // 1. Safety & Policy Boundaries Check (Critical P0)
  if (
    lower.includes('medical') ||
    lower.includes('doctor') ||
    lower.includes('chest pain') ||
    lower.includes('bleeding') ||
    lower.includes('emergency') ||
    lower.includes('police') ||
    lower.includes('ambulance') ||
    lower.includes('112') ||
    lower.includes('911')
  ) {
    return {
      type: 'escalate',
      reason: 'Safety Boundary: Medical or emergency service inquiry outside non-clinical support scope',
      priority: 'critical',
      targetSpecialist: 'Emergency Referral / Human Supervisor',
    };
  }

  // 2. Explicit Human Request
  if (
    lower.includes('human') ||
    lower.includes('agent') ||
    lower.includes('representative') ||
    lower.includes('person') ||
    lower.includes('bhai agent') ||
    lower.includes('specialist') ||
    lower.includes('officer') ||
    lower.includes('transfer me') ||
    lower.includes('connect me')
  ) {
    const specialist = routeSpecialist(state.intent.category, state.facts.issue?.value);
    return {
      type: 'escalate',
      reason: 'Customer explicitly requested human assistance',
      priority: 'high',
      targetSpecialist: specialist,
    };
  }

  // 3. High Frustration / Predictive Escalation Trigger
  if (state.emotion.frustration >= 0.85 || state.conversationHealth.escalationRisk === 'Critical') {
    const specialist = routeSpecialist(state.intent.category, state.facts.issue?.value);
    return {
      type: 'escalate',
      reason: `Predictive Escalation: High customer frustration (${Math.round(state.emotion.frustration * 100)}%) and resolution blockage`,
      priority: 'high',
      targetSpecialist: specialist,
    };
  }

  // 4. Conflict Radar: Unresolved critical conflict prompt
  const unresolvedConflict = state.conflicts.find(c => !c.resolved);
  if (unresolvedConflict) {
    return {
      type: 'confirm',
      field: unresolvedConflict.field,
      value: unresolvedConflict.newValue,
      prompt: `Just to make sure I don't make a mistake — earlier you mentioned ${unresolvedConflict.oldValue}, and now ${unresolvedConflict.newValue}. Which one is correct?`,
    };
  }

  // 5. Unconfirmed High-Risk Action (e.g. Refund request without explicit confirmation)
  if (state.intent.category === 'refund' && state.facts.amount && !state.facts.amount.confirmed) {
    return {
      type: 'confirm',
      field: 'amount',
      value: state.facts.amount.value,
      prompt: `I have the payment amount as ${state.facts.amount.value}. Would you like me to request a refund for that amount?`,
    };
  }

  // 6. Action Execution: If user confirmed and amount & txn are ready
  if (
    state.intent.category === 'refund' &&
    state.facts.amount?.confirmed &&
    (lower.includes('yes') || lower.includes('ha') || lower.includes('haan') || lower.includes('kar do') || lower.includes('please'))
  ) {
    return {
      type: 'action',
      action: 'request_refund',
      payload: {
        transactionId: state.facts.transactionId?.value || 'TXN-8392',
        amount: parseFloat(state.facts.amount.value.replace(/[^0-9.]/g, '')),
        confirmedByUser: true,
      },
    };
  }

  // 7. Missing Essential Information Prompt
  if (state.facts.issue && !state.facts.amount && (state.intent.category === 'payment' || state.intent.category === 'refund')) {
    return {
      type: 'ask',
      field: 'amount',
      question: 'Could you share the approximate payment amount involved?',
    };
  }

  // 8. Normal Answer / Flow
  return {
    type: 'answer',
  };
}
