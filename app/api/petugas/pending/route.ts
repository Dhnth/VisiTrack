// app/api/petugas/pending/route.ts
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
    const { id, action } = body;

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
         SET status = 'rejected', validated_at = ?, updated_at = ?, created_by = ?
         WHERE id = ? AND instance_id = ?`,
        [getUTCNow(), getUTCNow(), currentUser.id, guestId, instanceId]
      );

      // 🔥 Kirim notifikasi real-time ke petugas lain
      try {
        await pusherServer.trigger(
          `instance-${instanceId}-petugas`,
          'guest-updated',
          {
            guestId: guestId,
            status: 'rejected',
            name: guest.name,
            message: `${guest.name} ditolak oleh ${currentUser.name}`,
          }
        );

        await pusherServer.trigger(
          `instance-${instanceId}-petugas`,
          'notification',
          {
            id: Date.now(),
            title: 'Tamu Ditolak',
            message: `${guest.name} ditolak oleh ${currentUser.name}`,
            type: 'error',
            read: false,
            createdAt: new Date().toISOString(),
            guestId: guestId,
          }
        );
      } catch (pusherError) {
        console.error('Pusher error (non-critical):', pusherError);
      }

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
      const checkoutSettings = await getCheckoutSettings(instanceId);
      const nowUTC = getUTCNow();
      
      let newStatus: string;
      let description: string;
      let messageText: string;
      
      if (checkoutSettings.enable_checkout) {
        newStatus = 'active';
        description = `Memvalidasi tamu (sedang berkunjung): ${guest.name}`;
        messageText = `Tamu berhasil divalidasi dan sedang berkunjung`;
      } else {
        newStatus = 'done';
        description = `Memvalidasi tamu (langsung selesai): ${guest.name}`;
        messageText = `Tamu berhasil divalidasi (kunjungan selesai)`;
      }

      await query(
        `UPDATE guests 
         SET status = ?, 
             validated_at = ?, 
             updated_at = ?, 
             created_by = ?
         WHERE id = ? AND instance_id = ?`,
        [newStatus, nowUTC, nowUTC, currentUser.id, guestId, instanceId]
      );

      // 🔥 Kirim notifikasi real-time ke petugas lain
      try {
        await pusherServer.trigger(
          `instance-${instanceId}-petugas`,
          'guest-updated',
          {
            guestId: guestId,
            status: newStatus,
            name: guest.name,
            message: `${guest.name} divalidasi oleh ${currentUser.name}`,
          }
        );

        await pusherServer.trigger(
          `instance-${instanceId}-petugas`,
          'notification',
          {
            id: Date.now(),
            title: 'Tamu Divalidasi',
            message: `${guest.name} divalidasi oleh ${currentUser.name}`,
            type: 'success',
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
        action: 'UPDATE',
        table_name: 'guests',
        record_id: guestId,
        description,
        new_data: { status: newStatus, validated_at: nowUTC },
      });

      return NextResponse.json({
        success: true,
        message: messageText,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error) {
    console.error('Pending POST API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}