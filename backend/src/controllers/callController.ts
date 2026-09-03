import { Request, Response } from 'express';
import { startCall, getCall, getCompanyCalls, updateCall } from '../services/callService.js';

export async function handleStartCall(req: Request, res: Response) {
  try {
    const { phone, callerNumber, callerName } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, error: 'Phone number is required' });
    }
    const result = await startCall({ phone, callerNumber, callerName });
    return res.json({ success: true, ...result });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export async function handleGetCallById(req: Request, res: Response) {
  try {
    const call = await getCall(String(req.params.callId));
    if (!call) return res.status(404).json({ success: false, error: 'Call not found' });
    return res.json({ success: true, call });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function handleGetCompanyCalls(req: Request, res: Response) {
  try {
    const { companyId } = req.query;
    if (!companyId || typeof companyId !== 'string') {
      return res.status(400).json({ success: false, error: 'companyId query param is required' });
    }
    const calls = await getCompanyCalls(companyId);
    return res.json({ success: true, calls });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function handleUpdateCall(req: Request, res: Response) {
  try {
    const call = await updateCall(String(req.params.callId), req.body);
    return res.json({ success: true, call });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}
