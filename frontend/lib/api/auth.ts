import { apiRequest } from './client';

export async function adminSignup(data: {
  companyName: string;
  industry: string;
  supportPhone: string;
  adminName: string;
  adminEmail: string;
  password?: string;
}) {
  return apiRequest('/api/auth/admin/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function adminLogin(email: string, password?: string) {
  return apiRequest('/api/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function agentRegister(data: {
  companyId: string;
  name: string;
  email: string;
  department: string;
  specialization?: string[];
  languages?: string[];
  password?: string;
}) {
  return apiRequest('/api/auth/agent/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function agentLogin(email: string) {
  return apiRequest('/api/auth/agent/login', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}
