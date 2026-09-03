import { NextRequest, NextResponse } from 'next/server';
import { addOrUpdateCase } from '@/lib/storage/cases';
import { CaseDNA } from '@/types/echosphere';

export async function POST(request: NextRequest) {
  try {
    const body: CaseDNA = await request.json();
    if (!body.caseId || !body.sessionId) {
      return NextResponse.json({ error: 'caseId and sessionId are required' }, { status: 400 });
    }
    const saved = addOrUpdateCase(body);
    return NextResponse.json({ success: true, case: saved });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save case' },
      { status: 500 }
    );
  }
}
