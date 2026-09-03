import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveCompanyAdmin, saveCompany } from '@/lib/db';
import { CompanyAdmin, Company } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      password,
      mobile,
      jobTitle,
      companyName,
    } = body;

    if (!firstName || !lastName || !email || !password || !companyName) {
      return NextResponse.json(
        { error: 'First Name, Last Name, Work Email, Password, and Company Name are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const db = getDb();

    // Check if admin already exists
    const existing = db.admins.find(a => a.email.toLowerCase() === cleanEmail);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this work email already exists. Please sign in.' },
        { status: 409 }
      );
    }

    const adminId = `adm-${Date.now().toString().slice(-6)}`;
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const companyId = `comp-${slug}-${Date.now().toString().slice(-4)}`;

    const newAdmin: CompanyAdmin = {
      adminId,
      firstName,
      lastName,
      email: cleanEmail,
      password,
      mobile: mobile || '',
      jobTitle: jobTitle || 'Company Administrator',
      companyId,
      companyName,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      emailVerified: true,
      accountStatus: 'active',
    };

    // Pre-seed initial Company draft for onboarding
    const newCompany: Company = {
      id: companyId,
      name: companyName,
      legalName: companyName,
      slug,
      industry: 'Fintech & Digital Payments',
      description: `${companyName} customer resolution and support infrastructure.`,
      country: 'India',
      timezone: 'Asia/Kolkata (IST)',
      primaryContactName: `${firstName} ${lastName}`,
      primaryContactEmail: cleanEmail,
      primaryContactPhone: mobile || '',

      supportPhone: '',
      phoneType: 'PSTN',
      countryCode: '+91',
      businessHours: '24 Hours / 7 Days',
      is24x7Support: true,
      supportedLanguages: ['Hindi', 'English'],
      telephonyStatus: 'pending_verification',

      isActive: true,
      tagline: `Intelligent Voice AI for ${companyName}`,
      plan: 'Growth',
      pricePerMinute: 0.15,
      minutesUsed: 0,
      totalCalls: 0,
      aiResolutionRate: 0,
      createdAt: new Date().toISOString(),
    };

    saveCompanyAdmin(newAdmin);
    saveCompany(newCompany);

    return NextResponse.json({
      success: true,
      admin: newAdmin,
      company: newCompany,
      nextStepUrl: `/company/onboard?companyId=${companyId}&adminId=${adminId}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Signup failed' },
      { status: 500 }
    );
  }
}
