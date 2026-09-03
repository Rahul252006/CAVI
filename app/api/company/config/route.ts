import { NextRequest, NextResponse } from 'next/server';
import { getCompanyConfig, updateCompanyConfig } from '@/lib/company/brain';

export async function GET() {
  const config = getCompanyConfig();
  return NextResponse.json(config);
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const updated = updateCompanyConfig(body);
    return NextResponse.json({ success: true, config: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update config' },
      { status: 500 }
    );
  }
}
