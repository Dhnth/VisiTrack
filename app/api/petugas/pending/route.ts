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

async function getCurrentUser(): Promise<User | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  
  const users = await query(
    'SELECT id, instance_id, role, name, email FROM users WHERE email = ?',
    [session.user.email]
  ) as User[];
  
  return users[0] || null;
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

    let newStatus: string;
    let description: string;
    let checkInAt: string | null = null;

    if (action === 'approve') {
      newStatus = 'active';
      checkInAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
      description = `Memvalidasi tamu: ${guest.name}`;
    } else if (action === 'reject') {
      newStatus = 'rejected';
      description = `Menolak tamu: ${guest.name}`;
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update guest
    await query(
      `UPDATE guests 
       SET status = ?, check_in_at = COALESCE(?, check_in_at), updated_at = NOW(), created_by = ?
       WHERE id = ? AND instance_id = ?`,
      [newStatus, checkInAt, currentUser.id, guestId, instanceId]
    );

    // Create activity log
    await createActivityLog({
      instance_id: instanceId,
      user_id: currentUser.id,
      action: 'UPDATE',
      table_name: 'guests',
      record_id: guestId,
      description,
      new_data: { status: newStatus },
    });

    return NextResponse.json({
      success: true,
      message: action === 'approve' ? 'Tamu berhasil divalidasi' : 'Tamu ditolak',
    });
  } catch (error) {
    console.error('Pending POST API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}