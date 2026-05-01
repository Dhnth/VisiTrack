import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createActivityLog } from '@/lib/activity-log';

// Helper function untuk mendapatkan waktu UTC dalam format MySQL datetime
function getUTCNow(): string {
  const now = new Date();
  const utcYear = now.getUTCFullYear();
  const utcMonth = String(now.getUTCMonth() + 1).padStart(2, '0');
  const utcDay = String(now.getUTCDate()).padStart(2, '0');
  const utcHours = String(now.getUTCHours()).padStart(2, '0');
  const utcMinutes = String(now.getUTCMinutes()).padStart(2, '0');
  const utcSeconds = String(now.getUTCSeconds()).padStart(2, '0');
  
  return `${utcYear}-${utcMonth}-${utcDay} ${utcHours}:${utcMinutes}:${utcSeconds}`;
}

// Fungsi untuk memvalidasi expired token dengan UTC
function isTokenExpired(expiredAtStr: string | null): boolean {
  if (!expiredAtStr) return false;
  
  try {
    let expiredDate: Date;
    
    if (expiredAtStr.includes('T')) {
      expiredDate = new Date(expiredAtStr);
    } else {
      const [datePart, timePart] = expiredAtStr.split(' ');
      const [year, month, day] = datePart.split('-');
      const [hour, minute, second] = timePart.split(':');
      expiredDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)));
    }
    
    const nowUTC = new Date();
    return expiredDate < nowUTC;
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return false;
  }
}

async function getCheckoutSettings(instanceId: number): Promise<{ enable_checkout: boolean; auto_checkout_time: string | null }> {
  try {
    const settings = await query(
      'SELECT enable_checkout, auto_checkout_time FROM settings WHERE instance_id = ? LIMIT 1',
      [instanceId]
    ) as { enable_checkout: number; auto_checkout_time: string | null }[];
    
    const setting = settings[0] || { enable_checkout: 1, auto_checkout_time: null };
    
    return {
      enable_checkout: setting.enable_checkout === 1,
      auto_checkout_time: setting.auto_checkout_time,
    };
  } catch (error) {
    console.error('Error getting checkout settings:', error);
    return { enable_checkout: true, auto_checkout_time: null };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, name, nik, institution, purpose, employee_id, photo_url } = body;

    // Validasi input
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

    // Cek token
    const tokens = await query(
      'SELECT id, instance_id, expired_at FROM access_token WHERE token = ?',
      [token]
    ) as { id: number; instance_id: number; expired_at: string | null }[];

    if (tokens.length === 0) {
      return NextResponse.json({ error: 'Token tidak valid' }, { status: 400 });
    }

    const tokenData = tokens[0];

    // Cek expired token
    if (isTokenExpired(tokenData.expired_at)) {
      return NextResponse.json({ error: 'Token sudah expired' }, { status: 400 });
    }

    const instanceId = tokenData.instance_id;
    const nowUTC = getUTCNow();
    
    // Status selalu pending dulu (menunggu validasi petugas)
    // check_in_at dan check_out_at diisi NULL dulu
    const status = 'pending';
    
    // Insert guest
    // check_in_at dan check_out_at diisi NULL karena belum divalidasi
    const result = await query(
      `INSERT INTO guests 
       (instance_id, employee_id, name, nik, institution, purpose, photo_url, status, check_in_at, check_out_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        instanceId,
        employee_id || null,
        name,
        nik || null,
        institution || null,
        purpose,
        photo_url,
        status,           // 'pending'
        null,             // check_in_at (NULL, akan diisi saat validasi)
        null,             // check_out_at (NULL, akan diisi saat checkout)
        nowUTC,           // created_at
        nowUTC,           // updated_at
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

    // Activity log
    try {
      await createActivityLog({
        instance_id: instanceId,
        user_id: null,
        action: 'INSERT',
        table_name: 'guests',
        record_id: result.insertId,
        description: `Tamu baru mendaftar (menunggu validasi): ${name}`,
        new_data: { name, nik, institution, purpose, employee_id, photo_url, status: 'pending' },
      });
    } catch (logError) {
      console.error('Activity log error (non-critical):', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Kunjungan berhasil didaftarkan, menunggu validasi petugas',
      guest_id: result.insertId,
    });
    
  } catch (error) {
    console.error('Submit guest error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}