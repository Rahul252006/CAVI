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

export async function getCollection<T extends Document>(name: string): Promise<Collection<T>> {
  const db = await getMongoDb();
  return db.collection<T>(name);
}

// 1. Companies Collection
export async function mongoGetCompany(id: string): Promise<CompanyRecord | null> {
  const col = await getCollection<CompanyRecord & Document>('companies');
  const doc = await col.findOne({ id });
  if (!doc) return null;
  const { _id, ...rest } = doc as any;
  return rest as CompanyRecord;
}

export async function mongoGetCompanyBySupportPhone(supportPhone: string): Promise<CompanyRecord | null> {
  const col = await getCollection<CompanyRecord & Document>('companies');
  const normalized = supportPhone.replace(/\D/g, '');
  const doc = await col.findOne({
    $or: [
      { supportPhone },
      { supportPhone: normalized },
      { supportPhone: `+${normalized}` },
      { supportPhone: { $regex: normalized.slice(-10) } },
    ],
  });
  if (!doc) return null;
  const { _id, ...rest } = doc as any;
  return rest as CompanyRecord;
}

export async function mongoGetAllCompanies(): Promise<CompanyRecord[]> {
  const col = await getCollection<CompanyRecord & Document>('companies');
  const docs = await col.find({}).toArray();
  return docs.map((d: any) => {
    const { _id, ...rest } = d;
    return rest as CompanyRecord;
  });
}

export async function mongoSaveCompany(company: CompanyRecord): Promise<CompanyRecord> {
  const col = await getCollection<CompanyRecord & Document>('companies');
  await col.updateOne({ id: company.id }, { $set: company }, { upsert: true });
  return company;
}

// 2. Company Admins Collection
export async function mongoGetAdminByEmail(email: string): Promise<CompanyAdmin | null> {
  const col = await getCollection<CompanyAdmin & Document>('company_admins');
  const doc = await col.findOne({ email: email.toLowerCase() });
  if (!doc) return null;
  const { _id, ...rest } = doc as any;
  return rest as CompanyAdmin;
}

export async function mongoSaveAdmin(admin: CompanyAdmin): Promise<CompanyAdmin> {
  const col = await getCollection<CompanyAdmin & Document>('company_admins');
  await col.updateOne({ id: admin.id }, { $set: { ...admin, email: admin.email.toLowerCase() } }, { upsert: true });
  return admin;
}

// 3. Brain Configs Collection
export async function mongoGetBrainConfig(companyId: string): Promise<BrainConfig | null> {
  const col = await getCollection<BrainConfig & Document>('brain_configs');
  const doc = await col.findOne({ companyId });
  if (!doc) return null;
  const { _id, ...rest } = doc as any;
  return rest as BrainConfig;
}

export async function mongoSaveBrainConfig(config: BrainConfig): Promise<BrainConfig> {
  const col = await getCollection<BrainConfig & Document>('brain_configs');
  await col.updateOne({ companyId: config.companyId }, { $set: config }, { upsert: true });
  return config;
}

// 4. Knowledge Docs Collection
export async function mongoGetKnowledgeDocs(companyId: string): Promise<KnowledgeDoc[]> {
  const col = await getCollection<KnowledgeDoc & Document>('knowledge_docs');
  const docs = await col.find({ companyId }).toArray();
  return docs.map((d: any) => {
    const { _id, ...rest } = d;
    return rest as KnowledgeDoc;
  });
}

export async function mongoSaveKnowledgeDoc(doc: KnowledgeDoc): Promise<KnowledgeDoc> {
  const col = await getCollection<KnowledgeDoc & Document>('knowledge_docs');
  await col.updateOne({ id: doc.id }, { $set: doc }, { upsert: true });
  return doc;
}

export async function mongoDeleteKnowledgeDoc(id: string): Promise<boolean> {
  const col = await getCollection<KnowledgeDoc & Document>('knowledge_docs');
  const result = await col.deleteOne({ id });
  return result.deletedCount > 0;
}

// 5. Human Agents (Officers) Collection
export async function mongoGetAgentByEmail(email: string): Promise<HumanAgent | null> {
  const col = await getCollection<HumanAgent & Document>('human_agents');
  const doc = await col.findOne({ email: email.toLowerCase() });
  if (!doc) return null;
  const { _id, ...rest } = doc as any;
  return rest as HumanAgent;
}

export async function mongoGetAgentsByCompany(companyId: string): Promise<HumanAgent[]> {
  const col = await getCollection<HumanAgent & Document>('human_agents');
  const docs = await col.find({ companyId }).toArray();
  return docs.map((d: any) => {
    const { _id, ...rest } = d;
    return rest as HumanAgent;
  });
}

export async function mongoSaveAgent(agent: HumanAgent): Promise<HumanAgent> {
  const col = await getCollection<HumanAgent & Document>('human_agents');
  await col.updateOne({ id: agent.id }, { $set: { ...agent, email: agent.email.toLowerCase() } }, { upsert: true });
  return agent;
}

// 6. Call Records Collection
export async function mongoGetCall(id: string): Promise<CallRecord | null> {
  const col = await getCollection<CallRecord & Document>('call_records');
  const doc = await col.findOne({ id });
  if (!doc) return null;
  const { _id, ...rest } = doc as any;
  return rest as CallRecord;
}

export async function mongoGetCallsByCompany(companyId: string): Promise<CallRecord[]> {
  const col = await getCollection<CallRecord & Document>('call_records');
  const docs = await col.find({ companyId }).sort({ startedAt: -1 }).toArray();
  return docs.map((d: any) => {
    const { _id, ...rest } = d;
    return rest as CallRecord;
  });
}

export async function mongoSaveCall(call: CallRecord): Promise<CallRecord> {
  const col = await getCollection<CallRecord & Document>('call_records');
  await col.updateOne({ id: call.id }, { $set: call }, { upsert: true });
  return call;
}

// 7. Tool Configs Collection
export async function mongoGetToolsByCompany(companyId: string): Promise<ToolConfig[]> {
  const col = await getCollection<ToolConfig & Document>('tool_configs');
  const docs = await col.find({ companyId }).toArray();
  return docs.map((d: any) => {
    const { _id, ...rest } = d;
    return rest as ToolConfig;
  });
}

export async function mongoSaveTool(tool: ToolConfig): Promise<ToolConfig> {
  const col = await getCollection<ToolConfig & Document>('tool_configs');
  await col.updateOne({ id: tool.id }, { $set: tool }, { upsert: true });
  return tool;
}

// 8. Cases Collection
export async function mongoGetCases(companyId?: string): Promise<CaseDNA[]> {
  const col = await getCollection<CaseDNA & Document>('cases');
  const query = companyId ? { companyId } : {};
  const docs = await col.find(query).sort({ updatedAt: -1 }).toArray();
  return docs.map((d: any) => {
    const { _id, ...rest } = d;
    return rest as CaseDNA;
  });
}

export async function mongoGetCase(id: string): Promise<CaseDNA | null> {
  const col = await getCollection<CaseDNA & Document>('cases');
  const doc = await col.findOne({ $or: [{ id }, { caseId: id }] });
  if (!doc) return null;
  const { _id, ...rest } = doc as any;
  return rest as CaseDNA;
}

export async function mongoSaveCase(caseDna: CaseDNA): Promise<CaseDNA> {
  const col = await getCollection<CaseDNA & Document>('cases');
  await col.updateOne({ id: caseDna.id }, { $set: caseDna }, { upsert: true });
  return caseDna;
}
