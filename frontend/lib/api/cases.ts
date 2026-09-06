import { apiRequest } from './client';

export async function getCases(companyId?: string) {
  return apiRequest('/api/case/list', {
    params: { companyId },
  });
}

export async function getCase(caseId: string) {
  return apiRequest(`/api/case/${caseId}`);
}

export async function createCase(caseData: Record<string, any>) {
  return apiRequest('/api/case/create', {
    method: 'POST',
    body: JSON.stringify(caseData),
  });
}
