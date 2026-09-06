import { Request, Response } from 'express';
import { processRefund, lookupStatus } from '../services/actionService.js';
import { analyzeSentimentAndEmotion } from '../services/analyzeService.js';

export async function handleRefund(req: Request, res: Response) {
  try {
    const { companyId, orderId, amount, reason, customerPhone } = req.body;
    const result = await processRefund(companyId, {
      orderId,
      amount: Number(amount),
      reason,
      customerPhone,
    });
    return res.json({ success: true, ...result });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export async function handleLookup(req: Request, res: Response) {
  try {
    const { companyId, referenceId, type } = req.body;
    const result = await lookupStatus(companyId, {
      referenceId,
      type,
    });
    return res.json({ success: true, ...result });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export async function handleAnalyze(req: Request, res: Response) {
  try {
    const { transcript } = req.body;
    const result = analyzeSentimentAndEmotion(transcript || '');
    return res.json({ success: true, ...result });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}
