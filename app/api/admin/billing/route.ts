import { NextRequest, NextResponse } from 'next/server';
import { getCompanyById, getCompanyInvoices } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  if (!companyId) {
    return NextResponse.json({ error: 'companyId is required' }, { status: 400 });
  }

  const company = getCompanyById(companyId);
  if (!company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  }

  const invoices = getCompanyInvoices(company.id);
  const currentMonthMinutes = company.minutesUsed;
  const currentMonthCost = Number((currentMonthMinutes * company.pricePerMinute).toFixed(2));

  return NextResponse.json({
    company,
    currentUsage: {
      minutesUsed: currentMonthMinutes,
      totalCalls: company.totalCalls,
      pricePerMinute: company.pricePerMinute,
      currentBalance: currentMonthCost,
      plan: company.plan,
      billingCycle: 'Current (Sep 2026)',
    },
    invoices,
  });
}
