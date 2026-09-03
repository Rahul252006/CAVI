import { Request, Response } from 'express';
import { mongoGetCompanyBySupportPhone } from '../integrations/mongodb/models.js';
import { startCall } from '../services/callService.js';

export async function handleTelephonyInbound(req: Request, res: Response) {
  try {
    const { To, From, CallSid } = req.body;
    const supportPhone = To || req.query.To;
    const callerPhone = From || req.query.From;

    console.log(`[Telephony Inbound] Call from ${callerPhone} to ${supportPhone} (SID: ${CallSid})`);

    const company = await mongoGetCompanyBySupportPhone(String(supportPhone));
    if (!company) {
      return res.status(404).json({
        success: false,
        error: `No registered company for phone ${supportPhone}`,
      });
    }

    const callData = await startCall({
      phone: String(supportPhone),
      callerNumber: String(callerPhone),
    });

    return res.json({
      success: true,
      ...callData,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function handleTelephonyOutbound(req: Request, res: Response) {
  try {
    const { companyId, targetPhone, officerId } = req.body;
    return res.json({
      success: true,
      message: `Outbound call initiated to ${targetPhone}`,
      officerId,
      companyId,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export async function handleTelephonyStatus(req: Request, res: Response) {
  try {
    console.log('[Telephony Status]', req.body);
    return res.json({ success: true, received: true });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}
