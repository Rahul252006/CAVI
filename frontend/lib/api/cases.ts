import { apiRequest } from './client';

export async function getCases(companyId?: string) {
  return apiRequest('/api/cases', {
    params: { companyId },
  });
}

export async function getCase(caseId: string) {
  return apiRequest(`/api/cases/${caseId}`);
}

export async function createCase(caseData: Record<string, any>) {
  return apiRequest('/api/cases/create', {
    method: 'POST',
    body: JSON.stringify(caseData),
  });
}
