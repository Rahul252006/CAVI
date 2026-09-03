import { NextRequest, NextResponse } from 'next/server';
import { lookupCustomer } from '@/lib/echosphere/actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId } = body;
    if (!customerId) {
      return NextResponse.json({ error: 'customerId is required' }, { status: 400 });
    }
    const result = await lookupCustomer(customerId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Action failed' }, { status: 400 });
  }
}
