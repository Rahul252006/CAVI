import { config } from '../../config/index.js';
import {
  mongoGetCompany,
  mongoGetBrainConfig,
  mongoGetKnowledgeDocs,
  mongoGetToolsByCompany,
  mongoGetAgentsByCompany,
} from '../mongodb/models.js';

export async function getCompanyAgentConfig(companyId: string) {
  const company = await mongoGetCompany(companyId);
  const brain = await mongoGetBrainConfig(companyId);
  const docs = await mongoGetKnowledgeDocs(companyId);
  const tools = await mongoGetToolsByCompany(companyId);
  const officers = await mongoGetAgentsByCompany(companyId);

  const companyName = company?.name || 'Customer Support';
  const agentName = brain?.agentName || 'CAVI Assistant';
  const tone = brain?.tone || 'professional';
  const maxRefund = brain?.maxRefundAmount || 500;
  const allowCodeSwitching = brain?.allowCodeSwitching ?? true;

  const faqs = docs.filter((d) => d.type === 'faq');
  const policies = docs.filter((d) => d.type === 'policy');
  const sops = docs.filter((d) => d.type === 'sop');
  const productInfo = docs.filter((d) => d.type === 'product_info');

  const faqText = faqs.length
    ? faqs.map((f) => `Q: ${f.title}\nA: ${f.content}`).join('\n\n')
    : 'Standard enterprise FAQs apply.';

  const policyText = policies.length
    ? policies.map((p) => `- ${p.title}: ${p.content}`).join('\n')
    : `- Refunds allowed up to $${maxRefund} with verified customer identity.`;

  const sopText = sops.length
    ? sops.map((s) => `### ${s.title}\n${s.content}`).join('\n\n')
    : 'Follow standard verification: ask order number/phone, verify identity, then execute safe action.';

  const productText = productInfo.length
    ? productInfo.map((p) => `* ${p.title}: ${p.content}`).join('\n')
    : 'Company provides standard catalog products and subscription services.';

  const availableOfficers = officers
    .filter((o) => o.status === 'available')
    .map((o) => `${o.name} (${o.department} - ${o.specialization.join(', ')})`)
    .join(', ');

  const prompt = `You are ${agentName}, an empathetic and razor-sharp AI voice customer assistant for ${companyName}.
You are powered by CAVI (Customer Assistance through Voice Intelligence).

### CORE OBJECTIVES
1. Speak in a natural, ${tone}, conversational voice.
2. Listen carefully to caller issues. The caller may be stressed, speaking in noisy environments, or switching languages.
3. ${allowCodeSwitching ? 'MULTILINGUAL & CODE-SWITCHING: Fluently respond in English, Hindi, Tamil, or mixed code-switched sentences (e.g. Hinglish). Mirror the caller’s language choice comfortably.' : 'Speak in the configured primary language.'}
4. NATURAL INTERRUPTION HANDLING: When the caller starts speaking while you are talking, yield immediately without repeating previously spoken words.
5. NOISE RESILIENCE & LOW-CONFIDENCE: If the caller’s response is unclear due to background noise or broken audio, politely ask them to confirm or repeat: "I heard X, is that correct?"
6. SINGLE QUESTION FLOW: Ask only one focused question at a time to prevent cognitive overload.
7. CRITICAL DETAIL CONFIRMATION: Always repeat back critical entities (Order IDs, Email addresses, amounts, phone numbers) before executing any state change.
8. ZERO-REPEAT HUMAN HANDOFF: If the caller is furious, requests a human supervisor, or the issue exceeds policies (e.g. refunds > $${maxRefund}), assure them calmly:
   "I am transferring you to an officer right now with the full summary of what we discussed so you will not need to repeat yourself."
   Available officers on duty: ${availableOfficers || 'Customer Resolution Officers'}.

### COMPANY KNOWLEDGE BASE
${faqText}

### COMPANY POLICIES & BOUNDARIES
${policyText}
- Maximum autonomous refund limit: $${maxRefund}. Anything higher MUST be escalated to a human officer.
- Never make unverified financial guarantees.

### RUNBOOKS & STANDARD OPERATING PROCEDURES (SOPs)
${sopText}

### PRODUCTS & SERVICES
${productText}

${brain?.customInstructions ? `### SPECIAL COMPANY INSTRUCTIONS\n${brain.customInstructions}` : ''}
`;

  return {
    prompt,
    greeting: `Hello! Thank you for calling ${companyName}. I am ${agentName}, how can I help you today?`,
    agentName,
    companyName,
    tools: tools.filter((t) => t.enabled),
  };
}

export async function inviteAgoraAgent(channel: string, companyId: string) {
  const apiKey = config.agora.apiKey;
  const appId = config.agora.appId;
  const agentId = config.agora.agentId;

  if (!apiKey || !appId || !agentId) {
    console.warn('[Agora] Missing API credentials for agent invitation, returning simulated agent response');
    return {
      success: true,
      simulated: true,
      channel,
      message: 'Agent configured in mock mode (configure AGORA_CONVERSATIONAL_AI_API_KEY in backend/.env.local)',
    };
  }

  const { prompt, greeting } = await getCompanyAgentConfig(companyId);

  // Call Agora Conversational AI API
  const response = await fetch(`https://api.agora.io/v1/projects/${appId}/conversational-ai/agents/${agentId}/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      channel,
      prompt,
      greeting,
      vad: {
        interrupt_duration_ms: 160,
        silence_duration_ms: 480,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Agora] Agent invite failed (${response.status}):`, errorText);
    throw new Error(`Agora agent invite failed: ${errorText}`);
  }

  const data = (await response.json()) as Record<string, unknown>;
  return { success: true, ...data };
}
