export type LanguageState = {
  primary: string | null;
  detected: string[];
  confidence: number;
  codeSwitching: boolean;
};

export type ExtractedFact = {
  value: string;
  confidence: number;
  source: 'user' | 'system' | 'action';
  confirmed: boolean;
  timestamp?: number;
};

export type FactConflict = {
  field: string;
  oldValue: string;
  newValue: string;
  detectedAt: string;
  resolved: boolean;
  resolvedValue?: string;
};

export type EmotionState = {
  sentiment: 'positive' | 'neutral' | 'negative';
  frustration: number; // 0.0 to 1.0
  urgency: number; // 0.0 to 1.0
  confidence: number;
  repetitionCount: number;
  silenceCount: number;
};

export type HealthScore = {
  score: number; // 0 to 100
  understanding: number; // 0 to 1
  completeness: number; // 0 to 1
  confidence: number; // 0 to 1
  resolutionProgress: number; // 0 to 1
  frustration: number; // 0 to 1
  escalationRisk: 'Low' | 'Medium' | 'High' | 'Critical';
  resolutionLikelihood: 'Low' | 'Medium' | 'High';
};

export type Decision =
  | { type: 'answer'; text?: string }
  | { type: 'ask'; question: string; field?: string }
  | { type: 'confirm'; field: string; value: string; prompt: string }
  | { type: 'action'; action: string; payload: Record<string, unknown> }
  | { type: 'escalate'; reason: string; priority: 'low' | 'medium' | 'high' | 'critical'; targetSpecialist?: string };

export type ConversationState = {
  sessionId: string;
  status: 'idle' | 'listening' | 'speaking' | 'thinking' | 'confirming' | 'executing_action' | 'preparing_handoff' | 'handed_off' | 'resolved';
  channelName?: string;
  startedAt: number;

  language: LanguageState;

  intent: {
    value: string | null;
    confidence: number;
    category?: 'payment' | 'refund' | 'account' | 'technical' | 'general' | 'unsupported';
  };

  customer: {
    name?: string;
    customerId?: string;
    phone?: string;
  };

  issue: {
    category?: string;
    description?: string;
    status?: 'unclear' | 'identifying' | 'collecting_info' | 'resolving' | 'escalated' | 'resolved';
  };

  facts: Record<string, ExtractedFact>;
  conflicts: FactConflict[];
  emotion: EmotionState;
  conversationHealth: HealthScore;

  resolution: {
    status: 'unknown' | 'in_progress' | 'likely_resolved' | 'resolved' | 'escalating';
    nextBestQuestion?: string;
    suggestedAction?: string;
  };

  escalation: {
    required: boolean;
    reason?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    targetSpecialist?: string;
    preparedAt?: string;
    handedOffAt?: string;
  };

  actionsAttempted: Array<{
    action: string;
    status: 'attempted' | 'success' | 'failed';
    timestamp: number;
    result?: unknown;
  }>;
};

export type CaseDNA = {
  caseId: string;
  sessionId?: string;
  id?: string;
  companyId?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: 'pending' | 'assigned' | 'in_progress' | 'resolved' | string;

  intent?: string;
  customerGoal?: string;
  goal?: string;

  language?: {
    primary?: string;
    languagesUsed?: string[];
    codeSwitching?: boolean;
  };
  primaryLanguage?: string;
  detectedLanguages?: string[];

  facts?: Array<{
    key: string;
    value: string;
    confidence?: number;
    confirmed?: boolean;
  }>;
  confirmedFacts?: Record<string, any>;
  uncertainFacts?: Record<string, any>;

  conflicts?: Array<{
    field: string;
    oldValue: string;
    newValue: string;
    resolved?: boolean;
    resolution?: string;
  }>;

  actions?: Array<{
    action: string;
    status?: 'attempted' | 'success' | 'failed' | string;
    result?: string;
  }>;
  actionsTaken?: any[];

  sentiment?: string;
  sentimentScore?: number;
  frustration?: number;
  frustrationScore?: number;
  frustrationSignals?: string[];
  healthScore?: number;
  riskScore?: number;
  confidence?: number;
  riskReasons?: string[];

  escalation?: {
    required?: boolean;
    reason?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical' | 'urgent' | string;
    targetSpecialist?: string;
  };
  priority?: string;
  escalationReason?: string | null;
  suggestedDepartment?: string | null;
  suggestedOfficerId?: string | null;
  assignedOfficerId?: string | null;
  assignedOfficerName?: string | null;
  assignmentStatus?: 'assigned' | 'unassigned_no_available_officer' | string;
  adminActionRequired?: boolean;
  adminNotification?: string;

  summary?: string;
  nextBestAction?: string;
  customerPhone?: string;
  callerPhone?: string;
  customerName?: string;
  transcripts?: Array<{ role?: string; speaker?: string; text: string; timestamp?: number }> | any[];
  transcriptSnippet?: Array<{ role?: string; speaker?: string; text: string; timestamp?: number }>;
};
