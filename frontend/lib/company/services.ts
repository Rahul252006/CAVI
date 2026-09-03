import { checkPermission } from './brain';

export async function checkTransactionService(params: { transactionId?: string; amount?: number | string }) {
  const perm = checkPermission('lookup_transaction');
  if (!perm.allowed) throw new Error(perm.reason);

  const cleanTxnId = params.transactionId?.toUpperCase() || 'TXN8392';
  const cleanAmount = params.amount
    ? typeof params.amount === 'number'
      ? params.amount
      : parseFloat(params.amount.toString().replace(/[^0-9.]/g, ''))
    : 2499;

  return {
    success: true,
    transaction_id: cleanTxnId,
    amount: cleanAmount || 2499,
    currency: 'INR',
    status: 'FAILED',
    merchant: 'ABC Store',
    timestamp: new Date().toISOString(),
    failure_reason: 'Bank Gateway Timeout (HTTP 504) - Auto-reversal in progress',
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
    success: true,
    ticket_id: ticketId,
    status: 'OPEN',
    intent: params.intent,
    priority: params.priority || 'high',
    summary: params.summary,
    assigned_team: 'Payments Support Team',
    created_at: new Date().toISOString(),
  };
}

export async function getRefundStatusService(params: { transactionId: string }) {
  const perm = checkPermission('get_refund_status');
  if (!perm.allowed) throw new Error(perm.reason);

  return {
    success: true,
    transaction_id: params.transactionId,
    refund_status: 'PENDING_REVIEW',
    eligible: true,
    requires_human_approval: true,
    policy_note: 'Refund eligible under Failed Payment Policy. Pending human supervisor authorization.',
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
    success: true,
    callback_id: callbackId,
    status: 'SCHEDULED',
    customer_id: params.customerId || 'CUS-1001',
    scheduled_window: 'Within 15 minutes',
    specialist_assigned: 'Senior Support Officer',
  };
}

export async function lookupCustomerService(params: { customerId: string }) {
  const perm = checkPermission('lookup_customer');
  if (!perm.allowed) throw new Error(perm.reason);

  return {
    success: true,
    customer_id: params.customerId,
    name: 'Rahul Simhadri',
    email: 'rahul@example.com',
    phone: '+91 98765 43210',
    kyc_status: 'VERIFIED',
    account_tier: 'Gold',
    recent_transactions: ['TXN8392', 'TXN7104'],
  };
}
