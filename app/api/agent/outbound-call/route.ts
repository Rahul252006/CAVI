import { NextRequest, NextResponse } from 'next/server';
import { RtcTokenBuilder, RtcRole } from 'agora-token';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerPhone, caseId, agentId, companyId } = body;

    if (!customerPhone || !companyId) {
      return NextResponse.json({ error: 'customerPhone and companyId are required' }, { status: 400 });
    }

    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
    const appCertificate = process.env.NEXT_AGORA_APP_CERTIFICATE;

    if (!appId || !appCertificate) {
      return NextResponse.json({ error: 'Agora credentials not configured' }, { status: 500 });
    }

    // Generate dedicated outbound bridge channel
    const channelName = `outbound-${(customerPhone || 'cust').replace(/[^a-zA-Z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;
    const uid = Math.floor(100000 + Math.random() * 900000);
    const expireTime = Math.floor(Date.now() / 1000) + 3600;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      RtcRole.PUBLISHER,
      expireTime,
      expireTime
    );

    return NextResponse.json({
      success: true,
      channel: channelName,
      token,
      uid: String(uid),
      customerPhone,
      caseId,
      agentId,
      companyId,
      status: 'DIALING_CUSTOMER',
      telephonyMode: 'Agora Voice Bridge (Simulated PSTN Link)',
      message: `Direct voice bridge initialized for caller ${customerPhone}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Outbound calling failed' },
      { status: 500 }
    );
  }
}
