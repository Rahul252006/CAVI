import { NextRequest, NextResponse } from 'next/server';
import { getAllCases } from '@/lib/storage/cases';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId') || undefined;
  const cases = getAllCases(companyId);
  return NextResponse.json({ cases });
}
