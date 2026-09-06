import { Request, Response } from 'express';
import { startCall, getCall, getCompanyCalls, updateCall } from '../services/callService.js';

export async function handleStartCall(req: Request, res: Response) {
  try {
    const targetPhone = req.body.supportPhone || req.body.phone || req.body.supportNumber;
    const callerNumber = req.body.callerPhone || req.body.callerNumber;
    const callerName = req.body.callerName;

    if (!targetPhone || !callerNumber) {
      return res.status(400).json({
        success: false,
        error: 'supportPhone and callerPhone are required to start a call',
      });
    }

    const result = await startCall({ phone: targetPhone, callerNumber, callerName });
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
    const rawCid = req.query.companyId || req.query.companyid;
    const companyId = rawCid && typeof rawCid === 'string' && rawCid.trim() ? rawCid : undefined;
    const calls = await getCompanyCalls(companyId);
    return res.json({ success: true, calls });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function handleUpdateCall(req: Request, res: Response) {
  try {
    const callId = String(req.params.callId || req.body.callId || req.body.id || '');
    if (!callId) return res.status(400).json({ success: false, error: 'callId is required' });
    const { transcript, transcripts, ...rest } = req.body;
    const turns = Array.isArray(transcripts) ? transcripts : Array.isArray(transcript) ? transcript : undefined;
    const payload: any = { ...rest };
    if (turns) {
      payload.transcript = turns.map((t: any, idx: number) => ({
        id: t.id || `tr_${Date.now()}_${idx}`,
        speaker: (t.speaker === 'agent' || t.role === 'agent' || (t.uid && String(t.uid) === '1000')) ? ('agent' as const) : ('customer' as const),
        text: typeof t.text === 'string' ? t.text : '',
        timestamp: typeof t.timestamp === 'string' ? t.timestamp : new Date(t.timestamp || t._time || Date.now()).toISOString(),
      }));
    }
    const call = await updateCall(callId, payload);
    return res.json({ success: true, call });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export async function handleEndCall(req: Request, res: Response) {
  try {
    const { callId, channel, transcripts, transcript, durationSeconds, status, caseDna, caseDNA } = req.body;
    const cid = String(callId || req.params.callId || req.body.id || '');
    let targetCall = cid ? await getCall(cid) : null;

    if (!targetCall && channel) {
      const allCalls = await getCompanyCalls();
      targetCall = allCalls.find((c) => c.agoraChannel === channel) || null;
    }

    const turns = Array.isArray(transcripts) ? transcripts : Array.isArray(transcript) ? transcript : [];
    const formattedTranscript = turns.map((t: any, idx: number) => ({
      id: t.id || `tr_${Date.now()}_${idx}`,
      speaker: (t.speaker === 'agent' || t.role === 'agent' || (t.uid && String(t.uid) === '1000')) ? ('agent' as const) : ('customer' as const),
      text: typeof t.text === 'string' ? t.text : '',
      timestamp: typeof t.timestamp === 'string' ? t.timestamp : new Date(t.timestamp || t._time || Date.now()).toISOString(),
    }));

    if (targetCall) {
      const updated = await updateCall(targetCall.id, {
        status: status || (targetCall.status === 'active' ? 'completed' : targetCall.status),
        durationSeconds: typeof durationSeconds === 'number' ? durationSeconds : (targetCall.durationSeconds || 1),
        transcript: formattedTranscript.length > 0 ? formattedTranscript : targetCall.transcript,
        caseDNA: caseDna || caseDNA || targetCall.caseDNA,
        endedAt: new Date().toISOString(),
      });
      return res.json({ success: true, call: updated });
    }

    return res.json({ success: true, message: 'Call ended successfully' });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}
