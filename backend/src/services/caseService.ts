import {
  mongoGetCases,
  mongoGetCase,
  mongoSaveCase,
  mongoGetAgentsByCompany,
  mongoSaveCall,
  mongoGetCall,
  mongoGetCallsByCompany,
} from '../integrations/mongodb/models.js';
import type { CaseDNA } from '../types/index.js';
import { assessCaseRisk, findAvailableOfficerForSector } from './routingService.js';

export function normalizeCase(c: any): any {
  if (!c) return c;

  // Facts normalization
  let factsArray: Array<{ key: string; value: string; confidence?: number; confirmed?: boolean }> = [];
  let confirmedFactsObj: Record<string, any> = {};

  if (Array.isArray(c.facts) && c.facts.length > 0) {
    factsArray = c.facts;
    c.facts.forEach((f: any) => {
      if (f?.key && f?.value !== undefined) confirmedFactsObj[f.key] = String(f.value);
    });
  } else if (c.confirmedFacts && typeof c.confirmedFacts === 'object') {
    confirmedFactsObj = { ...c.confirmedFacts };
    factsArray = Object.entries(c.confirmedFacts).map(([k, v]) => ({
      key: k,
      value: typeof v === 'object' && (v as any)?.value !== undefined ? String((v as any).value) : String(v),
      confidence: 1.0,
      confirmed: true,
    }));
  }

  // Languages normalization
  const primaryLanguage = c.language?.primary || c.primaryLanguage || 'undetermined';
  let languagesUsed: string[] = [];
  if (Array.isArray(c.language?.languagesUsed) && c.language.languagesUsed.length > 0) {
    languagesUsed = c.language.languagesUsed;
  } else if (Array.isArray(c.detectedLanguages) && c.detectedLanguages.length > 0) {
    languagesUsed = c.detectedLanguages;
  } else if (primaryLanguage) {
    languagesUsed = [primaryLanguage];
  }

  // Escalation normalization
  const risk = assessCaseRisk(c);
  const priority = c.escalation?.priority || c.priority || risk.priority;
  const reason = c.escalation?.reason || c.escalationReason || risk.reasons.join('; ');
  const targetSpecialist =
    c.escalation?.targetSpecialist || c.suggestedDepartment || risk.department;

  const frustration =
    typeof c.frustration === 'number'
      ? c.frustration
      : typeof c.frustrationScore === 'number'
      ? c.frustrationScore / 100
      : Array.isArray(c.frustrationSignals) && c.frustrationSignals.length > 0
      ? 0.7
      : 0.2;

  const conflicts = Array.isArray(c.conflicts) ? c.conflicts : [];
  const actions = Array.isArray(c.actions) ? c.actions : (Array.isArray(c.actionsTaken) ? c.actionsTaken : []);

  const assignedOfficerId = c.assignedOfficerId || c.suggestedOfficerId || null;
  const assignedOfficerName = c.assignedOfficerName || null;
  const assignmentStatus = assignedOfficerId ? 'assigned' : (c.assignmentStatus || 'unassigned_no_available_officer');

  return {
    ...c,
    caseId: c.caseId || c.id || `CASE-${Date.now().toString().slice(-6)}`,
    sessionId: c.sessionId || c.id || '',
    status: c.status || 'pending',
    suggestedOfficerId: assignedOfficerId,
    assignedOfficerId: assignedOfficerId,
    assignedOfficerName: assignedOfficerName,
    intent: typeof c.intent === 'string' ? c.intent : (c.intent?.value || 'Support Inquiry'),
    customerGoal: c.customerGoal || c.goal || 'Customer Support Request',
    goal: c.goal || c.customerGoal || 'Customer Support Request',
    healthScore: typeof c.healthScore === 'number' ? c.healthScore : Math.max(0, 100 - risk.score),
    summary: c.summary || `Customer reported issue under case ${c.caseId || c.id}.`,
    frustration,
    frustrationScore: typeof c.frustrationScore === 'number' ? c.frustrationScore : Math.round(frustration * 100),
    sentiment: c.sentiment || (c.sentimentScore && c.sentimentScore < 50 ? 'negative' : 'neutral'),
    sentimentScore: typeof c.sentimentScore === 'number' ? c.sentimentScore : Math.max(10, 100 - risk.score),
    primaryLanguage,
    detectedLanguages: languagesUsed,
    language: {
      primary: primaryLanguage,
      languagesUsed,
      codeSwitching: Boolean(c.language?.codeSwitching || languagesUsed.length > 1),
    },
    facts: factsArray,
    confirmedFacts: confirmedFactsObj,
    conflicts,
    actions,
    actionsTaken: actions,
    escalation: {
      required: true,
      reason,
      priority,
      targetSpecialist,
    },
    priority,
    riskScore: risk.score,
    confidence: risk.confidence,
    riskReasons: risk.reasons,
    assignmentStatus,
    adminActionRequired: c.adminActionRequired ?? assignmentStatus !== 'assigned',
    adminNotification: c.adminNotification || (assignmentStatus !== 'assigned'
      ? `No available ${targetSpecialist} officer matched this case. Keep the customer context in the call log and assign a qualified officer.`
      : undefined),
    escalationReason: reason,
    suggestedDepartment: targetSpecialist,
    nextBestAction: c.nextBestAction || 'Review details and connect with customer.',
    customerPhone: c.customerPhone || c.callerPhone || '',
    customerName: c.customerName,
    transcripts: Array.isArray(c.transcripts) ? c.transcripts : (Array.isArray(c.transcriptSnippet) ? c.transcriptSnippet : []),
    transcriptSnippet: Array.isArray(c.transcriptSnippet) ? c.transcriptSnippet : (Array.isArray(c.transcripts) ? c.transcripts : []),
    createdAt: c.createdAt || new Date().toISOString(),
    updatedAt: c.updatedAt || new Date().toISOString(),
  };
}

export async function getCases(companyId?: string) {
  const allCases = await mongoGetCases(companyId);
  // Only return cases that are genuinely escalated for human specialist resolution
  const cases = (allCases || []).filter((c: any) => {
    if (!c) return false;
    return c.escalation?.required === true || c.status === 'escalated' || c.status === 'assigned' || c.status === 'pending';
  });

  const availableOfficers = companyId ? await mongoGetAgentsByCompany(companyId) : [];

  for (const c of cases) {
    if ((!c.suggestedOfficerId || c.suggestedOfficerId === 'unassigned' || !c.assignedOfficerId) && availableOfficers.length > 0) {
      const risk = assessCaseRisk(c);
      const languages = c.detectedLanguages || (c as any).language?.languagesUsed || [];
      const matched = findAvailableOfficerForSector(availableOfficers, risk.sector, languages);
      if (matched) {
        c.suggestedOfficerId = matched.id;
        (c as any).assignedOfficerId = matched.id;
        (c as any).assignedOfficerName = matched.name;
        (c as any).assignmentStatus = 'assigned';
        (c as any).adminActionRequired = false;
        (c as any).suggestedDepartment = risk.department;
        if (c.id) {
          await mongoSaveCase(c);
        }
      }
    }
  }

  return cases.map(normalizeCase);
}

export async function getCase(id: string) {
  const caseItem = await mongoGetCase(id);
  return caseItem ? normalizeCase(caseItem) : null;
}

export async function updateCase(id: string, updates: any) {
  const existing = await mongoGetCase(id);
  if (!existing) return null;

  const merged = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await mongoSaveCase(merged);
  return normalizeCase(merged);
}

export async function createCaseDNA(data: any) {
  const caseId = data.caseId || `CASE-${Date.now().toString().slice(-6)}`;
  const companyId = data.companyId;

  if (!companyId) {
    throw new Error('companyId is required to create a case');
  }

  // Normalize facts format
  const confirmedFacts: Record<string, any> = data.confirmedFacts || {};
  if (data.facts && Array.isArray(data.facts)) {
    data.facts.forEach((f: any) => {
      if (f.key && f.value) confirmedFacts[f.key] = f.value;
    });
  } else if (data.facts && typeof data.facts === 'object') {
    Object.entries(data.facts).forEach(([k, v]: [string, any]) => {
      if (v && v.value) confirmedFacts[k] = v.value;
      else if (v) confirmedFacts[k] = v;
    });
  }

  const intentText = typeof data.intent === 'string' ? data.intent : (data.intent?.value || 'Support Inquiry');
  const risk = assessCaseRisk({ ...data, intent: intentText });
  const targetDepartment = data.escalation?.targetSpecialist || data.suggestedDepartment || risk.department;
  const availableOfficers = await mongoGetAgentsByCompany(companyId);
  const languageHints = data.language?.languagesUsed || data.detectedLanguages || [];

  let assignedOfficerId = data.suggestedOfficerId || data.assignedOfficerId || null;
  let assignedOfficerName = data.assignedOfficerName || null;

  if (!assignedOfficerId) {
    const matched = findAvailableOfficerForSector(availableOfficers, risk.sector, languageHints);
    if (matched) {
      assignedOfficerId = matched.id;
      assignedOfficerName = matched.name;
    }
  }
  const assignmentStatus = assignedOfficerId ? 'assigned' : 'unassigned_no_available_officer';
  const adminNotification = assignmentStatus === 'assigned'
    ? undefined
    : (availableOfficers.length === 0
      ? `No online officer is currently registered in your company. Add or activate a support officer in the Team tab.`
      : `All registered officers are currently busy. Escalated case is queued for the next available ${targetDepartment} specialist.`);

  // Find existing call to prevent duplicate call records
  const cid = String(data.callId || (data.sessionId && !data.sessionId.startsWith('sess-') ? data.sessionId : ''));
  let targetCall = cid ? await mongoGetCall(cid) : null;
  if (!targetCall && data.channel) {
    const allCalls = await mongoGetCallsByCompany(companyId);
    targetCall = allCalls.find((c: any) => c.agoraChannel === data.channel) || null;
  }
  if (!targetCall && data.sessionId) {
    const allCalls = await mongoGetCallsByCompany(companyId);
    targetCall = allCalls.find((c: any) => c.agoraChannel === data.sessionId || c.id === data.sessionId) || null;
  }

  const resolvedCustomerPhone = data.customerPhone || data.callerPhone || targetCall?.callerNumber || '';

  const caseDNA: any = {
    id: data.id || `dna_${Date.now()}`,
    caseId,
    companyId,
    customerPhone: resolvedCustomerPhone,
    callerPhone: resolvedCustomerPhone,
    customerName: data.customerName || targetCall?.callerName,
    goal: data.customerGoal || data.goal || 'Customer Support Request',
    intent: intentText,
    primaryLanguage: data.language?.primary || data.primaryLanguage || 'undetermined',
    detectedLanguages: data.language?.languagesUsed || data.detectedLanguages || [],
    confirmedFacts,
    facts: data.facts || [],
    conflicts: data.conflicts || [],
    actions: data.actions || data.actionsTaken || [],
    actionsTaken: data.actionsTaken || data.actions || [],
    sentimentScore: data.sentimentScore ?? (data.sentiment === 'negative' ? 30 : Math.max(10, 100 - risk.score)),
    frustrationScore: data.frustrationScore ?? (typeof data.frustration === 'number' ? Math.round(data.frustration * 100) : 0),
    healthScore: data.healthScore ?? Math.max(0, 100 - risk.score),
    riskScore: risk.score,
    confidence: risk.confidence,
    riskReasons: risk.reasons,
    assignmentStatus,
    adminActionRequired: assignmentStatus !== 'assigned',
    adminNotification,
    priority: data.escalation?.priority || data.priority || risk.priority,
    escalationReason: data.escalation?.reason || data.escalationReason || 'Human Specialist Support Escalation',
    suggestedOfficerId: assignedOfficerId,
    assignedOfficerId: assignedOfficerId,
    assignedOfficerName: assignedOfficerName,
    suggestedDepartment: targetDepartment,
    escalation: data.escalation || {
      required: true,
      reason: data.escalationReason || 'Human Specialist Support Escalation',
      priority: risk.priority,
      targetSpecialist: targetDepartment,
    },
    transcripts: data.transcripts || data.transcriptSnippet || [],
    transcriptSnippet: data.transcriptSnippet || data.transcripts || [],
    summary: data.summary || `Customer reported ${intentText}. Risk score ${risk.score}/100 because ${risk.reasons.join(', ')}.`,
    nextBestAction: data.nextBestAction || (assignedOfficerName
      ? `Connect with ${assignedOfficerName} in ${targetDepartment}.`
      : `Assign or activate a qualified officer before customer handoff.`),
    status: data.status || (assignedOfficerId ? 'assigned' : 'pending'),
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const saved = await mongoSaveCase(caseDNA);

  // Sync corresponding call record for company admin call logs (Update existing or create exactly one)
  const transcriptItems = data.transcripts || data.transcriptSnippet || targetCall?.transcript || [];
  if (targetCall) {
    targetCall.caseId = caseId;
    targetCall.caseDNA = saved;
    targetCall.status = 'escalated';
    if (assignedOfficerId) targetCall.assignedOfficerId = assignedOfficerId;
    if (resolvedCustomerPhone) targetCall.callerNumber = resolvedCustomerPhone;
    if (transcriptItems.length > 0) targetCall.transcript = transcriptItems;
    await mongoSaveCall(targetCall);
  } else if (data.callId) {
    await mongoSaveCall({
      id: data.callId,
      companyId,
      callerNumber: resolvedCustomerPhone,
      callerName: data.customerName,
      direction: 'inbound',
      status: 'escalated',
      durationSeconds: data.durationSeconds || 0,
      agentId: assignedOfficerId || undefined,
      assignedOfficerId: assignedOfficerId || undefined,
      agoraChannel: data.channel || data.sessionId || `ch_${caseId}`,
      caseId: caseId,
      transcript: transcriptItems,
      intent: intentText,
      language: data.language?.primary || data.primaryLanguage || 'undetermined',
      sentiment: data.sentiment || 'neutral',
      healthScore: data.healthScore ?? Math.max(0, 100 - risk.score),
      caseDNA: saved,
      startedAt: data.createdAt || new Date().toISOString(),
      endedAt: new Date().toISOString(),
    } as any);
  }

  return normalizeCase(saved);
}
