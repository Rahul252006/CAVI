import { Request, Response } from 'express';
import {
  getCompany,
  getCompanyByPhone,
  getAllCompanies,
  updateCompany,
  getBrain,
  updateBrainConfig,
  addKnowledgeDoc,
  deleteKnowledgeDoc,
  saveToolConfig,
  getCompanyOverview,
} from '../services/companyService.js';
import { mongoSaveCompany } from '../integrations/mongodb/models.js';

export async function handleGetCompanies(req: Request, res: Response) {
  try {
    const { phone } = req.query;
    if (phone && typeof phone === 'string') {
      const company = await getCompanyByPhone(phone);
      return res.json({ success: true, company });
    }
    const companies = await getAllCompanies();
    return res.json({ success: true, companies });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function handleGetCompanyById(req: Request, res: Response) {
  try {
    const company = await getCompany(String(req.params.companyId));
    if (!company) return res.status(404).json({ success: false, error: 'Company not found' });
    return res.json({ success: true, company });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function handleRegisterCompany(req: Request, res: Response) {
  try {
    const { name, industry, supportPhone, adminEmail, adminName } = req.body;
    const company = {
      id: `comp_${Date.now()}`,
      name: name || 'New Company',
      industry: industry || 'Technology',
      supportPhone: supportPhone || '+919876543210',
      adminEmail: adminEmail || 'admin@example.com',
      adminName: adminName || 'Admin',
      createdAt: new Date().toISOString(),
      status: 'active' as const,
      plan: 'growth' as const,
    };
    await mongoSaveCompany(company);
    return res.status(201).json({ success: true, company });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export async function handleGetBrain(req: Request, res: Response) {
  try {
    const brain = await getBrain(String(req.params.companyId));
    return res.json({ success: true, ...brain });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function handleUpdateBrainConfig(req: Request, res: Response) {
  try {
    const brain = await updateBrainConfig(String(req.params.companyId), req.body);
    return res.json({ success: true, brain });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export async function handleAddKnowledge(req: Request, res: Response) {
  try {
    const doc = await addKnowledgeDoc(String(req.params.companyId), req.body);
    return res.status(201).json({ success: true, doc });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export async function handleDeleteKnowledge(req: Request, res: Response) {
  try {
    const success = await deleteKnowledgeDoc(String(req.params.id));
    return res.json({ success });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export async function handleSaveTool(req: Request, res: Response) {
  try {
    const tool = await saveToolConfig(String(req.params.companyId), req.body);
    return res.json({ success: true, tool });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export async function handleGetCompanyOverview(req: Request, res: Response) {
  try {
    const overview = await getCompanyOverview(String(req.params.companyId));
    return res.json({ success: true, ...overview });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
