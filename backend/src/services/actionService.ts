import { mongoGetBrainConfig } from '../integrations/mongodb/models.js';

export async function processRefund(companyId: string, params: {
  orderId: string;
  amount: number;
  reason?: string;
  customerPhone?: string;
}) {
  if (!companyId) throw new Error('companyId is required');
  if (!params.orderId) throw new Error('orderId is required');
  if (!Number.isFinite(params.amount) || params.amount <= 0) throw new Error('valid refund amount is required');
  const brain = await mongoGetBrainConfig(companyId);
  const maxLimit = brain?.maxRefundAmount ?? 0;

  if (!brain || brain.requireHumanApproval || maxLimit <= 0 || params.amount > maxLimit) {
    return {
      status: 'escalated',
      reason: !brain
        ? 'Company Brain is not configured for autonomous refunds.'
        : `Refund requires human approval or exceeds autonomous policy limit of $${maxLimit}.`,
      requiresOfficerApproval: true,
      amount: params.amount,
      orderId: params.orderId,
    };
  }

  return {
    status: 'integration_not_configured',
    orderId: params.orderId,
    amount: params.amount,
    requiresOfficerApproval: true,
    message: 'No live refund integration returned success; preserving the request for human review.',
    timestamp: new Date().toISOString(),
  };
}

export async function lookupStatus(companyId: string, params: {
  referenceId: string;
  type?: 'order' | 'transaction' | 'booking';
}) {
  if (!companyId) throw new Error('companyId is required');
  if (!params.referenceId) throw new Error('referenceId is required');
  return {
    status: 'integration_not_configured',
    referenceId: params.referenceId,
    type: params.type || 'order',
    currentStatus: null,
    estimatedCompletion: null,
    details: 'No live status lookup integration is configured for this company.',
    timestamp: new Date().toISOString(),
  };
}
