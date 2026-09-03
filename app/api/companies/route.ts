import { NextResponse } from 'next/server';
import { getCompanies } from '@/lib/db';
import type { Company } from '@/lib/db/schema';

export async function GET() {
  try {
    const companies = getCompanies().map((c: Company) => ({
      id: c.id,
      name: c.name,
      supportPhone: c.supportPhone,
      industry: c.industry,
      country: c.country,
      tagline: c.tagline,
    }));

    return NextResponse.json({ success: true, companies });
  } catch (error) {
    console.error('Failed to list companies:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
