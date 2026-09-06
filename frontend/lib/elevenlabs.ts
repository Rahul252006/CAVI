export interface ElevenLabsVoice {
  id: string;
  name: string;
  language: string;
  languageCode: 'en' | 'hi' | 'te' | 'ta';
  gender: 'male';
  modelId: string;
  description: string;
}

export const ELEVENLABS_MALE_VOICES: Record<'en' | 'hi' | 'te' | 'ta', ElevenLabsVoice> = {
  en: {
    id: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_EN || process.env.ELEVENLABS_VOICE_ID_EN || process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB', // Adam - Deep, Confident Male Voice
    name: 'Adam (ElevenLabs Male)',
    language: 'English',
    languageCode: 'en',
    gender: 'male',
    modelId: 'eleven_multilingual_v2',
    description: 'Deep, authoritative English male customer resolution voice.',
  },
  hi: {
    id: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_HI || process.env.ELEVENLABS_VOICE_ID_HI || 'ErXwobaYiN019PkySvjV', // Marcus / Multilingual Male
    name: 'Aarav (ElevenLabs Male - Hindi)',
    language: 'Hindi',
    languageCode: 'hi',
    gender: 'male',
    modelId: 'eleven_multilingual_v2',
    description: 'Crisp, natural Hindi male voice using ElevenLabs Multilingual V2.',
  },
  te: {
    id: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_TE || process.env.ELEVENLABS_VOICE_ID_TE || 'TxGEqnscrfWW6350DD69', // Josh / Multilingual Male
    name: 'Kiran (ElevenLabs Male - Telugu)',
    language: 'Telugu',
    languageCode: 'te',
    gender: 'male',
    modelId: 'eleven_multilingual_v2',
    description: 'Smooth, expressive Telugu male voice using ElevenLabs Multilingual V2.',
  },
  ta: {
    id: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_TA || process.env.ELEVENLABS_VOICE_ID_TA || 'VR6AewLTigWG4xSOukaG', // Marcus / Multilingual Male
    name: 'Vijay (ElevenLabs Male - Tamil)',
    language: 'Tamil',
    languageCode: 'ta',
    gender: 'male',
    modelId: 'eleven_multilingual_v2',
    description: 'Clear, polite Tamil male voice using ElevenLabs Multilingual V2.',
  },
};

let currentAudio: HTMLAudioElement | null = null;

export function stopCurrentAudio(): void {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio.src = '';
    } catch {}
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

export function playDirectBase64Audio(
  base64Data: string,
  onStart?: () => void,
  onEnd?: () => void
): boolean {
  // Stop any ongoing audio safely
  stopCurrentAudio();

  try {
    if (onStart) onStart();
    const audio = new Audio(`data:audio/mp3;base64,${base64Data}`);
    currentAudio = audio;

    audio.onended = () => {
      if (currentAudio === audio) {
        currentAudio = null;
      }
      if (onEnd) onEnd();
    };
    audio.onerror = () => {
      if (currentAudio === audio) {
        currentAudio = null;
      }
      if (onEnd) onEnd();
    };

    try {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((playErr: any) => {
          if (playErr?.name !== 'AbortError') {
            console.warn('[Direct Audio Play Exception]', playErr);
          }
        });
      }
    } catch (playErr: any) {
      if (playErr?.name !== 'AbortError') {
        console.warn('[Direct Audio Play Exception]', playErr);
      }
      const handleUserInteraction = () => {
        audio.play().catch(() => {});
        window.removeEventListener('click', handleUserInteraction);
        window.removeEventListener('keydown', handleUserInteraction);
      };
      window.addEventListener('click', handleUserInteraction, { once: true });
      window.addEventListener('keydown', handleUserInteraction, { once: true });
    }
    return true;
  } catch (err) {
    console.warn('[Direct Audio Error]', err);
    if (onEnd) onEnd();
    return false;
  }
}

export async function speakWithDeepgram(
  text: string,
  langCode: 'en' | 'hi' | 'te' | 'ta' = 'en',
  onStart?: () => void,
  onEnd?: () => void
): Promise<boolean> {
  // Stop any ongoing audio safely
  stopCurrentAudio();

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  try {
    const res = await fetch(`${backendUrl}/api/llm/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        deepgramModel: 'aura-2-priya-en',
        languageCode: langCode,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.audioBase64) {
        if (onStart) onStart();
        const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`);
        currentAudio = audio;

        audio.onended = () => {
          if (currentAudio === audio) {
            currentAudio = null;
          }
          if (onEnd) onEnd();
        };
        audio.onerror = (e) => {
          if (currentAudio === audio) {
            currentAudio = null;
          }
          if (onEnd) onEnd();
        };

        try {
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            await playPromise.catch((playErr: any) => {
              if (playErr?.name !== 'AbortError') {
                console.warn('[Deepgram Audio Play Exception]', playErr);
              }
            });
          }
        } catch (playErr: any) {
          if (playErr?.name !== 'AbortError') {
            console.warn('[Deepgram Audio Play Exception]', playErr);
          }
          // If browser blocked initial autoplay, retry play on user gesture
          const handleUserInteraction = () => {
            audio.play().catch(() => {});
            window.removeEventListener('click', handleUserInteraction);
            window.removeEventListener('keydown', handleUserInteraction);
          };
          window.addEventListener('click', handleUserInteraction, { once: true });
          window.addEventListener('keydown', handleUserInteraction, { once: true });
        }
        return true;
      }
    }
  } catch (err) {
    console.warn('[Deepgram Synthesizer Exception]', err);
  }

  // Only invoke fallback if API fails completely
  return fallbackSpeechSynthesis(text, langCode, onStart, onEnd);
}

export const speakWithElevenLabs = speakWithDeepgram;

function fallbackSpeechSynthesis(
  text: string,
  langCode: 'en' | 'hi' | 'te' | 'ta',
  onStart?: () => void,
  onEnd?: () => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return false;
  }

  try {
    window.speechSynthesis.cancel();
    const cleanSpeechText = text.replace(/!+/g, '.');
    const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
    utterance.rate = 0.95;
    utterance.pitch = 1.05; // Soothing, warm natural pitch

    const voices = window.speechSynthesis.getVoices();
    const langLocales: Record<string, string[]> = {
      en: ['en-IN', 'en-US', 'en-GB'],
      hi: ['hi-IN', 'hi'],
      te: ['te-IN', 'te'],
      ta: ['ta-IN', 'ta'],
    };

    const targetLocales = langLocales[langCode] || langLocales.en;
    const matchedVoice =
      voices.find((v) =>
        targetLocales.some((loc) => v.lang.toLowerCase().includes(loc.toLowerCase())) &&
        (v.name.toLowerCase().includes('priya') ||
          v.name.toLowerCase().includes('veena') ||
          v.name.toLowerCase().includes('samantha') ||
          v.name.toLowerCase().includes('female') ||
          v.name.toLowerCase().includes('karen') ||
          v.name.toLowerCase().includes('victoria') ||
          v.name.toLowerCase().includes('natural') ||
          v.name.toLowerCase().includes('zira') ||
          v.name.toLowerCase().includes('google'))
      ) ||
      voices.find((v) => targetLocales.some((loc) => v.lang.toLowerCase().includes(loc.toLowerCase()))) ||
      voices.find((v) => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('samantha')) ||
      voices[0];

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      if (onStart) onStart();
    };
    utterance.onend = () => {
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (e) {
    console.warn('Speech synthesis fallback error:', e);
    if (onEnd) onEnd();
    return false;
  }
}
