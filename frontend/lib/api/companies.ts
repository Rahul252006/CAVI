import { apiRequest } from './client';

export async function getCompanies(phone?: string) {
  return apiRequest('/api/companies', {
    params: { phone },
  });
}

export async function getCompany(companyId: string) {
  return apiRequest(`/api/companies/${companyId}`);
}

export async function getCompanyOverview(companyId: string) {
  return apiRequest(`/api/companies/${companyId}/overview`);
}

export async function getCompanyBrain(companyId: string) {
  return apiRequest(`/api/companies/${companyId}/brain`);
}

export async function updateBrainConfig(companyId: string, updates: Record<string, any>) {
  return apiRequest(`/api/companies/${companyId}/config`, {
    method: 'POST',
    body: JSON.stringify(updates),
  });
}

export async function addKnowledgeDoc(companyId: string, doc: { title: string; content: string; type?: string }) {
  return apiRequest(`/api/companies/${companyId}/knowledge`, {
    method: 'POST',
    body: JSON.stringify(doc),
  });
}

export async function deleteKnowledgeDoc(companyId: string, docId: string) {
  return apiRequest(`/api/companies/${companyId}/knowledge/${docId}`, {
    method: 'DELETE',
  });
}

export async function saveCompanyTool(companyId: string, tool: Record<string, any>) {
  return apiRequest(`/api/companies/${companyId}/tools`, {
    method: 'POST',
    body: JSON.stringify(tool),
  });
}
