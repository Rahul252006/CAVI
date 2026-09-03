import { NextRequest, NextResponse } from 'next/server';
import { ConversationState } from '@/types/echosphere';
import { processConversationTurn, createInitialState } from '@/lib/echosphere/state';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { state, userUtterance, agentUtterance, sessionId } = body;

    const currentState: ConversationState = state || createInitialState(sessionId);
    const result = processConversationTurn(currentState, userUtterance, agentUtterance);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in conversation analyzer:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
