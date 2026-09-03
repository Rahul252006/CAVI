import { getDb } from '@/lib/db';
import { CompanyConfig, KnowledgeItem, ToolPermission } from './types';

function buildCompanyConfig(companyId?: string): CompanyConfig {
  const db = getDb();
  const company = companyId
    ? db.companies.find((item) => item.id === companyId || item.slug === companyId)
    : db.companies[0];
  const brain = company
    ? db.brainConfigs.find((item) => item.companyId === company.id)
    : undefined;

  if (!company) {
    return {
      company: {
        name: '',
        industry: '',
        tagline: '',
        supportEmail: '',
        supportPhone: '',
      },
      languages: [],
      knowledge: [],
      connectedSystems: [],
      permissions: {},
      escalationRules: [],
    };
  }

  const permissions = db.tools
    .filter((tool) => tool.companyId === company.id)
    .reduce<Record<string, ToolPermission>>((acc, tool) => {
      acc[tool.name] = {
        name: tool.name,
        aiAllowed: tool.enabled && tool.permissionLevel === 'auto',
        requiresConfirmation: tool.permissionLevel === 'require_confirmation',
        humanApprovalRequired: tool.permissionLevel === 'require_human_approval',
      };
      return acc;
    }, {});

  return {
    company: {
      name: company.name,
      industry: company.industry,
      tagline: company.tagline,
      supportEmail: company.primaryContactEmail,
      supportPhone: company.supportPhone,
    },
    languages: company.supportedLanguages.map((name) => ({
      code: name.toLowerCase().slice(0, 2),
      name,
      enabled: true,
    })),
    knowledge: db.knowledge
      .filter((item) => item.companyId === company.id)
      .map<KnowledgeItem>((item) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        content: item.content,
      })),
    connectedSystems: db.tools
      .filter((tool) => tool.companyId === company.id)
      .map((tool) => ({
        name: tool.name,
        type: tool.authType,
        status: tool.enabled ? 'connected' : 'offline',
        latencyMs: 0,
      })),
    permissions,
    escalationRules: (brain?.humanApprovalActions || []).map((action) => ({
      rule: action,
      description: `${action} requires human approval before execution.`,
      priority: 'high',
    })),
  };
}

export function getCompanyConfig(companyId?: string): CompanyConfig {
  return buildCompanyConfig(companyId);
}

export function updateCompanyConfig(_updates?: unknown): CompanyConfig {
  return buildCompanyConfig();
}

export function searchKnowledge(query: string, companyId?: string): KnowledgeItem[] {
  const companyConfig = buildCompanyConfig(companyId);
  if (!query || query.trim().length === 0) return companyConfig.knowledge;
  const lower = query.toLowerCase();

  return companyConfig.knowledge.filter(
    k =>
      k.title.toLowerCase().includes(lower) ||
      k.category.toLowerCase().includes(lower) ||
      k.content.toLowerCase().includes(lower)
  );
}

export function checkPermission(actionName: string, companyId?: string): {
  allowed: boolean;
  permission?: ToolPermission;
  reason?: string;
} {
  const companyConfig = buildCompanyConfig(companyId);
  const perm = companyConfig.permissions[actionName];
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
