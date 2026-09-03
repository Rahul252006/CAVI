import { ExtractedFact } from '@/types/echosphere';

export function extractFactsFromText(text: string, _currentFacts: Record<string, ExtractedFact> = {}): Record<string, Partial<ExtractedFact>> {
  const extracted: Record<string, Partial<ExtractedFact>> = {};
  if (!text) return extracted;

  const lower = text.toLowerCase();

  // Amount extraction (supports ₹, Rs, INR, rupees, numbers)
  const amountRegex = /(?:₹|rs\.?|inr|rupees?)\s*([\d,]+(?:\.\d+)?)|([\d,]+(?:\.\d+)?)\s*(?:₹|rs\.?|inr|rupees?|bucks)/i;
  const directNumRegex = /\b(?:amount\s*(?:is|was)?\s*|around\s*|paid\s*|of\s*)(\d{3,6})\b/i;
  const numOnlyMatch = text.match(/\b(\d{3,5})\b/);

  const amtMatch = text.match(amountRegex);
  const directMatch = text.match(directNumRegex);

  if (amtMatch) {
    const val = amtMatch[1] || amtMatch[2];
    const cleaned = val.replace(/,/g, '');
    extracted['amount'] = {
      value: `₹${cleaned}`,
      confidence: 0.92,
      source: 'user',
    };
  } else if (directMatch) {
    extracted['amount'] = {
      value: `₹${directMatch[1]}`,
      confidence: 0.85,
      source: 'user',
    };
  } else if (numOnlyMatch && (lower.includes('amount') || lower.includes('payment') || lower.includes('paid') || lower.includes('rupee') || lower.includes('actually') || lower.includes('correct'))) {
    extracted['amount'] = {
      value: `₹${numOnlyMatch[1]}`,
      confidence: 0.78,
      source: 'user',
    };
  }

  // Transaction ID extraction (e.g. TXN-1234, ID 8392, #98234)
  const txnRegex = /(?:txn[-_ ]?|transaction\s*(?:id|number)?\s*[:#]?\s*)([a-zA-Z0-9_-]{4,16})/i;
  const txnMatch = text.match(txnRegex);
  if (txnMatch) {
    extracted['transactionId'] = {
      value: txnMatch[1].toUpperCase(),
      confidence: 0.95,
      source: 'user',
    };
  }

  // Customer ID / Account ID (e.g., CUST-901, ACC-123)
  const custRegex = /(?:cust(?:omer)?[-_ ]?id|account\s*(?:no|number|id)?\s*[:#]?\s*)([a-zA-Z0-9_-]{3,12})/i;
  const custMatch = text.match(custRegex);
  if (custMatch) {
    extracted['customerId'] = {
      value: custMatch[1].toUpperCase(),
      confidence: 0.9,
      source: 'user',
    };
  }

  // Merchant name extraction
  if (lower.includes('merchant') || lower.includes('store') || lower.includes('swiggy') || lower.includes('zomato') || lower.includes('amazon') || lower.includes('flipkart')) {
    if (lower.includes('swiggy')) extracted['merchant'] = { value: 'Swiggy', confidence: 0.9, source: 'user' };
    else if (lower.includes('zomato')) extracted['merchant'] = { value: 'Zomato', confidence: 0.9, source: 'user' };
    else if (lower.includes('amazon')) extracted['merchant'] = { value: 'Amazon', confidence: 0.9, source: 'user' };
    else if (lower.includes('flipkart')) extracted['merchant'] = { value: 'Flipkart', confidence: 0.9, source: 'user' };
  }

  // Date/Time
  if (lower.includes('today') || lower.includes('aaj')) {
    extracted['date'] = { value: 'Today', confidence: 0.88, source: 'user' };
  } else if (lower.includes('yesterday') || lower.includes('kal')) {
    extracted['date'] = { value: 'Yesterday', confidence: 0.85, source: 'user' };
  }

  // Issue Category & Goal detection
  if (lower.includes('fail') || lower.includes('kat gaya') || lower.includes('failed') || lower.includes('debited') || lower.includes('not received')) {
    extracted['issue'] = { value: 'Payment Failed / Money Debited', confidence: 0.95, source: 'user' };
    extracted['customerGoal'] = { value: 'Resolve failed transaction & verify status', confidence: 0.9, source: 'user' };
  } else if (lower.includes('refund') || lower.includes('wapas') || lower.includes('return')) {
    extracted['issue'] = { value: 'Refund Request', confidence: 0.92, source: 'user' };
    extracted['customerGoal'] = { value: 'Obtain refund for transaction', confidence: 0.9, source: 'user' };
  } else if (lower.includes('login') || lower.includes('password') || lower.includes('otp') || lower.includes('account')) {
    extracted['issue'] = { value: 'Account / Access Issue', confidence: 0.88, source: 'user' };
    extracted['customerGoal'] = { value: 'Regain account access', confidence: 0.85, source: 'user' };
  }

  return extracted;
}
