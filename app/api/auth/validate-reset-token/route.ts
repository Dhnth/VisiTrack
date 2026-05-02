// app/api/auth/validate-reset-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    const users = await query(
      `SELECT id, reset_token_expiry 
       FROM users 
       WHERE reset_token = ?`,
      [token]
    ) as { id: number; reset_token_expiry: number | null }[];

    if (users.length === 0) {
      return NextResponse.json({ valid: false, error: 'Token tidak valid' });
    }

    const user = users[0];

    if (!user.reset_token_expiry) {
      return NextResponse.json({ valid: false, error: 'Token tidak valid' });
    }

    // Cek apakah token sudah expired
    if (user.reset_token_expiry < Date.now()) {
      return NextResponse.json({ valid: false, error: 'Token sudah expired' });
    }

    return NextResponse.json({ valid: true });

  } catch (error) {
    console.error('Validate token error:', error);
    return NextResponse.json({ valid: false, error: 'Internal server error' });
  }
}