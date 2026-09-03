import { Request, Response } from 'express';
import { adminSignup, adminLogin, agentRegister, agentLogin } from '../services/authService.js';

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
    return res.json({ success: true, admin });
  } catch (err: any) {
    return res.status(401).json({ success: false, error: err.message });
  }
}

export async function handleAgentRegister(req: Request, res: Response) {
  try {
    const agent = await agentRegister(req.body);
    return res.status(201).json({ success: true, agent });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export async function handleAgentLogin(req: Request, res: Response) {
  try {
    const { email } = req.body;
    const agent = await agentLogin(email);
    return res.json({ success: true, agent });
  } catch (err: any) {
    return res.status(401).json({ success: false, error: err.message });
  }
}
