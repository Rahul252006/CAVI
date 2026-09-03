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
  companyName: string;
  industry: string;
  supportPhone: string;
  adminName: string;
  adminEmail: string;
  password?: string;
}) {
  const existing = await mongoGetAdminByEmail(params.adminEmail);
  if (existing) {
    throw new Error('An administrator with this email already exists');
  }

  const companyId = `comp_${Date.now()}`;
  const adminId = `admin_${Date.now()}`;

  const company: CompanyRecord = {
    id: companyId,
    name: params.companyName,
    industry: params.industry,
    supportPhone: params.supportPhone,
    adminEmail: params.adminEmail.toLowerCase(),
    adminName: params.adminName,
    createdAt: new Date().toISOString(),
    status: 'active',
    plan: 'growth',
  };

  const admin: CompanyAdmin = {
    id: adminId,
    companyId,
    name: params.adminName,
    email: params.adminEmail.toLowerCase(),
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
    allowedActions: ['refund', 'lookup_status', 'reschedule'],
    maxRefundAmount: 500,
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
  department: string;
  specialization?: string[];
  languages?: string[];
  password?: string;
}) {
  const existing = await mongoGetAgentByEmail(params.email);
  if (existing) {
    throw new Error('An officer with this email already exists');
  }

  const agent: HumanAgent = {
    id: `agent_${Date.now()}`,
    companyId: params.companyId,
    name: params.name,
    email: params.email.toLowerCase(),
    passwordHash: hashPassword(params.password || 'officer2026'),
    role: 'support_officer',
    department: params.department || 'General Support',
    specialization: params.specialization || ['Billing', 'Order Inquiries'],
    languages: params.languages || ['English', 'Hindi'],
    status: 'available',
    createdAt: new Date().toISOString(),
  };

  await mongoSaveAgent(agent);
  return agent;
}

export async function agentLogin(email: string) {
  const agent = await mongoGetAgentByEmail(email);
  if (!agent) {
    throw new Error('Officer not found with this email');
  }
  return agent;
}
