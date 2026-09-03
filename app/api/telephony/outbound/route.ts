import { NextRequest, NextResponse } from 'next/server';
import { initiateOutboundPstnCall } from '@/lib/telephony/gateway';
import { OutboundCallRequest } from '@/lib/telephony/types';

export async function POST(request: NextRequest) {
  try {
    const body: OutboundCallRequest = await request.json();

    if (!body.customerPhone || !body.companyId || !body.companySupportPhone) {
      return NextResponse.json(
        { error: 'customerPhone, companyId, and companySupportPhone are required' },
        { status: 400 }
      );
    }

    const result = await initiateOutboundPstnCall({
      companyId: body.companyId,
      companySupportPhone: body.companySupportPhone,
      customerPhone: body.customerPhone,
      caseId: body.caseId,
      agentId: body.agentId,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Outbound call failed' },
      { status: 500 }
    );
  }
}
