import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { Company } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, industry, supportPhone, tagline, plan } = body;

    if (!name || !industry || !supportPhone) {
      return NextResponse.json({ error: 'Name, industry, and support phone are required' }, { status: 400 });
    }

    const db = getDb();
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 30);
    const newCompany: Company = {
      id: `comp-${Date.now().toString().slice(-6)}`,
      name,
      legalName: name,
      slug,
      industry,
      description: `${name} customer care operations`,
      country: 'India',
      timezone: 'Asia/Kolkata (IST)',
      primaryContactName: 'Admin',
      primaryContactEmail: 'admin@' + slug + '.demo',
      primaryContactPhone: '+91 98765 00000',

      supportPhone,
      phoneType: 'PSTN',
      countryCode: '+91',
      businessHours: '24 Hours / 7 Days',
      is24x7Support: true,
      supportedLanguages: ['Hindi', 'English'],
      telephonyStatus: 'active',

      isActive: true,
      tagline: tagline || `${name} customer assistance and support line`,
      plan: plan || 'Enterprise',
      pricePerMinute: plan === 'Starter' ? 0.20 : plan === 'Growth' ? 0.15 : 0.12,
      minutesUsed: 0,
      totalCalls: 0,
      aiResolutionRate: 100,
      createdAt: new Date().toISOString(),
    };

    db.companies.push(newCompany);
    saveDb(db);

    return NextResponse.json({ success: true, company: newCompany });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to register company' },
      { status: 500 }
    );
  }
}
