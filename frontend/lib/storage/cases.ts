import type { CaseDNA } from '@/types/echosphere';
import { createCase } from '@/lib/api/cases';

const memoryCases: Record<string, CaseDNA> = {};

export function addOrUpdateCase(caseItem: CaseDNA) {
  memoryCases[caseItem.caseId] = caseItem;
  // Non-blocking sync to backend
  if (typeof window !== 'undefined') {
    createCase(caseItem).catch(() => {});
  }
}

export function getAllCases(): CaseDNA[] {
  return Object.values(memoryCases);
}

export function getCaseById(id: string): CaseDNA | undefined {
  return memoryCases[id];
}
