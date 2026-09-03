export function analyzeSentimentAndEmotion(transcriptText: string) {
  const text = transcriptText.toLowerCase();

  let frustrationScore = 0;
  const frustrationKeywords = ['furious', 'angry', 'terrible', 'ridiculous', 'scam', 'useless', 'manager', 'supervisor', 'repeat'];
  frustrationKeywords.forEach((kw) => {
    if (text.includes(kw)) frustrationScore += 25;
  });

  const sentiment = frustrationScore > 50 ? 'frustrated' : frustrationScore > 20 ? 'neutral' : 'positive';
  const healthScore = Math.max(10, Math.min(100, 100 - frustrationScore));

  const shouldEscalate = frustrationScore >= 50 || text.includes('speak to a human') || text.includes('supervisor');

  return {
    sentiment,
    healthScore,
    frustrationSignals: frustrationKeywords.filter((kw) => text.includes(kw)),
    shouldEscalate,
    escalationReason: shouldEscalate ? 'Customer expressed severe dissatisfaction / requested supervisor' : undefined,
  };
}
