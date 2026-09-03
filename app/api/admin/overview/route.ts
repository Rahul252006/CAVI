import { NextRequest, NextResponse } from 'next/server';
import { getCompanies, updateCompany } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  const companies = getCompanies();
  const selected = companyId ? companies.find(c => c.id === companyId || c.slug === companyId) : companies[0];

  return NextResponse.json({
    companies,
    selectedCompany: selected,
  });
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, isActive, plan } = body;

    if (!companyId) {
      return NextResponse.json({ error: 'companyId is required' }, { status: 400 });
    }

    const updated = updateCompany(companyId, {
      ...(isActive !== undefined && { isActive }),
      ...(plan !== undefined && { plan }),
    });

    if (!updated) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, company: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Update failed' },
      { status: 500 }
    );
  }
}
