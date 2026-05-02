// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { randomBytes } from 'crypto';
import { sendResetPasswordEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 });
    }

    // Cari user berdasarkan email
    const users = await query(
      `SELECT u.id, u.name, u.email, u.instance_id, i.slug, i.subscription_status, i.is_active
       FROM users u
       LEFT JOIN instances i ON u.instance_id = i.id
       WHERE u.email = ?`,
      [email]
    ) as { 
      id: number; 
      name: string; 
      email: string; 
      instance_id: number | null;
      slug: string | null;
      subscription_status: string | null;
      is_active: number | null;
    }[];

    if (users.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Jika email terdaftar, link reset password akan dikirim'
      });
    }

    const user = users[0];

    // Cek status instansi (kecuali super admin)
    if (user.instance_id !== null) {
      if (user.subscription_status === 'expired') {
        return NextResponse.json({
          success: false,
          status: 'expired',
          message: 'Instansi Anda telah expired. Silakan hubungi administrator.'
        }, { status: 400 });
      }

      if (user.is_active === 0) {
        return NextResponse.json({
          success: false,
          status: 'suspended',
          message: 'Instansi Anda dinonaktifkan. Silakan hubungi administrator.'
        }, { status: 400 });
      }
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    // Expired dalam 1 jam (3600000 milidetik)
    const resetTokenExpiry = Date.now() + (60 * 60 * 1000);

    // Simpan token ke database
    await query(
      `UPDATE users 
       SET reset_token = ?, reset_token_expiry = ? 
       WHERE id = ?`,
      [resetToken, resetTokenExpiry, user.id]
    );

    // Kirim email
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
    
    await sendResetPasswordEmail({
      email: user.email,
      name: user.name,
      resetLink,
    });

    return NextResponse.json({
      success: true,
      message: 'Jika email terdaftar, link reset password akan dikirim'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}