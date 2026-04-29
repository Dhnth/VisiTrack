import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createActivityLog } from '@/lib/activity-log';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, name, nik, institution, purpose, employee_id, photo_url } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    if (!name || !purpose) {
      return NextResponse.json(
        { error: 'Nama tamu dan tujuan kunjungan wajib diisi' },
        { status: 400 }
      );
    }

    if (!photo_url) {
      return NextResponse.json(
        { error: 'Foto wajib diambil' },
        { status: 400 }
      );
    }

    const tokens = await query(
      'SELECT id, instance_id, expired_at FROM access_token WHERE token = ?',
      [token]
    ) as { id: number; instance_id: number; expired_at: string | null }[];

    if (tokens.length === 0) {
      return NextResponse.json({ error: 'Token tidak valid' }, { status: 400 });
    }

    const tokenData = tokens[0];

    if (tokenData.expired_at) {
      const expiredAt = new Date(tokenData.expired_at + 'Z');
      const now = new Date();

      if (expiredAt < now) {
        return NextResponse.json({ error: 'Token sudah expired' }, { status: 400 });
      }
    }

    const instanceId = tokenData.instance_id;
    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Insert guest
    const result = await query(
      `INSERT INTO guests 
       (instance_id, employee_id, name, nik, institution, purpose, photo_url, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [
        instanceId,
        employee_id || null,
        name,
        nik || null,
        institution || null,
        purpose,
        photo_url,
        createdAt,
        createdAt,
      ]
    ) as { insertId: number };

    if (!result || !result.insertId) {
      console.error('Insert failed, result:', result);
      return NextResponse.json({ error: 'Gagal insert data' }, { status: 500 });
    }

    // Update token usage
    await query(
      'UPDATE access_token SET usage_count = usage_count + 1 WHERE id = ?',
      [tokenData.id]
    );

    // Activity log - pakai try catch terpisah
    try {
      await createActivityLog({
        instance_id: instanceId,
        user_id: null,
        action: 'INSERT',
        table_name: 'guests',
        record_id: result.insertId,
        description: `Tamu baru mendaftar: ${name}`,
        new_data: { name, nik, institution, purpose, employee_id, photo_url },
      });
    } catch (logError) {
      console.error('Activity log error (non-critical):', logError);
      // Tidak perlu return error, lanjutkan saja
    }

    return NextResponse.json({
      success: true,
      message: 'Kunjungan berhasil didaftarkan',
      guest_id: result.insertId,
    });
  } catch (error) {
    console.error('Submit guest error:', error);
    // Kirim error detail untuk debugging
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}