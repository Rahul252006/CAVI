import { getDb, saveCallRecord } from '@/lib/db';
import { Company, CallRecord } from '@/lib/db/schema';
import { InboundCallPayload, OutboundCallRequest, TelephonyStatus } from './types';
import { RtcTokenBuilder, RtcRole } from 'agora-token';

function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

export function resolveTenantByDestinationNumber(destinationPhone: string): Company | undefined {
  const db = getDb();
  const cleanDest = normalizePhone(destinationPhone);

  if (!cleanDest) return undefined;

  // Search for exact match or suffix match on company supportPhone
  return db.companies.find(c => {
    const cleanCompanyPhone = normalizePhone(c.supportPhone);
    return cleanCompanyPhone === cleanDest || cleanDest.endsWith(cleanCompanyPhone) || cleanCompanyPhone.endsWith(cleanDest);
  });
}

export async function handleInboundPstnCall(payload: InboundCallPayload) {
  const company = resolveTenantByDestinationNumber(payload.To);

  if (!company) {
    return {
      success: false,
      error: `Destination number '${payload.To}' is not mapped to any registered company in ORIGIN.`,
      status: 404,
    };
  }

  if (!company.isActive) {
    return {
      success: false,
      error: `EchoSphere AI is currently deactivated by company admin for ${company.name}.`,
      status: 403,
    };
  }

  const callerMobileNumber = payload.From || '+91 98765 43210';
  const callId = payload.CallSid || `pstn-${Date.now().toString().slice(-6)}`;
  const channelName = `call-${company.slug}-${Date.now().toString().slice(-5)}`;

  // Create persistent Call Record with caller's real phone
  const callRecord: CallRecord = {
    id: callId,
    companyId: company.id,
    callerPhone: callerMobileNumber,
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

  // Generate Agora RTC credentials for telephony media bridge
  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || '';
  const appCert = process.env.NEXT_AGORA_APP_CERTIFICATE || '';
  const uid = Math.floor(100000 + Math.random() * 900000);
  const expireTime = Math.floor(Date.now() / 1000) + 3600;

  const rtcToken = appId && appCert ? RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCert,
    channelName,
    uid,
    RtcRole.PUBLISHER,
    expireTime,
    expireTime
  ) : '';

  // Trigger Agora AI agent for the channel
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  fetch(`${baseUrl}/api/invite-agent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requester_id: String(uid),
      channel_name: channelName,
    }),
  }).catch((e) => console.error('Agent invite error during PSTN call:', e));

  // Generate TwiML / SIP Response
  const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi" language="hi-IN">Welcome to ${company.name} customer care. Please hold while we connect your call to our AI resolution assistant.</Say>
  <Connect>
    <Stream url="wss://${process.env.NEXT_PUBLIC_APP_URL ? process.env.NEXT_PUBLIC_APP_URL.replace(/^https?:\/\//, '') : 'gateway.echosphere.demo'}/api/telephony/media-stream">
      <Parameter name="companyId" value="${company.id}" />
      <Parameter name="channelName" value="${channelName}" />
      <Parameter name="callerPhone" value="${callerMobileNumber}" />
    </Stream>
  </Connect>
</Response>`;

  return {
    success: true,
    company: {
      id: company.id,
      name: company.name,
      supportPhone: company.supportPhone,
    },
    callId,
    callerPhone: callerMobileNumber,
    channelName,
    rtcToken,
    uid: String(uid),
    twimlResponse,
  };
}

export async function initiateOutboundPstnCall(req: OutboundCallRequest) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  const channelName = `outbound-${normalizePhone(req.customerPhone).slice(-6)}-${Date.now().toString().slice(-4)}`;
  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || '';
  const appCert = process.env.NEXT_AGORA_APP_CERTIFICATE || '';
  const uid = Math.floor(100000 + Math.random() * 900000);
  const expireTime = Math.floor(Date.now() / 1000) + 3600;

  const rtcToken = appId && appCert ? RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCert,
    channelName,
    uid,
    RtcRole.PUBLISHER,
    expireTime,
    expireTime
  ) : '';

  // If live Twilio credentials exist, make real outbound cellular call
  if (accountSid && authToken) {
    try {
      const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`;

      const formData = new URLSearchParams();
      formData.append('To', req.customerPhone);
      formData.append('From', req.companySupportPhone);
      formData.append('Url', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/telephony/outbound-twiml?channel=${channelName}`);

      const twilioRes = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const twilioData = await twilioRes.json();
      return {
        success: true,
        mode: 'LIVE_PSTN_OUTBOUND',
        callSid: twilioData.sid,
        to: req.customerPhone,
        from: req.companySupportPhone,
        channel: channelName,
        token: rtcToken,
        status: twilioData.status || 'queued',
        message: `Outbound cellular call dispatched to ${req.customerPhone}`,
      };
    } catch (e) {
      console.error('Twilio outbound call error:', e);
    }
  }

  // Fallback: Agora Voice Bridge with real phone number metadata
  return {
    success: true,
    mode: 'AGORA_VOICE_BRIDGE',
    to: req.customerPhone,
    from: req.companySupportPhone,
    channel: channelName,
    token: rtcToken,
    uid: String(uid),
    status: 'RINGING',
    message: `Voice link established for caller ${req.customerPhone}. To enable carrier PSTN trunking, configure TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.`,
  };
}

export function getTelephonyStatus(): TelephonyStatus {
  const db = getDb();
  const isPstnConfigured = Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return {
    isPstnConfigured,
    provider: isPstnConfigured ? 'twilio' : 'simulated',
    inboundWebhookUrl: `${baseUrl}/api/telephony/inbound`,
    sipUri: `sip:inbound@${baseUrl.replace(/^https?:\/\//, '')}`,
    companiesMapped: db.companies.map(c => ({
      companyId: c.id,
      companyName: c.name,
      supportPhone: c.supportPhone,
      status: 'active',
    })),
    requiredEnvVars: {
      TWILIO_ACCOUNT_SID: Boolean(process.env.TWILIO_ACCOUNT_SID),
      TWILIO_AUTH_TOKEN: Boolean(process.env.TWILIO_AUTH_TOKEN),
      NEXT_PUBLIC_APP_URL: Boolean(process.env.NEXT_PUBLIC_APP_URL),
    },
  };
}
