import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from all possible .env and .env.local files
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../backend/.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'frontend/.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '../frontend/.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env.local') });

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/echosphere',
  agora: {
    appId: process.env.AGORA_APP_ID || '',
    appCertificate: process.env.AGORA_APP_CERTIFICATE || '',
    apiKey: process.env.AGORA_CONVERSATIONAL_AI_API_KEY || '',
    agentId: process.env.AGORA_AGENT_ID || process.env.NEXT_PUBLIC_AGORA_AGENT_ID || '',
  },
  jwtSecret: process.env.JWT_SECRET || 'cavi_super_secret_jwt_key_2026',
  elevenlabs: {
    apiKey: process.env.ELEVENLABS_API_KEY || process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '',
    voiceIdEn: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_EN || process.env.ELEVENLABS_VOICE_ID_EN || process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL',
    voiceIdHi: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_HI || process.env.ELEVENLABS_VOICE_ID_HI || 'EXAVITQu4vr4xnSDxMaL',
    voiceIdTe: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_TE || process.env.ELEVENLABS_VOICE_ID_TE || 'EXAVITQu4vr4xnSDxMaL',
    voiceIdTa: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_TA || process.env.ELEVENLABS_VOICE_ID_TA || 'EXAVITQu4vr4xnSDxMaL',
  },
  deepgram: {
    apiKey: process.env.DEEPGRAM_API_KEY || process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY || '',
    voiceModel: process.env.DEEPGRAM_VOICE_MODEL || process.env.NEXT_PUBLIC_DEEPGRAM_VOICE_MODEL || 'flux-priya-en',
    sttModel: process.env.DEEPGRAM_STT_MODEL || process.env.NEXT_PUBLIC_DEEPGRAM_STT_MODEL || 'flux-general-en',
  },
};
