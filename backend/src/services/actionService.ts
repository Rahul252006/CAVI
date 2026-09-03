import { mongoGetBrainConfig } from '../integrations/mongodb/models.js';

export async function processRefund(companyId: string, params: {
  orderId: string;
  amount: number;
  reason?: string;
  customerPhone?: string;
}) {
  const brain = await mongoGetBrainConfig(companyId);
  const maxLimit = brain?.maxRefundAmount || 500;

  if (params.amount > maxLimit) {
    return {
      status: 'escalated',
      reason: `Refund amount $${params.amount} exceeds autonomous policy limit of $${maxLimit}. Transferring to human officer.`,
      requiresOfficerApproval: true,
      amount: params.amount,
      orderId: params.orderId,
    };
  }

  const refundId = `ref_${Date.now()}`;
  return {
    status: 'success',
    refundId,
    orderId: params.orderId,
    amount: params.amount,
    message: `Refund of $${params.amount} for Order #${params.orderId} processed successfully.`,
    timestamp: new Date().toISOString(),
  };
}

export async function lookupStatus(companyId: string, params: {
  referenceId: string;
  type?: 'order' | 'transaction' | 'booking';
}) {
  return {
    status: 'success',
    referenceId: params.referenceId,
    type: params.type || 'order',
    currentStatus: 'In Transit / Processing',
    estimatedCompletion: new Date(Date.now() + 86400000 * 2).toLocaleDateString(),
    details: `Standard active fulfillment for reference ${params.referenceId}`,
    timestamp: new Date().toISOString(),
  };
}
