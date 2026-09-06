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
  return {
    success: false,
    transactionId: parsed.transactionId,
    status: 'integration_not_configured',
    message: 'No live transaction lookup integration is configured for this company.',
  };
}

export async function requestRefund(transactionId: string, amount: number, confirmedByUser: boolean) {
  const parsed = RefundRequestSchema.parse({ transactionId, amount, confirmedByUser });
  return {
    success: false,
    transactionId: parsed.transactionId,
    amount: parsed.amount,
    status: 'integration_not_configured',
    message: 'Refunds require a live company-approved payment integration or human approval.',
  };
}

export async function lookupCustomer(customerId: string) {
  const parsed = CustomerLookupSchema.parse({ customerId });
  return {
    success: false,
    customerId: parsed.customerId,
    status: 'integration_not_configured',
    message: 'No live customer lookup integration is configured for this company.',
  };
}
