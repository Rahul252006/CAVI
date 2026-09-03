import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, companyId } = body;

    const db = getDb();

    if (email) {
      const cleanEmail = email.toLowerCase().trim();
      const admin = db.admins.find(a => a.email.toLowerCase().trim() === cleanEmail);

      if (!admin) {
        return NextResponse.json(
          { error: 'No Company Admin account found with this work email.' },
          { status: 404 }
        );
      }

      if (admin.password && password && admin.password !== password) {
        return NextResponse.json(
          { error: 'Invalid password. Please verify your credentials.' },
          { status: 401 }
        );
      }

      const company = db.companies.find(c => c.id === admin.companyId);

      return NextResponse.json({
        success: true,
        admin,
        company: company || { id: admin.companyId, name: admin.companyName },
      });
    }

    if (companyId) {
      const company = db.companies.find(c => c.id === companyId || c.slug === companyId);
      if (!company) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 });
      }

      const admin = db.admins.find(a => a.companyId === company.id);

      return NextResponse.json({
        success: true,
        admin,
        company,
      });
    }

    return NextResponse.json({ error: 'Email or Company ID is required.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Admin login failed' },
      { status: 500 }
    );
  }
}
