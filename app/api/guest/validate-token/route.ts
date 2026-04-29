import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    // 1. Validasi input
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token required' },
        { status: 400 }
      );
    }

    // 2. Ambil token dari database
    const tokens = await query(
      'SELECT id, expired_at, usage_count FROM access_token WHERE token = ?',
      [token]
    ) as { id: number; expired_at: string | null; usage_count: number }[];

    // 3. Cek token ada atau tidak
    if (tokens.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Token tidak valid' },
        { status: 400 }
      );
    }

    const tokenData = tokens[0];

    // 4. Cek expired (pakai UTC fix)
    if (tokenData.expired_at) {
      const expiredAt = new Date(tokenData.expired_at + 'Z'); // 🔥 FIX UTC
      const now = new Date();

      if (expiredAt < now) {
        return NextResponse.json(
          { success: false, error: 'Token sudah expired' },
          { status: 400 }
        );
      }
    }

    // 6. Update usage_count
    await query(
      'UPDATE access_token SET usage_count = usage_count + 1 WHERE id = ?',
      [tokenData.id]
    );

    // 7. Response sukses
    return NextResponse.json({
      success: true,
      message: 'Token valid',
    });

  } catch (error) {
    console.error('Validate token error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}