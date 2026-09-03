import {
  mongoGetCompany,
  mongoGetCompanyBySupportPhone,
  mongoGetAllCompanies,
  mongoSaveCompany,
  mongoGetBrainConfig,
  mongoSaveBrainConfig,
  mongoGetKnowledgeDocs,
  mongoSaveKnowledgeDoc,
  mongoDeleteKnowledgeDoc,
  mongoGetToolsByCompany,
  mongoSaveTool,
  mongoGetAgentsByCompany,
  mongoGetCallsByCompany,
} from '../integrations/mongodb/models.js';
import type { CompanyRecord, BrainConfig, KnowledgeDoc, ToolConfig } from '../types/index.js';

export async function getCompany(id: string) {
  return await mongoGetCompany(id);
}

export async function getCompanyByPhone(phone: string) {
  return await mongoGetCompanyBySupportPhone(phone);
}

export async function getAllCompanies() {
  return await mongoGetAllCompanies();
}

export async function updateCompany(id: string, updates: Partial<CompanyRecord>) {
  const existing = await mongoGetCompany(id);
  if (!existing) throw new Error('Company not found');
  const updated = { ...existing, ...updates };
  return await mongoSaveCompany(updated);
}

export async function getBrain(companyId: string) {
  const config = await mongoGetBrainConfig(companyId);
  const docs = await mongoGetKnowledgeDocs(companyId);
  const tools = await mongoGetToolsByCompany(companyId);
  const officers = await mongoGetAgentsByCompany(companyId);

  return { config, docs, tools, officers };
}

export async function updateBrainConfig(companyId: string, updates: Partial<BrainConfig>) {
  const existing = await mongoGetBrainConfig(companyId);
  const updated: BrainConfig = {
    companyId,
    agentName: updates.agentName || existing?.agentName || 'CAVI Assistant',
    tone: updates.tone || existing?.tone || 'empathetic',
    primaryLanguage: updates.primaryLanguage || existing?.primaryLanguage || 'English',
    allowCodeSwitching: updates.allowCodeSwitching ?? existing?.allowCodeSwitching ?? true,
    allowedActions: updates.allowedActions || existing?.allowedActions || ['refund', 'lookup_status'],
    maxRefundAmount: updates.maxRefundAmount ?? existing?.maxRefundAmount ?? 500,
    requireHumanApproval: updates.requireHumanApproval ?? existing?.requireHumanApproval ?? true,
    escalationThreshold: updates.escalationThreshold ?? existing?.escalationThreshold ?? 0.65,
    customInstructions: updates.customInstructions ?? existing?.customInstructions ?? '',
  };
  return await mongoSaveBrainConfig(updated);
}

export async function addKnowledgeDoc(companyId: string, doc: Omit<KnowledgeDoc, 'id' | 'createdAt' | 'updatedAt'>) {
  const newDoc: KnowledgeDoc = {
    id: `doc_${Date.now()}`,
    companyId,
    title: doc.title,
    content: doc.content,
    type: doc.type || 'faq',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return await mongoSaveKnowledgeDoc(newDoc);
}

export async function deleteKnowledgeDoc(id: string) {
  return await mongoDeleteKnowledgeDoc(id);
}

export async function saveToolConfig(companyId: string, tool: Partial<ToolConfig>) {
  const newTool: ToolConfig = {
    id: tool.id || `tool_${Date.now()}`,
    companyId,
    name: tool.name || 'Custom Tool',
    description: tool.description || '',
    endpointUrl: tool.endpointUrl || '',
    method: tool.method || 'POST',
    authType: tool.authType || 'none',
    authKey: tool.authKey,
    paramSchema: tool.paramSchema || {},
    enabled: tool.enabled ?? true,
    requiresConfirmation: tool.requiresConfirmation ?? true,
  };
  return await mongoSaveTool(newTool);
}

export async function getCompanyOverview(companyId: string) {
  const company = await mongoGetCompany(companyId);
  const brain = await mongoGetBrainConfig(companyId);
  const docs = await mongoGetKnowledgeDocs(companyId);
  const officers = await mongoGetAgentsByCompany(companyId);
  const calls = await mongoGetCallsByCompany(companyId);

  const totalMinutes = calls.reduce((acc, c) => acc + Math.ceil(c.durationSeconds / 60), 0);
  const escalatedCalls = calls.filter((c) => c.status === 'escalated').length;

  return {
    company,
    brain,
    stats: {
      totalCalls: calls.length,
      totalMinutes,
      escalatedCalls,
      resolutionRate: calls.length ? Math.round(((calls.length - escalatedCalls) / calls.length) * 100) : 100,
      activeOfficersCount: officers.filter((o) => o.status === 'available').length,
      knowledgeDocsCount: docs.length,
    },
    recentCalls: calls.slice(0, 10),
    officers,
  };
}
