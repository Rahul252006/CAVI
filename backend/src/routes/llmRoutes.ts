import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { mongoGetKnowledgeDocs, mongoSaveKnowledgeGap, mongoGetAllCompanies } from '../integrations/mongodb/models.js';
import type { KnowledgeGapRequest } from '../types/index.js';

const router = Router();

const ECHOSPHERE_PROMPT = `You are a calm, soothing, very pleasant, and cool customer care specialist speaking on a LIVE PHONE CALL.
You are CAVI (Customer Assistance through Voice Intelligence).

### SPEAKING STYLE & TONE (CRITICAL - SOUND ULTRA-COOL, CALM, AND PLEASANT):
1. SOUND RELAXED, GENTLE, AND REASSURING:
   - Speak in a calm, soft, polite, and reassuring customer care voice.
   - Never sound aggressive, rushed, loud, overly excited, or shouting.
   - Maintain a smooth, cool, soothing pitch at all times.
   - CRITICAL: DO NOT use exclamation marks (!) anywhere in your text. Use gentle periods (.) and commas (,) instead. Exclamation marks cause text-to-speech synthesizers to elevate pitch and shout.
   - Pleasant, soothing openers:
     * "I understand completely, let me check that for you right now."
     * "No worries at all, I can look into your order details right away."
     * "Got it, let me check on that payment for you."
     * "I am so sorry for the delay, let's get this sorted out right away."

2. CONCISE PHONE CALL REPLIES (1-2 SHORT GENTLE SENTENCES):
   - In phone calls, long paragraphs sound unnatural. Keep your reply strictly to 1 to 2 gentle, spoken sentences.
   - Gather needed details (like Order ID or phone number) with a calm, polite question.

3. MULTILINGUAL & CODE-SWITCHING SUPPORT:
   - If the caller speaks Hindi or mixed Hinglish, reply in a warm, calm, polite Hindi/Hinglish tone without shouting (e.g. "Haan ji, main abhi aapka order status check kar leta hoon. Kya aap apna Order ID share kar sakte hain?").
   - Match the caller's language naturally (English, Hindi, Hinglish, Tamil, Telugu).

### STRICT COMPANY KNOWLEDGE BASE GROUNDING:
- Answer specific policy/refund/product questions based on the COMPANY KNOWLEDGE BASE provided below.
- If a policy is not in the knowledge base, say softly: "I don't have that specific policy right here in my notes, but let me connect you with our team lead who can help you with this."
- Never make up fake monetary figures or unauthorized refund promises.

### STRICT CUSTOMER SUPPORT BOUNDARIES:
- If asked unrelated off-topic queries (DSA, coding, trivia, recipes):
  Politely redirect: "I can only help with your orders and account on this line. Is there an order issue I can help you with today?"`;

function getApiKey(keyName: string): string {
  const possiblePaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), 'backend/.env'),
    path.resolve(process.cwd(), '../backend/.env'),
    path.resolve(process.cwd(), 'frontend/.env.local'),
    path.resolve(process.cwd(), '../frontend/.env.local'),
    path.resolve(process.cwd(), '../.env.local'),
  ];

  for (const envPath of possiblePaths) {
    try {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const lines = content.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith(`${keyName}=`)) {
            const val = trimmed.substring(keyName.length + 1).trim();
            if (val) return val.replace(/['"]/g, '').trim();
          }
        }
      }
    } catch {}
  }

  if (process.env[keyName] && process.env[keyName]!.trim() !== '') {
    return process.env[keyName]!.replace(/['"]/g, '').trim();
  }

  return '';
}

router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { userUtterance, history = [], contextSummary = '' } = req.body;
    let targetCompanyId = String(req.body.companyId || req.query.companyId || '').trim();

    if (!targetCompanyId) {
      const allComps = await mongoGetAllCompanies();
      targetCompanyId = allComps[0]?.id || 'comp_default';
    }

    // Strict Scope Guard: Deterministically block off-topic queries (DSA, coding, trivia, general knowledge)
    const lowerUtterance = (userUtterance || '').toLowerCase();
    const offTopicKeywords = [
      'dsa', 'data structure', 'algorithm', 'binary tree', 'linked list', 'bubble sort', 'quick sort',
      'president', 'recipe', 'tell me a joke', 'write code', 'write a function', 'python code', 'java code',
      'what is dsa', 'explain dsa', 'teach me dsa', 'quantum physics', 'capital of', 'prime minister',
    ];
    if (offTopicKeywords.some((kw) => lowerUtterance.includes(kw))) {
      return res.json({
        success: true,
        text: 'I am only able to assist with customer support inquiries regarding your orders, payments, and account. Is there an order or account issue I can help you with today?',
        provider: 'scope_guard',
      });
    }

    // Load active Company Knowledge Base Docs
    const kbDocs = await mongoGetKnowledgeDocs(targetCompanyId);
    const kbContextText = kbDocs.length > 0
      ? `COMPANY KNOWLEDGE BASE DOCUMENTS:\n` + kbDocs.map((d) => `[${(d.type || d.category || 'POLICY').toUpperCase()}] ${d.title}: ${d.content}`).join('\n')
      : 'COMPANY KNOWLEDGE BASE: No company-approved documents are currently available. Ask only for essential details and escalate uncertain policy questions to a human.';

    // Check for Knowledge Gap: If user asks about a specific issue with no matching KB document, log an Admin Action Request
    const problemKeywords = ['broken', 'damaged', 'stolen', 'warranty', 'missing', 'unrecognized', 'unauthorized', 'replacement', 'cancellation', 'policy', 'discrepancy'];
    const isProblemQuery = problemKeywords.some((kw) => lowerUtterance.includes(kw));
    const hasMatchingKb = kbDocs.some((d) =>
      d.title.toLowerCase().includes(lowerUtterance) ||
      d.content.toLowerCase().includes(lowerUtterance)
    );

    if (isProblemQuery && !hasMatchingKb) {
      const gapRequest: KnowledgeGapRequest = {
        id: `gap_${Date.now()}`,
        companyId: targetCompanyId,
        problemSummary: `Customer asked about unsupported problem: "${userUtterance}". No company KB document exists for this topic.`,
        suggestedCategory: lowerUtterance.includes('warranty') || lowerUtterance.includes('cancel') ? 'policy' : 'sop',
        recommendedAction: `Upload a company policy/SOP covering '${userUtterance}' so the AI agent can resolve future inquiries automatically.`,
        callerPhone: req.body.callerPhone || req.body.customerPhone,
        createdAt: new Date().toISOString(),
        status: 'pending',
      };
      await mongoSaveKnowledgeGap(gapRequest).catch(console.warn);
    }

    const openrouterKey = getApiKey('OPENROUTER_API_KEY') || getApiKey('NEXT_PUBLIC_OPENROUTER_API_KEY');
    const geminiKey = getApiKey('GEMINI_API_KEY') || getApiKey('NEXT_PUBLIC_GEMINI_API_KEY');

    // 1. Prioritize OpenRouter API with fast candidate models
    if (openrouterKey.length > 5) {
      const messages = [
        {
          role: 'system',
          content: `${ECHOSPHERE_PROMPT}\n\n${kbContextText}\n\nContext Summary of Conversation so far:\n${contextSummary}`,
        },
        ...history.map((h: any) => ({
          role: h.role === 'user' ? 'user' : 'assistant',
          content: h.text,
        })),
        {
          role: 'user',
          content: userUtterance,
        },
      ];

      const candidateModels = [
        'google/gemini-2.0-flash-001',
        'openai/gpt-4o-mini',
        'meta-llama/llama-3.3-70b-instruct',
        process.env.OPENROUTER_MODEL,
      ].filter(Boolean) as string[];

      for (const model of candidateModels) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2800);

          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${openrouterKey}`,
              'HTTP-Referer': 'http://localhost:3000',
              'X-Title': 'CAVI Voice AI',
            },
            body: JSON.stringify({
              model,
              messages,
              max_tokens: 65,
              temperature: 0.6,
            }),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            const data: any = await response.json();
            const responseText = data.choices?.[0]?.message?.content;
            if (responseText) {
              const cleanText = responseText.trim();
              const audioBase64 = await synthesizeSpeechFast(cleanText);
              return res.json({
                success: true,
                text: cleanText,
                audioBase64,
                provider: `openrouter:${model}`,
              });
            }
          }
        } catch (mErr) {
          console.warn(`[OpenRouter Fetch Warning for ${model}]`, mErr);
        }
      }
    }

    // 2. Direct Google Gemini API fallback if Gemini key is present
    if (geminiKey.length > 5 && !geminiKey.includes('31d5104720ed40e4bb0880a126665d08')) {
      const contents = [
        {
          role: 'user',
          parts: [{ text: `${ECHOSPHERE_PROMPT}\n\nContext Summary:\n${contextSummary}` }],
        },
        ...history.map((h: any) => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }],
        })),
        {
          role: 'user',
          parts: [{ text: userUtterance }],
        },
      ];

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents }),
        }
      );

      if (response.ok) {
        const data: any = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (responseText) {
          const cleanText = responseText.trim();
          const audioBase64 = await synthesizeSpeechFast(cleanText);
          return res.json({
            success: true,
            text: cleanText,
            audioBase64,
            provider: 'gemini',
          });
        }
      }
    }

    return res.status(400).json({
      success: false,
      error: 'Neither OPENROUTER_API_KEY nor GEMINI_API_KEY is configured in env files.',
    });
  } catch (err: any) {
    console.error('[LLM Router Error]', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

async function synthesizeSpeechFast(text: string): Promise<string | null> {
  const deepgramKey = getApiKey('DEEPGRAM_API_KEY') || getApiKey('NEXT_PUBLIC_DEEPGRAM_API_KEY');
  const cleanSpeechText = text.replace(/!+/g, '.');

  if (deepgramKey && deepgramKey.length > 5) {
    const candidateModels = [
      'aura-asteria-en',
      'aura-luna-en',
      'aura-stella-en',
      'aura-athena-en',
      'aura-hera-en',
      'aura-2-priya-en',
      'aura-priya-en',
    ];

    for (const model of candidateModels) {
      try {
        const response = await fetch(`https://api.deepgram.com/v1/speak?model=${model}&speed=1.0`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${deepgramKey}`,
          },
          body: JSON.stringify({ text: cleanSpeechText }),
        });
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          return Buffer.from(arrayBuffer).toString('base64');
        }
      } catch (err) {
        console.warn(`[Deepgram Fast TTS Error for ${model}]`, err);
      }
    }
  }

  const elevenLabsKey = getApiKey('ELEVENLABS_API_KEY') || getApiKey('NEXT_PUBLIC_ELEVENLABS_API_KEY');
  // Rachel / Bella gentle pleasant female voices
  const targetVoiceId = '21m00Tcm4TlvDq8ikWAM';
  if (elevenLabsKey && elevenLabsKey.length > 5) {
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${targetVoiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsKey,
        },
        body: JSON.stringify({
          text: cleanSpeechText,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.85,
            similarity_boost: 0.85,
            style: 0.0,
            use_speaker_boost: false,
          },
        }),
      });
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer).toString('base64');
      }
    } catch (err) {
      console.warn('[ElevenLabs Fast TTS Error]', err);
    }
  }

  return null;
}

// Deepgram & ElevenLabs TTS Proxy Endpoint
router.post('/tts', async (req: Request, res: Response) => {
  try {
    const { text, voiceId, modelId, languageCode = 'en' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, error: 'Text prompt is required.' });
    }

    const cleanSpeechText = text.replace(/!+/g, '.');
    const deepgramKey = getApiKey('DEEPGRAM_API_KEY') || getApiKey('NEXT_PUBLIC_DEEPGRAM_API_KEY');

    // 1. Primary: Deepgram Priya / Asteria / Luna Gentle Female Voice Synthesis
    if (deepgramKey && deepgramKey.length > 5) {
      const candidateModels = [
        'aura-asteria-en',
        'aura-luna-en',
        'aura-stella-en',
        'aura-athena-en',
        'aura-hera-en',
        'aura-2-priya-en',
        'aura-priya-en',
      ];

      for (const model of candidateModels) {
        try {
          const response = await fetch(`https://api.deepgram.com/v1/speak?model=${model}&speed=1.0`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Token ${deepgramKey}`,
            },
            body: JSON.stringify({ text: cleanSpeechText }),
          });

          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            const base64Audio = Buffer.from(arrayBuffer).toString('base64');
            return res.json({
              success: true,
              provider: 'deepgram',
              model,
              languageCode,
              audioBase64: base64Audio,
            });
          }
        } catch (dgErr) {
          console.warn(`[Deepgram TTS Fetch Exception for ${model}]`, dgErr);
        }
      }
    }

    // 2. Secondary: ElevenLabs Fallback
    const elevenLabsKey = getApiKey('ELEVENLABS_API_KEY') || getApiKey('NEXT_PUBLIC_ELEVENLABS_API_KEY');
    const targetVoiceId = voiceId || getApiKey('ELEVENLABS_VOICE_ID') || getApiKey('NEXT_PUBLIC_ELEVENLABS_VOICE_ID_EN') || '21m00Tcm4TlvDq8ikWAM';

    if (elevenLabsKey && elevenLabsKey.length > 5) {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${targetVoiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsKey,
        },
        body: JSON.stringify({
          text: cleanSpeechText,
          model_id: modelId || 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.85,
            similarity_boost: 0.85,
            style: 0.0,
            use_speaker_boost: false,
          },
        }),
      });

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const base64Audio = Buffer.from(arrayBuffer).toString('base64');
        return res.json({
          success: true,
          provider: 'elevenlabs',
          voiceId: targetVoiceId,
          modelId: modelId || 'eleven_multilingual_v2',
          languageCode,
          audioBase64: base64Audio,
        });
      }
    }

    // Fallback response signaling client to use tuned Web Speech Synthesis
    return res.json({
      success: false,
      fallback: true,
      message: 'TTS providers unavailable. Using client-side tuned voice synthesis.',
    });
  } catch (err: any) {
    console.error('[TTS Router Error]', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
