import { NextRequest, NextResponse } from 'next/server';
import {
  checkTransactionService,
  createTicketService,
  getRefundStatusService,
  scheduleCallbackService,
  lookupCustomerService,
} from '@/lib/company/services';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tool, params } = body;

    let result: Record<string, unknown>;

    switch (tool) {
      case 'lookup_transaction':
      case 'check_transaction':
        result = await checkTransactionService(params || {});
        break;

      case 'create_ticket':
        result = await createTicketService(params || { intent: 'Support Inquiry', summary: 'Customer assistance' });
        break;

      case 'get_refund_status':
        result = await getRefundStatusService(params || { transactionId: 'TXN8392' });
        break;

      case 'schedule_callback':
        result = await scheduleCallbackService(params || {});
        break;

      case 'lookup_customer':
        result = await lookupCustomerService(params || { customerId: 'CUS-1001' });
        break;

      default:
        return NextResponse.json(
          { error: `Unknown or unsupported tool '${tool}'` },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, tool, result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Tool execution failed' },
      { status: 403 }
    );
  }
}
