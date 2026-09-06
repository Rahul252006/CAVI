export interface CompanyRecord {
  id: string;
  name: string;
  legalName?: string;
  industry: string;
  website?: string;
  description?: string;
  tagline?: string;
  country?: string;
  city?: string;
  timezone?: string;
  supportPhone: string;
  adminMobile?: string;
  phoneType?: string;
  businessHours?: string;
  adminEmail: string;
  adminName: string;
  createdAt: string;
  status: 'active' | 'suspended' | 'trial' | 'pending_onboarding';
  plan: 'starter' | 'growth' | 'enterprise';
  isActive?: boolean;
  pricePerMinute?: number;
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
  tone: string;
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
  category?: string;
  aiGenerated?: boolean;
  source?: 'manual' | 'ai_generated';
  aiReasoning?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeGapRequest {
  id: string;
  companyId: string;
  problemSummary: string;
  suggestedCategory: 'policy' | 'sop' | 'faq' | 'product_info';
  recommendedAction: string;
  callerPhone?: string;
  createdAt: string;
  status: 'pending' | 'resolved';
}

export interface HumanAgent {
  id: string;
  companyId: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  mobile?: string;
  jobTitle?: string;
  passwordHash?: string;
  role: 'support_officer' | 'team_lead' | 'specialist';
  department: string;
  specialization?: string[];
  languages?: string[];
  status: 'available' | 'online' | 'busy' | 'offline' | 'removed';
  removalReason?: string;
  currentCallId?: string;
  activeCallId?: string | null;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
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
  riskScore?: number;
  confidence?: number;
  riskReasons?: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  escalationReason?: string;
  summary: string;
  nextBestAction: string;
  assignmentStatus?: 'assigned' | 'unassigned_no_available_officer';
  adminActionRequired?: boolean;
  adminNotification?: string;
  suggestedDepartment?: string;
  suggestedOfficerId?: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  transcripts?: any[];
  transcriptSnippet?: any[];
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
