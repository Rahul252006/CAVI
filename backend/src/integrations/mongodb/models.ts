import { Collection, Document } from 'mongodb';
import { getMongoDb } from './client.js';
import type {
  CompanyRecord,
  CompanyAdmin,
  BrainConfig,
  KnowledgeDoc,
  KnowledgeGapRequest,
  HumanAgent,
  CallRecord,
  ToolConfig,
  CaseDNA,
} from '../../types/index.js';

const inMemoryStore = {
  companies: new Map<string, CompanyRecord>(),
  admins: new Map<string, CompanyAdmin>(),
  brainConfigs: new Map<string, BrainConfig>(),
  knowledge: new Map<string, KnowledgeDoc>(),
  knowledgeGaps: new Map<string, KnowledgeGapRequest>(),
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
  return inMemoryStore.companies.get(id) || null;
}

export async function mongoGetCompanyBySupportPhone(supportPhone: string): Promise<CompanyRecord | null> {
  const col = await getCollection<CompanyRecord & Document>('companies');
  const digits = (supportPhone || '').replace(/\D/g, '');
  const last10 = digits.slice(-10);

  if (col) {
    try {
      if (last10) {
        const doc = await col.findOne({
          $or: [
            { supportPhone },
            { supportPhone: { $regex: last10 } },
          ],
        });
        if (doc) {
          const { _id, ...rest } = doc as any;
          return cleanseCompanySupportPhone(rest as CompanyRecord);
        }
      }
    } catch (err) {
      console.warn('[MongoDB Fallback] Falling back to memory for phone lookup');
    }
  }

  const allComps = Array.from(inMemoryStore.companies.values()).map(cleanseCompanySupportPhone);
  return allComps.find((company) => {
    const savedDigits = (company.supportPhone || '').replace(/\D/g, '');
    return savedDigits && (savedDigits === digits || savedDigits.endsWith(last10));
  }) || null;
}

function cleanseCompanySupportPhone(comp: CompanyRecord): CompanyRecord {
  return comp;
}

export async function mongoGetAllCompanies(): Promise<CompanyRecord[]> {
  const col = await getCollection<CompanyRecord & Document>('companies');
  if (col) {
    try {
      const docs = await col.find({}).toArray();
      if (docs.length) {
        return docs.map((d: any) => {
          const { _id, ...rest } = d;
          return cleanseCompanySupportPhone(rest as CompanyRecord);
        });
      }
    } catch (err) {
      console.warn('[MongoDB Fallback] Falling back to memory for mongoGetAllCompanies');
    }
  }
  const allComps = Array.from(inMemoryStore.companies.values()).map(cleanseCompanySupportPhone);
  return allComps;
}

export async function mongoSaveCompany(company: CompanyRecord): Promise<CompanyRecord> {
  const cleansed = cleanseCompanySupportPhone(company);
  inMemoryStore.companies.set(cleansed.id, cleansed);
  const col = await getCollection<CompanyRecord & Document>('companies');
  if (col) {
    try {
      await col.updateOne({ id: cleansed.id }, { $set: cleansed }, { upsert: true });
    } catch (err) {
      console.warn('[MongoDB Warning] Failed to persist company to MongoDB');
    }
  }
  return cleansed;
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
  return inMemoryStore.brainConfigs.get(companyId) || null;
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
      return docs.map((d: any) => {
        const { _id, ...rest } = d;
        return rest as KnowledgeDoc;
      });
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

// Knowledge Gap Requests Collection (Admin Notifications for Missing Knowledge Base Docs)
export async function mongoGetKnowledgeGaps(companyId?: string): Promise<KnowledgeGapRequest[]> {
  const col = await getCollection<KnowledgeGapRequest & Document>('knowledge_gap_requests');
  if (col) {
    try {
      const query = companyId && companyId !== 'undefined' ? { companyId } : {};
      const docs = await col.find(query).sort({ createdAt: -1 }).toArray();
      return docs.map((d: any) => {
        const { _id, ...rest } = d;
        return rest as KnowledgeGapRequest;
      });
    } catch (err) {
      console.warn('[MongoDB Fallback] Falling back to memory for mongoGetKnowledgeGaps');
    }
  }

    return Array.from(inMemoryStore.knowledgeGaps.values()).filter((g) =>
      !companyId || g.companyId === companyId
    );
}

export async function mongoSaveKnowledgeGap(gap: KnowledgeGapRequest): Promise<KnowledgeGapRequest> {
  inMemoryStore.knowledgeGaps.set(gap.id, gap);
  const col = await getCollection<KnowledgeGapRequest & Document>('knowledge_gap_requests');
  if (col) {
    try {
      await col.updateOne({ id: gap.id }, { $set: gap }, { upsert: true });
    } catch (err) {
      console.warn('[MongoDB Warning] Failed to persist knowledge gap request to MongoDB');
    }
  }
  return gap;
}

export async function mongoDeleteKnowledgeGap(id: string): Promise<boolean> {
  inMemoryStore.knowledgeGaps.delete(id);
  const col = await getCollection<KnowledgeGapRequest & Document>('knowledge_gap_requests');
  if (col) {
    try {
      const result = await col.deleteOne({ id });
      return result.deletedCount > 0;
    } catch (err) {
      console.warn('[MongoDB Warning] Failed to delete knowledge gap request from MongoDB');
    }
  }
  return true;
}

// 5. Human Agents (Officers) Collection
export async function mongoGetAgentById(id: string): Promise<HumanAgent | null> {
  const col = await getCollection<HumanAgent & Document>('human_agents');
  if (col) {
    try {
      const doc = await col.findOne({ id });
      if (doc) {
        const { _id, ...rest } = doc as any;
        return rest as HumanAgent;
      }
    } catch (err) {
      console.warn('[MongoDB Fallback] Falling back to memory for mongoGetAgentById');
    }
  }
  return inMemoryStore.agents.get(id) || null;
}

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

export async function mongoGetAgentsByCompany(companyId?: string, includeRemoved = false): Promise<HumanAgent[]> {
  const col = await getCollection<HumanAgent & Document>('human_agents');
  if (col) {
    try {
      const query: any = companyId && companyId !== 'undefined'
        ? (includeRemoved ? { companyId } : { companyId, status: { $ne: 'removed' } })
        : (includeRemoved ? {} : { status: { $ne: 'removed' } });
      const docs = await col.find(query).toArray();
      return docs.map((d: any) => {
        const { _id, ...rest } = d;
        return rest as HumanAgent;
      });
    } catch (err) {
      console.warn('[MongoDB Fallback] Falling back to memory for mongoGetAgentsByCompany');
    }
  }

  return Array.from(inMemoryStore.agents.values()).filter((a) =>
    (!companyId || a.companyId === companyId) && (includeRemoved || a.status !== 'removed')
  );
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

export async function mongoGetCallsByCompany(companyId?: string): Promise<CallRecord[]> {
  const col = await getCollection<CallRecord & Document>('call_records');
  if (col) {
    try {
      const query = companyId && companyId !== 'undefined' && companyId.trim() !== '' ? { companyId } : {};
      const docs = await col.find(query).sort({ startedAt: -1 }).toArray();
      return docs.map((d: any) => {
        const { _id, ...rest } = d;
        return rest as CallRecord;
      });
    } catch (err) {
      console.warn('[MongoDB Fallback] Falling back to memory for mongoGetCallsByCompany');
    }
  }

  return Array.from(inMemoryStore.calls.values()).filter((c) => !companyId || c.companyId === companyId);
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
      return docs.map((d: any) => {
        const { _id, ...rest } = d;
        return rest as ToolConfig;
      });
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
      const query = companyId && companyId !== 'undefined' && companyId !== 'null'
        ? { companyId }
        : {};
      const docs = await col.find(query).sort({ updatedAt: -1 }).toArray();
      return docs.map((d: any) => {
        const { _id, ...rest } = d;
        return rest as CaseDNA;
      });
    } catch (err) {
      console.warn('[MongoDB Fallback] Falling back to memory for mongoGetCases');
    }
  }
  return Array.from(inMemoryStore.cases.values())
    .filter((c) => !companyId || c.companyId === companyId)
    .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
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

export async function mongoClearAllDatabaseData(): Promise<boolean> {
  inMemoryStore.cases.clear();
  inMemoryStore.calls.clear();
  inMemoryStore.knowledge.clear();
  inMemoryStore.agents.clear();

  const collections = ['cases', 'call_records', 'knowledge_docs', 'human_agents'];
  for (const name of collections) {
    const col = await getCollection(name);
    if (col) {
      try {
        await col.deleteMany({});
      } catch (err) {
        console.warn(`[MongoDB Clear Warning] Failed clearing collection ${name}`);
      }
    }
  }
  return true;
}
