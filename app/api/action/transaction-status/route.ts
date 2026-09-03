import { NextRequest, NextResponse } from 'next/server';
import { checkTransaction } from '@/lib/echosphere/actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId } = body;
    if (!transactionId) {
      return NextResponse.json({ error: 'transactionId is required' }, { status: 400 });
    }
    const result = await checkTransaction(transactionId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Action failed' }, { status: 400 });
  }
}
