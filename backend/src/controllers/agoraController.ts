import { Request, Response } from 'express';
import { generateAgoraToken } from '../integrations/agora/token.js';
import { inviteAgoraAgent, getCompanyAgentConfig } from '../integrations/agora/agent.js';

export async function handleGenerateToken(req: Request, res: Response) {
  try {
    const channel = req.body?.channel || req.body?.channelName || req.body?.channel_name || req.query?.channel;
    const uid = req.body?.uid || req.query?.uid || 0;
    const role = req.body?.role || req.query?.role || 'publisher';
    if (!channel) {
      return res.status(400).json({ success: false, error: 'channel name is required' });
    }
    const tokenData = generateAgoraToken(String(channel), Number(uid) || 0, String(role) as any);
    return res.json({ success: true, ...tokenData });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function handleInviteAgent(req: Request, res: Response) {
  try {
    const targetChannel = req.body?.channel || req.body?.channelName || req.body?.channel_name;
    const targetCompanyId = req.body?.companyId || req.body?.company_id;
    if (!targetCompanyId) {
      return res.status(400).json({ success: false, error: 'companyId is required' });
    }
    if (!targetChannel) {
      return res.status(400).json({ success: false, error: 'channel name is required' });
    }
    const result = await inviteAgoraAgent(targetChannel, targetCompanyId);
    return res.json({ ...result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function handleGetAgentPrompt(req: Request, res: Response) {
  try {
    const companyId = String(req.params.companyId);
    const config = await getCompanyAgentConfig(companyId);
    return res.json({ success: true, ...config });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function handleAgoraWebhook(req: Request, res: Response) {
  try {
    console.log('[Agora Webhook Event]', req.body);
    return res.json({ success: true, received: true });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}
