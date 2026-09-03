import { NextRequest, NextResponse } from 'next/server';
import { RtcTokenBuilder, RtcRole, RtmTokenBuilder } from 'agora-token';
import { getCompanyBySupportPhone, getCompanyBrain, saveCallRecord } from '@/lib/db';
import { CallRecord } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { supportPhone, callerPhone, callerName } = body;

    if (!supportPhone) {
      return NextResponse.json(
        { success: false, error: 'Customer care number is required.' },
        { status: 400 }
      );
    }

    // 1. Verify that the dialed customer care number is registered to an active company
    const company = getCompanyBySupportPhone(supportPhone);

    if (!company) {
      return NextResponse.json(
        {
          success: false,
          error: `Customer care number '${supportPhone}' is not registered with any company.`,
        },
        { status: 404 }
      );
    }

    if (!company.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: `The voice AI service for ${company.name} is currently inactive.`,
        },
        { status: 403 }
      );
    }

    // 2. Load Company Brain
    const brain = getCompanyBrain(company.id);

    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
    const appCertificate = process.env.NEXT_AGORA_APP_CERTIFICATE;

    if (!appId || !appCertificate) {
      return NextResponse.json(
        { success: false, error: 'Agora voice infrastructure is not configured.' },
        { status: 500 }
      );
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

    const callId = `call-${Date.now().toString().slice(-6)}`;
    const effectiveCallerPhone = callerPhone || '+91 98765 43210';

    // 3. Store CallRecord in DB
    const callRecord: CallRecord = {
      id: callId,
      companyId: company.id,
      callerPhone: effectiveCallerPhone,
      callerName: callerName || 'Customer Caller',
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
      company: {
        id: company.id,
        name: company.name,
        supportPhone: company.supportPhone,
        industry: company.industry,
      },
      brain: brain || null,
      callId,
      channel,
      token: rtcToken,
      rtmToken,
      uid: String(uid),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Call initialization failed' },
      { status: 500 }
    );
  }
}
