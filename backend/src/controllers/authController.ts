import { Request, Response } from 'express';
import { adminSignup, adminLogin, agentRegister, agentLogin, agentUpdate, agentRemove } from '../services/authService.js';
import { mongoGetAgentsByCompany } from '../integrations/mongodb/models.js';

export async function handleAdminSignup(req: Request, res: Response) {
  try {
    const result = await adminSignup(req.body);
    return res.status(201).json({ success: true, ...result });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export async function handleAdminLogin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const admin = await adminLogin(email, password);
    return res.json({
      success: true,
      admin,
      company: { id: admin.companyId },
    });
  } catch (err: any) {
    return res.status(401).json({ success: false, error: err.message });
  }
}

export async function handleAgentRegister(req: Request, res: Response) {
  try {
    if (req.method === 'GET') {
      const companyId = String(req.query.companyId || req.query.companyid || '');
      if (!companyId) return res.json({ success: true, agents: [], officers: [] });
      const includeRemoved = req.query.includeRemoved === 'true';
      const agents = await mongoGetAgentsByCompany(companyId, includeRemoved);
      return res.json({ success: true, agents, officers: agents });
    }
    const agent = await agentRegister(req.body);
    return res.status(201).json({ success: true, agent });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export async function handleUpdateAgent(req: Request, res: Response) {
  try {
    const agentId = String(req.params.agentId || req.body.id || req.body.agentId);
    const updated = await agentUpdate(agentId, req.body);
    return res.json({ success: true, agent: updated });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export async function handleRemoveAgent(req: Request, res: Response) {
  try {
    const agentId = String(req.params.agentId || req.body.id || req.body.agentId);
    const removalReason = String(req.body.removalReason || req.body.reason || 'Removed by Admin');
    const removed = await agentRemove(agentId, removalReason);
    return res.json({ success: true, agent: removed });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export async function handleAgentLogin(req: Request, res: Response) {
  try {
    const { email } = req.body;
    const agent = await agentLogin(email);
    return res.json({
      success: true,
      agent,
      company: { id: agent.companyId },
    });
  } catch (err: any) {
    return res.status(401).json({ success: false, error: err.message });
  }
}
