export interface CompanyRecord {
  id: string;
  name: string;
  industry: string;
  supportPhone: string;
  adminEmail: string;
  adminName: string;
  createdAt: string;
  status: 'active' | 'suspended' | 'trial';
  plan: 'starter' | 'growth' | 'enterprise';
}

export interface CompanyAdmin {
  id: string;
  companyId: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'owner' | 'manager';
  createdAt: string;
}

export interface BrainConfig {
  companyId: string;
  agentName: string;
  tone: 'empathetic' | 'professional' | 'urgent' | 'direct';
  primaryLanguage: string;
  allowCodeSwitching: boolean;
  allowedActions: string[];
  maxRefundAmount: number;
  requireHumanApproval: boolean;
  escalationThreshold: number;
  customInstructions: string;
}

export interface KnowledgeDoc {
  id: string;
  companyId: string;
  title: string;
  content: string;
  type: 'faq' | 'policy' | 'sop' | 'product_info';
  createdAt: string;
  updatedAt: string;
}

export interface HumanAgent {
  id: string;
  companyId: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'support_officer' | 'team_lead' | 'specialist';
  department: string;
  specialization: string[];
  languages: string[];
  status: 'available' | 'busy' | 'offline';
  currentCallId?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface CallRecord {
  id: string;
  companyId: string;
  callerNumber: string;
  callerName?: string;
  direction: 'inbound' | 'outbound';
  status: 'active' | 'completed' | 'escalated' | 'transferred';
  durationSeconds: number;
  agentId?: string;
  assignedOfficerId?: string;
  agoraChannel: string;
  caseId?: string;
  transcript: TranscriptItem[];
  intent?: string;
  language?: string;
  sentiment?: 'positive' | 'neutral' | 'frustrated' | 'angry';
  healthScore?: number;
  caseDNA?: CaseDNA;
  recordingUrl?: string;
  startedAt: string;
  endedAt?: string;
}

export interface TranscriptItem {
  id: string;
  speaker: 'customer' | 'agent' | 'human_officer' | 'system';
  text: string;
  timestamp: string;
  language?: string;
  confidence?: number;
}

export interface CaseDNA {
  id: string;
  caseId: string;
  companyId: string;
  customerPhone: string;
  customerName?: string;
  goal: string;
  intent: string;
  primaryLanguage: string;
  detectedLanguages: string[];
  confirmedFacts: Record<string, string>;
  uncertainFacts: Record<string, string>;
  conflicts: ConflictRecord[];
  actionsTaken: ActionAuditRecord[];
  sentimentScore: number;
  sentimentTrajectory: Array<{ score: number; timestamp: string }>;
  frustrationSignals: string[];
  healthScore: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  escalationReason?: string;
  summary: string;
  nextBestAction: string;
  suggestedDepartment?: string;
  suggestedOfficerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConflictRecord {
  field: string;
  firstValue: string;
  conflictingValue: string;
  detectedAt: string;
  resolved: boolean;
  resolvedValue?: string;
}

export interface ActionAuditRecord {
  id: string;
  actionName: string;
  params: Record<string, unknown>;
  status: 'initiated' | 'success' | 'rejected' | 'failed';
  resultSummary: string;
  timestamp: string;
  executedBy: 'ai_agent' | 'human_officer';
}

export interface ToolConfig {
  id: string;
  companyId: string;
  name: string;
  description: string;
  endpointUrl: string;
  method: 'GET' | 'POST' | 'PUT';
  authType: 'bearer' | 'api_key' | 'none';
  authKey?: string;
  paramSchema: Record<string, string>;
  enabled: boolean;
  requiresConfirmation: boolean;
}
