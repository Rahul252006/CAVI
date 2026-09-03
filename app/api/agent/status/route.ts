import { NextRequest, NextResponse } from 'next/server';
import { updateAgentStatus } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, status } = body;

    if (!agentId || !status) {
      return NextResponse.json({ error: 'agentId and status are required' }, { status: 400 });
    }

    const updated = updateAgentStatus(agentId, status);
    if (!updated) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, agent: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Status update failed' },
      { status: 500 }
    );
  }
}
