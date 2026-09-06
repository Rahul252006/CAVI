import { checkPermission } from './brain';

export async function checkTransactionService(params: { transactionId?: string; amount?: number | string }) {
  const perm = checkPermission('lookup_transaction');
  if (!perm.allowed) throw new Error(perm.reason);

  const cleanTxnId = params.transactionId?.toUpperCase();
  if (!cleanTxnId) throw new Error('Transaction ID is required for live lookup.');
  const cleanAmount = params.amount
    ? typeof params.amount === 'number'
      ? params.amount
      : parseFloat(params.amount.toString().replace(/[^0-9.]/g, ''))
    : undefined;

  return {
    success: false,
    transaction_id: cleanTxnId,
    amount: cleanAmount,
    status: 'integration_not_configured',
    timestamp: new Date().toISOString(),
    failure_reason: 'No live transaction integration is configured.',
  };
}

export async function createTicketService(params: {
  intent: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  customerId?: string;
}) {
  const perm = checkPermission('create_ticket');
  if (!perm.allowed) throw new Error(perm.reason);

  const ticketId = `CASE-${Math.floor(10000 + Math.random() * 90000)}`;

  return {
    success: false,
    ticket_id: ticketId,
    status: 'OPEN',
    intent: params.intent,
    priority: params.priority || 'high',
    summary: params.summary,
    assigned_team: null,
    created_at: new Date().toISOString(),
  };
}

export async function getRefundStatusService(params: { transactionId: string }) {
  const perm = checkPermission('get_refund_status');
  if (!perm.allowed) throw new Error(perm.reason);

  return {
    success: false,
    transaction_id: params.transactionId,
    refund_status: 'integration_not_configured',
    eligible: false,
    requires_human_approval: true,
    policy_note: 'Refund status requires a live company-approved integration or human review.',
  };
}

export async function scheduleCallbackService(params: {
  customerId?: string;
  phone?: string;
  reason?: string;
}) {
  const perm = checkPermission('schedule_callback');
  if (!perm.allowed) throw new Error(perm.reason);

  const callbackId = `CB-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    success: false,
    callback_id: callbackId,
    status: 'SCHEDULED',
    customer_id: params.customerId,
    scheduled_window: null,
    specialist_assigned: null,
  };
}

export async function lookupCustomerService(params: { customerId: string }) {
  const perm = checkPermission('lookup_customer');
  if (!perm.allowed) throw new Error(perm.reason);

  return {
    success: false,
    customer_id: params.customerId,
    status: 'integration_not_configured',
    message: 'No live customer lookup integration is configured.',
  };
}
