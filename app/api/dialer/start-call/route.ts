import { NextRequest, NextResponse } from 'next/server';
import { RtcTokenBuilder, RtcRole, RtmTokenBuilder } from 'agora-token';
import { getCompanyById, saveCallRecord } from '@/lib/db';
import { CallRecord } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, callerPhone, callerName } = body;

    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
    const appCertificate = process.env.NEXT_AGORA_APP_CERTIFICATE;

    if (!appId || !appCertificate) {
      return NextResponse.json({ error: 'Agora credentials not configured' }, { status: 500 });
    }

    if (!companyId) {
      return NextResponse.json({ error: 'companyId is required to start a call' }, { status: 400 });
    }

    if (!callerPhone) {
      return NextResponse.json({ error: 'callerPhone is required to start a call' }, { status: 400 });
    }

    const company = getCompanyById(companyId);
    if (!company) {
      return NextResponse.json({ error: 'Target company not found' }, { status: 404 });
    }

    if (!company.isActive) {
      return NextResponse.json({ error: 'EchoSphere AI is currently inactive for this company' }, { status: 403 });
    }

    const channel = `call-${company.slug}-${Date.now().toString().slice(-5)}`;
    const uid = Math.floor(100000 + Math.random() * 900000);
    const expireTime = Math.floor(Date.now() / 1000) + 3600;

    const rtcToken = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channel,
      uid,
      RtcRole.PUBLISHER,
      expireTime,
      expireTime
    );

    const rtmToken = RtmTokenBuilder.buildToken(
      appId,
      appCertificate,
      String(uid),
      expireTime
    );

    // Persist Call Record into database
    const callRecord: CallRecord = {
      id: `call-${Date.now().toString().slice(-6)}`,
      companyId: company.id,
      callerPhone,
      callerName,
      supportPhone: company.supportPhone,
      startedAt: new Date().toISOString(),
      durationSeconds: 0,
      cost: 0,
      status: 'in_progress',
      healthScore: 85,
      sentiment: 'neutral',
      language: 'hi ↔ en',
      transcripts: [],
    };

    saveCallRecord(callRecord);

    return NextResponse.json({
      success: true,
      channel,
      uid: String(uid),
      token: rtcToken,
      rtmToken,
      callId: callRecord.id,
      company: {
        id: company.id,
        name: company.name,
        supportPhone: company.supportPhone,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start call' },
      { status: 500 }
    );
  }
}
