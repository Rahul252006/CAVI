import { mongoGetCases, mongoGetCase, mongoSaveCase } from '../integrations/mongodb/models.js';
import type { CaseDNA } from '../types/index.js';

export async function getCases(companyId?: string) {
  return await mongoGetCases(companyId);
}

export async function getCase(id: string) {
  return await mongoGetCase(id);
}

export async function createCaseDNA(data: Partial<CaseDNA>) {
  const caseId = data.caseId || `case_${Date.now()}`;
  const caseDNA: CaseDNA = {
    id: data.id || `dna_${Date.now()}`,
    caseId,
    companyId: data.companyId || 'company_default',
    customerPhone: data.customerPhone || '+919876543210',
    customerName: data.customerName || 'Caller',
    goal: data.goal || 'General Support Inquiry',
    intent: data.intent || 'support_inquiry',
    primaryLanguage: data.primaryLanguage || 'English',
    detectedLanguages: data.detectedLanguages || ['English'],
    confirmedFacts: data.confirmedFacts || {},
    uncertainFacts: data.uncertainFacts || {},
    conflicts: data.conflicts || [],
    actionsTaken: data.actionsTaken || [],
    sentimentScore: data.sentimentScore ?? 75,
    sentimentTrajectory: data.sentimentTrajectory || [],
    frustrationSignals: data.frustrationSignals || [],
    healthScore: data.healthScore ?? 85,
    priority: data.priority || 'medium',
    escalationReason: data.escalationReason,
    summary: data.summary || 'Customer called for assistance.',
    nextBestAction: data.nextBestAction || 'Resolve query and verify customer satisfaction.',
    suggestedDepartment: data.suggestedDepartment,
    suggestedOfficerId: data.suggestedOfficerId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return await mongoSaveCase(caseDNA);
}
