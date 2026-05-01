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

interface PendingGuest {
  id: number;
  name: string;
  nik: string | null;
  institution: string | null;
  purpose: string;
  photo_url: string | null;
  created_at: string;
  employee_name: string | null;
  employee_department: string | null;
}

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

// GET - List pending guests
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'petugas') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const instanceId = currentUser.instance_id;

    const pendingList = await query(
      `SELECT 
        g.id,
        g.name,
        g.nik,
        g.institution,
        g.purpose,
        g.photo_url,
        g.created_at,
        e.name as employee_name,
        e.department as employee_department
      FROM guests g
      LEFT JOIN employees e ON g.employee_id = e.id
      WHERE g.instance_id = ? AND g.status = 'pending'
      ORDER BY g.created_at ASC`,
      [instanceId]
    ) as PendingGuest[];

    return NextResponse.json({
      success: true,
      guests: pendingList,
    });
  } catch (error) {
    console.error('Pending API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Validasi atau Tolak tamu
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'petugas') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, action } = body; // action: 'approve' or 'reject'

    if (!id || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const guestId = parseInt(id);
    const instanceId = currentUser.instance_id;

    // Get guest data
    const guestResult = await query(
      'SELECT name, status FROM guests WHERE id = ? AND instance_id = ?',
      [guestId, instanceId]
    ) as { name: string; status: string }[];

    if (guestResult.length === 0) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    const guest = guestResult[0];

    if (guest.status !== 'pending') {
      return NextResponse.json({ error: 'Guest is not in pending status' }, { status: 400 });
    }

    // Handle reject action
    if (action === 'reject') {
      await query(
        `UPDATE guests 
         SET status = 'rejected', updated_at = ?, created_by = ?
         WHERE id = ? AND instance_id = ?`,
        [getUTCNow(), currentUser.id, guestId, instanceId]
      );

      // Create activity log
      await createActivityLog({
        instance_id: instanceId,
        user_id: currentUser.id,
        action: 'UPDATE',
        table_name: 'guests',
        record_id: guestId,
        description: `Menolak tamu: ${guest.name}`,
        new_data: { status: 'rejected' },
      });

      return NextResponse.json({
        success: true,
        message: 'Tamu ditolak',
      });
    }

    // Handle approve action
    if (action === 'approve') {
      // Cek pengaturan checkout
      const checkoutSettings = await getCheckoutSettings(instanceId);
      const nowUTC = getUTCNow();
      
      let newStatus: string;
      let description: string;
      
      if (checkoutSettings.enable_checkout) {
        // Jika checkout aktif, status = 'active' (sedang berkunjung)
        newStatus = 'active';
        description = `Memvalidasi tamu (sedang berkunjung): ${guest.name}`;
      } else {
        // Jika checkout nonaktif, status = 'done' (langsung selesai)
        newStatus = 'done';
        description = `Memvalidasi tamu (langsung selesai): ${guest.name}`;
      }

      // Update guest
      // check_in_at diisi dengan waktu sekarang (UTC)
      // check_out_at tetap NULL (akan diisi saat checkout nanti jika enable_checkout true)
      await query(
        `UPDATE guests 
         SET status = ?, 
             check_in_at = ?, 
             updated_at = ?, 
             created_by = ?
         WHERE id = ? AND instance_id = ?`,
        [newStatus, nowUTC, nowUTC, currentUser.id, guestId, instanceId]
      );

      // Create activity log
      await createActivityLog({
        instance_id: instanceId,
        user_id: currentUser.id,
        action: 'UPDATE',
        table_name: 'guests',
        record_id: guestId,
        description,
        new_data: { status: newStatus, check_in_at: nowUTC },
      });

      const message = checkoutSettings.enable_checkout
        ? 'Tamu berhasil divalidasi dan sedang berkunjung'
        : 'Tamu berhasil divalidasi (kunjungan selesai)';

      return NextResponse.json({
        success: true,
        message,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error) {
    console.error('Pending POST API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}