import { apiRequest } from './client';

export async function generateAgoraToken(channel: string, uid?: number | string) {
  return apiRequest('/api/agora/token', {
    method: 'POST',
    body: JSON.stringify({ channel, uid }),
  });
}

export async function inviteAgoraAgent(channel: string, companyId?: string) {
  return apiRequest('/api/agora/invite-agent', {
    method: 'POST',
    body: JSON.stringify({ channel, companyId }),
  });
}

export async function analyzeTranscript(transcript: string) {
  return apiRequest('/api/action/analyze', {
    method: 'POST',
    body: JSON.stringify({ transcript }),
  });
}
