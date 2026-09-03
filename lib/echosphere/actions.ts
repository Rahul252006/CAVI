import { z } from 'zod';

export const TransactionCheckSchema = z.object({
  transactionId: z.string().min(1, 'Transaction ID is required'),
});

export const RefundRequestSchema = z.object({
  transactionId: z.string().min(1, 'Transaction ID is required'),
  amount: z.number().positive('Amount must be positive'),
  confirmedByUser: z.boolean().refine(val => val === true, 'Explicit user confirmation required for refunds'),
});

export const CustomerLookupSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
});

export async function checkTransaction(transactionId: string) {
  const parsed = TransactionCheckSchema.parse({ transactionId });
  // Deterministic mock for demo
  return {
    success: true,
    transactionId: parsed.transactionId,
    status: 'failed',
    amount: 2499,
    currency: 'INR',
    date: new Date().toISOString().split('T')[0],
    merchant: 'Demo Store',
    gatewayError: 'Payment gateway timeout (HTTP 504) - Auto-reversal initiated',
  };
}

export async function requestRefund(transactionId: string, amount: number, confirmedByUser: boolean) {
  const parsed = RefundRequestSchema.parse({ transactionId, amount, confirmedByUser });
  return {
    success: true,
    refundId: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
    transactionId: parsed.transactionId,
    amount: parsed.amount,
    currency: 'INR',
    status: 'submitted',
    estimatedSettlement: '24-48 hours to original payment method',
    message: `Refund of ₹${parsed.amount} successfully scheduled for transaction ${parsed.transactionId}`,
  };
}

export async function lookupCustomer(customerId: string) {
  const parsed = CustomerLookupSchema.parse({ customerId });
  return {
    success: true,
    customerId: parsed.customerId,
    name: 'Rahul Simhadri',
    tier: 'Gold Support',
    linkedTransactions: ['TXN-8392', 'TXN-7104'],
  };
}
