import fs from 'node:fs';
import path from 'node:path';
import {
  CompanyAdmin,
  Company,
  CompanyBrainConfig,
  ToolConfig,
  HumanAgent,
  CallRecord,
  KnowledgeDoc,
  BillingInvoice,
  DatabaseSchema,
} from './schema';
import {
  mongoGetCompanies,
  mongoGetCompanyById,
  mongoGetCompanyBySupportPhone,
  mongoSaveCompany,
  mongoGetAdminByEmail,
  mongoSaveAdmin,
  mongoGetCompanyBrain,
  mongoSaveCompanyBrain,
  mongoGetKnowledge,
  mongoSaveKnowledgeDoc,
  mongoGetAgents,
  mongoSaveAgent,
  mongoGetCalls,
  mongoSaveCallRecord,
  mongoGetTools,
  mongoSaveTool,
} from '../mongodb/models';

export {
  mongoGetCompanies,
  mongoGetCompanyById,
  mongoGetCompanyBySupportPhone,
  mongoSaveCompany,
  mongoGetAdminByEmail,
  mongoSaveAdmin,
  mongoGetCompanyBrain,
  mongoSaveCompanyBrain,
  mongoGetKnowledge,
  mongoSaveKnowledgeDoc,
  mongoGetAgents,
  mongoSaveAgent,
  mongoGetCalls,
  mongoSaveCallRecord,
  mongoGetTools,
  mongoSaveTool,
};

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'echosphere-db.json');

const INITIAL_DB: DatabaseSchema = {
  admins: [],
  companies: [],
  brainConfigs: [],
  tools: [],
  agents: [],
  calls: [],
  knowledge: [],
  invoices: [],
};

export function getDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(INITIAL_DB, null, 2), 'utf-8');
      return INITIAL_DB;
    }
    const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    return {
      admins: parsed.admins || INITIAL_DB.admins,
      companies: parsed.companies || INITIAL_DB.companies,
      brainConfigs: parsed.brainConfigs || INITIAL_DB.brainConfigs,
      tools: parsed.tools || INITIAL_DB.tools,
      agents: parsed.agents || INITIAL_DB.agents,
      calls: parsed.calls || INITIAL_DB.calls,
      knowledge: parsed.knowledge || INITIAL_DB.knowledge,
      invoices: parsed.invoices || INITIAL_DB.invoices,
    };
  } catch (error) {
    console.error('Error reading database file, returning fallback:', error);
    return INITIAL_DB;
  }
}

export function writeDb(db: DatabaseSchema): void {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to database:', error);
  }
}

export function saveDb(db: DatabaseSchema): void {
  writeDb(db);
}

export function saveCompanyAdmin(admin: CompanyAdmin): void {
  const db = getDb();
  const idx = db.admins.findIndex(a => a.adminId === admin.adminId || a.email === admin.email);
  if (idx >= 0) {
    db.admins[idx] = admin;
  } else {
    db.admins.push(admin);
  }
  writeDb(db);
  mongoSaveAdmin(admin).catch((e) => console.error('MongoDB sync admin error:', e));
}

export function findAdminByEmail(email: string): CompanyAdmin | undefined {
  const db = getDb();
  return db.admins.find(a => a.email.toLowerCase() === email.toLowerCase());
}

export function saveCompany(company: Company): void {
  const db = getDb();
  const idx = db.companies.findIndex((c) => c.id === company.id);
  if (idx >= 0) {
    db.companies[idx] = company;
  } else {
    db.companies.push(company);
  }
  writeDb(db);
  mongoSaveCompany(company).catch((e) => console.error('MongoDB sync company error:', e));
}

export function updateCompany(companyId: string, updates: Partial<Company>): Company | null {
  const db = getDb();
  const idx = db.companies.findIndex(c => c.id === companyId);
  if (idx >= 0) {
    db.companies[idx] = { ...db.companies[idx], ...updates };
    writeDb(db);
    mongoSaveCompany(db.companies[idx]).catch((e) => console.error('MongoDB sync company update error:', e));
    return db.companies[idx];
  }
  return null;
}

export function saveCompanyBrain(brain: CompanyBrainConfig): void {
  const db = getDb();
  const idx = db.brainConfigs.findIndex(b => b.companyId === brain.companyId);
  if (idx >= 0) {
    db.brainConfigs[idx] = brain;
  } else {
    db.brainConfigs.push(brain);
  }
  writeDb(db);
  mongoSaveCompanyBrain(brain).catch((e) => console.error('MongoDB sync brain error:', e));
}

export function saveTool(tool: ToolConfig): void {
  const db = getDb();
  const idx = db.tools.findIndex(t => t.id === tool.id);
  if (idx >= 0) {
    db.tools[idx] = tool;
  } else {
    db.tools.push(tool);
  }
  writeDb(db);
  mongoSaveTool(tool).catch((e) => console.error('MongoDB sync tool error:', e));
}

export function saveHumanAgent(agent: HumanAgent): void {
  const db = getDb();
  const idx = db.agents.findIndex(a => a.id === agent.id);
  if (idx >= 0) {
    db.agents[idx] = agent;
  } else {
    db.agents.push(agent);
  }
  writeDb(db);
  mongoSaveAgent(agent).catch((e) => console.error('MongoDB sync agent error:', e));
}

export function registerAgent(agentData: Partial<HumanAgent> & { companyId: string; email: string; name: string }): HumanAgent {
  const id = `agent-${Date.now()}`;
  const newAgent: HumanAgent = {
    id,
    companyId: agentData.companyId,
    firstName: agentData.firstName || agentData.name.split(' ')[0] || 'Support',
    lastName: agentData.lastName || agentData.name.split(' ')[1] || 'Agent',
    name: agentData.name,
    email: agentData.email,
    phone: agentData.phone || '+91 98765 00000',
    employeeId: agentData.employeeId || `EMP-${id.slice(-4)}`,
    jobTitle: agentData.jobTitle || 'Customer Support Specialist',
    department: (agentData.department as HumanAgent['department']) || 'General Customer Care',
    specialization: agentData.specialization || 'General Support',
    languagesSpoken: agentData.languagesSpoken || ['English'],
    yearsExperience: agentData.yearsExperience || 2,
    workingHours: agentData.workingHours || '9:00 AM - 6:00 PM',
    timezone: agentData.timezone || 'Asia/Kolkata',
    accountStatus: 'active',
    status: 'online',
    assignedCasesCount: 0,
    maxCapacity: 5,
    lastActiveTime: new Date().toISOString(),
    registeredAt: new Date().toISOString(),
  };

  saveHumanAgent(newAgent);
  return newAgent;
}

export function updateAgentStatus(agentId: string, status: HumanAgent['status']): HumanAgent | null {
  const db = getDb();
  const agent = db.agents.find(a => a.id === agentId);
  if (agent) {
    agent.status = status;
    agent.lastActiveTime = new Date().toISOString();
    saveHumanAgent(agent);
    return agent;
  }
  return null;
}

export function saveCallRecord(call: CallRecord): void {
  const db = getDb();
  const idx = db.calls.findIndex(c => c.id === call.id);
  if (idx >= 0) {
    db.calls[idx] = call;
  } else {
    db.calls.push(call);
  }
  writeDb(db);
  mongoSaveCallRecord(call).catch((e) => console.error('MongoDB sync call error:', e));
}

export function saveKnowledgeDoc(doc: KnowledgeDoc): void {
  const db = getDb();
  const idx = db.knowledge.findIndex(k => k.id === doc.id);
  if (idx >= 0) {
    db.knowledge[idx] = doc;
  } else {
    db.knowledge.push(doc);
  }
  writeDb(db);
  mongoSaveKnowledgeDoc(doc).catch((e) => console.error('MongoDB sync knowledge error:', e));
}

export function addKnowledgeDoc(doc: KnowledgeDoc): void {
  saveKnowledgeDoc(doc);
}

export function deleteKnowledgeDoc(docId: string): boolean {
  const db = getDb();
  const initialLen = db.knowledge.length;
  db.knowledge = db.knowledge.filter(k => k.id !== docId);
  if (db.knowledge.length !== initialLen) {
    writeDb(db);
    return true;
  }
  return false;
}

export function getCompanies(): Company[] {
  return getDb().companies;
}

export function getCompanyById(id: string): Company | undefined {
  return getDb().companies.find((c) => c.id === id);
}

export function getCompanyKnowledge(companyId: string): KnowledgeDoc[] {
  return getDb().knowledge.filter((k) => k.companyId === companyId);
}

export function getCompanyAgents(companyId: string): HumanAgent[] {
  return getDb().agents.filter((a) => a.companyId === companyId);
}

export function getAgents(companyId?: string): HumanAgent[] {
  const db = getDb();
  if (companyId) return db.agents.filter(a => a.companyId === companyId);
  return db.agents;
}

export function getCalls(companyId?: string): CallRecord[] {
  const db = getDb();
  if (companyId) return db.calls.filter((c) => c.companyId === companyId);
  return db.calls;
}

export function getCallById(callId: string): CallRecord | undefined {
  return getDb().calls.find(c => c.id === callId);
}

export function getCompanyCalls(companyId?: string): CallRecord[] {
  return getCalls(companyId);
}

export function getCompanyTools(companyId: string): ToolConfig[] {
  return getDb().tools.filter((t) => t.companyId === companyId);
}

export function getCompanyInvoices(companyId: string): BillingInvoice[] {
  return getDb().invoices.filter((i) => i.companyId === companyId);
}

export function getAdminByEmail(email: string): CompanyAdmin | null {
  const db = getDb();
  const admin = db.admins.find((a: CompanyAdmin) => a.email.toLowerCase() === email.toLowerCase());
  return admin || null;
}

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

export function getCompanyBySupportPhone(supportPhone: string): Company | undefined {
  const db = getDb();
  const searchDigits = convertPhoneToDigits(supportPhone);
  const searchNormalized = supportPhone.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (!searchDigits && !searchNormalized) return undefined;

  return db.companies.find((c: Company) => {
    const compDigits = convertPhoneToDigits(c.supportPhone);
    const compNormalized = c.supportPhone.toLowerCase().replace(/[^a-z0-9]/g, '');

    return (
      (compNormalized && searchNormalized && compNormalized === searchNormalized) ||
      (compDigits && searchDigits && (compDigits === searchDigits || searchDigits.endsWith(compDigits) || compDigits.endsWith(searchDigits)))
    );
  });
}

export function getCompanyBrain(companyId: string): CompanyBrainConfig | undefined {
  const db = getDb();
  return db.brainConfigs.find((b: CompanyBrainConfig) => b.companyId === companyId);
}
