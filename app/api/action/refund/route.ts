import { NextRequest, NextResponse } from 'next/server';
import { requestRefund } from '@/lib/echosphere/actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId, amount, confirmedByUser } = body;

    const result = await requestRefund(transactionId, Number(amount), Boolean(confirmedByUser));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Action failed' }, { status: 400 });
  }
}
