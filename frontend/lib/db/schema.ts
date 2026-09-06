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
  supportPhone: string;
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
  aiResolutionRate: number;
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
  confirmationActions: string[];
  humanApprovalActions: string[];
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
  firstName?: string;
  lastName?: string;
  name: string;
  email: string;
  phone: string;
  mobile?: string;
  employeeId?: string;
  jobTitle?: string;
  role?: string;
  profilePhoto?: string;
  department: string;
  specialization?: string;
  languagesSpoken?: string[];
  yearsExperience?: number;
  workingHours?: string;
  timezone?: string;
  accountStatus?: 'active' | 'invited' | 'suspended' | 'removed';
  status: 'online' | 'available' | 'busy' | 'offline' | 'removed';
  removalReason?: string;
  assignedCasesCount?: number;
  maxCapacity?: number;
  lastActiveTime?: string;
  activeCaseId?: string;
  registeredAt?: string;
  createdAt?: string;
  updatedAt?: string;
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
  type?: 'faq' | 'policy' | 'sop' | 'product_info';
  aiGenerated?: boolean;
  source?: 'manual' | 'ai_generated';
  aiReasoning?: string;
  updatedAt: string;
  createdAt?: string;
};

export type KnowledgeGapRequest = {
  id: string;
  companyId: string;
  problemSummary: string;
  suggestedCategory: 'policy' | 'sop' | 'faq' | 'product_info' | string;
  recommendedAction: string;
  callerPhone?: string;
  createdAt: string;
  status: 'pending' | 'resolved' | string;
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
