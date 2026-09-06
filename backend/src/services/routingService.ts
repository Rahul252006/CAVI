import type { CaseDNA, HumanAgent } from '../types/index.js';

export type SupportSector =
  | 'payments'
  | 'refunds'
  | 'account_security'
  | 'technical'
  | 'general'
  | 'safety_boundary';

export type RiskAssessment = {
  score: number;
  priority: CaseDNA['priority'];
  confidence: number;
  reasons: string[];
  sector: SupportSector;
  department: string;
};

const SECTOR_DEPARTMENTS: Record<SupportSector, string> = {
  payments: 'Payments & Transactions',
  refunds: 'Refund Operations',
  account_security: 'Account Security',
  technical: 'Technical Support',
  general: 'General Customer Care',
  safety_boundary: 'Human Supervisor',
};

const SAFETY_TERMS = [
  'medical',
  'doctor',
  'diagnosis',
  'emergency',
  'ambulance',
  'police',
  'suicide',
  'self harm',
  'bleeding',
  'chest pain',
  'legal advice',
  'financial advice',
];

const SECTOR_TERMS: Record<SupportSector, string[]> = {
  payments: ['payment', 'paid', 'debit', 'debited', 'upi', 'transaction', 'txn', 'money deducted', 'kat gaya'],
  refunds: ['refund', 'reversal', 'return money', 'chargeback', 'wapas'],
  account_security: ['account', 'login', 'password', 'otp', 'kyc', 'blocked', 'frozen', 'security'],
  technical: ['bug', 'error', 'crash', 'app', 'website', 'technical', 'server', 'timeout'],
  general: [],
  safety_boundary: SAFETY_TERMS,
};

function textFromCase(data: any): string {
  const transcriptText = (data.transcripts || data.transcriptSnippet || [])
    .map((item: any) => item?.text || '')
    .join(' ');
  const factsText = [
    data.intent,
    data.goal,
    data.customerGoal,
    data.summary,
    data.escalationReason,
    data.escalation?.reason,
    ...(Array.isArray(data.facts) ? data.facts.map((f: any) => `${f.key || ''} ${f.value || ''}`) : []),
    ...Object.entries(data.confirmedFacts || {}).map(([key, value]) => `${key} ${String(value)}`),
    ...Object.entries(data.uncertainFacts || {}).map(([key, value]) => `${key} ${String(value)}`),
  ].join(' ');

  return `${factsText} ${transcriptText}`.toLowerCase();
}

export function classifySupportSector(data: any): SupportSector {
  const text = textFromCase(data);

  if (SAFETY_TERMS.some((term) => text.includes(term))) {
    return 'safety_boundary';
  }

  const scored = (Object.keys(SECTOR_TERMS) as SupportSector[])
    .filter((sector) => sector !== 'general' && sector !== 'safety_boundary')
    .map((sector) => ({
      sector,
      hits: SECTOR_TERMS[sector].filter((term) => text.includes(term)).length,
    }))
    .sort((a, b) => b.hits - a.hits);

  return scored[0]?.hits > 0 ? scored[0].sector : 'general';
}

export function assessCaseRisk(data: any): RiskAssessment {
  const sector = classifySupportSector(data);
  const text = textFromCase(data);
  const reasons: string[] = [];

  let score = 15;
  let confidence = typeof data.confidence === 'number' ? data.confidence : 0.78;

  const explicitHuman = ['human', 'officer', 'agent', 'representative', 'supervisor', 'connect me'].some((term) =>
    text.includes(term)
  );
  if (explicitHuman) {
    score += 25;
    reasons.push('caller requested human support');
  }

  if (sector === 'safety_boundary') {
    score += 60;
    confidence = Math.min(confidence, 0.35);
    reasons.push('safety-restricted topic detected');
  }

  if (sector === 'payments' || sector === 'refunds') {
    score += 10;
    reasons.push('financial transaction support request');
  } else if (sector === 'account_security') {
    score += 14;
    reasons.push('account security support request');
  }

  const unresolvedConflicts = Array.isArray(data.conflicts)
    ? data.conflicts.filter((conflict: any) => !conflict.resolved).length
    : 0;
  if (unresolvedConflicts > 0) {
    score += Math.min(30, unresolvedConflicts * 15);
    confidence = Math.min(confidence, 0.55);
    reasons.push(`${unresolvedConflicts} unresolved critical detail conflict(s)`);
  }

  const uncertainFactCount = data.uncertainFacts && typeof data.uncertainFacts === 'object'
    ? Object.keys(data.uncertainFacts).length
    : Array.isArray(data.facts)
    ? data.facts.filter((fact: any) => fact.confirmed === false || (typeof fact.confidence === 'number' && fact.confidence < 0.7)).length
    : 0;
  if (uncertainFactCount > 0) {
    score += Math.min(24, uncertainFactCount * 8);
    confidence = Math.min(confidence, 0.68);
    reasons.push(`${uncertainFactCount} uncertain information field(s)`);
  }

  const frustrationScore =
    typeof data.frustrationScore === 'number'
      ? data.frustrationScore
      : typeof data.frustration === 'number'
      ? Math.round(data.frustration * 100)
      : 0;
  if (frustrationScore >= 70) {
    score += 22;
    reasons.push('high caller frustration');
  } else if (frustrationScore >= 40) {
    score += 12;
    reasons.push('moderate caller frustration');
  }

  const noisyOrIncomplete = ['noise', 'background', 'unclear', 'not sure', "don't know", 'pata nahi', 'repeat'].some((term) =>
    text.includes(term)
  );
  if (noisyOrIncomplete) {
    score += 14;
    confidence = Math.min(confidence, 0.62);
    reasons.push('noisy or incomplete caller context');
  }

  const providedHealthScore = typeof data.healthScore === 'number' ? data.healthScore : undefined;
  if (providedHealthScore !== undefined && providedHealthScore < 55) {
    score += 18;
    confidence = Math.min(confidence, providedHealthScore / 100);
    reasons.push('low conversation health score');
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let priority: CaseDNA['priority'] = 'low';
  if (score >= 85 || sector === 'safety_boundary') priority = 'urgent';
  else if (score >= 65) priority = 'high';
  else if (score >= 40) priority = 'medium';

  return {
    score,
    priority,
    confidence: Number(Math.max(0.05, Math.min(1, confidence)).toFixed(2)),
    reasons: reasons.length ? reasons : ['standard support request'],
    sector,
    department: SECTOR_DEPARTMENTS[sector],
  };
}

export function findAvailableOfficerForSector(
  officers: HumanAgent[],
  sector: SupportSector,
  languageHints: string[] = []
): HumanAgent | null {
  const available = officers.filter((officer) =>
    ['available', 'online'].includes(officer.status) && !officer.currentCallId && !officer.activeCallId
  );
  if (available.length === 0) return null;

  const terms = [SECTOR_DEPARTMENTS[sector], ...SECTOR_TERMS[sector]].map((term) => term.toLowerCase());
  const languageSet = languageHints.map((lang) => lang.toLowerCase());

  const scored = available
    .map((officer) => {
      const department = (officer.department || '').toLowerCase();
      const rawSpecialization = officer.specialization as string[] | string | undefined;
      const specialization = Array.isArray(rawSpecialization)
        ? rawSpecialization.join(' ').toLowerCase()
        : String(rawSpecialization || '').toLowerCase();
      const languages = (officer.languages || []).map((lang) => lang.toLowerCase());

      let score = 2; // Base score for being online & available
      if (terms.some((term) => department.includes(term) || term.includes(department))) score += 6;
      if (terms.some((term) => specialization.includes(term))) score += 4;
      if (languageSet.length && languageSet.some((lang) => languages.includes(lang))) score += 2;

      return { officer, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored[0]?.officer || available[0] || null;
}
