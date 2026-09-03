import { NextRequest, NextResponse } from 'next/server';
import { getCompanyKnowledge, addKnowledgeDoc, deleteKnowledgeDoc } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  if (!companyId) {
    return NextResponse.json({ error: 'companyId is required' }, { status: 400 });
  }

  const knowledge = getCompanyKnowledge(companyId);
  return NextResponse.json({ knowledge });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, title, category, content } = body;

    if (!companyId || !title || !content) {
      return NextResponse.json({ error: 'companyId, title, and content are required' }, { status: 400 });
    }

    const created = addKnowledgeDoc({
      id: `doc-${Date.now().toString().slice(-6)}`,
      companyId,
      title,
      category: category || 'General',
      content,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, doc: created });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add knowledge' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const deleted = deleteKnowledgeDoc(id);
  return NextResponse.json({ success: deleted });
}
