import { CompanyConfig, KnowledgeItem, ToolPermission } from './types';

const emptyCompanyConfig: CompanyConfig = {
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

export function getCompanyConfig(_companyId?: string): CompanyConfig {
  return emptyCompanyConfig;
}

export function updateCompanyConfig(_updates?: unknown): CompanyConfig {
  return emptyCompanyConfig;
}

export function searchKnowledge(query: string, _companyId?: string): KnowledgeItem[] {
  if (!query || query.trim().length === 0) return emptyCompanyConfig.knowledge;
  const lower = query.toLowerCase();

  return emptyCompanyConfig.knowledge.filter(
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
  return {
    allowed: false,
    reason: `Action '${actionName}' is not registered in the connected Company Brain.`,
  };
}
