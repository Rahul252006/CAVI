import { apiRequest } from './client';

export async function startCall(params: {
  phone: string;
  callerNumber?: string;
  callerName?: string;
}) {
  return apiRequest('/api/calls/start', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function getCall(callId: string) {
  return apiRequest(`/api/calls/${callId}`);
}

export async function getCompanyCalls(companyId: string) {
  return apiRequest('/api/calls', {
    params: { companyId },
  });
}

export async function updateCall(callId: string, updates: Record<string, any>) {
  return apiRequest(`/api/calls/${callId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}
