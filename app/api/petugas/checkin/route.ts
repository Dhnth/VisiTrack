// app/api/petugas/checkin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth';
import { createActivityLog } from '@/lib/activity-log';
import { pusherServer } from '@/lib/pusher/server';

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
    const nowUTC = getUTCNow();
    
    const checkoutSettings = await getCheckoutSettings(instanceId);
    
    let status: string;
    const checkInAt: string | null = nowUTC;
    const checkOutAt: string | null = null;
    
    if (checkoutSettings.enable_checkout) {
      status = 'active';
    } else {
      status = 'done';
    }

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
        checkInAt,
        checkOutAt,
        nowUTC,
        nowUTC,
      ]
    ) as InsertResult;

    const guestId = result.insertId;

    // 🔥 Kirim notifikasi real-time ke petugas lain
    try {
      await pusherServer.trigger(
        `instance-${instanceId}-petugas`,
        'new-guest',
        {
          guestId: guestId,
          name: name,
          institution: institution || 'Umum',
          purpose: purpose,
          createdAt: nowUTC,
        }
      );

      await pusherServer.trigger(
        `instance-${instanceId}-petugas`,
        'notification',
        {
          id: Date.now(),
          title: 'Tamu Baru (Input Manual)',
          message: `${name} dari ${institution || 'Umum'} ditambahkan oleh ${currentUser.name}`,
          type: 'info',
          read: false,
          createdAt: new Date().toISOString(),
          guestId: guestId,
        }
      );
    } catch (pusherError) {
      console.error('Pusher error (non-critical):', pusherError);
    }

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