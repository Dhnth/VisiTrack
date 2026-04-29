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

interface ActiveGuest {
  id: number;
  name: string;
  institution: string | null;
  purpose: string;
  photo_url: string | null;
  check_in_at: string;
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

// GET - List active guests
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'petugas') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const instanceId = currentUser.instance_id;

    const activeList = await query(
      `SELECT 
        g.id,
        g.name,
        g.institution,
        g.purpose,
        g.photo_url,
        g.check_in_at,
        e.name as employee_name,
        e.department as employee_department
      FROM guests g
      LEFT JOIN employees e ON g.employee_id = e.id
      WHERE g.instance_id = ? AND g.status = 'active'
      ORDER BY g.check_in_at ASC`,
      [instanceId]
    ) as ActiveGuest[];

    return NextResponse.json({
      success: true,
      guests: activeList,
    });
  } catch (error) {
    console.error('Active GET API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Checkout tamu (pulang)
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'petugas') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Guest ID required' }, { status: 400 });
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

    if (guest.status !== 'active') {
      return NextResponse.json({ error: 'Guest is not in active status' }, { status: 400 });
    }

    const checkOutAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Update guest
    await query(
      `UPDATE guests 
       SET status = 'done', check_out_at = ?, updated_at = NOW()
       WHERE id = ? AND instance_id = ?`,
      [checkOutAt, guestId, instanceId]
    );

    // Create activity log
    await createActivityLog({
      instance_id: instanceId,
      user_id: currentUser.id,
      action: 'UPDATE',
      table_name: 'guests',
      record_id: guestId,
      description: `Checkout tamu: ${guest.name}`,
      new_data: { status: 'done', check_out_at: checkOutAt },
    });

    return NextResponse.json({
      success: true,
      message: 'Tamu telah pulang',
    });
  } catch (error) {
    console.error('Active POST API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}