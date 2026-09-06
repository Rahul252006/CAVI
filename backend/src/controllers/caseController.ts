import { Request, Response } from 'express';
import { getCases, getCase, createCaseDNA, updateCase } from '../services/caseService.js';

export async function handleGetCases(req: Request, res: Response) {
  try {
    const { companyId } = req.query;
    const cleanCompId =
      typeof companyId === 'string' && companyId.trim() && companyId !== 'undefined' && companyId !== 'null'
        ? companyId.trim()
        : undefined;
    const cases = await getCases(cleanCompId);
    return res.json({ success: true, cases });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function handleGetCaseById(req: Request, res: Response) {
  try {
    const caseItem = await getCase(String(req.params.caseId));
    if (!caseItem) return res.status(404).json({ success: false, error: 'Case not found' });
    return res.json({ success: true, case: caseItem });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function handleCreateCase(req: Request, res: Response) {
  try {
    const caseDNA = await createCaseDNA(req.body);
    return res.status(201).json({ success: true, case: caseDNA });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export async function handleUpdateCase(req: Request, res: Response) {
  try {
    const updated = await updateCase(String(req.params.caseId), req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Case not found' });
    return res.json({ success: true, case: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

