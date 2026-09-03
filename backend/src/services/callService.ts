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

  // Generate caller token
  const tokenData = generateAgoraToken(agoraChannel, 0, 'publisher');

  const callRecord: CallRecord = {
    id: callId,
    companyId: company.id,
    callerNumber: params.callerNumber || '+919876543210',
    callerName: params.callerName || 'Valued Caller',
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
    agoraChannel,
    token: tokenData.token,
    appId: tokenData.appId,
    uid: tokenData.uid,
    callRecord,
  };
}

export async function getCall(id: string) {
  return await mongoGetCall(id);
}

export async function getCompanyCalls(companyId: string) {
  return await mongoGetCallsByCompany(companyId);
}

export async function updateCall(id: string, updates: Partial<CallRecord>) {
  const existing = await mongoGetCall(id);
  if (!existing) throw new Error('Call not found');
  const updated = { ...existing, ...updates };
  return await mongoSaveCall(updated);
}
