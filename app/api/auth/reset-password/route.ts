// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token dan password baru wajib diisi' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 });
    }

    // Cari user dengan token yang valid
    const users = await query(
      `SELECT u.id, u.name, u.email, u.reset_token_expiry, u.instance_id, i.subscription_status, i.is_active
       FROM users u
       LEFT JOIN instances i ON u.instance_id = i.id
       WHERE u.reset_token = ?`,
      [token]
    ) as { 
      id: number; 
      name: string; 
      email: string;
      reset_token_expiry: number | null;
      instance_id: number | null;
      subscription_status: string | null;
      is_active: number | null;
    }[];

    if (users.length === 0) {
      return NextResponse.json({ error: 'Token tidak valid' }, { status: 400 });
    }

    const user = users[0];

    // Cek apakah token expired
    if (!user.reset_token_expiry || user.reset_token_expiry < Date.now()) {
      return NextResponse.json({ error: 'Token sudah expired. Silakan request ulang.' }, { status: 400 });
    }

    // Cek status instansi
    if (user.instance_id !== null) {
      if (user.subscription_status === 'expired') {
        return NextResponse.json({ error: 'Instansi Anda telah expired. Silakan hubungi administrator.' }, { status: 400 });
      }

      if (user.is_active === 0) {
        return NextResponse.json({ error: 'Instansi Anda dinonaktifkan. Silakan hubungi administrator.' }, { status: 400 });
      }
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password dan hapus token
    await query(
      `UPDATE users 
       SET password = ?, reset_token = NULL, reset_token_expiry = NULL 
       WHERE id = ?`,
      [hashedPassword, user.id]
    );

    return NextResponse.json({
      success: true,
      message: 'Password berhasil direset. Silakan login dengan password baru.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}