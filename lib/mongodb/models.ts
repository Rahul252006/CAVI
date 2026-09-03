import { getMongoDb } from './client';
import type {
  Company,
  CompanyBrainConfig,
  CompanyAdmin,
  HumanAgent,
  KnowledgeDoc,
  CallRecord,
  ToolConfig,
} from '../db/schema';

function convertPhoneToDigits(phone: string): string {
  const keypadMap: Record<string, string> = {
    a: '2', b: '2', c: '2',
    d: '3', e: '3', f: '3',
    g: '4', h: '4', i: '4',
    j: '5', k: '5', l: '5',
    m: '6', n: '6', o: '6',
    p: '7', q: '7', r: '7', s: '7',
    t: '8', u: '8', v: '8',
    w: '9', x: '9', y: '9', z: '9',
  };

  return phone
    .toLowerCase()
    .split('')
    .map((char) => keypadMap[char] || (char >= '0' && char <= '9' ? char : ''))
    .join('');
}

// --- Companies Collection ---
export async function mongoGetCompanies(): Promise<Company[]> {
  const db = await getMongoDb();
  const docs = await db.collection('companies').find({}).toArray();
  return docs.map((doc) => {
    const { _id, ...rest } = doc;
    void _id;
    return rest as unknown as Company;
  });
}

export async function mongoGetCompanyById(id: string): Promise<Company | null> {
  const db = await getMongoDb();
  const res = await db.collection('companies').findOne({ id });
  if (!res) return null;
  const { _id, ...rest } = res;
  void _id;
  return rest as unknown as Company;
}

export async function mongoGetCompanyBySupportPhone(supportPhone: string): Promise<Company | null> {
  const searchDigits = convertPhoneToDigits(supportPhone);
  const searchNormalized = supportPhone.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (!searchDigits && !searchNormalized) return null;

  const all = await mongoGetCompanies();
  return (
    all.find((c) => {
      const compDigits = convertPhoneToDigits(c.supportPhone);
      const compNormalized = c.supportPhone.toLowerCase().replace(/[^a-z0-9]/g, '');

      return (
        (compNormalized && searchNormalized && compNormalized === searchNormalized) ||
        (compDigits &&
          searchDigits &&
          (compDigits === searchDigits ||
            searchDigits.endsWith(compDigits) ||
            compDigits.endsWith(searchDigits)))
      );
    }) || null
  );
}

export async function mongoSaveCompany(company: Company): Promise<Company> {
  const db = await getMongoDb();
  await db
    .collection('companies')
    .updateOne({ id: company.id }, { $set: company }, { upsert: true });
  return company;
}

// --- Company Admins Collection ---
export async function mongoGetAdminByEmail(email: string): Promise<CompanyAdmin | null> {
  const db = await getMongoDb();
  const res = await db.collection('company_admins').findOne({ email: email.toLowerCase().trim() });
  if (!res) return null;
  const { _id, ...rest } = res;
  void _id;
  return rest as unknown as CompanyAdmin;
}

export async function mongoSaveAdmin(admin: CompanyAdmin): Promise<CompanyAdmin> {
  const db = await getMongoDb();
  await db
    .collection('company_admins')
    .updateOne({ adminId: admin.adminId }, { $set: admin }, { upsert: true });
  return admin;
}

// --- Company Brain Config Collection ---
export async function mongoGetCompanyBrain(companyId: string): Promise<CompanyBrainConfig | null> {
  const db = await getMongoDb();
  const res = await db.collection('brain_configs').findOne({ companyId });
  if (!res) return null;
  const { _id, ...rest } = res;
  void _id;
  return rest as unknown as CompanyBrainConfig;
}

export async function mongoSaveCompanyBrain(brain: CompanyBrainConfig): Promise<CompanyBrainConfig> {
  const db = await getMongoDb();
  await db
    .collection('brain_configs')
    .updateOne({ companyId: brain.companyId }, { $set: brain }, { upsert: true });
  return brain;
}

// --- Knowledge Documents Collection ---
export async function mongoGetKnowledge(companyId: string): Promise<KnowledgeDoc[]> {
  const db = await getMongoDb();
  const docs = await db.collection('knowledge_docs').find({ companyId }).toArray();
  return docs.map((doc) => {
    const { _id, ...rest } = doc;
    void _id;
    return rest as unknown as KnowledgeDoc;
  });
}

export async function mongoSaveKnowledgeDoc(doc: KnowledgeDoc): Promise<KnowledgeDoc> {
  const db = await getMongoDb();
  await db
    .collection('knowledge_docs')
    .updateOne({ id: doc.id }, { $set: doc }, { upsert: true });
  return doc;
}

// --- Human Support Officers Collection ---
export async function mongoGetAgents(companyId: string): Promise<HumanAgent[]> {
  const db = await getMongoDb();
  const docs = await db.collection('human_agents').find({ companyId }).toArray();
  return docs.map((doc) => {
    const { _id, ...rest } = doc;
    void _id;
    return rest as unknown as HumanAgent;
  });
}

export async function mongoSaveAgent(agent: HumanAgent): Promise<HumanAgent> {
  const db = await getMongoDb();
  await db
    .collection('human_agents')
    .updateOne({ id: agent.id }, { $set: agent }, { upsert: true });
  return agent;
}

// --- Call Records Collection ---
export async function mongoSaveCallRecord(call: CallRecord): Promise<CallRecord> {
  const db = await getMongoDb();
  await db
    .collection('call_records')
    .updateOne({ id: call.id }, { $set: call }, { upsert: true });
  return call;
}

export async function mongoGetCalls(companyId?: string): Promise<CallRecord[]> {
  const db = await getMongoDb();
  const query = companyId ? { companyId } : {};
  const docs = await db.collection('call_records').find(query).toArray();
  return docs.map((doc) => {
    const { _id, ...rest } = doc;
    void _id;
    return rest as unknown as CallRecord;
  });
}

// --- Tools Collection ---
export async function mongoGetTools(companyId: string): Promise<ToolConfig[]> {
  const db = await getMongoDb();
  const docs = await db.collection('tool_configs').find({ companyId }).toArray();
  return docs.map((doc) => {
    const { _id, ...rest } = doc;
    void _id;
    return rest as unknown as ToolConfig;
  });
}

export async function mongoSaveTool(tool: ToolConfig): Promise<ToolConfig> {
  const db = await getMongoDb();
  await db
    .collection('tool_configs')
    .updateOne({ id: tool.id }, { $set: tool }, { upsert: true });
  return tool;
}
