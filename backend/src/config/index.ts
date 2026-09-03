import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env or .env.local
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

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
};
