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
  const maxRefund = brain?.maxRefundAmount ?? 0;
  const allowCodeSwitching = brain?.allowCodeSwitching ?? true;

  const faqs = docs.filter((d) => d.type === 'faq');
  const policies = docs.filter((d) => d.type === 'policy');
  const sops = docs.filter((d) => d.type === 'sop');
  const productInfo = docs.filter((d) => d.type === 'product_info');

  const faqText = faqs.length
    ? faqs.map((f) => `Q: ${f.title}\nA: ${f.content}`).join('\n\n')
    : 'No company-approved FAQs are configured yet. Ask only essential clarifying questions and do not invent policy answers.';

  const policyText = policies.length
    ? policies.map((p) => `- ${p.title}: ${p.content}`).join('\n')
    : '- No company-approved policies are configured yet. Do not approve refunds, replacements, legal, financial, medical, or emergency guidance from model knowledge.';

  const sopText = sops.length
    ? sops.map((s) => `### ${s.title}\n${s.content}`).join('\n\n')
    : 'No company-approved SOPs are configured yet. Collect minimum essential details, confirm critical details, and escalate when confidence is low.';

  const productText = productInfo.length
    ? productInfo.map((p) => `* ${p.title}: ${p.content}`).join('\n')
    : 'No company-approved product/service documents are configured yet.';

  const availableOfficers = officers
    .filter((o) => ['available', 'online'].includes(o.status) && !o.currentCallId && !o.activeCallId)
    .map((o) => {
      const rawSpecialization = o.specialization as string[] | string | undefined;
      const specialization = Array.isArray(rawSpecialization) ? rawSpecialization.join(', ') : String(rawSpecialization || '');
      return `${o.name} (${o.department}${specialization ? ` - ${specialization}` : ''})`;
    })
    .join(', ');

  const prompt = `You are ${agentName}, a warm, empathetic, and ultra-human AI voice customer resolution specialist for ${companyName}.
You are powered by CAVI (Customer Assistance through Voice Intelligence).

### STRICT CUSTOMER SUPPORT SCOPE BOUNDARIES
1. You are STRICTLY a Customer Support Specialist for ${companyName} orders, payments, refunds, and account assistance.
2. If the user asks ANY off-topic question (such as "explain DSA", "what is data structures", "write code", "who is President of US", "recipe for cake", "tell me a joke", or general knowledge):
   STRICTLY DECLINE to answer off-topic questions!
   Say politely: "I am only able to assist with customer support inquiries for ${companyName}. Is there an order or account issue I can help you with today?"

### HUMAN VOICE & CONVERSATIONAL STYLE
3. Speak in a natural, ${tone}, conversational voice.
4. Use natural human fillers and thinking phrases where appropriate: "Ah...", "Hmm, let me check...", "Got it!", "Oh, I see...", "Ah, yes, found it!", "Alright..."
5. Vary sentence rhythm naturally. Keep responses concise (1 to 2 spoken sentences per turn).
6. ${allowCodeSwitching ? 'MULTILINGUAL & CODE-SWITCHING: Fluently respond in English, Hindi, Tamil, or mixed code-switched sentences (e.g. Hinglish). Mirror the caller’s language choice comfortably.' : 'Speak in the configured primary language.'}

### STEP-BY-STEP HUMAN PROBLEM PROCESSING (NEVER ASSUME OR PROCESS REFUNDS BEFORE THE USER EXPLAINS THE ISSUE)
5. GATHER DETAILS FIRST:
   - If the user provides an Order ID or says "payment issue" without explaining the exact problem/amount, DO NOT claim a refund is processed!
   - Acknowledge naturally and ask for details: "Ah, got it. I have your Order ID right here... Could you tell me a bit more about what happened with the payment? Were you double-charged or was there a price discrepancy?"
6. CONFIRM & VERIFY:
   - Always repeat back critical entities (Order IDs, amounts, phone numbers) before executing any action: "Hmm, let me check that... Ah, yes, I see the duplicate charge right here."
7. ZERO-REPEAT HUMAN HANDOFF: If the caller is furious, requests a human supervisor, or the issue exceeds policies (e.g. refunds > $${maxRefund}), assure them calmly:
   "Hmm, since this involves a larger discrepancy, I am transferring you to an officer right now with the full summary so you will not need to repeat anything."
   Available officers on duty: ${availableOfficers || 'No currently available matching officers are listed. Prepare a case summary and mark admin action required without telling the caller staffing details.'}.

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
    throw new Error('Agora Conversational AI credentials are required to invite the production voice agent');
  }

  const { prompt, greeting } = await getCompanyAgentConfig(companyId);

  const deepgramApiKey = config.deepgram.apiKey;
  if (!deepgramApiKey) {
    throw new Error('DEEPGRAM_API_KEY is required for production voice STT/TTS');
  }
  const deepgramVoiceModel = config.deepgram.voiceModel || 'flux-priya-en';
  const deepgramSttModel = config.deepgram.sttModel || 'flux-general-en';

  const payload = {
    type: 'Settings',
    channel,
    audio: {
      input: {
        encoding: 'linear16',
        sample_rate: 48000,
      },
      output: {
        encoding: 'linear16',
        sample_rate: 24000,
        container: 'none',
      },
    },
    agent: {
      speak: {
        provider: {
          type: 'deepgram',
          version: 'v2',
          model: deepgramVoiceModel,
          key: deepgramApiKey,
        },
      },
      listen: {
        provider: {
          type: 'deepgram',
          version: 'v2',
          model: deepgramSttModel,
          key: deepgramApiKey,
        },
      },
      think: {
        provider: {
          type: 'google',
          model: 'gemini-3.1-flash-lite',
        },
        prompt,
      },
      greeting: greeting || 'Hello! How may I help you?',
    },
    tts: {
      vendor: 'deepgram',
      params: {
        key: deepgramApiKey,
        model: deepgramVoiceModel,
      },
    },
    vad: {
      interrupt_duration_ms: 160,
      silence_duration_ms: 400,
    },
  };

  // Call Agora Conversational AI API with Deepgram STT/TTS config
  const response = await fetch(`https://api.agora.io/v1/projects/${appId}/conversational-ai/agents/${agentId}/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Agora] Agent invite failed (${response.status}):`, errorText);
    throw new Error(`Agora agent invite failed: ${errorText}`);
  }

  const data = (await response.json()) as Record<string, unknown>;
  return { success: true, ...data };
}
