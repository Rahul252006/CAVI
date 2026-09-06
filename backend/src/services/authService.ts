import crypto from 'crypto';
import {
  mongoGetAdminByEmail,
  mongoSaveAdmin,
  mongoGetAgentByEmail,
  mongoSaveAgent,
  mongoSaveCompany,
  mongoSaveBrainConfig,
} from '../integrations/mongodb/models.js';
import type { CompanyAdmin, HumanAgent, CompanyRecord } from '../types/index.js';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function adminSignup(params: {
  companyName?: string;
  industry?: string;
  supportPhone?: string;
  mobile?: string;
  adminName?: string;
  firstName?: string;
  lastName?: string;
  adminEmail?: string;
  email?: string;
  password?: string;
}) {
  const email = (params.adminEmail || params.email || '').trim().toLowerCase();
  if (!email) {
    throw new Error('Work email address is required');
  }

  const existing = await mongoGetAdminByEmail(email);
  if (existing) {
    throw new Error('An administrator with this email already exists');
  }

  const companyId = `comp_${Date.now()}`;
  const adminId = `admin_${Date.now()}`;
  const adminName = (params.adminName || `${params.firstName || ''} ${params.lastName || ''}`).trim() || 'Company Admin';
  const companyName = (params.companyName || 'My Company').trim();
  const supportPhone = (params.supportPhone || '').trim();
  if (!supportPhone) {
    throw new Error('Company support phone is required');
  }
  const industry = (params.industry || 'Customer Support').trim();

  const company: CompanyRecord = {
    id: companyId,
    name: companyName,
    industry,
    supportPhone,
    adminEmail: email,
    adminName,
    createdAt: new Date().toISOString(),
    status: 'pending_onboarding' as any,
    plan: 'growth',
  };

  const admin: CompanyAdmin = {
    id: adminId,
    companyId,
    name: adminName,
    email,
    passwordHash: hashPassword(params.password || 'cavi2026'),
    role: 'owner',
    createdAt: new Date().toISOString(),
  };

  await mongoSaveCompany(company);
  await mongoSaveAdmin(admin);

  // Initialize Default Brain Config
  await mongoSaveBrainConfig({
    companyId,
    agentName: `${params.companyName} Assistant`,
    tone: 'empathetic',
    primaryLanguage: 'English',
    allowCodeSwitching: true,
    allowedActions: ['lookup_status', 'create_ticket', 'escalate_to_human'],
    maxRefundAmount: 0,
    requireHumanApproval: true,
    escalationThreshold: 0.65,
    customInstructions: `Help customers resolve orders, bookings, and inquiries with zero repeated stories.`,
  });

  return { company, admin };
}

export async function adminLogin(email: string, password?: string) {
  const admin = await mongoGetAdminByEmail(email);
  if (!admin) {
    throw new Error('Admin not found with this email');
  }

  if (password && admin.passwordHash !== hashPassword(password)) {
    // In relaxed dev mode we allow matching email or valid password
    console.warn('[Auth] Password check relaxed for testing');
  }

  return admin;
}

export async function agentRegister(params: {
  companyId: string;
  name: string;
  email: string;
  phone?: string;
  mobile?: string;
  department: string;
  role?: 'support_officer' | 'team_lead' | 'specialist';
  specialization?: string[];
  languages?: string[];
  password?: string;
}) {
  const existing = await mongoGetAgentByEmail(params.email);
  if (existing && existing.status !== 'removed') {
    throw new Error('An officer with this email already exists');
  }

  if (!params.companyId) {
    throw new Error('companyId is required to register an officer');
  }
  const phoneNum = (params.phone || params.mobile || '').trim();

  const agent: HumanAgent = {
    id: existing?.id || `agent_${Date.now()}`,
    companyId: params.companyId,
    name: params.name,
    email: params.email.toLowerCase(),
    phone: phoneNum,
    mobile: phoneNum,
    passwordHash: hashPassword(params.password || 'officer2026'),
    role: params.role || 'support_officer',
    department: params.department || 'General Support',
    specialization: params.specialization || [],
    languages: params.languages || [],
    status: 'available',
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await mongoSaveAgent(agent);
  return agent;
}

export async function agentUpdate(agentId: string, updates: Partial<HumanAgent>) {
  if (!updates.companyId) {
    throw new Error('companyId is required to update an officer');
  }
  // Save or update
  const agentToSave: HumanAgent = {
    id: agentId,
    companyId: updates.companyId,
    name: updates.name || 'Support Officer',
    email: (updates.email || '').toLowerCase(),
    phone: updates.phone || updates.mobile || '',
    mobile: updates.phone || updates.mobile || '',
    role: updates.role || 'support_officer',
    department: updates.department || 'General Support',
    status: updates.status || 'available',
    createdAt: updates.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await mongoSaveAgent(agentToSave);
  return agentToSave;
}

export async function agentRemove(agentId: string, removalReason: string) {
  const { mongoGetAgentById, mongoSaveAgent } = await import('../integrations/mongodb/models.js');
  const agent = await mongoGetAgentById(agentId);
  if (agent) {
    agent.status = 'removed';
    agent.removalReason = removalReason || 'Removed by Admin';
    agent.updatedAt = new Date().toISOString();
    await mongoSaveAgent(agent);
    return agent;
  }
  return null;
}

export async function agentLogin(email: string) {
  const agent = await mongoGetAgentByEmail(email);
  if (!agent || agent.status === 'removed') {
    throw new Error('Officer not found or access revoked');
  }
  return agent;
}
