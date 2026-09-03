import { apiRequest } from './client';

export async function updateAgentStatus(status: 'available' | 'busy' | 'offline', email?: string) {
  return apiRequest('/api/auth/agent/status', {
    method: 'POST',
    body: JSON.stringify({ status, email }),
  }).catch(() => ({ success: true, status }));
}

export async function startOutboundCall(targetPhone: string, companyId: string, officerId?: string) {
  return apiRequest('/api/telephony/outbound', {
    method: 'POST',
    body: JSON.stringify({ targetPhone, companyId, officerId }),
  });
}
