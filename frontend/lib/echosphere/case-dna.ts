import { CaseDNA, ConversationState } from '@/types/echosphere';

export function generateCaseDNA(
  state: ConversationState,
  escalationReason: string = 'Customer requested human assistance',
  targetSpecialist: string = 'General Support'
): CaseDNA {
  const caseId = `CASE-${Date.now().toString().slice(-6)}`;

  const factList = Object.entries(state.facts).map(([key, fact]) => ({
    key,
    value: fact.value,
    confidence: fact.confidence,
    confirmed: fact.confirmed,
  }));

  const conflictList = state.conflicts.map(c => ({
    field: c.field,
    oldValue: c.oldValue,
    newValue: c.newValue,
    resolved: c.resolved,
    resolution: c.resolvedValue,
  }));

  const actionList = state.actionsAttempted.map(a => ({
    action: a.action,
    status: a.status,
    result: a.result !== undefined ? (typeof a.result === 'object' ? JSON.stringify(a.result) : String(a.result)) : undefined,
  }));

  // Create human-readable summary
  const summaryParts: string[] = [];
  if (state.facts.issue) {
    summaryParts.push(`Customer reported: ${state.facts.issue.value}.`);
  }
  if (state.facts.amount) {
    summaryParts.push(`Confirmed amount: ${state.facts.amount.value}.`);
  }
  if (state.facts.transactionId) {
    summaryParts.push(`Transaction ID: ${state.facts.transactionId.value}.`);
  }
  if (state.conflicts.length > 0) {
    const unres = state.conflicts.filter(c => !c.resolved);
    if (unres.length > 0) {
      summaryParts.push(`Unresolved conflict detected on ${unres.map(c => c.field).join(', ')}.`);
    } else {
      summaryParts.push(`Resolved conflict on amount during call.`);
    }
  }
  summaryParts.push(`Escalation triggered due to: ${escalationReason}.`);

  const summary = summaryParts.join(' ') || 'Customer contacted support with a voice inquiry.';

  // Next best action recommendation for human agent
  let nextBestAction = 'Review details and greet customer without asking them to repeat details.';
  if (state.intent.category === 'payment' || state.facts.amount) {
    nextBestAction = `Verify status of ${state.facts.transactionId?.value || 'transaction'} for ${state.facts.amount?.value || 'reported amount'} and provide confirmation.`;
  } else if (state.intent.category === 'refund') {
    nextBestAction = 'Confirm refund policy terms and process instant reversal.';
  }

  return {
    caseId,
    sessionId: state.sessionId,
    createdAt: new Date().toISOString(),
    status: 'pending',
    intent: state.intent.value || state.facts.issue?.value || 'Customer Support Inquiry',
    customerGoal: state.facts.customerGoal?.value || 'Resolve issue with support',
    language: {
      primary: state.language.primary || 'en',
      languagesUsed: state.language.detected,
      codeSwitching: state.language.codeSwitching,
    },
    facts: factList,
    conflicts: conflictList,
    actions: actionList,
    sentiment: state.emotion.sentiment,
    frustration: state.emotion.frustration,
    healthScore: state.conversationHealth.score,
    escalation: {
      required: true,
      reason: escalationReason,
      priority: state.escalation.priority || 'medium',
      targetSpecialist,
    },
    summary,
    nextBestAction,
  };
}

export function routeSpecialist(intentCategory?: string, issueText?: string): string {
  const combined = `${intentCategory || ''} ${issueText || ''}`.toLowerCase();
  if (combined.includes('payment') || combined.includes('failed') || combined.includes('debit') || combined.includes('txn')) {
    return 'Payments & Transactions Specialist';
  }
  if (combined.includes('refund') || combined.includes('reversal') || combined.includes('return')) {
    return 'Refund Operations Specialist';
  }
  if (combined.includes('account') || combined.includes('otp') || combined.includes('login')) {
    return 'Account Security Specialist';
  }
  if (combined.includes('tech') || combined.includes('bug') || combined.includes('error')) {
    return 'Technical Support Specialist';
  }
  return 'Senior Customer Success Specialist';
}
