import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth';
import { createActivityLog } from '@/lib/activity-log';

interface User {
  id: number;
  instance_id: number;
  role: string;
  name: string;
  email: string;
}

interface InsertResult {
  insertId: number;
  affectedRows: number;
}

async function getCurrentUser(): Promise<User | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  
  const users = await query(
    'SELECT id, instance_id, role, name, email FROM users WHERE email = ?',
    [session.user.email]
  ) as User[];
  
  return users[0] || null;
}

async function getCheckoutSettings(instanceId: number): Promise<{ enable_checkout: boolean; auto_checkout_time: string | null }> {
  const settings = await query(
    'SELECT enable_checkout, auto_checkout_time FROM settings WHERE instance_id = ? LIMIT 1',
    [instanceId]
  ) as { enable_checkout: number; auto_checkout_time: string | null }[];
  
  const setting = settings[0] || { enable_checkout: 1, auto_checkout_time: null };
  
  return {
    enable_checkout: setting.enable_checkout === 1,
    auto_checkout_time: setting.auto_checkout_time,
  };
}

// Helper function untuk mendapatkan waktu UTC dalam format MySQL datetime
function getUTCNow(): string {
  const now = new Date();
  // Ambil UTC time dalam format YYYY-MM-DD HH:MM:SS
  const utcYear = now.getUTCFullYear();
  const utcMonth = String(now.getUTCMonth() + 1).padStart(2, '0');
  const utcDay = String(now.getUTCDate()).padStart(2, '0');
  const utcHours = String(now.getUTCHours()).padStart(2, '0');
  const utcMinutes = String(now.getUTCMinutes()).padStart(2, '0');
  const utcSeconds = String(now.getUTCSeconds()).padStart(2, '0');
  
  return `${utcYear}-${utcMonth}-${utcDay} ${utcHours}:${utcMinutes}:${utcSeconds}`;
}

// Alternatif yang lebih sederhana
function getUTCNowSimple(): string {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'petugas') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, nik, institution, purpose, employee_id, photo_url } = body;

    if (!name || !purpose) {
      return NextResponse.json(
        { error: 'Nama tamu dan tujuan kunjungan wajib diisi' },
        { status: 400 }
      );
    }

    const instanceId = currentUser.instance_id;
    const nowUTC = getUTCNow(); // Gunakan UTC
    // Atau bisa juga: const nowUTC = getUTCNowSimple();
    
    // Cek pengaturan checkout
    const checkoutSettings = await getCheckoutSettings(instanceId);
    
    // Tentukan status berdasarkan pengaturan checkout
    let status: string;
    const checkInAt: string | null = nowUTC;
    const checkOutAt: string | null = null;
    
    if (checkoutSettings.enable_checkout) {
      // Jika checkout aktif, status = active (perlu checkout nanti)
      status = 'active';
      // check_out_at tetap null (belum checkout)
    } else {
      // Jika checkout nonaktif, status = done (langsung selesai)
      status = 'done';
    }

    // Insert guest - Gunakan UTC untuk semua waktu
    const result = await query(
      `INSERT INTO guests 
       (instance_id, employee_id, created_by, name, nik, institution, purpose, photo_url, status, check_in_at, check_out_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        instanceId,
        employee_id || null,
        currentUser.id,
        name,
        nik || null,
        institution || null,
        purpose,
        photo_url || null,
        status,
        checkInAt,      // UTC
        checkOutAt,     // UTC (null)
        nowUTC,         // created_at UTC
        nowUTC,         // updated_at UTC
      ]
    ) as InsertResult;

    const guestId = result.insertId;

    // Create activity log
    await createActivityLog({
      instance_id: instanceId,
      user_id: currentUser.id,
      action: 'INSERT',
      table_name: 'guests',
      record_id: guestId,
      description: `Input manual tamu: ${name} (${status === 'done' ? 'langsung selesai' : 'sedang berkunjung'})`,
      new_data: { name, nik, institution, purpose, employee_id, photo_url, status },
    });

    return NextResponse.json({
      success: true,
      message: status === 'done' ? 'Tamu berhasil ditambahkan (langsung selesai)' : 'Tamu berhasil ditambahkan',
      guest_id: guestId,
    });
  } catch (error) {
    console.error('Checkin API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}