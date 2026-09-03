import { LanguageState } from '@/types/echosphere';

export const LANGUAGE_REGISTRY: Record<string, { name: string; nativeName: string; keywords: string[] }> = {
  en: {
    name: 'English',
    nativeName: 'English',
    keywords: ['hello', 'please', 'help', 'payment', 'refund', 'failed', 'issue', 'problem', 'money', 'transaction', 'account'],
  },
  hi: {
    name: 'Hindi',
    nativeName: 'हिंदी / Hinglish',
    keywords: ['mera', 'meri', 'kya', 'hai', 'bhai', 'bolo', 'paisa', 'paise', 'kat', 'gaya', 'nahi', 'hua', 'karo', 'shukriya', 'namaste', 'madad'],
  },
  ta: {
    name: 'Tamil',
    nativeName: 'தமிழ்',
    keywords: ['vanakkam', 'panam', 'illai', 'eppadi', 'udavi', 'tamil', 'sollunga'],
  },
  te: {
    name: 'Telugu',
    nativeName: 'తెలుగు',
    keywords: ['namaskaram', 'dabbu', 'ledu', 'ela', 'sahayam', 'telugu', 'cheppandi'],
  },
  bn: {
    name: 'Bengali',
    nativeName: 'বাংলা',
    keywords: ['nomoshkar', 'taka', 'kothay', 'sahajjo', 'bolun'],
  },
  mr: {
    name: 'Marathi',
    nativeName: 'मराठी',
    keywords: ['namaskar', 'paise', 'kasa', 'madat', 'saanga'],
  },
  gu: {
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    keywords: ['kem cho', 'paisa', 'madad', 'karo'],
  },
  kn: {
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    keywords: ['namaskara', 'hana', 'sahaya', 'heli'],
  },
  ml: {
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    keywords: ['namaskaram', 'panam', 'sahayam', 'parayu'],
  },
};

export function detectLanguages(text: string): { primary: string; detected: string[]; confidence: number; isCodeSwitching: boolean } {
  if (!text || text.trim().length === 0) {
    return { primary: 'en', detected: ['en'], confidence: 0.5, isCodeSwitching: false };
  }

  const lower = text.toLowerCase();
  const scores: Record<string, number> = {};

  // Check Unicode script ranges
  if (/[\u0900-\u097F]/.test(text)) scores.hi = (scores.hi || 0) + 4; // Devanagari
  if (/[\u0B80-\u0BFF]/.test(text)) scores.ta = (scores.ta || 0) + 4; // Tamil
  if (/[\u0C00-\u0C7F]/.test(text)) scores.te = (scores.te || 0) + 4; // Telugu
  if (/[\u0980-\u09FF]/.test(text)) scores.bn = (scores.bn || 0) + 4; // Bengali
  if (/[\u0A80-\u0AFF]/.test(text)) scores.gu = (scores.gu || 0) + 4; // Gujarati
  if (/[\u0C80-\u0CFF]/.test(text)) scores.kn = (scores.kn || 0) + 4; // Kannada
  if (/[\u0D00-\u0D7F]/.test(text)) scores.ml = (scores.ml || 0) + 4; // Malayalam

  // Keyword token matching
  const words = lower.split(/\s+/);
  for (const word of words) {
    for (const [lang, meta] of Object.entries(LANGUAGE_REGISTRY)) {
      if (meta.keywords.includes(word)) {
        scores[lang] = (scores[lang] || 0) + 1;
      }
    }
  }

  // English words presence check
  const enMatches = words.filter(w => LANGUAGE_REGISTRY.en.keywords.includes(w)).length;
  if (enMatches > 0) {
    scores.en = (scores.en || 0) + enMatches;
  } else if (/^[a-zA-Z0-9\s.,?!'"₹-]+$/.test(text) && Object.keys(scores).length === 0) {
    scores.en = 1;
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const detected = sorted.length > 0 ? sorted.map(s => s[0]) : ['en'];
  const primary = detected[0] || 'en';
  const isCodeSwitching = detected.length > 1 && sorted[0][1] > 0 && sorted[1][1] > 0;
  const confidence = Math.min(1.0, 0.6 + (sorted.length > 0 ? Math.min(sorted[0][1] * 0.1, 0.4) : 0));

  return { primary, detected, confidence, isCodeSwitching };
}

export function formatLanguageLabel(state: LanguageState): string {
  if (!state.detected || state.detected.length === 0) return 'English';
  const names = state.detected.map(code => LANGUAGE_REGISTRY[code]?.name || code.toUpperCase());
  if (state.codeSwitching && names.length > 1) {
    return `${names[0]} ↔ ${names[1]}`;
  }
  return names[0] || 'English';
}
