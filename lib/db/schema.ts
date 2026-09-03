import { CaseDNA } from '@/types/echosphere';

export type CompanyAdmin = {
  adminId: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  mobile: string;
  jobTitle: string;
  companyId: string;
  companyName: string;
  createdAt: string;
  lastLoginAt: string;
  emailVerified: boolean;
  accountStatus: 'active' | 'pending' | 'suspended';
};

export type Company = {
  id: string;
  name: string;
  legalName: string;
  slug: string;
  industry: string;
  website?: string;
  logo?: string;
  description: string;
  country: string;
  state?: string;
  city?: string;
  businessAddress?: string;
  timezone: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;

  // Customer Support / Telephony
  supportPhone: string; // The company's existing customer-care number mapped to companyId
  phoneType: 'PSTN' | 'SIP' | 'Other';
  countryCode: string;
  businessHours: string;
  is24x7Support: boolean;
  supportedLanguages: string[];
  telephonyStatus: 'active' | 'forwarding_configured' | 'pending_verification';

  // AI & Operations
  isActive: boolean;
  tagline: string;
  plan: 'Starter' | 'Growth' | 'Enterprise';
  pricePerMinute: number;
  minutesUsed: number;
  totalCalls: number;
  aiResolutionRate: number; // percentage, e.g. 82
  createdAt: string;
};

export type CompanyBrainConfig = {
  companyId: string;
  aiAgentName: string;
  welcomeMessage: string;
  supportedLanguages: string[];
  tone: 'Empathetic & Professional' | 'Authoritative & Calm' | 'Friendly & Dynamic' | 'Concise & Technical';
  aiPermissions: {
    canQueryTransactions: boolean;
    canIssueDirectRefunds: boolean;
    canModifyCustomerData: boolean;
    canScheduleCallbacks: boolean;
    canEscalateToHuman: boolean;
  };
  allowedActions: string[];
  confirmationActions: string[]; // e.g. update address, change plan
  humanApprovalActions: string[]; // e.g. high-value refunds > 5000
};

export type ToolConfig = {
  id: string;
  companyId: string;
  name: string;
  description: string;
  endpoint: string;
  authType: 'Bearer Token' | 'API Key' | 'OAuth2' | 'None';
  enabled: boolean;
  permissionLevel: 'auto' | 'require_confirmation' | 'require_human_approval';
};

export type HumanAgent = {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  jobTitle: string;
  profilePhoto?: string;

  // Work details
  department: 'Payments & Refunds' | 'Technical Support' | 'Account Security' | 'General Customer Care';
  specialization: string;
  languagesSpoken: string[];
  yearsExperience: number;
  workingHours: string;
  timezone: string;

  // Operational & Account Status
  accountStatus: 'active' | 'invited' | 'suspended';
  status: 'online' | 'busy' | 'offline'; // Operational availability
  assignedCasesCount: number;
  maxCapacity: number;
  lastActiveTime: string;
  activeCaseId?: string;
  registeredAt: string;
};

export type CallRecord = {
  id: string;
  companyId: string;
  callerPhone: string;
  callerName?: string;
  supportPhone: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  cost: number;
  status: 'in_progress' | 'resolved_by_ai' | 'escalated_to_human' | 'completed';
  healthScore: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  language: string;
  transcripts: Array<{ role: 'user' | 'agent' | 'human_officer'; text: string; timestamp: number }>;
  caseDna?: CaseDNA;
  assignedAgentId?: string;
  notes?: string;
};

export type KnowledgeDoc = {
  id: string;
  companyId: string;
  title: string;
  category: string;
  content: string;
  updatedAt: string;
};

export type BillingInvoice = {
  id: string;
  companyId: string;
  invoiceNumber: string;
  billingPeriod: string;
  minutesUsed: number;
  ratePerMinute: number;
  totalAmount: number;
  status: 'paid' | 'pending' | 'processing';
  generatedAt: string;
};

export type DatabaseSchema = {
  admins: CompanyAdmin[];
  companies: Company[];
  brainConfigs: CompanyBrainConfig[];
  tools: ToolConfig[];
  agents: HumanAgent[];
  calls: CallRecord[];
  knowledge: KnowledgeDoc[];
  invoices: BillingInvoice[];
};
