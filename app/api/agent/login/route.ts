import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, companyId } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const db = getDb();
    const cleanEmail = email.toLowerCase().trim();

    // Find agent by email and optional companyId
    const agent = db.agents.find(a => {
      const matchEmail = a.email.toLowerCase().trim() === cleanEmail;
      return companyId ? matchEmail && a.companyId === companyId : matchEmail;
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'No support officer found with this email for the selected company. Please contact your Company Admin.' },
        { status: 404 }
      );
    }

    const company = db.companies.find(c => c.id === agent.companyId);

    return NextResponse.json({
      success: true,
      agent,
      company,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Login failed' },
      { status: 500 }
    );
  }
}
