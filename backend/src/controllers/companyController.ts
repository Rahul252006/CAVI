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
import {
  mongoSaveCompany,
  mongoSaveBrainConfig,
  mongoSaveKnowledgeDoc,
  mongoSaveAgent,
  mongoGetCompany,
  mongoGetKnowledgeDocs,
  mongoGetKnowledgeGaps,
  mongoDeleteKnowledgeGap,
  mongoGetAgentsByCompany,
  mongoGetCallsByCompany,
  mongoGetAllCompanies,
  mongoClearAllDatabaseData,
} from '../integrations/mongodb/models.js';
import type { CompanyRecord, BrainConfig } from '../types/index.js';

function sanitizePublicCompany(company: CompanyRecord | null) {
  if (!company) return null;
  const { adminEmail, adminName, ...publicCompany } = company;
  return publicCompany;
}

export async function handleGetCompanies(req: Request, res: Response) {
  try {
    const { phone } = req.query;
    if (phone && typeof phone === 'string') {
      const company = await getCompanyByPhone(phone);
      return res.json({ success: true, company: sanitizePublicCompany(company) });
    }
    const companies = await getAllCompanies();
    const publicCompanies = companies.map(sanitizePublicCompany);
    return res.json({ success: true, companies: publicCompanies });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function handleGetCompanyById(req: Request, res: Response) {
  try {
    const company = await getCompany(String(req.params.companyId));
    if (!company) return res.status(404).json({ success: false, error: 'Company not found' });
    return res.json({ success: true, company: sanitizePublicCompany(company) });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function handleRegisterCompany(req: Request, res: Response) {
  try {
    const body = req.body;
    const adminEmail = (body.adminEmail || body.email || '').trim().toLowerCase();

    // 1. Fetch existing Company record by companyId or adminEmail to prevent duplicates
    let companyId = body.companyId || req.query.companyId || req.query.companyid;
    let existingCompany = companyId ? await mongoGetCompany(String(companyId)) : null;

    if (!existingCompany && adminEmail) {
      const allComps = await mongoGetAllCompanies();
      existingCompany = allComps.find((c) => c.adminEmail?.toLowerCase() === adminEmail) || null;
      if (existingCompany) companyId = existingCompany.id;
    }

    if (!companyId) {
      companyId = `comp_${Date.now()}`;
    }

    const company: CompanyRecord = {
      id: String(companyId),
      name: body.name || body.companyName || existingCompany?.name || 'My Company',
      legalName: body.legalName || body.name || existingCompany?.legalName || 'Registered Entity',
      industry: body.industry || existingCompany?.industry || 'Fintech & Digital Payments',
      website: body.website || existingCompany?.website || '',
      description: body.tagline || body.description || existingCompany?.description || 'Autonomous Multilingual Support Engine',
      tagline: body.tagline || existingCompany?.tagline || 'Autonomous Multilingual Support Engine',
      country: body.country || existingCompany?.country || 'India',
      city: body.city || existingCompany?.city || 'Bengaluru',
      timezone: body.timezone || existingCompany?.timezone || 'Asia/Kolkata (GMT+5:30)',
      supportPhone: (body.supportPhone && body.supportPhone.trim() && !body.supportPhone.includes('9182010151')) ? body.supportPhone.trim() : existingCompany?.supportPhone || '',
      adminMobile: body.adminMobile || body.mobile || existingCompany?.adminMobile || '',
      phoneType: body.phoneType || existingCompany?.phoneType || 'PSTN',
      businessHours: body.businessHours || existingCompany?.businessHours || '24/7 Live Voice AI Operations',
      adminEmail: adminEmail || existingCompany?.adminEmail || '',
      adminName: body.adminName || existingCompany?.adminName || 'Company Admin',
      createdAt: existingCompany?.createdAt || new Date().toISOString(),
      status: 'active',
      plan: (body.plan || existingCompany?.plan || 'growth').toLowerCase() as any,
    };

    await mongoSaveCompany(company);

    // 2. Save / Update Company Brain Config
    const brainConfig: BrainConfig = {
      companyId: company.id,
      agentName: body.aiAgentName || `${company.name} Specialist`,
      tone: body.tone || 'empathetic',
      primaryLanguage: body.primaryLanguage || 'undetermined',
      allowCodeSwitching: true,
      allowedActions: body.allowedActions || ['check_status', 'lookup_customer', 'create_ticket', 'escalate_to_human'],
      maxRefundAmount: body.maxRefundAmount || 0,
      requireHumanApproval: true,
      escalationThreshold: 0.65,
      customInstructions: body.welcomeMessage || `Welcome to ${company.name} customer support. How can I assist with your account or order today?`,
    };
    await mongoSaveBrainConfig(brainConfig);

    // 3. Save Knowledge Doc (SOP / Policy)
    if (body.initialSopTitle && body.initialSopContent) {
      await mongoSaveKnowledgeDoc({
        id: `doc_${Date.now()}`,
        companyId: company.id,
        title: body.initialSopTitle.trim(),
        content: body.initialSopContent.trim(),
        type: 'policy',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // 4. Save Invited Support Officer / Agent
    if (body.initialAgentName && body.initialAgentEmail) {
      await mongoSaveAgent({
        id: `agent_${Date.now()}`,
        companyId: company.id,
        name: body.initialAgentName?.trim() || 'Support Specialist',
        email: (body.initialAgentEmail || '').trim().toLowerCase(),
        phone: body.initialAgentPhone || '',
        department: body.initialAgentDepartment || 'Payments & Refunds',
        role: 'specialist',
        status: 'available',
        activeCallId: null,
        createdAt: new Date().toISOString(),
      });
    }

    return res.status(201).json({
      success: true,
      company,
      dashboardUrl: `/admin?companyId=${company.id}`,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export async function handleGetBrain(req: Request, res: Response) {
  try {
    const companyId = String(req.params.companyId || req.query.companyId || req.query.companyid || '');
    if (!companyId) return res.status(400).json({ success: false, error: 'companyId is required' });
    const brain = await getBrain(companyId);
    return res.json({ success: true, ...brain });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function handleUpdateBrainConfig(req: Request, res: Response) {
  try {
    const companyId = String(req.params.companyId || req.body.companyId || req.query.companyId || '');
    if (!companyId) return res.status(400).json({ success: false, error: 'companyId is required' });
    const brain = await updateBrainConfig(companyId, req.body);
    return res.json({ success: true, brain });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export async function handleGetKnowledgeDocs(req: Request, res: Response) {
  try {
    const companyId = String(req.params.companyId || req.query.companyId || req.query.companyid || '');
    if (!companyId) return res.status(400).json({ success: false, error: 'companyId is required' });
    const docs = await mongoGetKnowledgeDocs(companyId);
    return res.json({ success: true, docs, knowledge: docs });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function handleAddKnowledge(req: Request, res: Response) {
  try {
    const companyId = String(req.params.companyId || req.body.companyId || req.query.companyId || '');
    if (!companyId) return res.status(400).json({ success: false, error: 'companyId is required' });
    const doc = await addKnowledgeDoc(companyId, req.body);
    return res.status(201).json({ success: true, doc, knowledge: doc });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export async function handleDeleteKnowledge(req: Request, res: Response) {
  try {
    const id = String(req.params.id || req.query.id || '');
    if (!id) return res.status(400).json({ success: false, error: 'Document ID is required' });
    const success = await deleteKnowledgeDoc(id);
    return res.json({ success });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export async function handleUpdateCompanyOverview(req: Request, res: Response) {
  try {
    const { companyId, isActive, ...rest } = req.body;
    const cid = String(companyId || req.query.companyId || req.params.companyId || '');
    if (!cid) return res.status(400).json({ success: false, error: 'companyId is required' });
    const updated = await updateCompany(cid, { isActive, ...rest });
    return res.json({ success: true, company: updated });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export async function handleSaveTool(req: Request, res: Response) {
  try {
    const companyId = String(req.params.companyId || req.body.companyId || req.query.companyId || '');
    if (!companyId) return res.status(400).json({ success: false, error: 'companyId is required' });
    const tool = await saveToolConfig(companyId, req.body);
    return res.json({ success: true, tool });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export async function handleGetCompanyOverview(req: Request, res: Response) {
  try {
    const rawCid = req.params.companyId || req.query.companyId || req.query.companyid;
    let allCompanies = await mongoGetAllCompanies();

    // If no companies exist in database yet, initialize a seed company so admin/preview is never blank
    if (allCompanies.length === 0) {
      const defaultComp: CompanyRecord = {
        id: 'comp_default',
        name: 'PayFast Global',
        legalName: 'PayFast Solutions Private Limited',
        industry: 'Fintech & Digital Payments',
        website: 'https://payfast.demo',
        description: 'Autonomous 24/7 Voice Support Intelligence Engine',
        tagline: 'Autonomous 24/7 Voice Support Intelligence Engine',
        country: 'India',
        city: 'Bengaluru',
        timezone: 'Asia/Kolkata (GMT+5:30)',
        supportPhone: '+91 80 4729 0100',
        adminMobile: '+91 98765 43210',
        phoneType: 'PSTN',
        businessHours: '24/7 Live Voice AI Operations',
        adminEmail: 'admin@payfast.demo',
        adminName: 'Sanjay Verma',
        createdAt: new Date().toISOString(),
        status: 'active',
        plan: 'growth',
        isActive: true,
      };
      await mongoSaveCompany(defaultComp);
      allCompanies = [defaultComp];
    }

    const companyId = rawCid ? String(rawCid) : (allCompanies[0]?.id || '');
    const overview = await getCompanyOverview(companyId);
    const activeCompany = overview.company || allCompanies.find(c => c.id === companyId) || allCompanies[0];
    const targetCid = activeCompany?.id || companyId;

    const knowledgeDocs = await mongoGetKnowledgeDocs(targetCid);
    const callsList = await mongoGetCallsByCompany(targetCid);
    const officersList = await mongoGetAgentsByCompany(targetCid);

    const stats = {
      totalCalls: callsList.length,
      totalMinutes: callsList.reduce((acc, c) => acc + Math.ceil((c.durationSeconds || 0) / 60), 0),
      escalatedCalls: callsList.filter(c => (c.status as string) === 'escalated' || (c.status as string) === 'escalated_to_human').length,
      resolutionRate: callsList.length ? Math.round(((callsList.length - callsList.filter(c => (c.status as string) === 'escalated').length) / callsList.length) * 100) : 100,
      activeOfficersCount: officersList.filter(o => o.status !== 'removed').length,
      knowledgeDocsCount: knowledgeDocs.length,
    };

    return res.json({
      success: true,
      companies: allCompanies,
      selectedCompany: activeCompany,
      company: activeCompany,
      brain: overview.brain,
      docs: knowledgeDocs.length,
      knowledge: knowledgeDocs,
      officers: officersList,
      agents: officersList,
      stats,
      recentCalls: callsList,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function handleGetBillingInvoices(req: Request, res: Response) {
  try {
    const rawCid = req.params.companyId || req.query.companyId || req.query.companyid;
    const companyId = rawCid ? String(rawCid) : '';
    if (!companyId) return res.json({ success: true, invoices: [] });
    const company = await mongoGetCompany(companyId);
    const callsList = await mongoGetCallsByCompany(companyId);

    // Compute dynamic billing invoice from actual call usage if calls exist
    const totalMinutes = callsList.reduce((acc, c) => acc + Math.ceil((c.durationSeconds || 0) / 60), 0);
    const invoices = totalMinutes > 0 ? [
      {
        id: `inv_${Date.now()}`,
        invoiceNumber: `INV-${new Date().getFullYear()}-0001`,
        companyId: companyId,
        companyName: company?.name || 'Customer Support Care',
        billingPeriod: `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`,
        minutesUsed: totalMinutes,
        ratePerMinute: 0.15,
        subtotal: parseFloat((totalMinutes * 0.15).toFixed(2)),
        tax: parseFloat((totalMinutes * 0.15 * 0.18).toFixed(2)),
        totalAmount: parseFloat((totalMinutes * 0.15 * 1.18).toFixed(2)),
        status: 'pending',
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
        paidAt: null,
        pdfUrl: '#',
      }
    ] : [];

    return res.json({ success: true, invoices });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function handleClearDatabase(req: Request, res: Response) {
  try {
    const success = await mongoClearAllDatabaseData();
    return res.json({ success, message: 'All test and mock data cleared from database.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function handleGetKnowledgeGaps(req: Request, res: Response) {
  try {
    const companyId = String(req.params.companyId || req.query.companyId || req.query.companyid || '');
    if (!companyId) return res.status(400).json({ success: false, error: 'companyId is required' });
    const gaps = await mongoGetKnowledgeGaps(companyId);
    return res.json({ success: true, gaps, knowledgeGaps: gaps });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function handleDeleteKnowledgeGap(req: Request, res: Response) {
  try {
    const id = String(req.params.id || req.query.id);
    const success = await mongoDeleteKnowledgeGap(id);
    return res.json({ success });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
