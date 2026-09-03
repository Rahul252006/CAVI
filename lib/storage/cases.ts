import { CaseDNA } from '@/types/echosphere';

// Global in-memory map to preserve cases across requests in development
const globalForCases = globalThis as unknown as {
  echosphereCases?: Map<string, CaseDNA>;
};

export const caseStore = globalForCases.echosphereCases ?? new Map<string, CaseDNA>();
if (process.env.NODE_ENV !== 'production') globalForCases.echosphereCases = caseStore;

export function getAllCases(companyId?: string): CaseDNA[] {
  let all = Array.from(caseStore.values());
  if (companyId) {
    all = all.filter(c => !c.companyId || c.companyId === companyId);
  }
  return all.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getCaseById(caseId: string): CaseDNA | undefined {
  return caseStore.get(caseId);
}

export function addOrUpdateCase(caseDNA: CaseDNA): CaseDNA {
  caseStore.set(caseDNA.caseId, caseDNA);
  return caseDNA;
}

export function updateCaseStatus(caseId: string, status: CaseDNA['status']): CaseDNA | undefined {
  const existing = caseStore.get(caseId);
  if (existing) {
    existing.status = status;
    caseStore.set(caseId, existing);
    return existing;
  }
  return undefined;
}
