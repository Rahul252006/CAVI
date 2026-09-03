import { ExtractedFact, FactConflict } from '@/types/echosphere';

export function detectConflicts(
  existingFacts: Record<string, ExtractedFact>,
  newFacts: Record<string, Partial<ExtractedFact>>,
  existingConflicts: FactConflict[] = []
): { updatedFacts: Record<string, ExtractedFact>; updatedConflicts: FactConflict[]; newlyDetectedConflict?: FactConflict } {
  const updatedFacts = { ...existingFacts };
  const updatedConflicts = [...existingConflicts];
  let newlyDetectedConflict: FactConflict | undefined;

  for (const [key, newFact] of Object.entries(newFacts)) {
    if (!newFact || !newFact.value) continue;

    const existing = existingFacts[key];

    if (existing && existing.value && existing.value !== newFact.value) {
      // Normalize values before comparing (e.g. ₹2499 vs ₹2,499)
      const normExisting = existing.value.replace(/[, ]/g, '');
      const normNew = newFact.value.replace(/[, ]/g, '');

      if (normExisting !== normNew) {
        // We have a genuine conflict!
        const existingConflictIndex = updatedConflicts.findIndex(c => c.field === key && !c.resolved);

        if (existingConflictIndex >= 0) {
          // Update existing unresolved conflict
          updatedConflicts[existingConflictIndex] = {
            ...updatedConflicts[existingConflictIndex],
            newValue: newFact.value,
            detectedAt: new Date().toISOString(),
          };
          newlyDetectedConflict = updatedConflicts[existingConflictIndex];
        } else {
          const newConflict: FactConflict = {
            field: key,
            oldValue: existing.value,
            newValue: newFact.value,
            detectedAt: new Date().toISOString(),
            resolved: false,
          };
          updatedConflicts.push(newConflict);
          newlyDetectedConflict = newConflict;
        }

        // Do not blindly overwrite the existing value until confirmed
        // Keep existing, but note conflict
        continue;
      }
    }

    // No conflict: apply new or updated fact
    updatedFacts[key] = {
      value: newFact.value,
      confidence: newFact.confidence ?? 0.8,
      source: newFact.source ?? 'user',
      confirmed: newFact.confirmed ?? false,
      timestamp: Date.now(),
    };
  }

  return { updatedFacts, updatedConflicts, newlyDetectedConflict };
}

export function resolveConflict(
  conflicts: FactConflict[],
  field: string,
  resolvedValue: string,
  facts: Record<string, ExtractedFact>
): { conflicts: FactConflict[]; facts: Record<string, ExtractedFact> } {
  const updatedConflicts = conflicts.map(c => {
    if (c.field === field && !c.resolved) {
      return { ...c, resolved: true, resolvedValue };
    }
    return c;
  });

  const updatedFacts = {
    ...facts,
    [field]: {
      value: resolvedValue,
      confidence: 1.0,
      source: 'user' as const,
      confirmed: true,
      timestamp: Date.now(),
    },
  };

  return { conflicts: updatedConflicts, facts: updatedFacts };
}
