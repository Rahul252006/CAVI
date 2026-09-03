import { NextRequest, NextResponse } from 'next/server';
import { getCalls, getCallById, saveCallRecord } from '@/lib/db';
import { CallRecord } from '@/lib/db/schema';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');
  const searchPhone = searchParams.get('phone');
  const callId = searchParams.get('id');

  if (callId) {
    const call = getCallById(callId);
    if (!call) return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    return NextResponse.json({ call });
  }

  let calls = getCalls(companyId || undefined);

  if (searchPhone) {
    const cleanSearch = searchPhone.replace(/[^0-9]/g, '');
    calls = calls.filter(c => c.callerPhone.replace(/[^0-9]/g, '').includes(cleanSearch));
  }

  return NextResponse.json({ calls });
}

export async function POST(request: NextRequest) {
  try {
    const body: CallRecord = await request.json();
    if (!body.id || !body.companyId || !body.callerPhone) {
      return NextResponse.json({ error: 'id, companyId, and callerPhone are required' }, { status: 400 });
    }

    const saved = saveCallRecord(body);
    return NextResponse.json({ success: true, call: saved });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save call record' },
      { status: 500 }
    );
  }
}
