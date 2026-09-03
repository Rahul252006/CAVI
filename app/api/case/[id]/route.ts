import { NextRequest, NextResponse } from 'next/server';
import { getCaseById, updateCaseStatus } from '@/lib/storage/cases';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const found = getCaseById(id);
  if (!found) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 });
  }
  return NextResponse.json({ case: found });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { status } = body;
  const updated = updateCaseStatus(id, status);
  if (!updated) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, case: updated });
}
