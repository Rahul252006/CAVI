export type CompanyProfile = {
  name: string;
  industry: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
};

export type KnowledgeItem = {
  id: string;
  title: string;
  category: string;
  content: string;
};

export type ConnectedSystem = {
  name: string;
  type: string;
  status: 'connected' | 'degraded' | 'offline';
  latencyMs: number;
};

export type ToolPermission = {
  name: string;
  aiAllowed: boolean;
  requiresConfirmation?: boolean;
  humanApprovalRequired?: boolean;
};

export type EscalationRule = {
  rule: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
};

export type CompanyConfig = {
  company: CompanyProfile;
  languages: Array<{ code: string; name: string; enabled: boolean }>;
  knowledge: KnowledgeItem[];
  connectedSystems: ConnectedSystem[];
  permissions: Record<string, ToolPermission>;
  escalationRules: EscalationRule[];
};
