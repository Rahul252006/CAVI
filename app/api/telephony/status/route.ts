import { NextResponse } from 'next/server';
import { getTelephonyStatus } from '@/lib/telephony/gateway';

export async function GET() {
  const status = getTelephonyStatus();
  return NextResponse.json(status);
}
