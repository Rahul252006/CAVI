import { NextRequest, NextResponse } from 'next/server';
import {
  saveCompany,
  saveCompanyBrain,
  saveKnowledgeDoc,
  saveHumanAgent,
  getDb,
} from '@/lib/db';
import {
  Company,
  CompanyBrainConfig,
  KnowledgeDoc,
  HumanAgent,
} from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyId,
      name,
      legalName,
      industry,
      website,
      description,
      country,
      state,
      city,
      businessAddress,
      timezone,
      primaryContactName,
      primaryContactEmail,
      primaryContactPhone,

      supportPhone,
      phoneType,
      countryCode,
      businessHours,
      is24x7Support,
      supportedLanguages,

      plan,
      tagline,

      // Company Brain
      aiAgentName,
      welcomeMessage,
      tone,
      allowedActions,
      confirmationActions,
      humanApprovalActions,

      // Initial knowledge / SOP
      initialSopTitle,
      initialSopContent,

      // Initial officer invite
      initialAgentName,
      initialAgentEmail,
      initialAgentPhone,
      initialAgentDepartment,
    } = body;

    if (!companyId || !name || !supportPhone) {
      return NextResponse.json(
        { error: 'Company ID, Name, and Support Phone Number are required.' },
        { status: 400 }
      );
    }

    const db = getDb();
    const existing = db.companies.find(c => c.id === companyId);

    const updatedCompany: Company = {
      id: companyId,
      name,
      legalName: legalName || name,
      slug: existing?.slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      industry: industry || 'Fintech & Digital Payments',
      website: website || '',
      description: description || `${name} customer care infrastructure`,
      country: country || 'India',
      state: state || '',
      city: city || '',
      businessAddress: businessAddress || '',
      timezone: timezone || 'Asia/Kolkata (IST)',
      primaryContactName: primaryContactName || 'Admin',
      primaryContactEmail: primaryContactEmail || '',
      primaryContactPhone: primaryContactPhone || '',

      supportPhone,
      phoneType: phoneType || 'PSTN',
      countryCode: countryCode || '+91',
      businessHours: businessHours || '24 Hours / 7 Days',
      is24x7Support: is24x7Support !== undefined ? Boolean(is24x7Support) : true,
      supportedLanguages: supportedLanguages || ['Hindi', 'English'],
      telephonyStatus: 'active',

      isActive: true,
      tagline: tagline || `Enterprise Voice AI for ${name}`,
      plan: plan || 'Growth',
      pricePerMinute: plan === 'Enterprise' ? 0.12 : plan === 'Starter' ? 0.20 : 0.15,
      minutesUsed: existing?.minutesUsed || 0,
      totalCalls: existing?.totalCalls || 0,
      aiResolutionRate: existing?.aiResolutionRate || 0,
      createdAt: existing?.createdAt || new Date().toISOString(),
    };

    saveCompany(updatedCompany);

    // Save Company Brain
    const brainConfig: CompanyBrainConfig = {
      companyId,
      aiAgentName: aiAgentName || `${name} Voice Assistant`,
      welcomeMessage: welcomeMessage || `Welcome to ${name} customer care. How can I assist you today?`,
      supportedLanguages: supportedLanguages || ['Hindi', 'English'],
      tone: tone || 'Empathetic & Professional',
      aiPermissions: {
        canQueryTransactions: true,
        canIssueDirectRefunds: false,
        canModifyCustomerData: false,
        canScheduleCallbacks: true,
        canEscalateToHuman: true,
      },
      allowedActions: allowedActions || ['check_status', 'lookup_customer', 'create_ticket'],
      confirmationActions: confirmationActions || ['update_customer_details'],
      humanApprovalActions: humanApprovalActions || ['request_refund', 'cancel_subscription'],
    };
    saveCompanyBrain(brainConfig);

    // Save Initial SOP if provided
    if (initialSopTitle && initialSopContent) {
      const sopDoc: KnowledgeDoc = {
        id: `doc-${Date.now().toString().slice(-5)}`,
        companyId,
        title: initialSopTitle,
        category: 'Policies',
        content: initialSopContent,
        updatedAt: new Date().toISOString(),
      };
      saveKnowledgeDoc(sopDoc);
    }

    // Save Initial Agent if invited
    if (initialAgentName && initialAgentEmail) {
      const agent: HumanAgent = {
        id: `agent-${Date.now().toString().slice(-5)}`,
        companyId,
        firstName: initialAgentName.split(' ')[0] || initialAgentName,
        lastName: initialAgentName.split(' ')[1] || '',
        name: initialAgentName,
        email: initialAgentEmail.toLowerCase().trim(),
        phone: initialAgentPhone || '+91 98765 00000',
        employeeId: `EMP-${Date.now().toString().slice(-6)}`,
        jobTitle: 'Support Specialist',
        department: initialAgentDepartment || 'General Customer Care',
        specialization: 'Customer Escalation & Inquiry Resolution',
        languagesSpoken: ['Hindi', 'English'],
        yearsExperience: 2,
        workingHours: '9:00 AM - 6:00 PM',
        timezone: 'Asia/Kolkata',
        accountStatus: 'invited',
        status: 'offline',
        assignedCasesCount: 0,
        maxCapacity: 5,
        lastActiveTime: new Date().toISOString(),
        registeredAt: new Date().toISOString(),
      };
      saveHumanAgent(agent);
    }

    return NextResponse.json({
      success: true,
      company: updatedCompany,
      dashboardUrl: `/admin?companyId=${companyId}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Onboarding failed' },
      { status: 500 }
    );
  }
}
