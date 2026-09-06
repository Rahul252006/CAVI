import {
  mongoGetCompanyBySupportPhone,
  mongoGetCall,
  mongoGetCallsByCompany,
  mongoSaveCall,
} from '../integrations/mongodb/models.js';
import { generateAgoraToken } from '../integrations/agora/token.js';
import { inviteAgoraAgent } from '../integrations/agora/agent.js';
import type { CallRecord } from '../types/index.js';

export async function startCall(params: {
  phone: string;
  callerNumber?: string;
  callerName?: string;
}) {
  const company = await mongoGetCompanyBySupportPhone(params.phone);
  if (!company) {
    throw new Error(`No company registered with support phone: ${params.phone}`);
  }

  const callId = `call_${Date.now()}`;
  const agoraChannel = `cavi_ch_${Date.now()}`;

  // Generate caller token with valid numeric UID
  const userUid = Math.floor(Math.random() * 899999 + 100000);
  const tokenData = generateAgoraToken(agoraChannel, userUid, 'publisher');

  const callRecord: CallRecord = {
    id: callId,
    companyId: company.id,
    callerNumber: params.callerNumber || '',
    callerName: params.callerName,
    direction: 'inbound',
    status: 'active',
    durationSeconds: 0,
    agoraChannel,
    transcript: [],
    startedAt: new Date().toISOString(),
  };

  await mongoSaveCall(callRecord);

  // Trigger Conversational AI Agent Invitation
  try {
    await inviteAgoraAgent(agoraChannel, company.id);
  } catch (err) {
    console.warn('[CallService] Agent invitation warning:', err);
  }

  return {
    callId,
    companyId: company.id,
    companyName: company.name,
    company: {
      id: company.id,
      name: company.name,
      supportPhone: company.supportPhone,
      industry: company.industry,
    },
    agoraChannel,
    channel: agoraChannel,
    token: tokenData.token,
    rtmToken: tokenData.rtmToken || tokenData.token,
    rtmUserId: tokenData.rtmUserId,
    appId: tokenData.appId,
    uid: tokenData.uid,
    callRecord,
  };
}

export async function getCall(id: string) {
  return await mongoGetCall(id);
}

export async function getCompanyCalls(companyId?: string) {
  return await mongoGetCallsByCompany(companyId);
}

export async function updateCall(id: string, updates: Partial<CallRecord>) {
  const existing = await mongoGetCall(id);
  if (!existing) throw new Error('Call not found');
  const updated = { ...existing, ...updates };
  return await mongoSaveCall(updated);
}
