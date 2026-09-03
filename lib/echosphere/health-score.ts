import { HealthScore, ExtractedFact, FactConflict, EmotionState } from '@/types/echosphere';

export function calculateHealthScore(
  facts: Record<string, ExtractedFact>,
  conflicts: FactConflict[],
  emotion: EmotionState,
  resolutionStatus: string = 'in_progress'
): HealthScore {
  // 1. Understanding (0 to 1): has issue, intent, and customer details been recognized?
  let understanding = 0.5;
  if (facts.issue) understanding += 0.25;
  if (facts.customerGoal || facts.amount) understanding += 0.25;
  understanding = Math.min(1.0, understanding);

  // 2. Information Completeness (0 to 1): how many essential fields are filled?
  const essentialKeys = ['amount', 'issue', 'transactionId', 'date'];
  const filledCount = essentialKeys.filter(k => facts[k] && facts[k].value).length;
  const completeness = Math.min(1.0, 0.3 + (filledCount / essentialKeys.length) * 0.7);

  // 3. Average Confidence of extracted facts (0 to 1)
  const factArray = Object.values(facts);
  const avgConfidence =
    factArray.length > 0
      ? factArray.reduce((acc, f) => acc + (f.confidence || 0.8), 0) / factArray.length
      : 0.7;

  // 4. Resolution Progress (0 to 1)
  let resolutionProgress = 0.3;
  if (resolutionStatus === 'in_progress') resolutionProgress = 0.6;
  if (resolutionStatus === 'likely_resolved') resolutionProgress = 0.85;
  if (resolutionStatus === 'resolved') resolutionProgress = 1.0;
  if (resolutionStatus === 'escalating') resolutionProgress = 0.35;

  // 5. Frustration (0 to 1)
  const frustration = emotion.frustration || 0.1;

  // 6. Conflict penalty
  const unresolvedConflicts = conflicts.filter(c => !c.resolved).length;
  const conflictRate = Math.min(1.0, unresolvedConflicts * 0.5);

  // Composite calculation scaled to 0-100
  const rawScore =
    understanding * 0.25 +
    completeness * 0.20 +
    avgConfidence * 0.20 +
    resolutionProgress * 0.20 +
    (1 - frustration) * 0.10 +
    (1 - conflictRate) * 0.05;

  const score = Math.max(5, Math.min(100, Math.round(rawScore * 100)));

  // Escalation risk determination
  let escalationRisk: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
  if (frustration >= 0.75 || unresolvedConflicts >= 2) {
    escalationRisk = 'Critical';
  } else if (frustration >= 0.5 || unresolvedConflicts >= 1 || score < 50) {
    escalationRisk = 'High';
  } else if (frustration >= 0.3 || score < 70) {
    escalationRisk = 'Medium';
  }

  // Resolution likelihood
  let resolutionLikelihood: 'Low' | 'Medium' | 'High' = 'High';
  if (score < 45 || escalationRisk === 'Critical') {
    resolutionLikelihood = 'Low';
  } else if (score < 70 || escalationRisk === 'High') {
    resolutionLikelihood = 'Medium';
  }

  return {
    score,
    understanding: Number(understanding.toFixed(2)),
    completeness: Number(completeness.toFixed(2)),
    confidence: Number(avgConfidence.toFixed(2)),
    resolutionProgress: Number(resolutionProgress.toFixed(2)),
    frustration: Number(frustration.toFixed(2)),
    escalationRisk,
    resolutionLikelihood,
  };
}
