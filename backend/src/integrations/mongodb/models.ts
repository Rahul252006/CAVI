import { Collection, Document } from 'mongodb';
import { getMongoDb } from './client.js';
import type {
  CompanyRecord,
  CompanyAdmin,
  BrainConfig,
  KnowledgeDoc,
  HumanAgent,
  CallRecord,
  ToolConfig,
  CaseDNA,
} from '../../types/index.js';

// In-Memory Fallback Storage (Prevents 500 Internal Server Errors when DB is connecting or offline)
const defaultCompany: CompanyRecord = {
  id: 'comp_default',
  name: 'CAVI Enterprise Care',
  industry: 'Technology & E-Commerce',
  supportPhone: '+919876543210',
  adminEmail: 'admin@cavi.ai',
  adminName: 'Rahul Simhadri',
  createdAt: new Date().toISOString(),
  status: 'active',
  plan: 'enterprise',
};

const defaultBrain: BrainConfig = {
  companyId: 'comp_default',
  agentName: 'CAVI Support Assistant',
  tone: 'empathetic',
  primaryLanguage: 'English',
  allowCodeSwitching: true,
  allowedActions: ['refund', 'lookup_status', 'reschedule'],
  maxRefundAmount: 500,
  requireHumanApproval: true,
  escalationThreshold: 0.65,
  customInstructions: 'Help customers resolve orders and bookings with zero repeated stories.',
};

const inMemoryStore = {
  companies: new Map<string, CompanyRecord>([['comp_default', defaultCompany]]),
  admins: new Map<string, CompanyAdmin>(),
  brainConfigs: new Map<string, BrainConfig>([['comp_default', defaultBrain]]),
  knowledge: new Map<string, KnowledgeDoc>(),
  agents: new Map<string, HumanAgent>(),
  calls: new Map<string, CallRecord>(),
  tools: new Map<string, ToolConfig>(),
  cases: new Map<string, CaseDNA>(),
};

export async function getCollection<T extends Document>(name: string): Promise<Collection<T> | null> {
  try {
    const db = await getMongoDb();
    return db.collection<T>(name);
  } catch (err) {
    console.warn(`[MongoDB Warning] Operating in-memory for collection '${name}' (${(err as Error).message})`);
    return null;
  }
}

// 1. Companies Collection
export async function mongoGetCompany(id: string): Promise<CompanyRecord | null> {
  const col = await getCollection<CompanyRecord & Document>('companies');
  if (col) {
    try {
      const doc = await col.findOne({ id });
      if (doc) {
        const { _id, ...rest } = doc as any;
        return rest as CompanyRecord;
      }
    } catch (err) {
      console.warn('[MongoDB Fallback] Falling back to memory for mongoGetCompany');
    }
  }
  return inMemoryStore.companies.get(id) || inMemoryStore.companies.get('comp_default') || null;
}

export async function mongoGetCompanyBySupportPhone(supportPhone: string): Promise<CompanyRecord | null> {
  const col = await getCollection<CompanyRecord & Document>('companies');
  const normalized = supportPhone.replace(/\D/g, '');
  if (col) {
    try {
      const doc = await col.findOne({
        $or: [
          { supportPhone },
          { supportPhone: normalized },
          { supportPhone: `+${normalized}` },
          { supportPhone: { $regex: normalized.slice(-10) } },
        ],
      });
      if (doc) {
        const { _id, ...rest } = doc as any;
        return rest as CompanyRecord;
      }
    } catch (err) {
      console.warn('[MongoDB Fallback] Falling back to memory for phone lookup');
    }
  }

  for (const comp of inMemoryStore.companies.values()) {
    const cleanCompPhone = comp.supportPhone.replace(/\D/g, '');
    if (cleanCompPhone === normalized || normalized.endsWith(cleanCompPhone) || cleanCompPhone.endsWith(normalized)) {
      return comp;
    }
  }
  return defaultCompany;
}

export async function mongoGetAllCompanies(): Promise<CompanyRecord[]> {
  const col = await getCollection<CompanyRecord & Document>('companies');
  if (col) {
    try {
      const docs = await col.find({}).toArray();
      if (docs.length) {
        return docs.map((d: any) => {
          const { _id, ...rest } = d;
          return rest as CompanyRecord;
        });
      }
    } catch (err) {
      console.warn('[MongoDB Fallback] Falling back to memory for mongoGetAllCompanies');
    }
  }
  return Array.from(inMemoryStore.companies.values());
}

export async function mongoSaveCompany(company: CompanyRecord): Promise<CompanyRecord> {
  inMemoryStore.companies.set(company.id, company);
  const col = await getCollection<CompanyRecord & Document>('companies');
  if (col) {
    try {
      await col.updateOne({ id: company.id }, { $set: company }, { upsert: true });
    } catch (err) {
      console.warn('[MongoDB Warning] Failed to persist company to MongoDB');
    }
  }
  return company;
}

// 2. Company Admins Collection
export async function mongoGetAdminByEmail(email: string): Promise<CompanyAdmin | null> {
  const col = await getCollection<CompanyAdmin & Document>('company_admins');
  const lower = email.toLowerCase();
  if (col) {
    try {
      const doc = await col.findOne({ email: lower });
      if (doc) {
        const { _id, ...rest } = doc as any;
        return rest as CompanyAdmin;
      }
    } catch (err) {
      console.warn('[MongoDB Fallback] Falling back to memory for mongoGetAdminByEmail');
    }
  }
  for (const admin of inMemoryStore.admins.values()) {
    if (admin.email.toLowerCase() === lower) return admin;
  }
  return null;
}

export async function mongoSaveAdmin(admin: CompanyAdmin): Promise<CompanyAdmin> {
  inMemoryStore.admins.set(admin.id, admin);
  const col = await getCollection<CompanyAdmin & Document>('company_admins');
  if (col) {
    try {
      await col.updateOne({ id: admin.id }, { $set: { ...admin, email: admin.email.toLowerCase() } }, { upsert: true });
    } catch (err) {
      console.warn('[MongoDB Warning] Failed to persist admin to MongoDB');
    }
  }
  return admin;
}

// 3. Brain Configs Collection
export async function mongoGetBrainConfig(companyId: string): Promise<BrainConfig | null> {
  const col = await getCollection<BrainConfig & Document>('brain_configs');
  if (col) {
    try {
      const doc = await col.findOne({ companyId });
      if (doc) {
        const { _id, ...rest } = doc as any;
        return rest as BrainConfig;
      }
    } catch (err) {
      console.warn('[MongoDB Fallback] Falling back to memory for mongoGetBrainConfig');
    }
  }
  return inMemoryStore.brainConfigs.get(companyId) || defaultBrain;
}

export async function mongoSaveBrainConfig(config: BrainConfig): Promise<BrainConfig> {
  inMemoryStore.brainConfigs.set(config.companyId, config);
  const col = await getCollection<BrainConfig & Document>('brain_configs');
  if (col) {
    try {
      await col.updateOne({ companyId: config.companyId }, { $set: config }, { upsert: true });
    } catch (err) {
      console.warn('[MongoDB Warning] Failed to persist brain config to MongoDB');
    }
  }
  return config;
}

// 4. Knowledge Docs Collection
export async function mongoGetKnowledgeDocs(companyId: string): Promise<KnowledgeDoc[]> {
  const col = await getCollection<KnowledgeDoc & Document>('knowledge_docs');
  if (col) {
    try {
      const docs = await col.find({ companyId }).toArray();
      if (docs.length) {
        return docs.map((d: any) => {
          const { _id, ...rest } = d;
          return rest as KnowledgeDoc;
        });
      }
    } catch (err) {
      console.warn('[MongoDB Fallback] Falling back to memory for mongoGetKnowledgeDocs');
    }
  }
  return Array.from(inMemoryStore.knowledge.values()).filter((d) => d.companyId === companyId);
}

export async function mongoSaveKnowledgeDoc(doc: KnowledgeDoc): Promise<KnowledgeDoc> {
  inMemoryStore.knowledge.set(doc.id, doc);
  const col = await getCollection<KnowledgeDoc & Document>('knowledge_docs');
  if (col) {
    try {
      await col.updateOne({ id: doc.id }, { $set: doc }, { upsert: true });
    } catch (err) {
      console.warn('[MongoDB Warning] Failed to persist knowledge doc to MongoDB');
    }
  }
  return doc;
}

export async function mongoDeleteKnowledgeDoc(id: string): Promise<boolean> {
  inMemoryStore.knowledge.delete(id);
  const col = await getCollection<KnowledgeDoc & Document>('knowledge_docs');
  if (col) {
    try {
      const result = await col.deleteOne({ id });
      return result.deletedCount > 0;
    } catch (err) {
      console.warn('[MongoDB Warning] Failed to delete knowledge doc from MongoDB');
    }
  }
  return true;
}

// 5. Human Agents (Officers) Collection
export async function mongoGetAgentByEmail(email: string): Promise<HumanAgent | null> {
  const col = await getCollection<HumanAgent & Document>('human_agents');
  const lower = email.toLowerCase();
  if (col) {
    try {
      const doc = await col.findOne({ email: lower });
      if (doc) {
        const { _id, ...rest } = doc as any;
        return rest as HumanAgent;
      }
    } catch (err) {
      console.warn('[MongoDB Fallback] Falling back to memory for mongoGetAgentByEmail');
    }
  }
  for (const agent of inMemoryStore.agents.values()) {
    if (agent.email.toLowerCase() === lower) return agent;
  }
  return null;
}

export async function mongoGetAgentsByCompany(companyId: string): Promise<HumanAgent[]> {
  const col = await getCollection<HumanAgent & Document>('human_agents');
  if (col) {
    try {
      const docs = await col.find({ companyId }).toArray();
      if (docs.length) {
        return docs.map((d: any) => {
          const { _id, ...rest } = d;
          return rest as HumanAgent;
        });
      }
    } catch (err) {
      console.warn('[MongoDB Fallback] Falling back to memory for mongoGetAgentsByCompany');
    }
  }
  return Array.from(inMemoryStore.agents.values()).filter((a) => a.companyId === companyId);
}

export async function mongoSaveAgent(agent: HumanAgent): Promise<HumanAgent> {
  inMemoryStore.agents.set(agent.id, agent);
  const col = await getCollection<HumanAgent & Document>('human_agents');
  if (col) {
    try {
      await col.updateOne({ id: agent.id }, { $set: { ...agent, email: agent.email.toLowerCase() } }, { upsert: true });
    } catch (err) {
      console.warn('[MongoDB Warning] Failed to persist agent to MongoDB');
    }
  }
  return agent;
}

// 6. Call Records Collection
export async function mongoGetCall(id: string): Promise<CallRecord | null> {
  const col = await getCollection<CallRecord & Document>('call_records');
  if (col) {
    try {
      const doc = await col.findOne({ id });
      if (doc) {
        const { _id, ...rest } = doc as any;
        return rest as CallRecord;
      }
    } catch (err) {
      console.warn('[MongoDB Fallback] Falling back to memory for mongoGetCall');
    }
  }
  return inMemoryStore.calls.get(id) || null;
}

export async function mongoGetCallsByCompany(companyId: string): Promise<CallRecord[]> {
  const col = await getCollection<CallRecord & Document>('call_records');
  if (col) {
    try {
      const docs = await col.find({ companyId }).sort({ startedAt: -1 }).toArray();
      if (docs.length) {
        return docs.map((d: any) => {
          const { _id, ...rest } = d;
          return rest as CallRecord;
        });
      }
    } catch (err) {
      console.warn('[MongoDB Fallback] Falling back to memory for mongoGetCallsByCompany');
    }
  }
  return Array.from(inMemoryStore.calls.values()).filter((c) => c.companyId === companyId);
}

export async function mongoSaveCall(call: CallRecord): Promise<CallRecord> {
  inMemoryStore.calls.set(call.id, call);
  const col = await getCollection<CallRecord & Document>('call_records');
  if (col) {
    try {
      await col.updateOne({ id: call.id }, { $set: call }, { upsert: true });
    } catch (err) {
      console.warn('[MongoDB Warning] Failed to persist call to MongoDB');
    }
  }
  return call;
}

// 7. Tool Configs Collection
export async function mongoGetToolsByCompany(companyId: string): Promise<ToolConfig[]> {
  const col = await getCollection<ToolConfig & Document>('tool_configs');
  if (col) {
    try {
      const docs = await col.find({ companyId }).toArray();
      if (docs.length) {
        return docs.map((d: any) => {
          const { _id, ...rest } = d;
          return rest as ToolConfig;
        });
      }
    } catch (err) {
      console.warn('[MongoDB Fallback] Falling back to memory for mongoGetToolsByCompany');
    }
  }
  return Array.from(inMemoryStore.tools.values()).filter((t) => t.companyId === companyId);
}

export async function mongoSaveTool(tool: ToolConfig): Promise<ToolConfig> {
  inMemoryStore.tools.set(tool.id, tool);
  const col = await getCollection<ToolConfig & Document>('tool_configs');
  if (col) {
    try {
      await col.updateOne({ id: tool.id }, { $set: tool }, { upsert: true });
    } catch (err) {
      console.warn('[MongoDB Warning] Failed to persist tool to MongoDB');
    }
  }
  return tool;
}

// 8. Cases Collection
export async function mongoGetCases(companyId?: string): Promise<CaseDNA[]> {
  const col = await getCollection<CaseDNA & Document>('cases');
  if (col) {
    try {
      const query = companyId ? { companyId } : {};
      const docs = await col.find(query).sort({ updatedAt: -1 }).toArray();
      if (docs.length) {
        return docs.map((d: any) => {
          const { _id, ...rest } = d;
          return rest as CaseDNA;
        });
      }
    } catch (err) {
      console.warn('[MongoDB Fallback] Falling back to memory for mongoGetCases');
    }
  }
  return Array.from(inMemoryStore.cases.values()).filter((c) => !companyId || c.companyId === companyId);
}

export async function mongoGetCase(id: string): Promise<CaseDNA | null> {
  const col = await getCollection<CaseDNA & Document>('cases');
  if (col) {
    try {
      const doc = await col.findOne({ $or: [{ id }, { caseId: id }] });
      if (doc) {
        const { _id, ...rest } = doc as any;
        return rest as CaseDNA;
      }
    } catch (err) {
      console.warn('[MongoDB Fallback] Falling back to memory for mongoGetCase');
    }
  }
  return inMemoryStore.cases.get(id) || null;
}

export async function mongoSaveCase(caseDna: CaseDNA): Promise<CaseDNA> {
  inMemoryStore.cases.set(caseDna.id, caseDna);
  inMemoryStore.cases.set(caseDna.caseId, caseDna);
  const col = await getCollection<CaseDNA & Document>('cases');
  if (col) {
    try {
      await col.updateOne({ id: caseDna.id }, { $set: caseDna }, { upsert: true });
    } catch (err) {
      console.warn('[MongoDB Warning] Failed to persist case to MongoDB');
    }
  }
  return caseDna;
}
