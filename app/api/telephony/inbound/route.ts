import { NextRequest, NextResponse } from 'next/server';
import { handleInboundPstnCall } from '@/lib/telephony/gateway';
import { InboundCallPayload } from '@/lib/telephony/types';

export async function POST(request: NextRequest) {
  try {
    let payload: InboundCallPayload;

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      payload = {
        From: (formData.get('From') as string) || '+919876543210',
        To: (formData.get('To') as string) || '+91800555FAST',
        CallSid: (formData.get('CallSid') as string) || undefined,
        CallStatus: (formData.get('CallStatus') as string) || 'ringing',
        Direction: 'inbound',
      };
    } else {
      payload = await request.json();
    }

    const result = await handleInboundPstnCall(payload);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status || 400 });
    }

    // If client requested XML (e.g. Twilio / SIP carrier), return TwiML XML
    const acceptHeader = request.headers.get('accept') || '';
    if (acceptHeader.includes('text/xml') || acceptHeader.includes('application/xml')) {
      return new NextResponse(result.twimlResponse, {
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Inbound telephony handling failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const to = searchParams.get('To') || '+91800555FAST';
  const from = searchParams.get('From') || '+919876543210';

  const result = await handleInboundPstnCall({ To: to, From: from });
  return NextResponse.json(result);
}
