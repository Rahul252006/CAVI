export interface AIResponsePayload {
  text: string;
  audioBase64?: string | null;
}

export async function generateAIResponseWithAudio(
  userUtterance: string,
  history: { role: string; text: string }[] = [],
  contextSummary: string = '',
  companyId?: string | null
): Promise<AIResponsePayload | null> {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
    : typeof window !== 'undefined'
      ? ''
      : 'http://localhost:4000';

  try {
    const res = await fetch(`${backendUrl}/api/llm/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userUtterance, history, contextSummary, companyId }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.text) {
        return {
          text: data.text,
          audioBase64: data.audioBase64 || null,
        };
      }
    } else {
      const errJson = await res.json().catch(() => ({}));
      console.warn('[LLM Gateway Warning]', res.status, errJson);
    }
  } catch (err) {
    console.warn('[LLM Gateway Error]', err);
  }

  return null;
}

export async function generateAIResponse(
  userUtterance: string,
  history: { role: string; text: string }[] = [],
  contextSummary: string = '',
  companyId?: string | null
): Promise<string | null> {
  const res = await generateAIResponseWithAudio(userUtterance, history, contextSummary, companyId);
  return res?.text || null;
}
