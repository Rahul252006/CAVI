import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(currentDir, '..');

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: workspaceRoot,
  env: {
    NEXT_PUBLIC_AGORA_APP_ID: process.env.NEXT_PUBLIC_AGORA_APP_ID || '4849add8a86849f098b0523bedea6cba',
    NEXT_PUBLIC_AGORA_AGENT_ID: process.env.NEXT_PUBLIC_AGORA_AGENT_ID || 'cavi_agent_preset_01',
    NEXT_PUBLIC_OPENROUTER_API_KEY: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || '',
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '',
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
  },
  devIndicators: {
    buildActivity: false,
    appIsrStatus: false,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const targetUrl = backendUrl.includes('localhost:3000') ? 'http://localhost:4000' : backendUrl;
    return [
      {
        source: '/api/:path*',
        destination: `${targetUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

