import { NextRequest, NextResponse } from 'next/server';
import { registerAgent, getAgents } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');
  const agents = getAgents(companyId || undefined);
  return NextResponse.json({ agents });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, companyId, department } = body;

    if (!name || !email || !phone || !companyId) {
      return NextResponse.json({ error: 'Name, email, phone, and companyId are required' }, { status: 400 });
    }

    const newAgent = registerAgent({
      name,
      email,
      phone,
      companyId,
      department: department || 'Payments & Refunds',
      status: 'online',
    });

    return NextResponse.json({ success: true, agent: newAgent });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Registration failed' },
      { status: 500 }
    );
  }
}
