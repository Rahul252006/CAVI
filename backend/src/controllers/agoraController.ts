import { Request, Response } from 'express';
import { generateAgoraToken } from '../integrations/agora/token.js';
import { inviteAgoraAgent, getCompanyAgentConfig } from '../integrations/agora/agent.js';

export async function handleGenerateToken(req: Request, res: Response) {
  try {
    const { channel, uid, role } = req.body;
    if (!channel) {
      return res.status(400).json({ success: false, error: 'channel name is required' });
    }
    const tokenData = generateAgoraToken(channel, uid || 0, role || 'publisher');
    return res.json({ success: true, ...tokenData });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export async function handleInviteAgent(req: Request, res: Response) {
  try {
    const { channel, companyId, channelName } = req.body;
    const targetChannel = channel || channelName;
    if (!targetChannel) {
      return res.status(400).json({ success: false, error: 'channel name is required' });
    }
    const result = await inviteAgoraAgent(targetChannel, companyId || 'company_default');
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
