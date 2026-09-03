import { CompanyConfig, KnowledgeItem, ToolPermission } from './types';

const defaultFallbackConfig: CompanyConfig = {
  company: {
    name: 'CAVI Enterprise',
    industry: 'Technology & AI',
    tagline: 'Customer Assistance through Voice Intelligence',
    supportEmail: 'support@cavi.ai',
    supportPhone: '+919876543210',
  },
  languages: [
    { code: 'en', name: 'English', enabled: true },
    { code: 'hi', name: 'Hindi', enabled: true },
    { code: 'ta', name: 'Tamil', enabled: true },
  ],
  knowledge: [
    {
      id: 'doc_1',
      title: 'Refund Policy',
      category: 'Policy',
      content: 'Standard refunds processed within 3-5 business days for items returned within 30 days.',
    },
    {
      id: 'doc_2',
      title: 'Operating Hours',
      category: 'General',
      content: 'AI voice assistance is available 24/7 with human officers on duty 9 AM to 9 PM IST.',
    },
  ],
  connectedSystems: [
    { name: 'RefundAPI', type: 'REST', status: 'connected', latencyMs: 45 },
    { name: 'OrderLookup', type: 'REST', status: 'connected', latencyMs: 32 },
  ],
  permissions: {
    refund: {
      name: 'refund',
      aiAllowed: true,
      requiresConfirmation: true,
      humanApprovalRequired: false,
    },
    lookup_status: {
      name: 'lookup_status',
      aiAllowed: true,
      requiresConfirmation: false,
      humanApprovalRequired: false,
    },
  },
  escalationRules: [
    {
      rule: 'High value dispute',
      description: 'Refunds exceeding $500 require human officer approval.',
      priority: 'high',
    },
  ],
};

export function getCompanyConfig(_companyId?: string): CompanyConfig {
  return defaultFallbackConfig;
}

export function updateCompanyConfig(_updates?: unknown): CompanyConfig {
  return defaultFallbackConfig;
}

export function searchKnowledge(query: string, _companyId?: string): KnowledgeItem[] {
  if (!query || query.trim().length === 0) return defaultFallbackConfig.knowledge;
  const lower = query.toLowerCase();

  return defaultFallbackConfig.knowledge.filter(
    (k) =>
      k.title.toLowerCase().includes(lower) ||
      k.category.toLowerCase().includes(lower) ||
      k.content.toLowerCase().includes(lower)
  );
}

export function checkPermission(actionName: string, _companyId?: string): {
  allowed: boolean;
  permission?: ToolPermission;
  reason?: string;
} {
  const perm = defaultFallbackConfig.permissions[actionName];
  if (!perm) {
    return {
      allowed: false,
      reason: `Action '${actionName}' is not registered in Company Brain.`,
    };
  }

  if (!perm.aiAllowed || perm.humanApprovalRequired) {
    return {
      allowed: false,
      permission: perm,
      reason: `Policy Restriction: Action '${perm.name}' requires Human Specialist approval.`,
    };
  }

  return { allowed: true, permission: perm };
}
